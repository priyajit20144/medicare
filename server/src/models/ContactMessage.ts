import mongoose, { Document, Schema } from 'mongoose';

export type ContactTopic =
  | 'GENERAL'
  | 'MEDICINE_ORDER'
  | 'PRESCRIPTION'
  | 'APPOINTMENT'
  | 'HEALTH_CHECKUP'
  | 'TECHNICAL';

export interface IContactMessage extends Document {
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, maxlength: 30 },
    topic: {
      type: String,
      enum: ['GENERAL', 'MEDICINE_ORDER', 'PRESCRIPTION', 'APPOINTMENT', 'HEALTH_CHECKUP', 'TECHNICAL'],
      default: 'GENERAL',
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

