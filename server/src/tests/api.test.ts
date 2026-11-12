import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { AuditLog } from '../models/AuditLog';
import { HealthCheckupPackage, HealthCheckupBooking, Test } from '../models/HealthCheckup';
import { UserMembership } from '../models/Membership';
import { ContactMessage } from '../models/ContactMessage';
import { emailService } from '../services/emailService';
import {
  CURRENCY_CODE,
  FREE_DELIVERY_THRESHOLD_INR,
  STANDARD_DELIVERY_FEE_INR,
  calculateDeliveryFeeINR,
  calculateOrderBreakdownINR,
  formatINR,
} from '../utils/pricing';

describe('Medicare Backend Core Tests', () => {
  it('GET /api/health returns ONLINE status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ONLINE');
  });

  it('Password hashing and comparison works securely', async () => {
    const rawPass = 'SecretHealthPass2026!';
    const hashed = await hashPassword(rawPass);
    expect(hashed).not.toBe(rawPass);
    const matches = await comparePassword(rawPass, hashed);
    expect(matches).toBe(true);
    const incorrect = await comparePassword('WrongPassword', hashed);
    expect(incorrect).toBe(false);
  });

  it('JWT generation and verification payload matches', () => {
    const payload = {
      userId: '60f7b1b2f1a2b3c4d5e6f7a8',
      role: 'USER' as const,
      email: 'patient@medicare.health',
    };
    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  it('Unauthenticated access to protected route /api/user/dashboard-summary returns 401', async () => {
    const res = await request(app).get('/api/user/dashboard-summary');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Undefined route returns 404 with structured JSON', async () => {
    const res = await request(app).get('/api/undefined-endpoint-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Auth0 API Identifier and configuration are initialized', () => {
    expect(ENV.AUTH0_AUDIENCE).toBe('http://localhost:5000');
    expect(ENV.AUTH0_API_ID).toBe('6abc42caa9ce5f0ef7176151');
  });

  it('Unauthenticated upload to /api/medicines/upload-image returns 401', async () => {
    const res = await request(app).post('/api/medicines/upload-image');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Non-admin user cannot upload medicine image (returns 403)', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f7a8',
      role: 'USER',
      email: 'patient@medicare.health',
      isActive: true,
    } as any);

    const userToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f7a8',
      role: 'USER',
      email: 'patient@medicare.health',
    });
    const res = await request(app)
      .post('/api/medicines/upload-image')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Admin user can upload medicine image and receive public URL', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);
    vi.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });
    // Create a 1x1 dummy PNG buffer
    const dummyPngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const res = await request(app)
      .post('/api/medicines/upload-image')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', dummyPngBuffer, 'test_medicine.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toMatch(/^\/uploads\/test_medicine/);
    expect(res.body.data.mimetype).toBe('image/png');
  });

  it('Unauthenticated request to /api/health-checkups/packages returns 401', async () => {
    const res = await request(app).post('/api/health-checkups/packages').send({ name: 'Cardiac Panel', price: 99 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Admin user can create a health checkup package', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);
    vi.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);
    vi.spyOn(HealthCheckupPackage, 'create').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f801',
      name: 'Full Body Executive Checkup',
      slug: 'full-body-executive-checkup-test',
      price: 199,
      duration: '2 Hours',
      testCount: 0,
      status: 'ACTIVE',
    } as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .post('/api/health-checkups/packages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Full Body Executive Checkup',
        price: 199,
        duration: '2 Hours',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Full Body Executive Checkup');
  });

  it('Admin user can register a new laboratory biomarker test', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);
    vi.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);
    vi.spyOn(Test, 'create').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f901',
      name: 'High-Sensitivity CRP',
      code: 'LAB-CRP-HS',
      category: 'Cardiovascular Risk',
      price: 45,
      isActive: true,
    } as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .post('/api/health-checkups/tests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'High-Sensitivity CRP',
        code: 'LAB-CRP-HS',
        category: 'Cardiovascular Risk',
        price: 45,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('High-Sensitivity CRP');
    expect(res.body.data.code).toBe('LAB-CRP-HS');
  });

  it('Unauthenticated request to /api/membership/admin/stats returns 401', async () => {
    const res = await request(app).get('/api/membership/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Admin user can retrieve membership and VIP checkup stats', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);

    const mockQuery: any = {
      populate: vi.fn().mockReturnThis(),
    };
    mockQuery.then = (resolve: any) =>
      resolve([
        {
          status: 'ACTIVE',
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          payment: { status: 'COMPLETED', amount: 149 },
          benefitUsages: [
            {
              benefitKey: 'free_annual_checkup',
              usedCount: 0,
              maxLimit: 1,
            },
          ],
        },
      ]);
    vi.spyOn(UserMembership, 'find').mockReturnValue(mockQuery as any);
    vi.spyOn(HealthCheckupBooking, 'find').mockResolvedValue([{ isVipRedemption: true }] as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .get('/api/membership/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('checkupBenefits');
    expect(res.body.data.totalActive).toBe(1);
    expect(res.body.data.checkupBenefits.totalAllocated).toBe(1);
  });

  it('Unauthenticated request to /api/doctors/admin returns 401', async () => {
    const res = await request(app).post('/api/doctors/admin').send({
      name: 'Dr. John Watson',
      email: 'dr.watson@medicare.health',
      specialization: 'General Medicine',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Non-admin user cannot register a physician (returns 403)', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f7a8',
      role: 'USER',
      email: 'patient@medicare.health',
      isActive: true,
    } as any);

    const userToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f7a8',
      role: 'USER',
      email: 'patient@medicare.health',
    });

    const res = await request(app)
      .post('/api/doctors/admin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Dr. John Watson',
        email: 'dr.watson@medicare.health',
        specialization: 'General Medicine',
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Admin user can manually register a new physician and auto-link user account', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);

    vi.spyOn(User, 'findOne').mockResolvedValueOnce(null);
    vi.spyOn(User, 'create').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f7d1',
      fullName: 'Dr. Evelyn Reed',
      email: 'dr.reed@medicare.health',
      role: 'DOCTOR',
    } as any);

    vi.spyOn(Doctor, 'create').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f7d2',
      userId: '60f7b1b2f1a2b3c4d5e6f7d1',
      name: 'Dr. Evelyn Reed',
      email: 'dr.reed@medicare.health',
      specialization: 'Cardiology',
      consultationFee: 150,
      experienceYears: 12,
      isVerified: true,
      isActive: true,
    } as any);

    vi.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .post('/api/doctors/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Evelyn Reed',
        email: 'dr.reed@medicare.health',
        password: 'DoctorPass123!',
        specialization: 'Cardiology',
        experienceYears: 12,
        consultationFee: 150,
        qualifications: 'MBBS, MD',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Dr. Evelyn Reed');
    expect(res.body.data.specialization).toBe('Cardiology');
  });

  it('Admin user can retrieve all physicians via /api/doctors/admin/all', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);

    const mockQuery: any = {
      sort: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue([
        {
          _id: '60f7b1b2f1a2b3c4d5e6f7d2',
          name: 'Dr. Evelyn Reed',
          specialization: 'Cardiology',
          isActive: true,
          isVerified: true,
        },
      ]),
    };
    vi.spyOn(Doctor, 'find').mockReturnValue(mockQuery as any);
    vi.spyOn(Doctor, 'countDocuments').mockResolvedValue(1 as any);
    vi.spyOn(Doctor, 'distinct').mockResolvedValue(['Cardiology'] as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .get('/api/doctors/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.doctors).toHaveLength(1);
    expect(res.body.data.stats.totalDoctors).toBe(1);
  });

  it('POST /api/auth/forgot-password dispatches 6-digit OTP code', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      fullName: 'John Patient',
      email: 'john@medicare.health',
      save: vi.fn().mockResolvedValue(true),
    } as any);

    vi.spyOn(AuditLog, 'create').mockResolvedValueOnce({} as any);

    vi.spyOn(emailService, 'sendPasswordResetOtpEmail').mockResolvedValueOnce({
      success: true,
      delivered: true,
      messageId: 'test-otp-message-id',
    } as any);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'john@medicare.health' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('verification code');
  });

  it('POST /api/auth/forgot-password fails with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/verify-reset-otp validates 6-digit OTP code', async () => {
    const mockUser = {
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      email: 'john@medicare.health',
      passwordResetOtp: '482915',
      passwordResetOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      passwordResetOtpAttempts: 0,
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(User, 'findOne').mockReturnValue({
      select: vi.fn().mockResolvedValueOnce(mockUser),
    } as any);

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: 'john@medicare.health', otp: '482915' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(true);
  });

  it('POST /api/contact creates support inquiry ticket and dispatches confirmation', async () => {
    vi.spyOn(ContactMessage, 'create').mockResolvedValueOnce({
      ticketId: 'MC-SUP-123456',
      fullName: 'Sarah Patient',
      email: 'sarah@medicare.health',
      topic: 'GENERAL',
      subject: 'Prescription Delivery Question',
      message: 'When does express cold-chain delivery arrive?',
      status: 'OPEN',
    } as any);

    vi.spyOn(emailService, 'sendContactSupportConfirmationEmail').mockResolvedValueOnce({
      success: true,
      delivered: true,
      messageId: 'contact-msg-id',
    } as any);

    const res = await request(app)
      .post('/api/contact')
      .send({
        fullName: 'Sarah Patient',
        email: 'sarah@medicare.health',
        topic: 'GENERAL',
        subject: 'Prescription Delivery Question',
        message: 'When does express cold-chain delivery arrive?',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketId).toBe('MC-SUP-123456');
  });

  it('POST /api/contact rejects incomplete support inquiries with 422', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ fullName: 'A', email: 'bad-email', subject: 'Hi', message: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('computes INR pricing breakdown, delivery threshold, and en-IN formatting correctly', () => {
    expect(CURRENCY_CODE).toBe('INR');
    expect(calculateDeliveryFeeINR(0)).toBe(0);
    expect(calculateDeliveryFeeINR(FREE_DELIVERY_THRESHOLD_INR)).toBe(STANDARD_DELIVERY_FEE_INR);
    expect(calculateDeliveryFeeINR(FREE_DELIVERY_THRESHOLD_INR + 1)).toBe(0);

    const lowOrder = calculateOrderBreakdownINR(500, 50);
    expect(lowOrder.deliveryFee).toBe(STANDARD_DELIVERY_FEE_INR);
    expect(lowOrder.tax).toBe(22.5);
    expect(lowOrder.total).toBe(521.5);

    const freeShippingOrder = calculateOrderBreakdownINR(1500, 100);
    expect(freeShippingOrder.deliveryFee).toBe(0);
    expect(freeShippingOrder.tax).toBe(70);
    expect(freeShippingOrder.total).toBe(1470);

    expect(formatINR(125000, 0)).toBe('₹1,25,000');
    expect(formatINR(1499)).toBe('₹1,499.00');
  });

  it('removed GET /api/admin/audit-logs endpoint returns 404 for authenticated admin', async () => {
    vi.spyOn(User, 'findById').mockResolvedValueOnce({
      _id: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
      isActive: true,
    } as any);

    const adminToken = generateToken({
      userId: '60f7b1b2f1a2b3c4d5e6f799',
      role: 'ADMIN',
      email: 'admin@medicare.health',
    });

    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
