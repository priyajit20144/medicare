import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ENV } from '../config/env';

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types for healthcare documents
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${file.mimetype}). Only PDF, JPG, JPEG, PNG, and WebP are allowed for medical documents.`
      )
    );
  }
};

const maxSizeBytes = ENV.MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSizeBytes,
    files: 5,
  },
});

const imageOnlyFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedImageMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedImageMimes.includes(file.mimetype) && allowedImageExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid image format (${file.mimetype}). Only JPG, PNG, and WebP are allowed for medicine products.`
      )
    );
  }
};

export const medicineImageUpload = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: maxSizeBytes,
    files: 1,
  },
});

