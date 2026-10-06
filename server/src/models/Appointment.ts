import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentNumber: string;
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  symptoms?: string;
  consultationType: 'IN_PERSON' | 'VIDEO';
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 AM" or "14:30"
  fee: number;
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  prescriptionGiven?: string;
  payment: {
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    transactionId?: string;
    paidAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentNumber: { type: String, required: true, unique: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, required: true, trim: true },
    patientEmail: { type: String, required: true, trim: true, lowercase: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    symptoms: { type: String, default: '' },
    consultationType: { type: String, enum: ['IN_PERSON', 'VIDEO'], default: 'VIDEO' },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'PENDING',
      index: true,
    },
    notes: { type: String, default: '' },
    meetingLink: { type: String },
    prescriptionGiven: { type: String },
    payment: {
      provider: { type: String, default: 'mock' },
      status: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound index to quickly find conflicts or query doctor slots
AppointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });
AppointmentSchema.index({ userId: 1, date: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
