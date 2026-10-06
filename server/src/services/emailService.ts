import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ENV, isDev } from '../config/env';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export type EmailTemplateType =
  | 'ACCOUNT_VERIFICATION'
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGED'
  | 'SECURITY_ALERT'
  | 'ORDER_CONFIRMATION'
  | 'ORDER_STATUS'
  | 'PRESCRIPTION_UPLOADED'
  | 'PRESCRIPTION_APPROVED'
  | 'PRESCRIPTION_REJECTED'
  | 'PRESCRIPTION_CLARIFICATION'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_STATUS'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CANCELLED'
  | 'MEMBERSHIP_ACTIVATED'
  | 'MEMBERSHIP_EXPIRING'
  | 'CHECKUP_BOOKED'
  | 'CHECKUP_REMINDER'
  | 'HEALTH_REPORT_READY'
  | 'ADMIN_NOTIFICATION';

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  /**
   * Initialize Nodemailer Transporter with SMTP environment settings
   */
  public initTransporter(): void {
    const host = process.env.SMTP_HOST || ENV.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || String(ENV.SMTP_PORT) || '587', 10);
    const user = process.env.SMTP_USER || ENV.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD || ENV.SMTP_PASSWORD;

    const isPlaceholder =
      !host ||
      host === 'your-smtp-host' ||
      !user ||
      user === 'your-smtp-username';

    if (isPlaceholder) {
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465 || port === 2465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.isConfigured = true;
    } catch (err: any) {
      console.error('[EmailService] Failed to initialize SMTP transporter:', err.message);
      this.isConfigured = false;
    }
  }

  /**
   * Verify SMTP / Mailofly connection with server
   */
  public async verifyConnection(): Promise<{ success: boolean; message: string; identities?: any[] }> {
    const mailoflyKey = process.env.MAILOFLY_API_KEY || ENV.MAILOFLY_API_KEY;
    if (mailoflyKey && mailoflyKey.startsWith('mf_live_')) {
      try {
        const idRes = await fetch('https://api.mailofly.com/identities', {
          headers: { Authorization: `Bearer ${mailoflyKey}` },
        });
        if (idRes.ok) {
          const idData: any = await idRes.json().catch(() => ({ data: [] }));
          const identities = idData.data || [];
          return {
            success: true,
            message: `Mailofly REST API key authenticated successfully! (${identities.length} active identities configured)`,
            identities,
          };
        } else {
          return {
            success: false,
            message: `Mailofly API authentication error: HTTP ${idRes.status}`,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          message: `Mailofly API connection error: ${err.message}`,
        };
      }
    }

    this.initTransporter();
    if (!this.transporter || !this.isConfigured) {
      return {
        success: false,
        message: 'SMTP is not configured with active credentials. Using development mock logger.',
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: `SMTP connection established successfully to ${process.env.SMTP_HOST || ENV.SMTP_HOST}:${process.env.SMTP_PORT || ENV.SMTP_PORT}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `SMTP verification failed: ${error.message || error}`,
      };
    }
  }

  /**
   * Send an email via Mailofly REST API or SMTP (with accurate delivery reporting)
   */
  public async sendMail(options: SendMailOptions): Promise<{ success: boolean; delivered: boolean; messageId?: string; error?: string; provider?: string }> {
    const fromEmail = process.env.SMTP_FROM_EMAIL || ENV.SMTP_FROM_EMAIL;
    const fromName = process.env.SMTP_FROM_NAME || ENV.SMTP_FROM_NAME;
    const fromAddress = `"${fromName}" <${fromEmail}>`;

    let lastError = '';

    // 1. Attempt dispatch via Mailofly REST API if Key is present
    const mailoflyKey = process.env.MAILOFLY_API_KEY || ENV.MAILOFLY_API_KEY;
    if (mailoflyKey && mailoflyKey.startsWith('mf_live_')) {
      try {
        const response = await fetch('https://api.mailofly.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mailoflyKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
          }),
        });

        const data: any = await response.json().catch(() => ({}));
        if (response.ok) {
          console.log(`[EmailService] Dispatched via Mailofly REST API to ${options.to}. ID: ${data.id || data.messageId}`);
          return { success: true, delivered: true, provider: 'Mailofly REST API', messageId: data.id || data.messageId };
        } else {
          lastError = data.message || data.error || `HTTP ${response.status}`;
          console.warn(`[EmailService] Mailofly REST API notice (${response.status}):`, lastError);
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[EmailService] Mailofly REST API network error:`, err.message);
      }
    }

    // 2. Dispatch via SMTP Transporter if configured
    this.initTransporter();
    if (this.transporter && this.isConfigured) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
          replyTo: options.replyTo || fromEmail,
        });

        console.log(`[EmailService] Email sent successfully via SMTP to ${options.to}. MessageId: ${info.messageId}`);
        return { success: true, delivered: true, provider: 'SMTP', messageId: info.messageId };
      } catch (error: any) {
        lastError = error.message;
        console.error('[EmailService] SMTP send error:', error.message);
      }
    }

    // 3. If real dispatch could not be completed, clearly report the exact blocker
    const failureExplanation = lastError
      ? `Email could not be delivered to original Gmail inbox yet. Provider response: "${lastError}".`
      : 'Neither Mailofly API nor active SMTP credentials could establish a live mail connection.';

    console.log(`\n⚠️ [EMAIL DISPATCH BLOCKED]`);
    console.log(`To:      ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Reason:  ${failureExplanation}`);
    console.log(`---------------------------------------------------\n`);

    return {
      success: false,
      delivered: false,
      error: failureExplanation,
    };
  }

  /**
   * Reusable HTML Template Wrapper with Modern Medicare Healthcare Branding
   */
  private wrapTemplate(title: string, bodyContent: string): string {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const fromName = process.env.SMTP_FROM_NAME || ENV.SMTP_FROM_NAME;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 24px; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
          .brand-title { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin: 0; color: #ffffff; }
          .brand-tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; margin-top: 6px; font-weight: 700; color: #99f6e4; }
          .body-content { padding: 36px 32px; line-height: 1.65; font-size: 15px; color: #334155; }
          .body-content h2 { color: #0f2d42; margin-top: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
          .card { background-color: #f8fafc; border-radius: 14px; padding: 22px; margin: 24px 0; border: 1px solid #e2e8f0; }
          .card-alert { background-color: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .card-success { background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 800; font-size: 14px; margin-top: 18px; box-shadow: 0 4px 12px rgba(13,148,136,0.25); }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .badge-teal { background-color: #ccfbf1; color: #0f766e; }
          .badge-rose { background-color: #ffe4e6; color: #be123c; }
          .badge-amber { background-color: #fef3c7; color: #b45309; }
          .footer { background-color: #f8fafc; padding: 28px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; line-height: 1.5; }
          .footer a { color: #0d9488; text-decoration: none; font-weight: 600; }
          .highlight { color: #0d9488; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1 class="brand-title">MEDICARE</h1>
            <p class="brand-tagline">Your Health, Our Priority</p>
          </div>
          <div class="body-content">
            ${bodyContent}
          </div>
          <div class="footer">
            <p><strong>Medicare Healthcare Ecosystem</strong></p>
            <p>Safe Cold-Chain Pharmacy · Board-Certified Doctors · Encrypted Health Diagnostics</p>
            <p style="margin-top: 12px;">© ${new Date().getFullYear()} Medicare Inc. All rights reserved.</p>
            <p style="font-size: 11px; color: #94a3b8;">This is an automated notification from ${fromName}. Please do not reply directly.</p>
            <p style="margin-top: 8px;"><a href="${frontendUrl}">Visit Patient Portal</a> · <a href="${frontendUrl}/#support">Patient Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ===========================================================================
  // 1. ACCOUNT VERIFICATION EMAIL
  // ===========================================================================
  public async sendAccountVerificationEmail(to: string, fullName: string, verificationLink: string): Promise<any> {
    const html = this.wrapTemplate(
      'Verify Your Medicare Account',
      `
        <h2>Verify Your Email Address ✉️</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Thank you for registering with Medicare. To ensure the security of your private health records and enable 1-click prescription orders, please verify your email address.</p>
        <div class="card" style="text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b;">Click the button below to confirm your account:</p>
          <a href="${verificationLink}" class="button">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">If you did not create a Medicare account, please disregard this email.</p>
      `
    );

    return this.sendMail({
      to,
      subject: 'Verify Your Email Address — Medicare',
      html,
    });
  }

  // ===========================================================================
  // 2. WELCOME EMAIL (AFTER SUCCESSFUL REGISTRATION)
  // ===========================================================================
  public async sendWelcomeEmail(to: string, fullName: string): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Welcome to Medicare',
      `
        <h2>Welcome to Medicare, ${fullName}! 👋</h2>
        <p>Your healthcare account is now fully active. Medicare connects you directly to certified cold-chain pharmacies, licensed doctors, and diagnostic labs.</p>
        <div class="card">
          <h3 style="margin-top: 0; color: #0f766e; font-size: 16px;">Quick Access Health Tools:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;"><strong>Prescription Orders:</strong> Upload your paper or digital Rx for 10-minute pharmacist review.</li>
            <li style="margin-bottom: 8px;"><strong>Doctor Consultations:</strong> Book board-certified specialists for telehealth or clinic visits.</li>
            <li style="margin-bottom: 8px;"><strong>Home Diagnostic Checkups:</strong> Schedule 24+ clinical biomarkers with home sample collection.</li>
            <li><strong>Express Medicine Delivery:</strong> Order authentic OTC & prescription medicines delivered in 2 hours.</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/medicines" class="button">Explore Health Services</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: 'Welcome to Medicare Healthcare Platform!',
      html,
    });
  }

  // ===========================================================================
  // 3. PASSWORD RESET EMAIL
  // ===========================================================================
  public async sendPasswordResetEmail(to: string, fullName: string, resetToken: string): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

    const html = this.wrapTemplate(
      'Reset Your Medicare Password',
      `
        <h2>Password Reset Request 🔐</h2>
        <p>Hello <strong>${fullName || 'Patient'}</strong>,</p>
        <p>We received a request to reset the password for your Medicare account. Click the button below to choose a new secure password:</p>
        <div class="card" style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset My Password</a>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #64748b;">This link is valid for 60 minutes.</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">If you didn't request a password reset, you can safely ignore this email. Your current password remains unchanged.</p>
      `
    );

    return this.sendMail({
      to,
      subject: 'Password Reset Request — Medicare Security',
      html,
    });
  }

  // ===========================================================================
  // 4. PASSWORD CHANGED CONFIRMATION
  // ===========================================================================
  public async sendPasswordChangedEmail(to: string, fullName: string): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Password Changed Successfully',
      `
        <h2>Password Successfully Updated ✅</h2>
        <p>Hello <strong>${fullName || 'Patient'}</strong>,</p>
        <p>This is a confirmation that the password for your Medicare account (${to}) was successfully changed on <strong>${new Date().toLocaleString()}</strong>.</p>
        <div class="card-alert">
          <p style="margin: 0; font-size: 14px; color: #9f1239;"><strong>Didn't make this change?</strong> If you did not perform this update, please reset your password immediately and contact Medicare patient support.</p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${frontendUrl}/login" class="button">Log In to Your Account</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: 'Security Notice: Medicare Password Changed',
      html,
    });
  }

  // ===========================================================================
  // 5. LOGIN / SECURITY ALERT EMAIL
  // ===========================================================================
  public async sendSecurityAlertEmail(to: string, fullName: string, details: { ip?: string; userAgent?: string; time?: string }): Promise<any> {
    const html = this.wrapTemplate(
      'Security Alert: New Sign-In',
      `
        <h2>Security Notice: New Account Sign-In 🛡️</h2>
        <p>Hello <strong>${fullName || 'Patient'}</strong>,</p>
        <p>Your Medicare account was accessed from a new device or IP address.</p>
        <div class="card">
          <p style="margin: 4px 0;"><strong>Time:</strong> ${details.time || new Date().toLocaleString()}</p>
          <p style="margin: 4px 0;"><strong>IP Address:</strong> ${details.ip || '127.0.0.1'}</p>
          <p style="margin: 4px 0;"><strong>Device / Browser:</strong> ${details.userAgent || 'Web Browser'}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">If this was you, no action is needed. If you do not recognize this sign-in, please change your password immediately.</p>
      `
    );

    return this.sendMail({
      to,
      subject: 'Security Alert: New Sign-in to Your Medicare Account',
      html,
    });
  }

  // ===========================================================================
  // 6. ORDER CONFIRMATION EMAIL
  // ===========================================================================
  public async sendOrderConfirmation(
    to: string,
    orderId: string,
    totalAmount: number,
    itemCount: number,
    shippingAddress?: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Order Confirmation',
      `
        <h2>Order Confirmed! 📦</h2>
        <p>Thank you for your order. Our licensed pharmacy team is verifying the items and preparing your temperature-controlled shipment.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Order ID:</strong> <span class="highlight">#${orderId}</span></p>
          <p style="margin: 6px 0;"><strong>Medication Items:</strong> ${itemCount} items</p>
          <p style="margin: 6px 0;"><strong>Total Paid:</strong> $${totalAmount.toFixed(2)}</p>
          ${shippingAddress ? `<p style="margin: 6px 0;"><strong>Delivery Address:</strong> ${shippingAddress}</p>` : ''}
          <p style="margin: 6px 0;"><strong>Status:</strong> <span class="badge badge-teal">Processing</span></p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/orders" class="button">Track Order Status</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Order Confirmation #${orderId.slice(-8)} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 7. ORDER STATUS UPDATE (PROCESSING -> SHIPPED -> DELIVERED)
  // ===========================================================================
  public async sendOrderStatusEmail(
    to: string,
    orderId: string,
    status: string,
    trackingNumber?: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const statusLabels: Record<string, string> = {
      PROCESSING: 'Order is being packaged by our pharmacy team',
      SHIPPED: 'Dispatched & Out for delivery with cold-chain courier 🚚',
      DELIVERED: 'Delivered successfully to your address 🏡',
      CANCELLED: 'Order has been cancelled',
    };

    const html = this.wrapTemplate(
      `Order Update: ${status}`,
      `
        <h2>Order Status Update: ${status} 📦</h2>
        <p>There is an update on your Medicare medication order:</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Order Number:</strong> <span class="highlight">#${orderId}</span></p>
          <p style="margin: 6px 0;"><strong>Current Status:</strong> <span class="badge badge-teal">${status}</span></p>
          <p style="margin: 6px 0;"><strong>Details:</strong> ${statusLabels[status] || status}</p>
          ${trackingNumber ? `<p style="margin: 6px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/orders" class="button">View Order Details</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Order #${orderId.slice(-8)} Status Update: ${status} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 8. PRESCRIPTION UPLOADED CONFIRMATION
  // ===========================================================================
  public async sendPrescriptionUploadedEmail(to: string, patientName: string, prescriptionId: string): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Prescription Received',
      `
        <h2>Prescription Received for Review 📄</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your prescription document has been securely uploaded to Medicare. It has been placed in our priority pharmacist queue.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Prescription Reference:</strong> <span class="highlight">#${prescriptionId.slice(-8)}</span></p>
          <p style="margin: 6px 0;"><strong>Review Status:</strong> <span class="badge badge-amber">Under Pharmacist Review</span></p>
          <p style="margin: 6px 0;"><strong>Estimated Review Time:</strong> 10 to 15 minutes</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">You will receive an immediate notification as soon as our licensed pharmacist approves the prescription.</p>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/prescriptions" class="button">View My Prescriptions</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Prescription #${prescriptionId.slice(-8)} Received — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 9. PRESCRIPTION APPROVED
  // ===========================================================================
  public async sendPrescriptionApprovedEmail(
    to: string,
    patientName: string,
    prescriptionId: string,
    validDays: number = 30
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Prescription Approved',
      `
        <h2>Your Prescription is Approved! ✅</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Great news! Your prescription document has been reviewed and verified by our board-certified clinical pharmacist.</p>
        <div class="card-success">
          <p style="margin: 4px 0; color: #065f46;"><strong>Status:</strong> Approved & Active</p>
          <p style="margin: 4px 0; color: #065f46;"><strong>Validity:</strong> Valid for ${validDays} days</p>
          <p style="margin: 4px 0; color: #065f46;"><strong>Prescription ID:</strong> #${prescriptionId.slice(-8)}</p>
        </div>
        <p>You can now purchase your prescribed medications with fast home delivery.</p>
        <div style="text-align: center;">
          <a href="${frontendUrl}/medicines" class="button">Order Prescribed Medicines</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Prescription Approved! ✅ #${prescriptionId.slice(-8)} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 10. PRESCRIPTION REJECTED
  // ===========================================================================
  public async sendPrescriptionRejectedEmail(
    to: string,
    patientName: string,
    prescriptionId: string,
    reason: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Prescription Review Update',
      `
        <h2>Prescription Not Approved ⚠️</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Our licensed pharmacist reviewed your prescription document (#${prescriptionId.slice(-8)}), but it could not be approved at this time.</p>
        <div class="card-alert">
          <p style="margin: 4px 0; color: #9f1239;"><strong>Reason for Rejection:</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #881337;">${reason || 'The uploaded file was illegible, expired, or missing the doctor signature/license number.'}</p>
        </div>
        <p>You may re-upload a clear, valid photo or PDF of your doctor's prescription at any time.</p>
        <div style="text-align: center;">
          <a href="${frontendUrl}/prescriptions/upload" class="button">Upload New Prescription</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Prescription Update #${prescriptionId.slice(-8)} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 11. CLARIFICATION REQUIRED (PHARMACIST NEEDS INFO)
  // ===========================================================================
  public async sendPrescriptionClarificationEmail(
    to: string,
    patientName: string,
    prescriptionId: string,
    pharmacistNotes: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Clarification Required for Prescription',
      `
        <h2>Pharmacist Clarification Needed 📋</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Our licensed pharmacist is currently reviewing your prescription (#${prescriptionId.slice(-8)}), but needs a quick clarification to ensure patient safety.</p>
        <div class="card" style="border-left: 4px solid #f59e0b;">
          <p style="margin: 4px 0; font-weight: 700; color: #b45309;">Pharmacist Note:</p>
          <p style="margin: 4px 0; font-size: 14px; color: #78350f;">"${pharmacistNotes || 'Please provide a clear image showing dosage instructions and doctor seal.'}"</p>
        </div>
        <p>Please reply or update your prescription details directly in your portal:</p>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/prescriptions" class="button">Respond to Pharmacist</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Clarification Required: Prescription #${prescriptionId.slice(-8)} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 12. APPOINTMENT BOOKED
  // ===========================================================================
  public async sendAppointmentBookedEmail(
    to: string,
    patientName: string,
    doctorName: string,
    specialization: string,
    date: string,
    timeSlot: string,
    appointmentNumber: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Appointment Confirmed',
      `
        <h2>Doctor Consultation Confirmed 🩺</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Appointment #:</strong> <span class="highlight">#${appointmentNumber}</span></p>
          <p style="margin: 6px 0;"><strong>Specialist:</strong> ${doctorName} (${specialization})</p>
          <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${date} at ${timeSlot}</p>
          <p style="margin: 6px 0;"><strong>Status:</strong> <span class="badge badge-teal">Confirmed</span></p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/appointments" class="button">View Appointment & Telehealth Link</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Appointment Confirmed with ${doctorName} (#${appointmentNumber}) — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 13. APPOINTMENT CONFIRMED / REJECTED STATUS
  // ===========================================================================
  public async sendAppointmentStatusEmail(
    to: string,
    patientName: string,
    doctorName: string,
    status: string,
    date: string,
    timeSlot: string,
    notes?: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      `Appointment Status: ${status}`,
      `
        <h2>Appointment Update: ${status} 🩺</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment with <strong>${doctorName}</strong> scheduled for ${date} at ${timeSlot} has been updated to <strong>${status}</strong>.</p>
        ${notes ? `<div class="card"><p style="margin: 0;"><strong>Notes:</strong> ${notes}</p></div>` : ''}
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/appointments" class="button">View Appointments</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Appointment Update (${status}): ${doctorName} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 14. APPOINTMENT REMINDER
  // ===========================================================================
  public async sendAppointmentReminderEmail(
    to: string,
    patientName: string,
    doctorName: string,
    date: string,
    timeSlot: string,
    meetingLink?: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Upcoming Appointment Reminder',
      `
        <h2>Appointment Reminder ⏰</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>This is a friendly reminder of your upcoming consultation with <strong>${doctorName}</strong>.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${date} at ${timeSlot}</p>
          ${meetingLink ? `<p style="margin: 6px 0;"><strong>Telehealth Video Link:</strong> <a href="${meetingLink}" class="highlight">Join Video Call</a></p>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="${meetingLink || `${frontendUrl}/user/appointments`}" class="button">Join Consultation</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Reminder: Upcoming Appointment with ${doctorName} on ${date} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 15. APPOINTMENT CANCELLED
  // ===========================================================================
  public async sendAppointmentCancelledEmail(
    to: string,
    patientName: string,
    doctorName: string,
    appointmentNumber: string,
    reason?: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Appointment Cancelled',
      `
        <h2>Appointment Cancelled 🚫</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your appointment #${appointmentNumber} with <strong>${doctorName}</strong> has been cancelled.</p>
        <div class="card-alert">
          <p style="margin: 4px 0; color: #9f1239;"><strong>Cancellation Reason:</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #881337;">${reason || 'Cancelled by user or clinical schedule modification. Any paid consultation fees have been refunded.'}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${frontendUrl}/doctors" class="button">Book New Appointment</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Appointment Cancelled #${appointmentNumber} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 16. PREMIUM MEMBERSHIP ACTIVATION
  // ===========================================================================
  public async sendMembershipActivatedEmail(
    to: string,
    fullName: string,
    planName: string,
    membershipId: string,
    endDate: Date
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Medicare Premium Activated',
      `
        <h2>Welcome to Medicare VIP Premium! 👑</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your <strong>${planName}</strong> membership is now active! Thank you for choosing Medicare as your trusted health partner.</p>
        <div class="card" style="border: 2px solid #14b8a6;">
          <p style="margin: 6px 0;"><strong>Membership ID:</strong> <span class="highlight">${membershipId}</span></p>
          <p style="margin: 6px 0;"><strong>Plan Tier:</strong> ${planName}</p>
          <p style="margin: 6px 0;"><strong>Valid Through:</strong> ${endDate.toLocaleDateString()}</p>
          <h4 style="margin: 16px 0 8px 0; color: #0f766e;">Your VIP Benefits:</h4>
          <ul style="padding-left: 20px; margin: 0;">
            <li>Zero Delivery Fees on all medicine orders</li>
            <li>Priority Pharmacist Rx Review</li>
            <li>15% discount on Diagnostic Health Checkups</li>
            <li>Direct Doctor Telehealth Consultations</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/membership" class="button">View VIP Membership Hub</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Welcome to Medicare Premium! 👑 (#${membershipId})`,
      html,
    });
  }

  // ===========================================================================
  // 17. MEMBERSHIP EXPIRING REMINDER
  // ===========================================================================
  public async sendMembershipExpiringEmail(
    to: string,
    fullName: string,
    planName: string,
    daysRemaining: number
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Membership Expiring Soon',
      `
        <h2>Your Medicare Premium Membership is Expiring ⏳</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your <strong>${planName}</strong> VIP membership will expire in <strong>${daysRemaining} days</strong>.</p>
        <div class="card" style="border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #78350f;">
            Renew today to retain your zero-fee delivery, prescription discounts, and priority consultation slots without interruption.
          </p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/membership" class="button">Renew Membership</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Reminder: Your Medicare VIP Membership expires in ${daysRemaining} days`,
      html,
    });
  }

  // ===========================================================================
  // 18. HEALTH CHECKUP BOOKING CONFIRMATION
  // ===========================================================================
  public async sendCheckupBookingEmail(
    to: string,
    patientName: string,
    packageName: string,
    facilityName: string,
    date: string,
    timeSlot: string,
    bookingNumber: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Health Checkup Confirmed',
      `
        <h2>Health Checkup Confirmed! 🏥</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>Your comprehensive diagnostic panel has been scheduled successfully.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Booking Number:</strong> <span class="highlight">#${bookingNumber}</span></p>
          <p style="margin: 6px 0;"><strong>Test Package:</strong> ${packageName}</p>
          <p style="margin: 6px 0;"><strong>Diagnostic Hub:</strong> ${facilityName}</p>
          <p style="margin: 6px 0;"><strong>Date & Slot:</strong> ${date} (${timeSlot})</p>
          <p style="margin: 6px 0;"><strong>Preparation:</strong> 10-12 hours overnight fasting recommended before sample collection.</p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/health-checkups" class="button">View Checkup Details</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Health Checkup Confirmed: ${packageName} (#${bookingNumber}) — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 19. HEALTH CHECKUP REMINDER
  // ===========================================================================
  public async sendCheckupReminderEmail(
    to: string,
    patientName: string,
    packageName: string,
    facilityName: string,
    date: string,
    timeSlot: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Upcoming Health Checkup Reminder',
      `
        <h2>Reminder: Upcoming Health Checkup 🏥</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>This is a reminder for your upcoming diagnostic health checkup:</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Package:</strong> ${packageName}</p>
          <p style="margin: 6px 0;"><strong>Facility:</strong> ${facilityName}</p>
          <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${date} (${timeSlot})</p>
          <p style="margin: 6px 0; color: #b45309; font-weight: 700;">Please remember to fast for 10-12 hours prior to sample collection.</p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/health-checkups" class="button">View Preparation Instructions</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Reminder: Health Checkup (${packageName}) Scheduled on ${date} — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 20. HEALTH REPORT AVAILABLE
  // ===========================================================================
  public async sendHealthReportAvailableEmail(
    to: string,
    patientName: string,
    packageName: string,
    bookingNumber: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      'Your Diagnostic Report is Ready',
      `
        <h2>Lab Diagnostic Report Ready! 📄</h2>
        <p>Hello <strong>${patientName}</strong>,</p>
        <p>The diagnostic lab report for your <strong>${packageName}</strong> (Booking #${bookingNumber}) has been signed off by our chief pathologist and is now available to download.</p>
        <div class="card-success">
          <p style="margin: 4px 0; color: #065f46;"><strong>Report Status:</strong> Verified & Certified</p>
          <p style="margin: 4px 0; color: #065f46;"><strong>Package:</strong> ${packageName}</p>
          <p style="margin: 4px 0; color: #065f46;"><strong>Booking Ref:</strong> #${bookingNumber}</p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/user/health-checkups" class="button">Download Verified Report PDF</a>
        </div>
      `
    );

    return this.sendMail({
      to,
      subject: `Diagnostic Report Ready: ${packageName} (#${bookingNumber}) — Medicare`,
      html,
    });
  }

  // ===========================================================================
  // 21. ADMIN NOTIFICATIONS
  // ===========================================================================
  public async sendAdminNotificationEmail(
    adminEmail: string,
    subject: string,
    eventTitle: string,
    eventDetails: string
  ): Promise<any> {
    const frontendUrl = process.env.FRONTEND_URL || ENV.FRONTEND_URL;
    const html = this.wrapTemplate(
      `Admin Alert: ${eventTitle}`,
      `
        <h2>Platform Event: ${eventTitle} 🚨</h2>
        <p>This is an automated operational notification dispatched to the platform administrator.</p>
        <div class="card">
          <p style="margin: 6px 0;"><strong>Event:</strong> ${eventTitle}</p>
          <p style="margin: 6px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p style="margin: 6px 0;"><strong>Details:</strong> ${eventDetails}</p>
        </div>
        <div style="text-align: center;">
          <a href="${frontendUrl}/admin" class="button">Open Admin Portal</a>
        </div>
      `
    );

    return this.sendMail({
      to: adminEmail,
      subject: `[Medicare Admin Alert] ${subject}`,
      html,
    });
  }
}

export const emailService = new EmailService();
