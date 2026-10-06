import mongoose, { Document, Schema } from 'mongoose';

export interface ITest extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  category: string;
  sampleType: string; // Blood, Urine, Saliva, Imaging, etc.
  preparationInstructions: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestSchema = new Schema<ITest>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, required: true, trim: true },
    sampleType: { type: String, default: 'Blood' },
    preparationInstructions: { type: String, default: '10-12 hours fasting required before test.' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Test = mongoose.model<ITest>('Test', TestSchema);

export interface IHealthCheckupPackage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  duration: string; // e.g. "2 - 3 hours"
  testCount: number;
  includedTests: mongoose.Types.ObjectId[];
  recommendedFor: string; // e.g. "Adults 30+, individuals with sedentary lifestyle"
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const HealthCheckupPackageSchema = new Schema<IHealthCheckupPackage>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    duration: { type: String, default: '2 Hours' },
    testCount: { type: Number, default: 0 },
    includedTests: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
    recommendedFor: { type: String, default: 'Men and Women of all ages' },
    image: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

export const HealthCheckupPackage = mongoose.model<IHealthCheckupPackage>(
  'HealthCheckupPackage',
  HealthCheckupPackageSchema
);

export type CheckupBookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'RESCHEDULE_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface IHealthCheckupBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  patientPhone: string;
  patientEmail: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00 AM"
  sampleCollectionType: 'AT_CENTER' | 'HOME_COLLECTION';
  homeAddress?: string;
  status: CheckupBookingStatus;
  payment: {
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    transactionId?: string;
    amount: number;
    paidAt?: Date;
  };
  notes?: string;
  isVipRedemption?: boolean;
  vipMembershipId?: string;
  phlebotomistName?: string;
  sampleStatus?: 'PENDING_COLLECTION' | 'SAMPLE_COLLECTED' | 'IN_LAB_ANALYSIS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const HealthCheckupBookingSchema = new Schema<IHealthCheckupBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'HealthCheckupPackage', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    patientPhone: { type: String, required: true, trim: true },
    patientEmail: { type: String, required: true, trim: true, lowercase: true },
    bookingDate: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    sampleCollectionType: { type: String, enum: ['AT_CENTER', 'HOME_COLLECTION'], default: 'AT_CENTER' },
    homeAddress: { type: String },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    payment: {
      provider: { type: String, default: 'mock' },
      status: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
      transactionId: { type: String },
      amount: { type: Number, required: true },
      paidAt: { type: Date },
    },
    notes: { type: String },
    isVipRedemption: { type: Boolean, default: false, index: true },
    vipMembershipId: { type: String },
    phlebotomistName: { type: String },
    sampleStatus: {
      type: String,
      enum: ['PENDING_COLLECTION', 'SAMPLE_COLLECTED', 'IN_LAB_ANALYSIS', 'COMPLETED'],
      default: 'PENDING_COLLECTION',
    },
  },
  { timestamps: true }
);

export const HealthCheckupBooking = mongoose.model<IHealthCheckupBooking>(
  'HealthCheckupBooking',
  HealthCheckupBookingSchema
);

export interface IHealthCheckupResult extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  status: 'PROCESSING' | 'AVAILABLE' | 'VERIFIED';
  reportFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };
  summaryObservations?: string;
  recommendations?: string;
  uploadedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthCheckupResultSchema = new Schema<IHealthCheckupResult>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'HealthCheckupBooking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'HealthCheckupPackage', required: true },
    status: {
      type: String,
      enum: ['PROCESSING', 'AVAILABLE', 'VERIFIED'],
      default: 'PROCESSING',
      index: true,
    },
    reportFile: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
    summaryObservations: { type: String },
    recommendations: { type: String },
    uploadedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const HealthCheckupResult = mongoose.model<IHealthCheckupResult>(
  'HealthCheckupResult',
  HealthCheckupResultSchema
);
