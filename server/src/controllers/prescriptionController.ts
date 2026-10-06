import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { Prescription, IPrescriptionFile } from '../models/Prescription';
import { Notification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { emailService } from '../services/emailService';
import { ENV } from '../config/env';

/**
 * User uploads new prescription document(s)
 */
export async function uploadPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { patientName, patientAge, patientGender, doctorName, prescriptionDate, notes } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      sendError(res, 'Please upload at least one prescription document (PDF or image).', 400);
      return;
    }

    const prescriptionFiles: IPrescriptionFile[] = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedAt: new Date(),
    }));

    const prescription = await Prescription.create({
      userId: user._id,
      patientName: patientName || user.fullName,
      patientAge: patientAge ? Number(patientAge) : undefined,
      patientGender,
      doctorName,
      prescriptionDate: prescriptionDate ? new Date(prescriptionDate) : new Date(),
      notes,
      status: 'PENDING_REVIEW',
      files: prescriptionFiles,
    });

    // Notify user that prescription was received
    await Notification.create({
      userId: user._id,
      type: 'PRESCRIPTION',
      title: 'Prescription Submitted',
      message: 'Your prescription has been received and is queued for verification by a licensed pharmacist.',
      link: `/user/prescriptions/${prescription._id}`,
    });

    await logAudit({
      req,
      action: 'PRESCRIPTION_UPLOADED',
      resourceType: 'Prescription',
      resourceId: prescription._id.toString(),
      metadata: { fileCount: files.length, patientName },
    });

    // Send prescription uploaded confirmation email
    emailService.sendPrescriptionUploadedEmail(user.email, patientName, prescription._id.toString()).catch(() => {});

    sendSuccess(res, prescription, 'Prescription uploaded successfully. A pharmacist will review it shortly.', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * User views their own prescriptions
 */
export async function getUserPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId: user._id };
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('recommendedMedicines.medicineId', 'name genericName brand price discountPrice images packSize')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Prescription.countDocuments(query),
    ]);

    sendSuccess(res, {
      prescriptions,
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

/**
 * Get prescription details with ownership and authorization check
 */
export async function getPrescriptionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate('userId', 'fullName email phone')
      .populate('reviewedBy', 'fullName email')
      .populate('recommendedMedicines.medicineId', 'name genericName brand price discountPrice images packSize');

    if (!prescription) {
      sendError(res, 'Prescription not found', 404);
      return;
    }

    // Ownership check: regular users can only see their own prescriptions
    const isOwner = prescription.userId._id.toString() === user._id.toString();
    const isStaff = ['PHARMACIST', 'ADMIN', 'DOCTOR'].includes(user.role);

    if (!isOwner && !isStaff) {
      sendError(res, 'Access denied. You do not have permission to view this medical record.', 403);
      return;
    }

    sendSuccess(res, prescription);
  } catch (error) {
    next(error);
  }
}

/**
 * Pharmacist / Admin queue of prescriptions
 */
export async function getPrescriptionQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ patientName: searchRegex }, { doctorName: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(query)
        .populate('userId', 'fullName email phone')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Prescription.countDocuments(query),
    ]);

    sendSuccess(res, {
      prescriptions,
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

/**
 * Pharmacist review action: Approve, Reject, or Request Clarification
 */
export async function reviewPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id } = req.params;
    const { status, reviewNotes, recommendedMedicines, validDays = 30 } = req.body;

    if (!['APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED', 'UNDER_REVIEW'].includes(status)) {
      sendError(res, 'Invalid review status provided.', 400);
      return;
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      sendError(res, 'Prescription not found', 404);
      return;
    }

    prescription.status = status;
    prescription.reviewNotes = reviewNotes || prescription.reviewNotes;
    prescription.reviewedBy = user._id;
    prescription.reviewedAt = new Date();

    if (status === 'APPROVED') {
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + (Number(validDays) || 30));
      prescription.validUntil = validUntilDate;
    }

    if (Array.isArray(recommendedMedicines)) {
      prescription.recommendedMedicines = recommendedMedicines;
    }

    await prescription.save();

    // Create user notification based on review outcome
    let title = 'Prescription Review Update';
    let message = `Your prescription status is now: ${status.replace(/_/g, ' ')}.`;

    if (status === 'APPROVED') {
      title = 'Prescription Approved! ✅';
      message = 'Your prescription has been approved by our licensed pharmacist. You can now purchase your required medications.';
    } else if (status === 'REJECTED') {
      title = 'Prescription Not Approved';
      message = `Your prescription could not be approved. Reason: ${reviewNotes || 'Document illegible or invalid'}.`;
    } else if (status === 'CLARIFICATION_REQUIRED') {
      title = 'Prescription Clarification Required';
      message = `The pharmacist requested clarification: ${reviewNotes || 'Please check and re-upload'}.`;
    }

    await Notification.create({
      userId: prescription.userId,
      type: 'PRESCRIPTION',
      title,
      message,
      link: `/user/prescriptions/${prescription._id}`,
    });

    await logAudit({
      req,
      action: `PRESCRIPTION_${status}`,
      resourceType: 'Prescription',
      resourceId: prescription._id.toString(),
      metadata: { status, reviewNotes },
    });

    // Dispatch corresponding prescription outcome email
    User.findById(prescription.userId).then((prescUser) => {
      if (!prescUser) return;
      if (status === 'APPROVED') {
        emailService.sendPrescriptionApprovedEmail(prescUser.email, prescription.patientName, prescription._id.toString(), Number(validDays) || 30).catch(() => {});
      } else if (status === 'REJECTED') {
        emailService.sendPrescriptionRejectedEmail(prescUser.email, prescription.patientName, prescription._id.toString(), reviewNotes).catch(() => {});
      } else if (status === 'CLARIFICATION_REQUIRED') {
        emailService.sendPrescriptionClarificationEmail(prescUser.email, prescription.patientName, prescription._id.toString(), reviewNotes).catch(() => {});
      }
    }).catch(() => {});

    sendSuccess(res, prescription, `Prescription review recorded as ${status}`);
  } catch (error) {
    next(error);
  }
}

/**
 * Securely stream/download private prescription document
 */
export async function downloadPrescriptionFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { id, filename } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      sendError(res, 'Prescription record not found', 404);
      return;
    }

    // Strict ownership and role access validation
    const isOwner = prescription.userId.toString() === user._id.toString();
    const isStaff = ['PHARMACIST', 'ADMIN', 'DOCTOR'].includes(user.role);

    if (!isOwner && !isStaff) {
      sendError(res, 'Access denied. You are not authorized to view this medical document.', 403);
      return;
    }

    const fileMeta = prescription.files.find((f) => f.filename === filename);
    if (!fileMeta) {
      sendError(res, 'File not found on prescription record', 404);
      return;
    }

    const uploadDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
    const safeFilePath = path.join(uploadDir, path.basename(filename));

    if (!fs.existsSync(safeFilePath)) {
      sendError(res, 'Document file not found on storage server', 404);
      return;
    }

    await logAudit({
      req,
      action: 'PRESCRIPTION_DOCUMENT_VIEWED',
      resourceType: 'PrescriptionFile',
      resourceId: prescription._id.toString(),
      metadata: { filename: fileMeta.originalName },
    });

    res.setHeader('Content-Type', fileMeta.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileMeta.originalName}"`);
    fs.createReadStream(safeFilePath).pipe(res);
  } catch (error) {
    next(error);
  }
}
