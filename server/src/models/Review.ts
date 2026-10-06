import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  targetType: 'MEDICINE' | 'DOCTOR' | 'FACILITY' | 'PACKAGE';
  targetId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['MEDICINE', 'DOCTOR', 'FACILITY', 'PACKAGE'],
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ targetType: 1, targetId: 1, rating: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
