import { Request, Response, NextFunction } from 'express';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Notification } from '../models/Notification';
import { IUser } from '../models/User';
import { paymentService } from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { emailService } from '../services/emailService';

export async function bookAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const {
      doctorId,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      symptoms,
      consultationType = 'VIDEO',
      date,
      timeSlot,
    } = req.body;

    if (!doctorId || !date || !timeSlot || !patientName || !patientPhone) {
      sendError(res, 'Please provide doctor, date, time slot, patient name, and phone number.', 400);
      return;
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      sendError(res, 'Doctor is currently not available for bookings.', 404);
      return;
    }

    // Anti-double-booking check: prevent conflict for the same doctor, date and slot
    const existingConflict = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });

    if (existingConflict) {
      sendError(
        res,
        `The requested slot (${timeSlot} on ${date}) is no longer available. Please select another time.`,
        409
      );
      return;
    }

    const appointmentNumber = `APT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Process payment through abstraction layer
    const paymentResult = await paymentService.createPayment({
      amount: doctor.consultationFee,
      description: `Appointment with Dr. ${doctor.name} (${appointmentNumber})`,
      customer: {
        name: patientName,
        email: patientEmail || user.email,
        phone: patientPhone,
      },
    });

    const appointment = await Appointment.create({
      appointmentNumber,
      doctorId: doctor._id,
      userId: user._id,
      patientName,
      patientPhone,
      patientEmail: patientEmail || user.email,
      patientAge: Number(patientAge) || 30,
      patientGender: patientGender || 'OTHER',
      symptoms,
      consultationType,
      date,
      timeSlot,
      fee: doctor.consultationFee,
      status: 'CONFIRMED',
      meetingLink: consultationType === 'VIDEO' ? `https://medicare.internal/telehealth/${appointmentNumber}` : undefined,
      payment: {
        provider: paymentResult.provider,
        status: paymentResult.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentResult.transactionId,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    // Notify patient
    await Notification.create({
      userId: user._id,
      type: 'APPOINTMENT',
      title: 'Appointment Confirmed! 🩺',
      message: `Your consultation with Dr. ${doctor.name} on ${date} at ${timeSlot} is confirmed. Booking #${appointmentNumber}.`,
      link: `/user/appointments`,
    });

    // Notify doctor user account if one exists
    if (doctor.userId) {
      await Notification.create({
        userId: doctor.userId,
        type: 'APPOINTMENT',
        title: 'New Patient Booking',
        message: `New appointment scheduled: ${patientName} on ${date} at ${timeSlot}.`,
        link: `/doctor`,
      });
    }

    await logAudit({
      req,
      action: 'APPOINTMENT_BOOKED',
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      metadata: { doctorName: doctor.name, date, timeSlot },
    });

    // Send appointment confirmation email
    emailService.sendAppointmentBookedEmail(
      patientEmail || user.email,
      patientName,
      doctor.name,
      doctor.specialization,
      date,
      timeSlot,
      appointmentNumber
    ).catch(() => {});

    sendSuccess(res, appointment, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId: user._id };
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctorId', 'name specialization qualifications avatar hospitalAffiliation consultationFee')
        .sort({ date: -1, timeSlot: -1 })
        .skip(skip)
        .limit(limitNum),
      Appointment.countDocuments(query),
    ]);

    sendSuccess(res, {
      appointments,
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

export async function getDoctorAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      sendError(res, 'Doctor account not found', 404);
      return;
    }

    const { date, status, page = 1, limit = 15 } = req.query;
    const query: any = { doctorId: doctor._id };
    if (date) query.date = String(date);
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('userId', 'fullName email phone avatar')
        .sort({ date: 1, timeSlot: 1 })
        .skip(skip)
        .limit(limitNum),
      Appointment.countDocuments(query),
    ]);

    sendSuccess(res, {
      appointments,
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

export async function getAppointmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const appointment = await Appointment.findById(id).populate('doctorId');
    if (!appointment) {
      sendError(res, 'Appointment not found', 404);
      return;
    }

    // Ownership check: patient, assigned doctor, or admin
    const isPatient = appointment.userId.toString() === user._id.toString();
    const doctor = await Doctor.findById(appointment.doctorId);
    const isDoctor = doctor && doctor.userId && doctor.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      sendError(res, 'Access denied.', 403);
      return;
    }

    sendSuccess(res, appointment);
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const { status, notes, meetingLink, prescriptionGiven } = req.body;

    const appointment = await Appointment.findById(id).populate('doctorId');
    if (!appointment) {
      sendError(res, 'Appointment not found', 404);
      return;
    }

    if (status) appointment.status = status as AppointmentStatus;
    if (notes !== undefined) appointment.notes = notes;
    if (meetingLink !== undefined) appointment.meetingLink = meetingLink;
    if (prescriptionGiven !== undefined) appointment.prescriptionGiven = prescriptionGiven;

    await appointment.save();

    await Notification.create({
      userId: appointment.userId,
      type: 'APPOINTMENT',
      title: `Appointment Status: ${status}`,
      message: `Your appointment #${appointment.appointmentNumber} has been marked as ${status}.`,
      link: `/user/appointments`,
    });

    await logAudit({
      req,
      action: `APPOINTMENT_STATUS_${status}`,
      resourceType: 'Appointment',
      resourceId: appointment._id.toString(),
      metadata: { status },
    });

    // Send appointment status / cancellation email
    const docName = (appointment.doctorId as any)?.name || 'Specialist';
    if (status === 'CANCELLED') {
      emailService.sendAppointmentCancelledEmail(
        appointment.patientEmail,
        appointment.patientName,
        docName,
        appointment.appointmentNumber,
        notes
      ).catch(() => {});
    } else {
      emailService.sendAppointmentStatusEmail(
        appointment.patientEmail,
        appointment.patientName,
        docName,
        status,
        appointment.date,
        appointment.timeSlot,
        notes
      ).catch(() => {});
    }

    sendSuccess(res, appointment, `Appointment status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function getAllAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, date, page = 1, limit = 15 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (date) query.date = String(date);
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ appointmentNumber: searchRegex }, { patientName: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctorId', 'name specialization avatar hospitalAffiliation')
        .populate('userId', 'fullName email phone')
        .sort({ date: -1, timeSlot: -1 })
        .skip(skip)
        .limit(limitNum),
      Appointment.countDocuments(query),
    ]);

    sendSuccess(res, {
      appointments,
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
