import mongoose, { Document, Schema } from 'mongoose';

export type MembershipStatus =
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUSPENDED';

export type BenefitFrequency = 'ONE_TIME' | 'MONTHLY' | 'UNLIMITED' | 'LIMITED_USE';

export interface IBenefitConfig {
  key: string;
  name: string;
  description: string;
  frequency: BenefitFrequency;
  maxLimit?: number;
}

export interface IMembershipPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  durationMonths: number;
  price: number;
  discountPrice?: number;
  features: string[];
  benefitsConfig: IBenefitConfig[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    durationMonths: { type: Number, required: true, default: 12 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    features: [{ type: String, trim: true }],
    benefitsConfig: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        frequency: {
          type: String,
          enum: ['ONE_TIME', 'MONTHLY', 'UNLIMITED', 'LIMITED_USE'],
          default: 'LIMITED_USE',
        },
        maxLimit: { type: Number, default: 1 },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);

export interface IBenefitUsage {
  benefitKey: string;
  name: string;
  usedCount: number;
  maxLimit?: number;
  lastUsedAt?: Date;
}

export interface IUserMembership extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  membershipId: string; // e.g. MC-VIP-2026-XXXX
  startDate: Date;
  endDate: Date;
  status: MembershipStatus;
  autoRenew: boolean;
  benefitUsages: IBenefitUsage[];
  payment: {
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    transactionId?: string;
    amount: number;
    paidAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserMembershipSchema = new Schema<IUserMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    membershipId: { type: String, required: true, unique: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    autoRenew: { type: Boolean, default: false },
    benefitUsages: [
      {
        benefitKey: { type: String, required: true },
        name: { type: String, required: true },
        usedCount: { type: Number, default: 0 },
        maxLimit: { type: Number },
        lastUsedAt: { type: Date },
      },
    ],
    payment: {
      provider: { type: String, default: 'mock' },
      status: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
      transactionId: { type: String },
      amount: { type: Number, required: true },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const UserMembership = mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);
