import { Router } from 'express';
import {
  getAnalyticsOverview,
  getUsersList,
  updateUserStatus,
  getPharmacistsList,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/analytics/overview', getAnalyticsOverview);
router.get('/users', getUsersList);
router.patch('/users/:id/status', updateUserStatus);
router.get('/pharmacists', getPharmacistsList);

export default router;
