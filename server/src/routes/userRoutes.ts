import { Router } from 'express';
import { getUserDashboardSummary } from '../controllers/userDashboardController';
import { Address } from '../models/Address';
import { authenticate } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(authenticate);

router.get('/dashboard-summary', getUserDashboardSummary);

// User addresses
router.get('/addresses', async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    sendSuccess(res, addresses);
  } catch (e) {
    next(e);
  }
});

router.post('/addresses', async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault, addressType } = req.body;
    if (isDefault) {
      await Address.updateMany({ userId: req.user!._id }, { isDefault: false });
    }
    const address = await Address.create({
      userId: req.user!._id,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'United States',
      isDefault: Boolean(isDefault),
      addressType: addressType || 'HOME',
    });
    sendSuccess(res, address, 'Address added successfully', 201);
  } catch (e) {
    next(e);
  }
});

router.delete('/addresses/:id', async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!address) {
      sendError(res, 'Address not found', 404);
      return;
    }
    sendSuccess(res, null, 'Address deleted successfully');
  } catch (e) {
    next(e);
  }
});

export default router;
