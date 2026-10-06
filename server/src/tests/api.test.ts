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
});
