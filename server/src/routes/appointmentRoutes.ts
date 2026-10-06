import { Router } from 'express';
import {
  bookAppointment,
  getUserAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAllAppointments,
} from '../controllers/appointmentController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// User endpoints
router.post('/', authenticate, bookAppointment);
router.get('/my', authenticate, getUserAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.patch('/:id/status', authenticate, updateAppointmentStatus);

// Doctor specific list
router.get('/doctor/assigned', authenticate, requireRole('DOCTOR'), getDoctorAppointments);

// Admin list
router.get('/admin/all', authenticate, requireRole('ADMIN'), getAllAppointments);

export default router;
