import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Medicine } from '../models/Medicine';
import { Doctor } from '../models/Doctor';
import { Pharmacist } from '../models/Pharmacist';
import { Prescription } from '../models/Prescription';
import { Appointment } from '../models/Appointment';
import { UserMembership } from '../models/Membership';
import { HealthCheckupBooking } from '../models/HealthCheckup';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';

export async function getAnalyticsOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalPharmacists,
      totalMedicines,
      totalOrders,
      pendingOrders,
      totalPrescriptions,
      pendingPrescriptions,
      totalAppointments,
      totalMemberships,
      totalCheckupBookings,
      revenueAggregation,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Doctor.countDocuments(),
      Pharmacist.countDocuments(),
      Medicine.countDocuments({ status: 'ACTIVE' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['PROCESSING', 'PHARMACY_REVIEW', 'READY_TO_SHIP'] } }),
      Prescription.countDocuments(),
      Prescription.countDocuments({ status: { $in: ['PENDING_REVIEW', 'UNDER_REVIEW'] } }),
      Appointment.countDocuments(),
      UserMembership.countDocuments({ status: 'ACTIVE' }),
      HealthCheckupBooking.countDocuments(),
      Order.aggregate([
        { $match: { 'payment.status': 'COMPLETED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Order.find().populate('userId', 'fullName email').sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // Monthly orders distribution
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top selling medicines (fictional mock analytics fallback if few orders)
    const topMedicines = await Medicine.find({ status: 'ACTIVE' })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5)
      .select('name brand price stock requiresPrescription images');

    // Popular doctors
    const topDoctors = await Doctor.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(4)
      .select('name specialization consultationFee rating avatar hospitalAffiliation');

    sendSuccess(res, {
      metrics: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalUsers,
        totalDoctors,
        totalPharmacists,
        totalMedicines,
        totalOrders,
        pendingOrders,
        totalPrescriptions,
        pendingPrescriptions,
        totalAppointments,
        totalMemberships,
        totalCheckupBookings,
      },
      ordersByStatus,
      topMedicines,
      topDoctors,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsersList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ fullName: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    sendSuccess(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role && ['USER', 'DOCTOR', 'PHARMACIST', 'ADMIN'].includes(role)) {
      user.role = role;
    }

    await user.save();

    await logAudit({
      req,
      action: 'ADMIN_USER_UPDATED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      metadata: { isActive, role },
    });

    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, resourceType, page = 1, limit = 25 } = req.query;
    const query: any = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    sendSuccess(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPharmacistsList(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pharmacists = await Pharmacist.find().populate('userId', 'fullName email phone avatar isActive');
    sendSuccess(res, pharmacists);
  } catch (error) {
    next(error);
  }
}
