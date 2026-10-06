import { Router } from 'express';
import { Review } from '../models/Review';
import { authenticate } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Public reviews lookup by targetType and targetId
router.get('/', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      sendError(res, 'targetType and targetId are required', 400);
      return;
    }

    const reviews = await Review.find({
      targetType: String(targetType).toUpperCase() as any,
      targetId: targetId as any,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
});

// Authenticated user posts a review
router.post('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user!;
    const { targetType, targetId, rating, title, comment } = req.body;

    if (!targetType || !targetId || !rating || !title || !comment) {
      sendError(res, 'Please provide targetType, targetId, rating, title, and comment', 400);
      return;
    }

    const review = await Review.create({
      userId: user._id,
      userName: user.fullName,
      targetType: targetType.toUpperCase(),
      targetId,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: true,
    });

    sendSuccess(res, review, 'Thank you! Your feedback has been published.', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
