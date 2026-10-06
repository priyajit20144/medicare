import { Router } from 'express';
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  getPrescriptionQueue,
  reviewPrescription,
  downloadPrescriptionFile,
} from '../controllers/prescriptionController';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// User endpoints
router.post('/', authenticate, uploadMiddleware.array('files', 5), uploadPrescription);
router.get('/my', authenticate, getUserPrescriptions);
router.get('/:id', authenticate, getPrescriptionById);
router.get('/:id/files/:filename', authenticate, downloadPrescriptionFile);

// Pharmacist & Admin queue
router.get('/queue/all', authenticate, requireRole('PHARMACIST', 'ADMIN'), getPrescriptionQueue);
router.patch('/:id/review', authenticate, requireRole('PHARMACIST', 'ADMIN'), reviewPrescription);

export default router;
