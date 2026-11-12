import { Router } from 'express';
import { z } from 'zod';
import { submitContactInquiry } from '../controllers/contactController';
import { validateRequest } from '../middleware/validate';

const contactInquirySchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Please provide your full name (at least 2 characters)'),
    email: z.string().trim().email('Please provide a valid email address'),
    phone: z.string().trim().max(30, 'Phone number is too long').optional(),
    topic: z
      .enum(['GENERAL', 'MEDICINE_ORDER', 'PRESCRIPTION', 'APPOINTMENT', 'HEALTH_CHECKUP', 'TECHNICAL'])
      .optional(),
    subject: z.string().trim().min(3, 'Please provide a brief subject').max(200),
    message: z
      .string()
      .trim()
      .min(10, 'Please describe how we can help (at least 10 characters)')
      .max(3000),
  }),
});

const router = Router();

router.post('/', validateRequest(contactInquirySchema), submitContactInquiry);

export default router;

