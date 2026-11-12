export const CURRENCY_CODE = 'INR';
export const CURRENCY_SYMBOL = '₹';
export const FREE_DELIVERY_THRESHOLD_INR = 999;
export const STANDARD_DELIVERY_FEE_INR = 49;
export const GST_TAX_RATE = 0.05;

export interface OrderBreakdownINR {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

/**
 * Computes delivery fee in INR: free above ₹999 or on empty carts; ₹49 otherwise.
 */
export function calculateDeliveryFeeINR(subtotal: number): number {
  if (subtotal <= 0 || subtotal > FREE_DELIVERY_THRESHOLD_INR) {
    return 0;
  }
  return STANDARD_DELIVERY_FEE_INR;
}

/**
 * Computes full cart / order financial breakdown in INR (GST 5% + delivery fee).
 */
export function calculateOrderBreakdownINR(
  subtotal: number,
  totalDiscount: number
): OrderBreakdownINR {
  const cleanSubtotal = Number(subtotal.toFixed(2));
  const cleanDiscount = Number(totalDiscount.toFixed(2));
  const taxableAmount = Math.max(0, cleanSubtotal - cleanDiscount);
  const deliveryFee = calculateDeliveryFeeINR(cleanSubtotal);
  const tax = Number((taxableAmount * GST_TAX_RATE).toFixed(2));
  const total = Number((taxableAmount + deliveryFee + tax).toFixed(2));

  return {
    subtotal: cleanSubtotal,
    discount: cleanDiscount,
    deliveryFee,
    tax,
    total,
  };
}

/**
 * Formats an amount in Indian Rupees using en-IN digit grouping.
 */
export function formatINR(amount: number | undefined | null, decimals = 2): string {
  const numeric = Number(amount ?? 0);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
}

