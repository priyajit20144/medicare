import { Router } from 'express';
import {
  getAllCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getAllCategories);
router.get('/admin', authenticate, requireRole('ADMIN'), getAdminCategories);
router.post('/', authenticate, requireRole('ADMIN'), createCategory);
router.patch('/:id', authenticate, requireRole('ADMIN'), updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCategory);

export default router;
