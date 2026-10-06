export type UserRole = 'USER' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  iconName?: string;
  itemCount?: number;
}

export interface Medicine {
  _id: string;
  name: string;
  slug: string;
  genericName: string;
  brand: string;
  description: string;
  shortDescription?: string;
  category: Category | string;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  manufacturer: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  requiresPrescription: boolean;
  directions?: string;
  warnings?: string;
  ingredients?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  medicineId: Medicine;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  hasPrescriptionRequiredItems: boolean;
}

export interface CartResponse {
  cart: {
    _id: string;
    userId: string;
    items: CartItem[];
  };
  summary: CartSummary;
}

export interface OrderItem {
  medicineId: string;
  medicine?: any;
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  requiresPrescription: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: any;
  user?: any;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payment: {
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    paidAt?: string;
  };
  paymentStatus?: string;
  status:
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'PHARMACY_REVIEW'
    | 'READY_TO_SHIP'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';
  prescriptionId?: any;
  prescriptionStatus?: 'NOT_REQUIRED' | 'ATTACHED' | 'VERIFIED' | 'REJECTED' | 'REQUIRED_PENDING';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface PrescriptionRecommendation {
  medicineId: any;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  userId: any;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorName?: string;
  prescriptionDate?: string;
  notes?: string;
  status:
    | 'PENDING_REVIEW'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CLARIFICATION_REQUIRED'
    | 'EXPIRED';
  files: PrescriptionFile[];
  reviewNotes?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  recommendedMedicines: PrescriptionRecommendation[];
  validUntil?: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  userId?: any;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  biography: string;
  avatar?: string;
  languages: string[];
  consultationTypes: ('IN_PERSON' | 'VIDEO')[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  hospitalAffiliation?: string;
  availableDays?: string[];
  availableSlots?: string[];
}

export interface Appointment {
  _id: string;
  appointmentNumber: string;
  doctorId: any;
  doctor?: any;
  userId: any;
  user?: any;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  symptoms?: string;
  consultationType: 'IN_PERSON' | 'VIDEO';
  type?: string;
  date: string;
  timeSlot: string;
  fee: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  meetingLink?: string;
  prescriptionGiven?: string;
  payment: {
    provider: string;
    status: 'PENDING' | 'COMPLETED' | 'REFUNDED';
    transactionId?: string;
  };
  createdAt: string;
}

export interface HealthCheckupPackage {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  duration: string;
  testCount: number;
  includedTests?: any[];
  recommendedFor: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LabTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  sampleType: string;
  preparationInstructions: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Facility {
  _id: string;
  name: string;
  slug: string;
  type:
    | 'DIAGNOSTIC_CENTER'
    | 'PARTNER_CLINIC'
    | 'HEALTH_CHECKUP_CENTER'
    | 'PHARMACY'
    | 'COLLECTION_CENTER'
    | 'DOCTOR_CONSULTATION_CENTER';
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  openingHours: string;
  services: string[];
  checkupPackages?: any[];
  image?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

export interface HealthCheckupBooking {
  _id: string;
  bookingNumber: string;
  userId: any;
  packageId: any;
  facilityId: any;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  bookingDate: string;
  timeSlot: string;
  sampleCollectionType: 'AT_CENTER' | 'HOME_COLLECTION';
  homeAddress?: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  payment: {
    provider: string;
    status: string;
    amount: number;
    transactionId?: string;
    paidAt?: string;
  };
  notes?: string;
  isVipRedemption?: boolean;
  vipMembershipId?: string;
  phlebotomistName?: string;
  sampleStatus?: 'PENDING_COLLECTION' | 'SAMPLE_COLLECTED' | 'IN_LAB_ANALYSIS' | 'COMPLETED';
  createdAt: string;
}

export interface HealthCheckupResult {
  _id: string;
  bookingId: any;
  userId: any;
  packageId: any;
  status: 'PROCESSING' | 'AVAILABLE' | 'VERIFIED';
  reportFile?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  };
  summaryObservations?: string;
  recommendations?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  durationMonths: number;
  price: number;
  discountPrice?: number;
  features: string[];
  benefitsConfig: {
    key: string;
    name: string;
    description: string;
    frequency: 'ONE_TIME' | 'MONTHLY' | 'UNLIMITED' | 'LIMITED_USE';
    maxLimit?: number;
  }[];
  isActive?: boolean;
}

export interface UserMembership {
  _id: string;
  userId: any;
  planId: MembershipPlan;
  membershipId: string;
  startDate: string;
  endDate: string;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
  autoRenew: boolean;
  benefitUsages: {
    benefitKey: string;
    name: string;
    usedCount: number;
    maxLimit?: number;
    lastUsedAt?: string;
  }[];
  payment?: {
    provider: string;
    status: string;
    amount: number;
    transactionId?: string;
    paidAt?: string;
  };
}

export interface MembershipAdminStats {
  totalMemberships: number;
  totalActive: number;
  totalExpired: number;
  totalSuspended: number;
  totalRevenue: number;
  checkupBenefits: {
    totalAllocated: number;
    totalClaimed: number;
    totalAvailable: number;
  };
  vipCheckupBookingsCount: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'ORDER' | 'PRESCRIPTION' | 'APPOINTMENT' | 'MEMBERSHIP' | 'HEALTH_CHECKUP' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
