import { ENV } from '../config/env';

export interface PaymentIntentInput {
  amount: number;
  currency?: string;
  orderId?: string;
  bookingId?: string;
  membershipId?: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentResult {
  provider: string;
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentUrl?: string;
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentProvider {
  createPayment(input: PaymentIntentInput): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
}

/**
 * Sandbox payment provider for development & integration testing.
 * Provides explicit sandbox status and simulated payment intent tracking.
 */
class SandboxPaymentProvider implements IPaymentProvider {
  async createPayment(input: PaymentIntentInput): Promise<PaymentResult> {
    const transactionId = `txn_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      provider: 'sandbox',
      transactionId,
      amount: input.amount,
      status: 'COMPLETED',
      metadata: {
        isSandbox: true,
        description: input.description,
        orderId: input.orderId,
        bookingId: input.bookingId,
        membershipId: input.membershipId,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return {
      provider: 'sandbox',
      transactionId,
      amount: 0,
      status: 'COMPLETED',
      metadata: { isSandbox: true },
    };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    return {
      provider: 'sandbox',
      transactionId: `ref_${transactionId}`,
      amount: amount || 0,
      status: 'REFUNDED',
      metadata: { isSandbox: true },
    };
  }
}

/**
 * Payment Service orchestrator
 */
class PaymentService {
  private provider: IPaymentProvider;

  constructor() {
    const providerName = (ENV.PAYMENT_PROVIDER || 'sandbox').toLowerCase();
    if (providerName === 'sandbox' || providerName === 'mock') {
      this.provider = new SandboxPaymentProvider();
    } else {
      // Production live payment providers (Stripe / Razorpay) plug in here
      console.warn(`[Payment] Live provider '${providerName}' credentials pending. Falling back to sandbox payment provider.`);
      this.provider = new SandboxPaymentProvider();
    }
  }

  async createPayment(input: PaymentIntentInput): Promise<PaymentResult> {
    return this.provider.createPayment(input);
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    return this.provider.verifyPayment(transactionId);
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    return this.provider.refundPayment(transactionId, amount);
  }
}

export const paymentService = new PaymentService();
