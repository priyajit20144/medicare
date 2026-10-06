import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:medicineId', updateCartItemQuantity);
router.delete('/items/:medicineId', removeCartItem);
router.delete('/', clearCart);

export default router;
