import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models/Doctor';
import { Appointment } from '../models/Appointment';
import { User, IUser } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { hashPassword } from '../utils/password';

export async function getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      search,
      specialization,
      consultationType,
      minFee,
      maxFee,
      minExperience,
      sort = 'rating',
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = { isActive: true };

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { hospitalAffiliation: searchRegex },
      ];
    }

    if (specialization) {
      query.specialization = new RegExp(`^${String(specialization)}$`, 'i');
    }

    if (consultationType) {
      query.consultationTypes = String(consultationType).toUpperCase();
    }

    if (minFee !== undefined || maxFee !== undefined) {
      query.consultationFee = {};
      if (minFee !== undefined) query.consultationFee.$gte = Number(minFee);
      if (maxFee !== undefined) query.consultationFee.$lte = Number(maxFee);
    }

    if (minExperience) {
      query.experienceYears = { $gte: Number(minExperience) };
    }

    let sortOptions: any = { rating: -1, reviewCount: -1 };
    if (sort === 'fee_asc') sortOptions = { consultationFee: 1 };
    else if (sort === 'fee_desc') sortOptions = { consultationFee: -1 };
    else if (sort === 'experience') sortOptions = { experienceYears: -1 };
    else if (sort === 'name') sortOptions = { name: 1 };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Doctor.countDocuments(query),
    ]);

    sendSuccess(res, {
      doctors,
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

export async function getDoctorById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate('userId', 'fullName email phone avatar');

    if (!doctor) {
      sendError(res, 'Doctor not found', 404);
      return;
    }

    sendSuccess(res, doctor);
  } catch (error) {
    next(error);
  }
}

export async function getDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      sendError(res, 'Doctor not found', 404);
      return;
    }

    const defaultSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
      '05:00 PM',
    ];

    const availableSlots = doctor.availableSlots && doctor.availableSlots.length > 0
      ? doctor.availableSlots
      : defaultSlots;

    let bookedSlots: string[] = [];
    if (date) {
      const bookedAppointments = await Appointment.find({
        doctorId: doctor._id,
        date: String(date),
        status: { $in: ['PENDING', 'CONFIRMED'] },
      }).select('timeSlot');

      bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    }

    const slotStatus = availableSlots.map((slot) => ({
      slot,
      isBooked: bookedSlots.includes(slot),
    }));

    sendSuccess(res, {
      doctorId: doctor._id,
      date: date || new Date().toISOString().split('T')[0],
      slots: slotStatus,
      availableDays: doctor.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
  } catch (error) {
    next(error);
  }
}

export async function getDoctorSpecialties(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const specialties = await Doctor.distinct('specialization', { isActive: true });
    sendSuccess(res, specialties.filter(Boolean));
  } catch (error) {
    next(error);
  }
}

export async function getDoctorMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      sendError(res, 'Doctor profile not associated with this account.', 404);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const [todayCount, upcomingCount, pendingCount, completedCount] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id, date: todayStr }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'CONFIRMED', date: { $gte: todayStr } }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'PENDING' }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'COMPLETED' }),
    ]);

    sendSuccess(res, {
      profile: doctor,
      stats: {
        todayAppointments: todayCount,
        upcomingAppointments: upcomingCount,
        pendingRequests: pendingCount,
        completedAppointments: completedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDoctorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { availableDays, availableSlots, consultationFee, consultationTypes } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      sendError(res, 'Doctor profile not found', 404);
      return;
    }

    if (availableDays) doctor.availableDays = availableDays;
    if (availableSlots) doctor.availableSlots = availableSlots;
    if (consultationFee) doctor.consultationFee = Number(consultationFee);
    if (consultationTypes) doctor.consultationTypes = consultationTypes;

    await doctor.save();

    await logAudit({
      req,
      action: 'DOCTOR_AVAILABILITY_UPDATED',
      resourceType: 'Doctor',
      resourceId: doctor._id.toString(),
    });

    sendSuccess(res, doctor, 'Availability updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAdminDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, specialization, status, sort = 'newest' } = req.query;
    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { specialization: searchRegex },
        { hospitalAffiliation: searchRegex },
      ];
    }

    if (specialization && specialization !== 'ALL') {
      query.specialization = new RegExp(`^${String(specialization)}$`, 'i');
    }

    if (status === 'ACTIVE') {
      query.isActive = true;
    } else if (status === 'INACTIVE') {
      query.isActive = false;
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'rating') sortOptions = { rating: -1, reviewCount: -1 };
    else if (sort === 'fee_asc') sortOptions = { consultationFee: 1 };
    else if (sort === 'fee_desc') sortOptions = { consultationFee: -1 };
    else if (sort === 'experience') sortOptions = { experienceYears: -1 };
    else if (sort === 'name') sortOptions = { name: 1 };

    const doctors = await Doctor.find(query)
      .sort(sortOptions)
      .populate('userId', 'fullName email avatar isActive');

    const [totalDoctors, activeDoctors, verifiedDoctors, specialtiesList] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isVerified: true }),
      Doctor.distinct('specialization'),
    ]);

    sendSuccess(res, {
      doctors,
      total: doctors.length,
      stats: {
        totalDoctors,
        activeDoctors,
        verifiedDoctors,
        specialtiesCount: specialtiesList.filter(Boolean).length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      biography,
      avatar,
      languages,
      consultationTypes,
      hospitalAffiliation,
      availableDays,
      availableSlots,
      isVerified = true,
      isActive = true,
      userId,
    } = req.body;

    if (!name || !email || !specialization) {
      sendError(res, 'Name, email, and specialization are required.', 400);
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let linkedUserId = userId;

    if (!linkedUserId) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        // Check if a doctor profile is already linked
        const existingDoc = await Doctor.findOne({
          $or: [{ userId: existingUser._id }, { email: cleanEmail }],
        });
        if (existingDoc) {
          sendError(res, 'A physician profile is already linked to this email address.', 400);
          return;
        }

        // Elevate user role if regular user
        if (existingUser.role !== 'DOCTOR' && existingUser.role !== 'ADMIN') {
          existingUser.role = 'DOCTOR';
          if (avatar && !existingUser.avatar) existingUser.avatar = avatar;
          if (phone && !existingUser.phone) existingUser.phone = phone;
          await existingUser.save();
        }
        linkedUserId = existingUser._id;
      } else {
        // Create user account for doctor
        const rawPassword = password && String(password).trim().length >= 6
          ? String(password).trim()
          : 'Doctor@2026!';
        const hashedPassword = await hashPassword(rawPassword);

        const newUser = await User.create({
          fullName: String(name).trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: 'DOCTOR',
          phone: phone ? String(phone).trim() : '',
          avatar: avatar || '',
          isEmailVerified: true,
          isActive: true,
        });

        linkedUserId = newUser._id;
      }
    } else {
      const existingDoc = await Doctor.findOne({
        $or: [{ userId: linkedUserId }, { email: cleanEmail }],
      });
      if (existingDoc) {
        sendError(res, 'A physician profile is already linked to this user or email.', 400);
        return;
      }
    }

    // Format array fields
    const parsedQualifications = Array.isArray(qualifications)
      ? qualifications.map((q: any) => String(q).trim()).filter(Boolean)
      : typeof qualifications === 'string'
      ? qualifications.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['MBBS'];

    const parsedLanguages = Array.isArray(languages)
      ? languages.map((l: any) => String(l).trim()).filter(Boolean)
      : typeof languages === 'string'
      ? languages.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['English'];

    const parsedDays = Array.isArray(availableDays) && availableDays.length > 0
      ? availableDays
      : typeof availableDays === 'string'
      ? availableDays.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const parsedSlots = Array.isArray(availableSlots) && availableSlots.length > 0
      ? availableSlots
      : typeof availableSlots === 'string'
      ? availableSlots.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

    const parsedTypes = Array.isArray(consultationTypes) && consultationTypes.length > 0
      ? consultationTypes
      : ['IN_PERSON', 'VIDEO'];

    const doctor = await Doctor.create({
      userId: linkedUserId,
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      specialization: String(specialization).trim(),
      qualifications: parsedQualifications.length > 0 ? parsedQualifications : ['MBBS'],
      experienceYears: Math.max(0, Number(experienceYears) || 0),
      consultationFee: Math.max(0, Number(consultationFee) || 0),
      biography: biography ? String(biography).trim() : '',
      avatar: avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
      languages: parsedLanguages.length > 0 ? parsedLanguages : ['English'],
      consultationTypes: parsedTypes,
      hospitalAffiliation: hospitalAffiliation ? String(hospitalAffiliation).trim() : 'Medicare Central Medical Hospital',
      availableDays: parsedDays,
      availableSlots: parsedSlots,
      isVerified: Boolean(isVerified),
      isActive: Boolean(isActive),
    });

    await logAudit({
      req,
      action: 'ADMIN_PHYSICIAN_MANUALLY_CREATED',
      resourceType: 'Doctor',
      resourceId: doctor._id.toString(),
      metadata: { name: doctor.name, email: doctor.email, specialization: doctor.specialization },
    });

    sendSuccess(res, doctor, 'Physician registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const updateData: any = { ...req.body };

    // Format array fields if provided as string
    if (updateData.qualifications && typeof updateData.qualifications === 'string') {
      updateData.qualifications = updateData.qualifications.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updateData.languages && typeof updateData.languages === 'string') {
      updateData.languages = updateData.languages.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updateData.availableDays && typeof updateData.availableDays === 'string') {
      updateData.availableDays = updateData.availableDays.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updateData.availableSlots && typeof updateData.availableSlots === 'string') {
      updateData.availableSlots = updateData.availableSlots.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updateData.experienceYears !== undefined) {
      updateData.experienceYears = Math.max(0, Number(updateData.experienceYears) || 0);
    }
    if (updateData.consultationFee !== undefined) {
      updateData.consultationFee = Math.max(0, Number(updateData.consultationFee) || 0);
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!doctor) {
      sendError(res, 'Doctor not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'ADMIN_PHYSICIAN_UPDATED',
      resourceType: 'Doctor',
      resourceId: doctor._id.toString(),
      metadata: { updateData },
    });

    sendSuccess(res, doctor, 'Doctor updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      sendError(res, 'Doctor not found', 404);
      return;
    }

    await Doctor.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'ADMIN_PHYSICIAN_DELETED',
      resourceType: 'Doctor',
      resourceId: id,
      metadata: { name: doctor.name, email: doctor.email, specialization: doctor.specialization },
    });

    sendSuccess(res, null, 'Physician removed successfully');
  } catch (error) {
    next(error);
  }
}
