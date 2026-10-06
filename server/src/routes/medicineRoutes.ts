import { Router } from 'express';
import {
  getMedicines,
  getMedicineById,
  getRelatedMedicines,
  getFilterMetadata,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  uploadMedicineImage,
} from '../controllers/medicineController';
import { authenticate, requireRole } from '../middleware/auth';
import { medicineImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getMedicines);
router.get('/meta/filters', getFilterMetadata);
router.get('/:id', getMedicineById);
router.get('/:id/related', getRelatedMedicines);

// Administrative operations
router.post('/upload-image', authenticate, requireRole('ADMIN'), medicineImageUpload.single('image'), uploadMedicineImage);
router.post('/', authenticate, requireRole('ADMIN'), createMedicine);
router.patch('/:id', authenticate, requireRole('ADMIN'), updateMedicine);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteMedicine);

export default router;
