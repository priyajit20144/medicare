import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'USER' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  auth0Id?: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    auth0Id: { type: String, sparse: true, index: true },
    role: {
      type: String,
      enum: ['USER', 'DOCTOR', 'PHARMACIST', 'ADMIN'],
      default: 'USER',
      index: true,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    bloodGroup: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
