import { Router } from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
} from '../controllers/facilityController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getFacilities);
router.get('/:id', getFacilityById);
router.post('/admin', authenticate, requireRole('ADMIN'), createFacility);
router.patch('/admin/:id', authenticate, requireRole('ADMIN'), updateFacility);

export default router;
