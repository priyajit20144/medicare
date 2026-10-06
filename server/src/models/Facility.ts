import mongoose, { Document, Schema } from 'mongoose';

export type FacilityType =
  | 'DIAGNOSTIC_CENTER'
  | 'PARTNER_CLINIC'
  | 'HEALTH_CHECKUP_CENTER'
  | 'PHARMACY'
  | 'COLLECTION_CENTER'
  | 'DOCTOR_CONSULTATION_CENTER';

export interface IFacility extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: FacilityType;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  openingHours: string;
  services: string[];
  checkupPackages: mongoose.Types.ObjectId[];
  image: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema = new Schema<IFacility>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: [
        'DIAGNOSTIC_CENTER',
        'PARTNER_CLINIC',
        'HEALTH_CHECKUP_CENTER',
        'PHARMACY',
        'COLLECTION_CENTER',
        'DOCTOR_CONSULTATION_CENTER',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    openingHours: { type: String, default: 'Mon - Sat: 07:00 AM - 09:00 PM' },
    services: [{ type: String, trim: true }],
    checkupPackages: [{ type: Schema.Types.ObjectId, ref: 'HealthCheckupPackage' }],
    image: { type: String },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);
