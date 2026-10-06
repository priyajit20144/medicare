import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import {
  HealthCheckupPackage,
  HealthCheckupBooking,
  HealthCheckupResult,
  Test,
} from '../models/HealthCheckup';
import { Facility } from '../models/Facility';
import { Notification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { UserMembership } from '../models/Membership';
import { paymentService } from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { emailService } from '../services/emailService';
import { ENV } from '../config/env';

export async function getCheckupPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, maxPrice } = req.query;
    const query: any = { status: 'ACTIVE' };

    if (search) {
      query.name = new RegExp(String(search), 'i');
    }
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }

    const packages = await HealthCheckupPackage.find(query).populate('includedTests');
    sendSuccess(res, packages);
  } catch (error) {
    next(error);
  }
}

export async function getCheckupPackageById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    let pkg;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      pkg = await HealthCheckupPackage.findById(id).populate('includedTests');
    } else {
      pkg = await HealthCheckupPackage.findOne({ slug: id.toLowerCase() }).populate('includedTests');
    }

    if (!pkg) {
      sendError(res, 'Health checkup package not found', 404);
      return;
    }

    sendSuccess(res, pkg);
  } catch (error) {
    next(error);
  }
}

export async function bookCheckup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const {
      packageId,
      facilityId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      bookingDate,
      timeSlot,
      sampleCollectionType = 'AT_CENTER',
      homeAddress,
      notes,
      redeemVipBenefit = false,
    } = req.body;

    const pkg = await HealthCheckupPackage.findById(packageId);
    if (!pkg) {
      sendError(res, 'Health checkup package not found', 404);
      return;
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      sendError(res, 'Healthcare facility not found', 404);
      return;
    }

    const bookingNumber = `CHK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    let isVipRedemption = false;
    let vipMembershipId: string | undefined;
    let finalAmount = pkg.discountPrice || pkg.price;

    if (redeemVipBenefit) {
      const membership = await UserMembership.findOne({
        userId: user._id,
        status: 'ACTIVE',
        endDate: { $gte: new Date() },
      });

      if (membership) {
        const checkupBenefit = membership.benefitUsages.find(
          (b) => b.benefitKey === 'free_annual_checkup' || b.benefitKey.includes('checkup')
        );
        if (
          checkupBenefit &&
          (checkupBenefit.maxLimit === undefined || checkupBenefit.usedCount < checkupBenefit.maxLimit)
        ) {
          isVipRedemption = true;
          vipMembershipId = membership.membershipId;
          finalAmount = 0;
          checkupBenefit.usedCount += 1;
          checkupBenefit.lastUsedAt = new Date();
          await membership.save();
        }
      }
    }

    let paymentResult: any;
    if (isVipRedemption) {
      paymentResult = {
        provider: 'VIP_COMPLIMENTARY_BENEFIT',
        status: 'COMPLETED',
        transactionId: `VIP-CHK-${Date.now()}`,
      };
    } else {
      paymentResult = await paymentService.createPayment({
        amount: finalAmount,
        description: `Health Checkup: ${pkg.name} (${bookingNumber})`,
        customer: {
          name: patientName,
          email: patientEmail || user.email,
          phone: patientPhone,
        },
      });
    }

    const booking = await HealthCheckupBooking.create({
      bookingNumber,
      userId: user._id,
      packageId: pkg._id,
      facilityId: facility._id,
      patientName,
      patientAge: Number(patientAge),
      patientGender,
      patientPhone,
      patientEmail: patientEmail || user.email,
      bookingDate,
      timeSlot,
      sampleCollectionType,
      homeAddress,
      status: 'CONFIRMED',
      payment: {
        provider: paymentResult.provider,
        status: paymentResult.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        transactionId: paymentResult.transactionId,
        amount: finalAmount,
        paidAt: paymentResult.status === 'COMPLETED' ? new Date() : undefined,
      },
      notes,
      isVipRedemption,
      vipMembershipId,
      sampleStatus: 'PENDING_COLLECTION',
    });

    // Initialize blank pending result record
    await HealthCheckupResult.create({
      bookingId: booking._id,
      userId: user._id,
      packageId: pkg._id,
      status: 'PROCESSING',
      summaryObservations: 'Sample collection and diagnostic analysis in progress.',
    });

    await Notification.create({
      userId: user._id,
      type: 'HEALTH_CHECKUP',
      title: 'Health Checkup Confirmed! 🏥',
      message: `Your booking for "${pkg.name}" at ${facility.name} on ${bookingDate} (${timeSlot}) is confirmed. Booking #${bookingNumber}.`,
      link: `/user/health-checkups`,
    });

    await logAudit({
      req,
      action: 'CHECKUP_BOOKED',
      resourceType: 'HealthCheckupBooking',
      resourceId: booking._id.toString(),
      metadata: { bookingNumber, packageName: pkg.name },
    });

    // Send health checkup booking confirmation email
    emailService.sendCheckupBookingEmail(
      patientEmail || user.email,
      patientName,
      pkg.name,
      facility.name,
      bookingDate,
      timeSlot,
      bookingNumber
    ).catch(() => {});

    sendSuccess(res, booking, 'Health checkup booked successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getUserCheckupBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const bookings = await HealthCheckupBooking.find({ userId: user._id })
      .populate('packageId', 'name price discountPrice duration testCount image')
      .populate('facilityId', 'name address city phone type image')
      .sort({ bookingDate: -1 });

    sendSuccess(res, bookings);
  } catch (error) {
    next(error);
  }
}

export async function getUserCheckupResults(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const results = await HealthCheckupResult.find({ userId: user._id })
      .populate('packageId', 'name image duration testCount')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
}

export async function getResultById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const result = await HealthCheckupResult.findById(id)
      .populate('packageId')
      .populate('bookingId');

    if (!result) {
      sendError(res, 'Report result not found', 404);
      return;
    }

    const isOwner = result.userId.toString() === user._id.toString();
    const isStaff = ['ADMIN', 'DOCTOR'].includes(user.role);

    if (!isOwner && !isStaff) {
      sendError(res, 'Access denied. You do not have permission to view this medical diagnostic report.', 403);
      return;
    }

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function downloadReportFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const result = await HealthCheckupResult.findById(id);
    if (!result || !result.reportFile || !result.reportFile.filename) {
      sendError(res, 'Report document is not yet available for download.', 404);
      return;
    }

    const isOwner = result.userId.toString() === user._id.toString();
    const isStaff = ['ADMIN', 'DOCTOR'].includes(user.role);

    if (!isOwner && !isStaff) {
      sendError(res, 'Access denied.', 403);
      return;
    }

    const uploadDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
    const safeFilePath = path.join(uploadDir, path.basename(result.reportFile.filename));

    if (!fs.existsSync(safeFilePath)) {
      sendError(res, 'Report file not found on storage server', 404);
      return;
    }

    await logAudit({
      req,
      action: 'CHECKUP_REPORT_DOWNLOADED',
      resourceType: 'HealthCheckupResult',
      resourceId: result._id.toString(),
    });

    res.setHeader('Content-Type', result.reportFile.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${result.reportFile.originalName}"`);
    fs.createReadStream(safeFilePath).pipe(res);
  } catch (error) {
    next(error);
  }
}

export async function uploadCheckupResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookingId, summaryObservations, recommendations, notes, status = 'VERIFIED' } = req.body;
    const file = req.file;

    const booking = await HealthCheckupBooking.findById(bookingId);
    if (!booking) {
      sendError(res, 'Booking not found', 404);
      return;
    }

    let result = await HealthCheckupResult.findOne({ bookingId });
    if (!result) {
      result = new HealthCheckupResult({
        bookingId: booking._id,
        userId: booking.userId,
        packageId: booking.packageId,
      });
    }

    result.status = status;
    result.summaryObservations = summaryObservations || result.summaryObservations;
    result.recommendations = recommendations || result.recommendations;
    result.notes = notes || result.notes;
    result.verifiedAt = new Date();
    result.verifiedBy = 'Dr. Chief Pathologist, Medicare Central Labs';

    if (file) {
      result.reportFile = {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      };
      result.uploadedAt = new Date();
    }

    await result.save();
    booking.status = 'COMPLETED';
    await booking.save();

    await Notification.create({
      userId: booking.userId,
      type: 'HEALTH_CHECKUP',
      title: 'Lab Report Available! 📄',
      message: `The medical report for your health checkup (${booking.bookingNumber}) is now verified and available in your dashboard.`,
      link: `/user/health-checkups`,
    });

    await logAudit({
      req,
      action: 'CHECKUP_REPORT_PUBLISHED',
      resourceType: 'HealthCheckupResult',
      resourceId: result._id.toString(),
    });

    // Send diagnostic report available email
    User.findById(booking.userId).then((checkupUser) => {
      if (checkupUser) {
        emailService.sendHealthReportAvailableEmail(
          checkupUser.email,
          booking.patientName,
          'Diagnostic Health Checkup Panel',
          booking.bookingNumber
        ).catch(() => {});
      }
    }).catch(() => {});

    sendSuccess(res, result, 'Checkup result uploaded and verified successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAllCheckupBookings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await HealthCheckupBooking.find()
      .populate('userId', 'fullName email phone')
      .populate('packageId', 'name price discountPrice duration')
      .populate('facilityId', 'name city address')
      .sort({ createdAt: -1 });

    sendSuccess(res, bookings);
  } catch (error) {
    next(error);
  }
}

export async function updateCheckupBookingAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, sampleStatus, phlebotomistName, notes, isVipRedemption } = req.body;

    const booking = await HealthCheckupBooking.findById(id)
      .populate('userId', 'fullName email')
      .populate('packageId', 'name')
      .populate('facilityId', 'name');

    if (!booking) {
      sendError(res, 'Health checkup booking not found', 404);
      return;
    }

    if (status) booking.status = status;
    if (sampleStatus) booking.sampleStatus = sampleStatus;
    if (phlebotomistName !== undefined) booking.phlebotomistName = phlebotomistName;
    if (notes !== undefined) booking.notes = notes;
    if (isVipRedemption !== undefined) booking.isVipRedemption = isVipRedemption;

    await booking.save();

    await Notification.create({
      userId: booking.userId,
      type: 'HEALTH_CHECKUP',
      title: 'Health Checkup Status Updated 📋',
      message: `Your booking #${booking.bookingNumber} (${(booking.packageId as any)?.name}) is now marked as ${booking.status}${
        booking.sampleStatus ? ` [Sample: ${booking.sampleStatus.replace(/_/g, ' ')}]` : ''
      }.`,
      link: '/user/health-checkups',
    });

    await logAudit({
      req,
      action: 'CHECKUP_BOOKING_ADMIN_UPDATED',
      resourceType: 'HealthCheckupBooking',
      resourceId: booking._id.toString(),
      metadata: { status: booking.status, sampleStatus: booking.sampleStatus, phlebotomistName },
    });

    sendSuccess(res, booking, 'Health checkup booking updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAllTests(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tests = await Test.find({ isActive: true }).sort({ category: 1, name: 1 });
    sendSuccess(res, tests);
  } catch (error) {
    next(error);
  }
}

export async function createCheckupPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      discountPrice,
      duration,
      includedTests = [],
      recommendedFor,
      image,
    } = req.body;

    if (!name || price === undefined || price === null) {
      sendError(res, 'Package name and price are required.', 400);
      return;
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const testArray = Array.isArray(includedTests) ? includedTests : [];

    const pkg = await HealthCheckupPackage.create({
      name,
      slug,
      description: description || 'Comprehensive preventative healthcare checkup bundle.',
      shortDescription: shortDescription || (description ? description.slice(0, 120) : ''),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      duration: duration || '2 Hours',
      testCount: testArray.length,
      includedTests: testArray,
      recommendedFor: recommendedFor || 'Men and Women of all ages',
      image: image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
    });

    await logAudit({
      req,
      action: 'CHECKUP_PACKAGE_CREATED',
      resourceType: 'HealthCheckupPackage',
      resourceId: pkg._id.toString(),
      metadata: { name, slug, price: pkg.price },
    });

    sendSuccess(res, pkg, 'Checkup package created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteCheckupPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await HealthCheckupPackage.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
    if (!pkg) {
      sendError(res, 'Checkup package not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'CHECKUP_PACKAGE_DEACTIVATED',
      resourceType: 'HealthCheckupPackage',
      resourceId: id,
    });

    sendSuccess(res, pkg, 'Checkup package deactivated successfully');
  } catch (error) {
    next(error);
  }
}

export async function createTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      code,
      category,
      sampleType,
      preparationInstructions,
      description,
      price,
    } = req.body;

    if (!name || price === undefined || price === null) {
      sendError(res, 'Test name and price are required.', 400);
      return;
    }

    const testCode = code ? code.trim().toUpperCase() : `LAB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const test = await Test.create({
      name,
      code: testCode,
      category: category || 'General Pathology',
      sampleType: sampleType || 'Venous Blood',
      preparationInstructions: preparationInstructions || '10-12 hours fasting required before test.',
      description: description || '',
      price: Number(price),
      isActive: true,
    });

    await logAudit({
      req,
      action: 'LAB_TEST_CREATED',
      resourceType: 'Test',
      resourceId: test._id.toString(),
      metadata: { name, code: testCode, category: test.category },
    });

    sendSuccess(res, test, 'Laboratory test registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const test = await Test.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!test) {
      sendError(res, 'Laboratory test not found', 404);
      return;
    }

    await logAudit({
      req,
      action: 'LAB_TEST_DEACTIVATED',
      resourceType: 'Test',
      resourceId: id,
    });

    sendSuccess(res, test, 'Laboratory test deactivated successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadPackageImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'No image file uploaded. Please select an image file (JPG, PNG, WebP).', 400);
      return;
    }

    const file = req.file;
    const imageUrl = `/uploads/${file.filename}`;

    await logAudit({
      req,
      action: 'CHECKUP_PACKAGE_IMAGE_UPLOADED',
      resourceType: 'HealthCheckupPackageImage',
      resourceId: file.filename,
      metadata: {
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: imageUrl,
      },
    });

    sendSuccess(
      res,
      {
        url: imageUrl,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
      'Package image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}
