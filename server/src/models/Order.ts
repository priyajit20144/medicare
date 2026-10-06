import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'PHARMACY_REVIEW'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface IOrderItem {
  medicineId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  requiresPrescription: boolean;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment: {
    provider: string; // 'mock', 'stripe', 'razorpay'
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    paidAt?: Date;
  };
  status: OrderStatus;
  prescriptionId?: mongoose.Types.ObjectId;
  prescriptionStatus?: 'NOT_REQUIRED' | 'ATTACHED' | 'VERIFIED' | 'REJECTED';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        name: { type: String, required: true },
        sku: { type: String, required: true },
        image: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        requiresPrescription: { type: Boolean, default: false },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'United States' },
    },
    payment: {
      provider: { type: String, default: 'mock' },
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
      },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
    status: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'PHARMACY_REVIEW',
        'READY_TO_SHIP',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    prescriptionStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'ATTACHED', 'VERIFIED', 'REJECTED'],
      default: 'NOT_REQUIRED',
    },
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
