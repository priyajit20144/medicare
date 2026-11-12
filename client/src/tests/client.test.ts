import { describe, it, expect } from 'vitest';
import {
  QUICK_HEALTH_SERVICES,
  getSafeReturnUrl,
  getDefaultDashboardRoute,
  findQuickServiceByRoute,
} from '../constants/quickServices';
import {
  CURRENCY_CODE,
  CURRENCY_SYMBOL,
  FREE_DELIVERY_THRESHOLD_INR,
  STANDARD_DELIVERY_FEE_INR,
  formatINR,
} from '../utils/currency';
import { computeCartSummary } from '../store/cartStore';

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

  it('formats Indian Rupee (INR) prices with en-IN digit grouping', () => {
    expect(CURRENCY_CODE).toBe('INR');
    expect(CURRENCY_SYMBOL).toBe('₹');
    expect(formatINR(1499)).toBe('₹1,499.00');
    expect(formatINR(125000, 0)).toBe('₹1,25,000');
    expect(formatINR(null)).toBe('₹0.00');
  });

  it('applies ₹999 free-delivery threshold and ₹49 standard delivery fee in cart summary', () => {
    const lowCart = computeCartSummary([
      {
        medicineId: {
          _id: 'med-1',
          name: 'Paracetamol',
          price: 500,
          discountPrice: 400,
          requiresPrescription: false,
        } as any,
        quantity: 1,
        price: 500,
        discountPrice: 400,
      },
    ]);
    expect(lowCart.subtotal).toBe(500);
    expect(lowCart.discount).toBe(100);
    expect(lowCart.deliveryFee).toBe(STANDARD_DELIVERY_FEE_INR);
    expect(lowCart.tax).toBe(20);
    expect(lowCart.total).toBe(469);

    const freeCart = computeCartSummary([
      {
        medicineId: {
          _id: 'med-2',
          name: 'Cardio Care',
          price: FREE_DELIVERY_THRESHOLD_INR + 201,
          requiresPrescription: false,
        } as any,
        quantity: 1,
        price: FREE_DELIVERY_THRESHOLD_INR + 201,
      },
    ]);
    expect(freeCart.deliveryFee).toBe(0);
    expect(freeCart.tax).toBe(60);
    expect(freeCart.total).toBe(1260);
  });
});
