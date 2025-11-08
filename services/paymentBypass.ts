/**
 * Payment Bypass Service for Dev Mode
 * Provides credit and payment bypass functionality during development
 */

import { DEV_MODE, DEV_CREDITS_RESPONSE, logDevAction } from '../utils/devMode';

/**
 * Check user credits with Dev Mode bypass
 * @param userId - User ID to check credits for
 * @returns Promise with credits information
 */
export async function checkCredits(userId: string): Promise<{
  credits: number;
  accessGranted: boolean;
  tier?: string;
}> {
  if (DEV_MODE) {
    logDevAction('Credit check bypassed - returning unlimited credits');
    return DEV_CREDITS_RESPONSE;
  }

  // Production logic - make API call to check credits
  try {
    const response = await fetch(`/api/check-credits?userId=${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check credits:', error);
    throw new Error('Failed to check credits');
  }
}

/**
 * Process payment with Dev Mode bypass
 * @param amount - Payment amount
 * @param tier - Tier being purchased
 * @returns Promise with payment result
 */
export async function processPayment(amount: number, tier: string): Promise<{
  success: boolean;
  credits: number;
  transactionId?: string;
}> {
  if (DEV_MODE) {
    logDevAction(`Payment bypassed - simulating payment for ${tier} tier ($${amount})`);
    return {
      success: true,
      credits: tier === 'free' ? 1 : tier === 'professional' ? 5 : 6,
      transactionId: 'dev-transaction-' + Date.now()
    };
  }

  // Production logic - process actual payment
  try {
    const response = await fetch('/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, tier }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw new Error('Payment processing failed');
  }
}

/**
 * Verify payment with Dev Mode bypass
 * @param transactionId - Transaction ID to verify
 * @returns Promise with verification result
 */
export async function verifyPayment(transactionId: string): Promise<{
  verified: boolean;
  credits: number;
  tier?: string;
}> {
  if (DEV_MODE) {
    logDevAction(`Payment verification bypassed - simulating verification for ${transactionId}`);
    return {
      verified: true,
      credits: Infinity,
      tier: 'advanced'
    };
  }

  // Production logic - verify actual payment
  try {
    const response = await fetch(`/api/verify-payment/${transactionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw new Error('Payment verification failed');
  }
}

/**
 * Get user tier with Dev Mode bypass
 * @param userId - User ID to get tier for
 * @returns Promise with tier information
 */
export async function getUserTier(userId: string): Promise<{
  tier: string;
  credits: number;
  accessLevel: string;
}> {
  if (DEV_MODE) {
    logDevAction('Tier check bypassed - returning advanced tier');
    return {
      tier: 'advanced',
      credits: Infinity,
      accessLevel: 'full'
    };
  }

  // Production logic - get actual user tier
  try {
    const response = await fetch(`/api/user-tier/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get user tier:', error);
    throw new Error('Failed to get user tier');
  }
}
