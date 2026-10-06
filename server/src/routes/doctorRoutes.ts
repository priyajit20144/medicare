import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getDoctorSpecialties,
  getDoctorMe,
  updateDoctorAvailability,
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public metadata
router.get('/meta/specialties', getDoctorSpecialties);

// Doctor portal self endpoints
router.get('/portal/me', authenticate, requireRole('DOCTOR'), getDoctorMe);
router.patch('/portal/availability', authenticate, requireRole('DOCTOR'), updateDoctorAvailability);

// Admin endpoints
router.get('/admin/all', authenticate, requireRole('ADMIN'), getAdminDoctors);
router.post('/admin', authenticate, requireRole('ADMIN'), createDoctor);
router.patch('/admin/:id', authenticate, requireRole('ADMIN'), updateDoctor);
router.delete('/admin/:id', authenticate, requireRole('ADMIN'), deleteDoctor);

// Public listings and single doctor endpoints
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

export default router;
