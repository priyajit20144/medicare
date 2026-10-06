import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import mongoose from 'mongoose';

import { ENV, isDev } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import medicineRoutes from './routes/medicineRoutes';
import categoryRoutes from './routes/categoryRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import doctorRoutes from './routes/doctorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import membershipRoutes from './routes/membershipRoutes';
import healthCheckupRoutes from './routes/healthCheckupRoutes';
import facilityRoutes from './routes/facilityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import emailRoutes from './routes/emailRoutes';

export const app = express();

// Security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CORS_ORIGIN
      if (!origin || origin.includes('localhost') || origin === ENV.CORS_ORIGIN) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev
      }
    },
    credentials: true,
  })
);

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (isDev) {
  app.use(morgan('dev'));
}

// Rate limiting for API endpoints (200 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests created from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    service: 'Medicare Healthcare Platform API',
    status: 'ONLINE',
    database: {
      status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
      readyState: mongoose.connection.readyState,
      host: isDbConnected ? mongoose.connection.host : undefined,
      name: isDbConnected ? mongoose.connection.name : undefined,
    },
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Static uploads directory for media assets
const uploadDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
app.use('/uploads', express.static(uploadDir));
app.use('/api/uploads', express.static(uploadDir));

// Mount modular feature routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/health-checkups', healthCheckupRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/email', emailRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' not found on Medicare server.`,
  });
});

// Centralized error handling
app.use(errorHandler);
