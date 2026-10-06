import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Prescription } from '../models/Prescription';
import { Appointment } from '../models/Appointment';
import { UserMembership } from '../models/Membership';
import { HealthCheckupBooking } from '../models/HealthCheckup';
import { Notification } from '../models/Notification';
import { IUser } from '../models/User';
import { sendSuccess } from '../utils/response';

export async function getUserDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const [
      totalOrders,
      activeOrders,
      recentOrders,
      totalPrescriptions,
      pendingPrescriptions,
      recentPrescriptions,
      upcomingAppointments,
      activeMembership,
      upcomingCheckups,
      unreadNotifications,
    ] = await Promise.all([
      Order.countDocuments({ userId: user._id }),
      Order.countDocuments({
        userId: user._id,
        status: { $in: ['PROCESSING', 'PHARMACY_REVIEW', 'READY_TO_SHIP', 'SHIPPED'] },
      }),
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(3),
      Prescription.countDocuments({ userId: user._id }),
      Prescription.countDocuments({ userId: user._id, status: { $in: ['PENDING_REVIEW', 'UNDER_REVIEW'] } }),
      Prescription.find({ userId: user._id }).sort({ createdAt: -1 }).limit(3),
      Appointment.find({
        userId: user._id,
        date: { $gte: todayStr },
        status: { $in: ['PENDING', 'CONFIRMED'] },
      })
        .populate('doctorId', 'name specialization avatar hospitalAffiliation')
        .sort({ date: 1, timeSlot: 1 })
        .limit(3),
      UserMembership.findOne({
        userId: user._id,
        status: 'ACTIVE',
        endDate: { $gte: now },
      }).populate('planId'),
      HealthCheckupBooking.find({
        userId: user._id,
        bookingDate: { $gte: todayStr },
        status: { $in: ['PENDING_PAYMENT', 'CONFIRMED'] },
      })
        .populate('packageId', 'name duration')
        .populate('facilityId', 'name city')
        .sort({ bookingDate: 1 })
        .limit(2),
      Notification.countDocuments({ userId: user._id, isRead: false }),
    ]);

    const daysRemaining = activeMembership
      ? Math.max(0, Math.ceil((activeMembership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    sendSuccess(res, {
      metrics: {
        totalOrders,
        activeOrders,
        totalPrescriptions,
        pendingPrescriptions,
        upcomingAppointmentsCount: upcomingAppointments.length,
        hasActiveMembership: !!activeMembership,
        membershipDaysRemaining: daysRemaining,
        unreadNotifications,
      },
      recentOrders,
      recentPrescriptions,
      upcomingAppointments,
      activeMembership,
      upcomingCheckups,
    });
  } catch (error) {
    next(error);
  }
}
