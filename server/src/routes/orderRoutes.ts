import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// User endpoints
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/cancel', authenticate, cancelOrder);

// Admin & Pharmacist endpoints
router.get('/admin/all', authenticate, requireRole('ADMIN', 'PHARMACIST'), getAllOrders);
router.patch('/admin/:id/status', authenticate, requireRole('ADMIN', 'PHARMACIST'), updateOrderStatus);

export default router;
