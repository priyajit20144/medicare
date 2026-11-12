export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const FREE_DELIVERY_THRESHOLD_INR = 999;
export const STANDARD_DELIVERY_FEE_INR = 49;
export const GST_TAX_RATE = 0.05;

/**
 * Formats an amount in Indian Rupees using the Indian numbering system (en-IN).
 * Example: formatINR(1499) -> "₹1,499.00", formatINR(1499, 0) -> "₹1,499"
 */
export function formatINR(
  amount: number | string | undefined | null,
  decimals: number = 2
): string {
  const numeric = Number(amount ?? 0);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safe);
}

