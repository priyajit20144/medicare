import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'United States', trim: true },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
  },
  { timestamps: true }
);

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
