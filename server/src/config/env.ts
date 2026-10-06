import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or current directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'REPLACE_WITH_YOUR_JWT_SECRET',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET || 'REPLACE_WITH_YOUR_SESSION_SECRET',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
  PAYMENT_SECRET: process.env.PAYMENT_SECRET || '',
  // SMTP / Email Service
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'no-reply@yourdomain.com',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Medicare',
  MAILOFLY_API_KEY: process.env.MAILOFLY_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'http://localhost:5000',
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
  AUTH0_ISSUER_URL: process.env.AUTH0_ISSUER_URL || (process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/` : ''),
  AUTH0_API_ID: process.env.AUTH0_API_ID || '6abc42caa9ce5f0ef7176151',
};

export const isDev = ENV.NODE_ENV === 'development';
export const isProd = ENV.NODE_ENV === 'production';
