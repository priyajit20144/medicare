import mongoose, { Document, Schema } from 'mongoose';

export type PrescriptionStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUIRED'
  | 'EXPIRED';

export interface IPrescriptionFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface IPrescriptionRecommendation {
  medicineId: mongoose.Types.ObjectId;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorName?: string;
  prescriptionDate?: Date;
  notes?: string;
  status: PrescriptionStatus;
  files: IPrescriptionFile[];
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId; // Pharmacist or Admin user id
  reviewedAt?: Date;
  recommendedMedicines: IPrescriptionRecommendation[];
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number },
    patientGender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    doctorName: { type: String, trim: true },
    prescriptionDate: { type: Date },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED', 'EXPIRED'],
      default: 'PENDING_REVIEW',
      index: true,
    },
    files: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        path: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    reviewNotes: { type: String, default: '' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    recommendedMedicines: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
      },
    ],
    validUntil: { type: Date },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ userId: 1, status: 1 });
PrescriptionSchema.index({ createdAt: -1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
