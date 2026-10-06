import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'ORDER'
  | 'PRESCRIPTION'
  | 'APPOINTMENT'
  | 'MEMBERSHIP'
  | 'HEALTH_CHECKUP'
  | 'SYSTEM';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['ORDER', 'PRESCRIPTION', 'APPOINTMENT', 'MEMBERSHIP', 'HEALTH_CHECKUP', 'SYSTEM'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
