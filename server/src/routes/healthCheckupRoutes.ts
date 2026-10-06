import { Router } from 'express';
import {
  getCheckupPackages,
  getCheckupPackageById,
  bookCheckup,
  getUserCheckupBookings,
  getUserCheckupResults,
  getResultById,
  downloadReportFile,
  uploadCheckupResult,
  getAllCheckupBookings,
  updateCheckupBookingAdmin,
  getAllTests,
  createCheckupPackage,
  deleteCheckupPackage,
  createTest,
  deleteTest,
  uploadPackageImage,
} from '../controllers/healthCheckupController';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadMiddleware, medicineImageUpload } from '../middleware/upload';

const router = Router();

// Public package browsing
router.get('/packages', getCheckupPackages);
router.get('/packages/:id', getCheckupPackageById);
router.get('/tests', getAllTests);

// User booking & results
router.post('/bookings', authenticate, bookCheckup);
router.get('/bookings/my', authenticate, getUserCheckupBookings);
router.get('/results/my', authenticate, getUserCheckupResults);
router.get('/results/:id', authenticate, getResultById);
router.get('/results/:id/download', authenticate, downloadReportFile);

// Admin & Staff operations
router.post('/packages/upload-image', authenticate, requireRole('ADMIN'), medicineImageUpload.single('image'), uploadPackageImage);
router.post('/packages', authenticate, requireRole('ADMIN'), createCheckupPackage);
router.delete('/packages/:id', authenticate, requireRole('ADMIN'), deleteCheckupPackage);

router.post('/tests', authenticate, requireRole('ADMIN'), createTest);
router.delete('/tests/:id', authenticate, requireRole('ADMIN'), deleteTest);

router.post('/results/upload', authenticate, requireRole('ADMIN', 'DOCTOR'), uploadMiddleware.single('report'), uploadCheckupResult);
router.get('/admin/bookings', authenticate, requireRole('ADMIN'), getAllCheckupBookings);
router.patch('/admin/bookings/:id', authenticate, requireRole('ADMIN'), updateCheckupBookingAdmin);

export default router;
