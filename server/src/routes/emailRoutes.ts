import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/emailService';
import { ENV } from '../config/env';

const router = Router();

// Validation schema for test/custom email
const sendMailSchema = z.object({
  to: z.string().email('Valid recipient email address is required'),
  subject: z.string().min(1, 'Subject cannot be empty').max(200),
  message: z.string().min(1, 'Message content cannot be empty'),
});

/**
 * GET /api/email/status
 * Returns current SMTP configuration status (sensitive credentials omitted)
 */
router.get('/status', async (_req: Request, res: Response) => {
  const host = process.env.SMTP_HOST || ENV.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || String(ENV.SMTP_PORT) || '587', 10);
  const user = process.env.SMTP_USER || ENV.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || ENV.SMTP_PASSWORD;
  const fromEmail = process.env.SMTP_FROM_EMAIL || ENV.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || ENV.SMTP_FROM_NAME;
  const mailoflyKey = process.env.MAILOFLY_API_KEY || ENV.MAILOFLY_API_KEY;

  const isPlaceholder =
    !host ||
    host === 'your-smtp-host' ||
    !user ||
    user === 'your-smtp-username';

  const isMailofly = host.includes('mailofly');

  res.json({
    success: true,
    service: 'Medicare SMTP & Email API Service',
    provider: isMailofly ? 'Mailofly' : (host ? 'Custom SMTP' : 'None'),
    configured: !isPlaceholder,
    details: {
      host: host || 'Not configured',
      port,
      secure: port === 465 || port === 2465,
      fromEmail,
      fromName,
      username: user ? `${user.slice(0, 8)}...` : 'None',
      hasPassword: Boolean(pass && pass !== 'your-smtp-password'),
      hasMailoflyApiKey: Boolean(mailoflyKey && mailoflyKey.startsWith('mf_live_')),
    },
  });
});

/**
 * POST /api/email/verify
 * Tests live connection to configured SMTP server
 */
router.post('/verify', async (_req: Request, res: Response) => {
  const result = await emailService.verifyConnection();
  res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/email/test
 * Sends a test email to verify end-to-end delivery
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const parseResult = sendMailSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
      });
    }

    const { to, subject, message } = parseResult.data;

    const result = await emailService.sendMail({
      to,
      subject: `[Test] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0d9488;">Medicare SMTP Test Dispatch</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #64748b;">
            Dispatched via Medicare SMTP Engine: ${ENV.SMTP_HOST}:${ENV.SMTP_PORT}
          </p>
        </div>
      `,
      text: message,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to send test email',
      });
    }

    return res.json({
      success: true,
      message: `Test email successfully dispatched to ${to}`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while sending email',
    });
  }
});

/**
 * GET /api/email/templates
 * Returns list of all 20+ supported Medicare transactional email types
 */
router.get('/templates', (_req: Request, res: Response) => {
  const templates = [
    { type: 'ACCOUNT_VERIFICATION', name: 'Account Verification', trigger: 'User registers a new account' },
    { type: 'WELCOME', name: 'Welcome Email', trigger: 'After successful registration' },
    { type: 'PASSWORD_RESET', name: 'Password Reset', trigger: 'User requests a password reset' },
    { type: 'PASSWORD_CHANGED', name: 'Password Changed Confirmation', trigger: 'Confirmation after changing password' },
    { type: 'SECURITY_ALERT', name: 'Login/Security Alert', trigger: 'Important account-security event' },
    { type: 'ORDER_CONFIRMATION', name: 'Order Confirmation', trigger: 'Medicine order is successfully created' },
    { type: 'ORDER_STATUS', name: 'Order Status Update', trigger: 'Processing → shipped → delivered, etc.' },
    { type: 'PRESCRIPTION_UPLOADED', name: 'Prescription Uploaded', trigger: 'Confirmation that the prescription was received' },
    { type: 'PRESCRIPTION_APPROVED', name: 'Prescription Approved', trigger: 'Pharmacist approves the prescription' },
    { type: 'PRESCRIPTION_REJECTED', name: 'Prescription Rejected', trigger: 'Pharmacist rejects prescription with reason' },
    { type: 'PRESCRIPTION_CLARIFICATION', name: 'Clarification Required', trigger: 'Pharmacist needs additional information' },
    { type: 'APPOINTMENT_BOOKED', name: 'Appointment Booked', trigger: 'Doctor appointment is created' },
    { type: 'APPOINTMENT_STATUS', name: 'Appointment Status', trigger: 'Doctor/admin updates appointment' },
    { type: 'APPOINTMENT_REMINDER', name: 'Appointment Reminder', trigger: 'Reminder before consultation' },
    { type: 'APPOINTMENT_CANCELLED', name: 'Appointment Cancelled', trigger: 'Appointment is cancelled' },
    { type: 'MEMBERSHIP_ACTIVATED', name: 'Premium Membership', trigger: 'Membership activated' },
    { type: 'MEMBERSHIP_EXPIRING', name: 'Membership Expiring', trigger: 'Reminder before membership expiration' },
    { type: 'CHECKUP_BOOKED', name: 'Health Checkup Booking', trigger: 'Checkup booking confirmation' },
    { type: 'CHECKUP_REMINDER', name: 'Health Checkup Reminder', trigger: 'Upcoming checkup reminder' },
    { type: 'HEALTH_REPORT_READY', name: 'Health Report Available', trigger: 'Report is ready to view' },
    { type: 'ADMIN_NOTIFICATION', name: 'Admin Notifications', trigger: 'Important platform events' },
  ];

  res.json({
    success: true,
    total: templates.length,
    templates,
  });
});

/**
 * POST /api/email/templates/send
 * Dispatches any of the 20 Medicare email templates on demand
 */
router.post('/templates/send', async (req: Request, res: Response) => {
  try {
    const { template, to, data = {} } = req.body;
    if (!template || !to) {
      return res.status(400).json({ success: false, message: 'Both "template" and "to" email are required.' });
    }

    let result;
    switch (template) {
      case 'ACCOUNT_VERIFICATION':
        result = await emailService.sendAccountVerificationEmail(to, data.fullName || 'Patient', data.verificationLink || `${ENV.FRONTEND_URL}/verify`);
        break;
      case 'WELCOME':
        result = await emailService.sendWelcomeEmail(to, data.fullName || 'Patient');
        break;
      case 'PASSWORD_RESET':
        result = await emailService.sendPasswordResetEmail(to, data.fullName || 'Patient', data.resetToken || 'demo_token_123');
        break;
      case 'PASSWORD_CHANGED':
        result = await emailService.sendPasswordChangedEmail(to, data.fullName || 'Patient');
        break;
      case 'SECURITY_ALERT':
        result = await emailService.sendSecurityAlertEmail(to, data.fullName || 'Patient', { ip: data.ip || '127.0.0.1', userAgent: data.userAgent || 'Chrome/macOS' });
        break;
      case 'ORDER_CONFIRMATION':
        result = await emailService.sendOrderConfirmation(to, data.orderId || 'ORD-2026-98124', data.totalAmount || 49.99, data.itemCount || 3, data.shippingAddress);
        break;
      case 'ORDER_STATUS':
        result = await emailService.sendOrderStatusEmail(to, data.orderId || 'ORD-2026-98124', data.status || 'SHIPPED', data.trackingNumber || 'TRK-98214');
        break;
      case 'PRESCRIPTION_UPLOADED':
        result = await emailService.sendPrescriptionUploadedEmail(to, data.patientName || 'Patient', data.prescriptionId || 'RX-82194');
        break;
      case 'PRESCRIPTION_APPROVED':
        result = await emailService.sendPrescriptionApprovedEmail(to, data.patientName || 'Patient', data.prescriptionId || 'RX-82194', data.validDays || 30);
        break;
      case 'PRESCRIPTION_REJECTED':
        result = await emailService.sendPrescriptionRejectedEmail(to, data.patientName || 'Patient', data.prescriptionId || 'RX-82194', data.reason || 'Missing doctor signature');
        break;
      case 'PRESCRIPTION_CLARIFICATION':
        result = await emailService.sendPrescriptionClarificationEmail(to, data.patientName || 'Patient', data.prescriptionId || 'RX-82194', data.notes || 'Please provide clear dosage information');
        break;
      case 'APPOINTMENT_BOOKED':
        result = await emailService.sendAppointmentBookedEmail(to, data.patientName || 'Patient', data.doctorName || 'Dr. Sarah Jenkins', data.specialization || 'Cardiology', data.date || '2026-10-05', data.timeSlot || '10:00 AM', data.appointmentNumber || 'APT-1249');
        break;
      case 'APPOINTMENT_STATUS':
        result = await emailService.sendAppointmentStatusEmail(to, data.patientName || 'Patient', data.doctorName || 'Dr. Sarah Jenkins', data.status || 'CONFIRMED', data.date || '2026-10-05', data.timeSlot || '10:00 AM', data.notes);
        break;
      case 'APPOINTMENT_REMINDER':
        result = await emailService.sendAppointmentReminderEmail(to, data.patientName || 'Patient', data.doctorName || 'Dr. Sarah Jenkins', data.date || '2026-10-05', data.timeSlot || '10:00 AM', data.meetingLink);
        break;
      case 'APPOINTMENT_CANCELLED':
        result = await emailService.sendAppointmentCancelledEmail(to, data.patientName || 'Patient', data.doctorName || 'Dr. Sarah Jenkins', data.appointmentNumber || 'APT-1249', data.reason);
        break;
      case 'MEMBERSHIP_ACTIVATED':
        result = await emailService.sendMembershipActivatedEmail(to, data.fullName || 'Patient', data.planName || 'VIP Diamond Family Care', data.membershipId || 'MC-VIP-8721', new Date(Date.now() + 365 * 24 * 3600 * 1000));
        break;
      case 'MEMBERSHIP_EXPIRING':
        result = await emailService.sendMembershipExpiringEmail(to, data.fullName || 'Patient', data.planName || 'VIP Diamond Family Care', data.daysRemaining || 7);
        break;
      case 'CHECKUP_BOOKED':
        result = await emailService.sendCheckupBookingEmail(to, data.patientName || 'Patient', data.packageName || 'Comprehensive Executive Panel', data.facilityName || 'Medicare Central Labs', data.date || '2026-10-06', data.timeSlot || '08:30 AM', data.bookingNumber || 'CHK-4821');
        break;
      case 'CHECKUP_REMINDER':
        result = await emailService.sendCheckupReminderEmail(to, data.patientName || 'Patient', data.packageName || 'Comprehensive Executive Panel', data.facilityName || 'Medicare Central Labs', data.date || '2026-10-06', data.timeSlot || '08:30 AM');
        break;
      case 'HEALTH_REPORT_READY':
        result = await emailService.sendHealthReportAvailableEmail(to, data.patientName || 'Patient', data.packageName || 'Comprehensive Executive Panel', data.bookingNumber || 'CHK-4821');
        break;
      case 'ADMIN_NOTIFICATION':
        result = await emailService.sendAdminNotificationEmail(to, data.subject || 'System Health Report', data.eventTitle || 'New Healthcare Specialist Registered', data.eventDetails || 'A new doctor has completed licensing verification.');
        break;
      default:
        return res.status(400).json({ success: false, message: `Unknown email template type '${template}'. Call GET /api/email/templates for the full list.` });
    }

    res.json({
      success: result.success,
      delivered: result.delivered,
      provider: result.provider,
      template,
      recipient: to,
      messageId: result.messageId,
      error: result.error,
      message: result.delivered
        ? `Template "${template}" delivered to original Gmail inbox successfully.`
        : (result.error || `Template "${template}" could not be delivered to original Gmail inbox yet.`),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error sending template email' });
  }
});

export default router;
