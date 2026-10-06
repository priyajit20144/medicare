import { Request, Response, NextFunction } from 'express';
import { MembershipPlan, UserMembership } from '../models/Membership';
import { Notification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { HealthCheckupBooking } from '../models/HealthCheckup';
import { paymentService } from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { emailService } from '../services/emailService';

export async function getMembershipPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const plans = await MembershipPlan.find({ isActive: true });
    sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentMembership(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const now = new Date();

    const membership = await UserMembership.findOne({
      userId: user._id,
      status: 'ACTIVE',
      endDate: { $gte: now },
    }).populate('planId');

    if (!membership) {
      sendSuccess(res, { hasActiveMembership: false, membership: null });
      return;
    }

    const daysRemaining = Math.max(
      0,
      Math.ceil((membership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    sendSuccess(res, {
      hasActiveMembership: true,
      membership,
      daysRemaining,
    });
  } catch (error) {
    next(error);
  }
}

export async function subscribeMembership(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { planId, autoRenew = true } = req.body;

    const plan = await MembershipPlan.findById(planId);
    if (!plan || !plan.isActive) {
      sendError(res, 'Membership plan not found or no longer active.', 404);
      return;
    }

    const price = plan.discountPrice || plan.price;
    const membershipId = `MC-VIP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const paymentResult = await paymentService.createPayment({
      amount: price,
      description: `Medicare Premium Membership: ${plan.name} (${membershipId})`,
      customer: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Initial benefits usage tracker based on plan benefits
    const benefitUsages = plan.benefitsConfig.map((b) => ({
      benefitKey: b.key,
      name: b.name,
      usedCount: 0,
      maxLimit: b.maxLimit,
    }));

    const membership = await UserMembership.create({
      userId: user._id,
      planId: plan._id,
      membershipId,
      startDate,
      endDate,
      status: 'ACTIVE',
      autoRenew,
      benefitUsages,
      payment: {
        provider: paymentResult.provider,
        status: paymentResult.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentResult.transactionId,
        amount: price,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    await Notification.create({
      userId: user._id,
      type: 'MEMBERSHIP',
      title: 'Welcome to Medicare Premium! 👑',
      message: `Your 1-year premium membership (${membershipId}) is now active! Enjoy priority bookings, member discounts, and free delivery.`,
      link: `/user/membership`,
    });

    await logAudit({
      req,
      action: 'MEMBERSHIP_SUBSCRIBED',
      resourceType: 'UserMembership',
      resourceId: membership._id.toString(),
      metadata: { membershipId, planName: plan.name },
    });

    // Send membership activated VIP email
    emailService.sendMembershipActivatedEmail(user.email, user.fullName, plan.name, membershipId, endDate).catch(() => {});

    sendSuccess(res, membership, 'Premium membership activated successfully!', 201);
  } catch (error) {
    next(error);
  }
}

export async function useBenefit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { benefitKey } = req.body;

    const membership = await UserMembership.findOne({
      userId: user._id,
      status: 'ACTIVE',
      endDate: { $gte: new Date() },
    });

    if (!membership) {
      sendError(res, 'Active premium membership required to use this benefit.', 403);
      return;
    }

    const benefit = membership.benefitUsages.find((b) => b.benefitKey === benefitKey);
    if (!benefit) {
      sendError(res, 'Benefit key not found in your membership plan.', 404);
      return;
    }

    if (benefit.maxLimit !== undefined && benefit.usedCount >= benefit.maxLimit) {
      sendError(res, `Benefit "${benefit.name}" usage limit reached (${benefit.maxLimit}/${benefit.maxLimit}).`, 400);
      return;
    }

    benefit.usedCount += 1;
    benefit.lastUsedAt = new Date();
    await membership.save();

    sendSuccess(res, membership, `Benefit "${benefit.name}" applied successfully`);
  } catch (error) {
    next(error);
  }
}

export async function getAllMemberships(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const memberships = await UserMembership.find()
      .populate('userId', 'fullName email phone')
      .populate('planId', 'name price discountPrice durationMonths benefitsConfig')
      .sort({ createdAt: -1 });

    sendSuccess(res, memberships);
  } catch (error) {
    next(error);
  }
}

export async function getMembershipAdminStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const [allMemberships, vipCheckupBookings] = await Promise.all([
      UserMembership.find().populate('userId', 'fullName email').populate('planId', 'name price'),
      HealthCheckupBooking.find({ isVipRedemption: true }),
    ]);

    let totalActive = 0;
    let totalExpired = 0;
    let totalSuspended = 0;
    let totalRevenue = 0;
    let totalCheckupQuota = 0;
    let totalCheckupsUsed = 0;

    for (const m of allMemberships) {
      if (m.payment?.status === 'COMPLETED') {
        totalRevenue += m.payment.amount || 0;
      }
      if (m.status === 'ACTIVE' && new Date(m.endDate) >= now) {
        totalActive++;
        // Calculate checkup benefits
        const checkupBenefit = m.benefitUsages.find(
          (b) => b.benefitKey === 'free_annual_checkup' || b.benefitKey.includes('checkup')
        );
        if (checkupBenefit) {
          totalCheckupQuota += checkupBenefit.maxLimit ?? 1;
          totalCheckupsUsed += checkupBenefit.usedCount || 0;
        }
      } else if (m.status === 'SUSPENDED') {
        totalSuspended++;
      } else {
        totalExpired++;
      }
    }

    sendSuccess(res, {
      totalMemberships: allMemberships.length,
      totalActive,
      totalExpired,
      totalSuspended,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      checkupBenefits: {
        totalAllocated: totalCheckupQuota,
        totalClaimed: totalCheckupsUsed,
        totalAvailable: Math.max(0, totalCheckupQuota - totalCheckupsUsed),
      },
      vipCheckupBookingsCount: vipCheckupBookings.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMembershipStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, extendMonths, notes } = req.body;

    const membership = await UserMembership.findById(id).populate('userId', 'fullName email');
    if (!membership) {
      sendError(res, 'User membership not found', 404);
      return;
    }

    if (status) {
      membership.status = status;
    }

    if (extendMonths && Number(extendMonths) > 0) {
      const currentEnd = new Date(membership.endDate);
      const baseDate = currentEnd > new Date() ? currentEnd : new Date();
      baseDate.setMonth(baseDate.getMonth() + Number(extendMonths));
      membership.endDate = baseDate;
    }

    await membership.save();

    await Notification.create({
      userId: membership.userId,
      type: 'MEMBERSHIP',
      title: 'Medicare VIP Membership Update 👑',
      message: `Your VIP status has been updated to ${membership.status}. Valid through ${new Date(
        membership.endDate
      ).toLocaleDateString()}.${notes ? ` Note: ${notes}` : ''}`,
      link: '/user/membership',
    });

    await logAudit({
      req,
      action: 'MEMBERSHIP_STATUS_UPDATED',
      resourceType: 'UserMembership',
      resourceId: membership._id.toString(),
      metadata: { status: membership.status, extendMonths, notes },
    });

    sendSuccess(res, membership, 'Membership updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adjustMembershipCheckupBenefit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { benefitKey = 'free_annual_checkup', usedCount, maxLimit, reason } = req.body;

    const membership = await UserMembership.findById(id).populate('userId', 'fullName email');
    if (!membership) {
      sendError(res, 'User membership not found', 404);
      return;
    }

    let benefit = membership.benefitUsages.find((b) => b.benefitKey === benefitKey);
    if (!benefit) {
      // If benefit record does not exist yet, initialize it
      benefit = {
        benefitKey,
        name: 'Annual Comprehensive Executive Checkup ($229 value)',
        usedCount: Number(usedCount ?? 0),
        maxLimit: Number(maxLimit ?? 1),
      };
      membership.benefitUsages.push(benefit);
    } else {
      if (usedCount !== undefined) {
        benefit.usedCount = Math.max(0, Number(usedCount));
      }
      if (maxLimit !== undefined) {
        benefit.maxLimit = Math.max(0, Number(maxLimit));
      }
      benefit.lastUsedAt = new Date();
    }

    await membership.save();

    await Notification.create({
      userId: membership.userId,
      type: 'MEMBERSHIP',
      title: 'VIP Health Checkup Allowance Adjusted 🏥',
      message: `Your VIP Annual Checkup allowance was updated by administration: ${benefit.usedCount} of ${benefit.maxLimit} used.${
        reason ? ` (${reason})` : ''
      }`,
      link: '/user/membership',
    });

    await logAudit({
      req,
      action: 'MEMBERSHIP_BENEFIT_ADJUSTED',
      resourceType: 'UserMembership',
      resourceId: membership._id.toString(),
      metadata: { benefitKey, usedCount, maxLimit, reason },
    });

    sendSuccess(res, membership, 'Checkup allowance updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function grantUserMembership(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userEmail, planId, durationMonths = 12, notes } = req.body;

    const targetUser = userId
      ? await User.findById(userId)
      : userEmail
      ? await User.findOne({ email: userEmail.toLowerCase().trim() })
      : null;

    if (!targetUser) {
      sendError(res, 'Specified user could not be found.', 404);
      return;
    }

    const plan = planId
      ? await MembershipPlan.findById(planId)
      : await MembershipPlan.findOne({ isActive: true });

    if (!plan) {
      sendError(res, 'Active membership plan not found.', 404);
      return;
    }

    const months = Number(durationMonths) || plan.durationMonths || 12;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const membershipId = `MC-VIP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const benefitUsages = plan.benefitsConfig.map((b) => ({
      benefitKey: b.key,
      name: b.name,
      usedCount: 0,
      maxLimit: b.maxLimit,
    }));

    const membership = await UserMembership.create({
      userId: targetUser._id,
      planId: plan._id,
      membershipId,
      startDate,
      endDate,
      status: 'ACTIVE',
      autoRenew: false,
      benefitUsages,
      payment: {
        provider: 'ADMIN_COMPLIMENTARY',
        status: 'COMPLETED',
        transactionId: `ADMIN-GRANT-${Date.now()}`,
        amount: 0,
        paidAt: new Date(),
      },
    });

    await Notification.create({
      userId: targetUser._id,
      type: 'MEMBERSHIP',
      title: 'Complimentary Medicare VIP Membership Granted! 👑',
      message: `You have been granted a complimentary ${months}-month Medicare VIP membership (${membershipId})! Enjoy complimentary annual diagnostic checkups, priority booking, and free delivery.`,
      link: '/user/membership',
    });

    await logAudit({
      req,
      action: 'MEMBERSHIP_ADMIN_GRANTED',
      resourceType: 'UserMembership',
      resourceId: membership._id.toString(),
      metadata: { targetUserId: targetUser._id.toString(), membershipId, notes },
    });

    sendSuccess(res, membership, 'VIP Membership granted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateMembershipPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, discountPrice, durationMonths, features, benefitsConfig, isActive } =
      req.body;

    const plan = await MembershipPlan.findById(id);
    if (!plan) {
      sendError(res, 'Membership plan not found', 404);
      return;
    }

    if (name) plan.name = name;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = Number(price);
    if (discountPrice !== undefined) plan.discountPrice = discountPrice ? Number(discountPrice) : undefined;
    if (durationMonths !== undefined) plan.durationMonths = Number(durationMonths);
    if (Array.isArray(features)) plan.features = features;
    if (Array.isArray(benefitsConfig)) plan.benefitsConfig = benefitsConfig;
    if (isActive !== undefined) plan.isActive = Boolean(isActive);

    await plan.save();

    await logAudit({
      req,
      action: 'MEMBERSHIP_PLAN_UPDATED',
      resourceType: 'MembershipPlan',
      resourceId: plan._id.toString(),
      metadata: { name: plan.name, price: plan.price },
    });

    sendSuccess(res, plan, 'Membership plan updated successfully');
  } catch (error) {
    next(error);
  }
}
