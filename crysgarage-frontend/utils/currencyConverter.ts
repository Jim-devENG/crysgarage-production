// Currency conversion utility for USD to NGN
// This ensures Paystack receives amounts in Naira (NGN) instead of USD

export interface CurrencyConversion {
  usd: number;
  ngn: number;
  ngnCents: number; // Paystack expects amount in kobo (smallest NGN unit)
}

// Current exchange rate (you can update this or fetch from an API)
let USD_TO_NGN_RATE = 1500; // 1 USD = 1500 NGN

/**
 * Convert USD amount to NGN for Paystack payments
 * @param usdAmount - Amount in USD (e.g., 19.99)
 * @returns CurrencyConversion object with USD, NGN, and NGN cents
 */
export function convertUSDToNGN(usdAmount: number): CurrencyConversion {
  const ngnAmount = usdAmount * USD_TO_NGN_RATE;
  const ngnCents = Math.round(ngnAmount * 100); // Convert to kobo (1 NGN = 100 kobo)
  
  return {
    usd: usdAmount,
    ngn: ngnAmount,
    ngnCents: ngnCents
  };
}

/**
 * Format NGN amount for display
 * @param ngnAmount - Amount in NGN
 * @returns Formatted string with NGN symbol
 */
export function formatNGN(ngnAmount: number): string {
  return `NGN ${ngnAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Get the current exchange rate
 * @returns Current USD to NGN exchange rate
 */
export function getExchangeRate(): number {
  return USD_TO_NGN_RATE;
}

/**
 * Update exchange rate (useful if you want to fetch from an API)
 * @param newRate - New USD to NGN exchange rate
 */
export function updateExchangeRate(newRate: number): void {
  // In a real app, you might want to validate this rate
  if (newRate > 0 && newRate < 10000) { // Reasonable bounds
    (USD_TO_NGN_RATE as any) = newRate;
  }
}

