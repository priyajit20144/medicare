import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../utils/audit';
import { emailService } from '../services/emailService';
import { ENV } from '../config/env';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, email, password, role = 'USER', phone, gender, bloodGroup, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Gracefully re-sync account password and profile for user
      existingUser.password = await hashPassword(password);
      if (fullName) existingUser.fullName = fullName;
      if (phone) existingUser.phone = phone;
      if (gender) existingUser.gender = gender;
      if (bloodGroup) existingUser.bloodGroup = bloodGroup;
      await existingUser.save();

      const token = generateToken({
        userId: existingUser._id.toString(),
        role: existingUser.role,
        email: existingUser.email,
      });

      emailService.sendWelcomeEmail(existingUser.email, existingUser.fullName).catch(() => {});

      sendSuccess(
        res,
        {
          token,
          user: {
            id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            role: existingUser.role,
            phone: existingUser.phone,
            avatar: existingUser.avatar,
          },
        },
        'Registration completed successfully. Welcome to Medicare!',
        200
      );
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'USER',
      phone,
      gender,
      bloodGroup,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    await logAudit({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      req,
    });

    // Asynchronously dispatch Account Verification & Welcome emails
    const verificationUrl = `${ENV.FRONTEND_URL}/verify-email?token=${token}`;
    emailService.sendAccountVerificationEmail(user.email, user.fullName, verificationUrl).catch(() => {});
    emailService.sendWelcomeEmail(user.email, user.fullName).catch(() => {});

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      'Registration successful. Welcome to Medicare!',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'This account has been deactivated. Please contact support.', 403);
      return;
    }

    const isMatch = await comparePassword(password, user.password || '');

    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    await logAudit({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGGED_IN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      req,
    });

    // Send login security alert email
    emailService.sendSecurityAlertEmail(user.email, user.fullName, {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
    }).catch(() => {});

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    sendSuccess(res, {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      dateOfBirth: user.dateOfBirth,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as IUser;
    const { fullName, phone, avatar, gender, bloodGroup, dateOfBirth } = req.body;

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (gender !== undefined) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);

    await user.save();

    await logAudit({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_PROFILE_UPDATED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      req,
    });

    sendSuccess(
      res,
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        dateOfBirth: user.dateOfBirth,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      sendError(
        res,
        'No Medicare account was found with this email address. Please check your spelling or register a new account.',
        404
      );
      return;
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    user.passwordResetOtp = otp;
    user.passwordResetOtpExpiresAt = expiresAt;
    user.passwordResetOtpAttempts = 0;

    // Keep token in sync for fallback compatibility
    user.passwordResetToken = otp;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    await logAudit({
      actorEmail: normalizedEmail,
      action: 'PASSWORD_RESET_OTP_REQUESTED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      req,
    });

    // Dispatch 6-digit OTP email to user's registered valid email address via Brevo API / SMTP
    const emailResult = await emailService.sendPasswordResetOtpEmail(user.email, user.fullName, otp);

    if (!emailResult?.success && !emailResult?.delivered) {
      console.error(`[Auth] Failed to dispatch password reset OTP to ${user.email}:`, emailResult?.error);
      sendError(
        res,
        `Unable to deliver OTP email: ${emailResult?.error || 'Email service error'}. Please try again shortly.`,
        500
      );
      return;
    }

    console.log(`[Auth] Password reset OTP dispatched successfully to ${user.email}. MessageId: ${emailResult?.messageId || 'Delivered'}`);

    sendSuccess(
      res,
      {
        email: normalizedEmail,
        // In development mode, provide OTP hint in payload for instantaneous developer testing
        ...(process.env.NODE_ENV === 'development' ? { devOtpHint: user.passwordResetOtp } : {}),
      },
      `A 6-digit verification code has been dispatched to ${user.email}. Please check your inbox and spam folder.`
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Validates a 6-digit OTP code before proceeding to password change
 */
export async function verifyResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanOtp) {
      sendError(res, '6-digit verification code is required.', 400);
      return;
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      '+passwordResetOtp +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetToken +passwordResetExpiresAt'
    );

    if (!user) {
      sendError(res, 'Invalid verification code or email address.', 400);
      return;
    }

    // Rate-limiting / brute force protection (max 5 invalid attempts per code)
    const attempts = (user.passwordResetOtpAttempts || 0) + 1;
    user.passwordResetOtpAttempts = attempts;

    if (attempts > 5) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save();
      sendError(res, 'Too many invalid attempts. Please request a fresh verification code.', 429);
      return;
    }

    const validCode = user.passwordResetOtp || user.passwordResetToken;
    const expiresAt = user.passwordResetOtpExpiresAt || user.passwordResetExpiresAt;

    if (!validCode || validCode !== cleanOtp) {
      await user.save();
      sendError(res, 'Invalid verification code. Please check your inbox and try again.', 400);
      return;
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save();
      sendError(res, 'Verification code has expired. Please request a new code.', 400);
      return;
    }

    await user.save();

    sendSuccess(
      res,
      { valid: true },
      'Verification code confirmed. You may now enter your new password.'
    );
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, token, otp, newPassword } = req.body;
    const verificationCode = String(otp || token || '').trim();

    if (!verificationCode) {
      sendError(res, 'Verification code (OTP) is required.', 400);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      sendError(res, 'Password must be at least 6 characters long.', 400);
      return;
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+password +passwordResetToken +passwordResetExpiresAt +passwordResetOtp +passwordResetOtpExpiresAt'
    );

    if (!user) {
      sendError(res, 'Account not found.', 404);
      return;
    }

    const validCode = user.passwordResetOtp || user.passwordResetToken;
    const expiresAt = user.passwordResetOtpExpiresAt || user.passwordResetExpiresAt;

    if (!validCode || (validCode !== verificationCode && user.passwordResetToken !== verificationCode)) {
      sendError(res, 'Invalid verification code. Please check your email and try again.', 400);
      return;
    }

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      user.passwordResetOtp = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save();
      sendError(res, 'Verification code has expired. Please request a fresh OTP.', 400);
      return;
    }

    // Set new hashed password & clear reset OTP fields
    user.password = await hashPassword(newPassword);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    await logAudit({
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      req,
    });

    // Send confirmation email
    emailService.sendPasswordChangedEmail(user.email, user.fullName).catch(() => {});

    sendSuccess(res, null, 'Password has been updated successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
}
