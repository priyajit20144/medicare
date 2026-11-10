import { ShoppingBag, UserCheck, ShieldCheck, HeartPulse, LucideIcon } from 'lucide-react';

export interface QuickHealthService {
  id: 'medicines' | 'doctors' | 'prescriptions' | 'checkups';
  titleLine1: string;
  titleLine2: string;
  fullLabel: string;
  description: string;
  route: string;
  icon: LucideIcon;
}

export const QUICK_HEALTH_SERVICES: QuickHealthService[] = [
  {
    id: 'medicines',
    titleLine1: 'Buy',
    titleLine2: 'Medicines',
    fullLabel: 'Buy Medicines',
    description: 'Certified OTC & Rx pharmacy delivery',
    route: '/medicines',
    icon: ShoppingBag,
  },
  {
    id: 'doctors',
    titleLine1: 'Book',
    titleLine2: 'Doctors',
    fullLabel: 'Book Doctors',
    description: 'Board-certified specialist visits',
    route: '/doctors',
    icon: UserCheck,
  },
  {
    id: 'prescriptions',
    titleLine1: 'Upload',
    titleLine2: 'Prescription',
    fullLabel: 'Upload Prescription',
    description: '10-minute clinical pharmacist review',
    route: '/prescriptions/upload',
    icon: ShieldCheck,
  },
  {
    id: 'checkups',
    titleLine1: 'Health',
    titleLine2: 'Checkups',
    fullLabel: 'Health Checkups',
    description: 'Preventative panels & home labs',
    route: '/health-checkups',
    icon: HeartPulse,
  },
];

/**
 * Prevents open-redirect vulnerabilities by allowing only internal relative paths.
 */
export function getSafeReturnUrl(
  rawUrl: string | null | undefined,
  fallback: string = '/user/dashboard'
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return fallback;
}

/**
 * Resolves the role-appropriate landing dashboard when no explicit destination is chosen.
 */
export function getDefaultDashboardRoute(role?: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PHARMACIST':
      return '/pharmacist';
    case 'DOCTOR':
      return '/doctor';
    default:
      return '/user/dashboard';
  }
}

/**
 * Matches a returnUrl path against one of the 4 featured healthcare services.
 */
export function findQuickServiceByRoute(path: string | null | undefined): QuickHealthService | undefined {
  if (!path) return undefined;
  const basePath = path.split('?')[0];
  return QUICK_HEALTH_SERVICES.find((service) => basePath === service.route);
}

