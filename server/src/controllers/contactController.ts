import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { emailService } from '../services/emailService';
import { sendSuccess } from '../utils/response';

/**
 * Generates a readable support ticket reference (e.g., MC-SUP-847291).
 */
function generateTicketId(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `MC-SUP-${randomDigits}`;
}

/**
 * Handles public/patient contact & support inquiries, stores the ticket in MongoDB,
 * and sends an acknowledgment confirmation email.
 */
export async function submitContactInquiry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fullName, email, phone, topic = 'GENERAL', subject, message } = req.body;
    const ticketId = generateTicketId();

    const inquiry = await ContactMessage.create({
      ticketId,
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      topic,
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'OPEN',
    });

    // Send confirmation asynchronously so transient email slowdowns never block form UX
    emailService
      .sendContactSupportConfirmationEmail({
        to: inquiry.email,
        fullName: inquiry.fullName,
        ticketId: inquiry.ticketId,
        topic: inquiry.topic,
        subject: inquiry.subject,
        message: inquiry.message,
      })
      .catch((err) => {
        console.warn('[ContactController] Confirmation email notice:', err?.message || err);
      });

    sendSuccess(
      res,
      {
        ticketId: inquiry.ticketId,
        email: inquiry.email,
        topic: inquiry.topic,
        status: inquiry.status,
      },
      `Support request #${inquiry.ticketId} received. Our care team will respond to ${inquiry.email} shortly.`,
      201
    );
  } catch (error) {
    next(error);
  }
}

