import { Router } from 'express';
import {
  getMembershipPlans,
  getCurrentMembership,
  subscribeMembership,
  useBenefit,
  getAllMemberships,
  getMembershipAdminStats,
  updateMembershipStatus,
  adjustMembershipCheckupBenefit,
  grantUserMembership,
  updateMembershipPlan,
} from '../controllers/membershipController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public & User routes
router.get('/plans', getMembershipPlans);
router.get('/me', authenticate, getCurrentMembership);
router.post('/subscribe', authenticate, subscribeMembership);
router.post('/use-benefit', authenticate, useBenefit);

// Admin Operations
router.get('/admin/stats', authenticate, requireRole('ADMIN'), getMembershipAdminStats);
router.get('/admin/all', authenticate, requireRole('ADMIN'), getAllMemberships);
router.post('/admin/grant', authenticate, requireRole('ADMIN'), grantUserMembership);
router.patch('/admin/:id/status', authenticate, requireRole('ADMIN'), updateMembershipStatus);
router.patch('/admin/:id/benefits', authenticate, requireRole('ADMIN'), adjustMembershipCheckupBenefit);
router.patch('/admin/plans/:id', authenticate, requireRole('ADMIN'), updateMembershipPlan);
router.put('/admin/plans/:id', authenticate, requireRole('ADMIN'), updateMembershipPlan);

export default router;
