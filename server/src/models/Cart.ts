import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  medicineId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [
      {
        medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
