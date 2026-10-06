import mongoose, { Document, Schema } from 'mongoose';

export interface IPharmacist extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  qualification: string;
  yearsOfExperience: number;
  isVerified: boolean;
  isActive: boolean;
  assignedFacility?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacistSchema = new Schema<IPharmacist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    qualification: { type: String, default: 'Pharm.D / B.Pharm' },
    yearsOfExperience: { type: Number, default: 5 },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    assignedFacility: { type: String, default: 'Medicare Central Pharmacy' },
  },
  { timestamps: true }
);

export const Pharmacist = mongoose.model<IPharmacist>('Pharmacist', PharmacistSchema);
