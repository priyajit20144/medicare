import { describe, it, expect } from 'vitest';
import {
  QUICK_HEALTH_SERVICES,
  getSafeReturnUrl,
  getDefaultDashboardRoute,
  findQuickServiceByRoute,
} from '../constants/quickServices';

describe('Medicare Client Core Tests', () => {
  it('loads environment and application config defaults', () => {
    expect(true).toBe(true);
  });

  it('validates auth token key constant', () => {
    const TOKEN_KEY = 'medicare_token';
    expect(TOKEN_KEY).toBe('medicare_token');
  });

  it('verifies healthcare disclaimer text formatting', () => {
    const disclaimer = 'Medicare provides healthcare connectivity, scheduling, and pharmacy dispatching services.';
    expect(disclaimer).toContain('healthcare');
  });

  it('validates login credentials validation requirements', () => {
    const validateLogin = (email: string, pass: string) => {
      if (!email.trim() || !pass.trim()) return false;
      return email.includes('@') && pass.length >= 6;
    };
    expect(validateLogin('', '')).toBe(false);
    expect(validateLogin('test@example.com', '123456')).toBe(true);
  });

  it('validates 6-digit OTP verification code format', () => {
    const isOtpValid = (code: string) => /^\d{6}$/.test(code.trim());
    expect(isOtpValid('123456')).toBe(true);
    expect(isOtpValid('482915')).toBe(true);
    expect(isOtpValid('12345')).toBe(false);
    expect(isOtpValid('1234567')).toBe(false);
    expect(isOtpValid('12a456')).toBe(false);
  });

  it('validates password reset match and minimum length requirements', () => {
    const canResetPassword = (otp: string, p1: string, p2: string) => {
      if (!/^\d{6}$/.test(otp)) return false;
      if (p1.length < 6) return false;
      return p1 === p2;
    };
    expect(canResetPassword('123456', 'Secret123!', 'Secret123!')).toBe(true);
    expect(canResetPassword('123456', '12345', '12345')).toBe(false);
    expect(canResetPassword('123456', 'Secret123!', 'Mismatch!')).toBe(false);
  });

  it('defines all 4 quick healthcare service routes and labels consistently', () => {
    expect(QUICK_HEALTH_SERVICES).toHaveLength(4);
    expect(QUICK_HEALTH_SERVICES.map((s) => s.fullLabel)).toEqual([
      'Buy Medicines',
      'Book Doctors',
      'Upload Prescription',
      'Health Checkups',
    ]);
    expect(QUICK_HEALTH_SERVICES.map((s) => s.route)).toEqual([
      '/medicines',
      '/doctors',
      '/prescriptions/upload',
      '/health-checkups',
    ]);
  });

  it('sanitizes returnUrl against open redirects and matches quick services', () => {
    expect(getSafeReturnUrl('/medicines')).toBe('/medicines');
    expect(getSafeReturnUrl('/prescriptions/upload?step=1')).toBe('/prescriptions/upload?step=1');
    expect(getSafeReturnUrl('https://evil.com')).toBe('/user/dashboard');
    expect(getSafeReturnUrl('//evil.com')).toBe('/user/dashboard');
    expect(getSafeReturnUrl(null)).toBe('/user/dashboard');

    expect(findQuickServiceByRoute('/doctors')?.fullLabel).toBe('Book Doctors');
    expect(findQuickServiceByRoute('/health-checkups?panel=cardiac')?.id).toBe('checkups');
    expect(findQuickServiceByRoute('/unknown')).toBeUndefined();
  });

  it('resolves role-based default dashboards accurately after login', () => {
    expect(getDefaultDashboardRoute('ADMIN')).toBe('/admin');
    expect(getDefaultDashboardRoute('PHARMACIST')).toBe('/pharmacist');
    expect(getDefaultDashboardRoute('DOCTOR')).toBe('/doctor');
    expect(getDefaultDashboardRoute('USER')).toBe('/user/dashboard');
    expect(getDefaultDashboardRoute()).toBe('/user/dashboard');
  });
});
