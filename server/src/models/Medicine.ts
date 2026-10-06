import mongoose, { Document, Schema } from 'mongoose';

export type MedicineStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface IMedicine extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  genericName: string;
  brand: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  manufacturer: string;
  dosageForm: string; // Tablet, Capsule, Syrup, Injection, Cream, Drops
  strength: string; // 500mg, 10mg/ml, etc.
  packSize: string; // Strip of 10, 100ml bottle, etc.
  requiresPrescription: boolean;
  directions: string;
  warnings: string;
  ingredients: string[];
  status: MedicineStatus;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    genericName: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    dosageForm: { type: String, required: true, trim: true },
    strength: { type: String, required: true, trim: true },
    packSize: { type: String, required: true, trim: true },
    requiresPrescription: { type: Boolean, default: false, index: true },
    directions: { type: String, default: 'Use strictly as directed by your physician.' },
    warnings: { type: String, default: 'Keep out of reach of children. Store below 25°C.' },
    ingredients: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'],
      default: 'ACTIVE',
      index: true,
    },
    rating: { type: Number, default: 4.7, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MedicineSchema.index({ name: 'text', genericName: 'text', brand: 'text', description: 'text' });
MedicineSchema.index({ price: 1, category: 1, requiresPrescription: 1 });

export const Medicine = mongoose.model<IMedicine>('Medicine', MedicineSchema);
