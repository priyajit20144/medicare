import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  biography: string;
  avatar?: string;
  languages: string[];
  consultationTypes: ('IN_PERSON' | 'VIDEO')[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  hospitalAffiliation?: string;
  availableDays: string[];
  availableSlots: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    specialization: { type: String, required: true, trim: true, index: true },
    qualifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, required: true, min: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    biography: { type: String, default: '' },
    avatar: { type: String },
    languages: [{ type: String, trim: true }],
    consultationTypes: [{ type: String, enum: ['IN_PERSON', 'VIDEO'], default: ['IN_PERSON', 'VIDEO'] }],
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    hospitalAffiliation: { type: String, default: 'Medicare Central Medical Hospital' },
    availableDays: [{ type: String }],
    availableSlots: [{ type: String }],
  },
  { timestamps: true }
);

DoctorSchema.index({ specialization: 1, isActive: 1 });
DoctorSchema.index({ consultationFee: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
