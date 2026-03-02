/**
 * Credit Service
 * Handles credit tracking, usage, and purchase logic
 */

import { isDevModeActive } from '../utils/secureDevMode';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: Date;
  tier?: string;
}

export interface CreditBalance {
  current: number;
  total_purchased: number;
  total_used: number;
  last_transaction?: CreditTransaction;
}

class CreditService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8002' 
      : 'https://crysgarage.studio';
  }

  /**
   * Get user's current credit balance
   */
  async getCreditBalance(userId: string): Promise<CreditBalance> {
    try {
      // CRITICAL: Always fetch from backend - credits are authoritative
      // Dev mode may bypass payment verification, but NOT credit checks
      // Professional tier (Emerald) is pay-per-download, so no credits needed
      // But we still fetch from backend to get accurate balance
      
      const response = await fetch(`${this.baseUrl}/credits/balance/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit balance');
      }
      // Ensure JSON (avoid HTML responses)
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Unexpected content-type');
      }
      const balance = await response.json();
      
      // CRITICAL: Backend is source of truth - return what backend says
      return balance;
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      // CRITICAL: If backend fails, return 0 (deny access)
      // Do NOT use localStorage or cached values - backend is authoritative
      // This ensures credits === 0 → access denied, even if API fails
      return {
        current: 0,
        total_purchased: 0,
        total_used: 0
      };
    }
  }

  /**
   * Use credits for a download/processing
   */
  async useCredits(userId: string, amount: number = 1, description: string = 'Audio processing'): Promise<CreditTransaction> {
    try {
      // CRITICAL: Removed dev mode bypass - credits are ALWAYS managed by backend
      // Dev mode may skip payment verification, but NOT credit operations
      const response = await fetch(`${this.baseUrl}/credits/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: amount,
          description: description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to use credits');
      }

      return await response.json();
    } catch (error) {
      console.error('Error using credits:', error);
      throw error;
    }
  }

  /**
   * Add credits after successful payment
   */
  async addCredits(userId: string, amount: number, tier: string, transactionId: string): Promise<CreditTransaction> {
    try {
      // CRITICAL: Removed dev mode bypass - credits are ALWAYS managed by backend
      // Dev mode may skip payment verification, but NOT credit operations
      
      // Ensure absolute URL in production (no blind relative paths)
      const url = window.location.hostname === 'localhost' 
        ? 'http://localhost:8002/credits/add'
        : `${this.baseUrl}/credits/add`;
      
      const requestBody = {
        user_id: userId,
        amount: amount,
        tier: tier,
        transaction_id: transactionId,
        description: `Credits purchased for ${tier} tier`
      };
      
      console.log('🔧 CreditService.addCredits - Request:', {
        url,
        method: 'POST',
        body: requestBody,
        baseUrl: this.baseUrl
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      // Log response details for debugging
      console.log('🔧 CreditService.addCredits - Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      // CRITICAL HARD GUARD: Check content-type BEFORE parsing JSON
      // This prevents "Unexpected token '<'" errors when Apache serves HTML
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        const errorMsg = `Backend returned non-JSON response. Apache is misrouting /credits/add to React SPA. Response preview: ${text.slice(0, 200)}`;
        console.error('❌ CreditService.addCredits - Non-JSON response (Apache routing bug):', {
          contentType,
          status: response.status,
          statusText: response.statusText,
          preview: text.slice(0, 200),
          fullUrl: response.url,
          requestUrl: url,
          error: errorMsg
        });
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        // Content-type is JSON, safe to parse
        const errorData = await response.json();
        console.error('❌ CreditService.addCredits - Backend error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.detail || `Failed to add credits: ${response.status} ${response.statusText}`);
      }

      // Response is OK and JSON - safe to parse
      const data = await response.json();
      console.log('✅ CreditService.addCredits - Success:', data);
      return data;
    } catch (error) {
      console.error('❌ CreditService.addCredits - Error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Check if user has enough credits
   * Tier-specific logic:
   * - Sapphire (free): Requires credits for download
   * - Emerald (professional): No credits needed (pay-per-download)
   * - Jasper (advanced): Requires credits for download
   */
  /**
   * Check if user has enough credits
   * 
   * DEPRECATED: This method should NOT be used for credit checks.
   * Use AuthenticationContext.user.credits directly instead.
   * 
   * This method is kept for backward compatibility but will be removed.
   * 
   * Tier-specific logic:
   * - Sapphire (free): Requires credits for download
   * - Emerald (professional): No credits needed (pay-per-download)
   * - Jasper (advanced): Requires credits for download
   */
  async hasEnoughCredits(userId: string, required: number = 1): Promise<boolean> {
    try {
      // CRITICAL: Dev mode does NOT bypass credit checks
      // Dev mode may bypass payment verification, but access is still credit-based
      // credits > 0 → allow, credits === 0 → deny (NO EXCEPTIONS)
      
      // WARNING: This method calls backend which may return undefined
      // Use AuthenticationContext.user.credits directly instead
      console.warn('⚠️ creditService.hasEnoughCredits() is deprecated. Use AuthenticationContext.user.credits directly.');
      
      // Always fetch from backend - credits are authoritative
      const balance = await this.getCreditBalance(userId);
      const current = balance?.current ?? 0;
      const hasEnough = current >= required;
      
      console.log(`💳 Credit check (deprecated method): ${current} >= ${required} = ${hasEnough}`);
      
      // CRITICAL INVARIANT: credits > 0 → allow, credits === 0 → deny
      return hasEnough;
    } catch (error) {
      console.error('Error checking credits:', error);
      // CRITICAL: On error, deny access (return false)
      // Credits are the source of truth - if we can't verify, deny access
      return false;
    }
  }

  /**
   * Get credit usage history
   */
  async getCreditHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/credits/history/${userId}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching credit history:', error);
      return [];
    }
  }

  /**
   * Handle credit exhaustion - redirect to purchase
   */
  handleCreditExhaustion(onPurchaseRedirect: () => void) {
    const isDevActive = isDevModeActive();
    if (isDevActive) {
      // Suppress exhaustion notifications in Dev Mode
      console.log('🧪 Dev Mode: Suppressing credit exhaustion notification');
      return;
    }
    // Show notification about credit exhaustion
    const notification = {
      type: 'warning',
      title: 'Credits Exhausted',
      message: 'You have used all your free credits. Purchase more credits to continue processing audio.',
      action: 'Purchase Credits',
      onAction: onPurchaseRedirect
    };

    // Dispatch custom event for notification system
    window.dispatchEvent(new CustomEvent('credit-exhaustion', { 
      detail: notification 
    }));

    // Also show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Credits Exhausted', {
        body: 'You have used all your free credits. Purchase more to continue.',
        icon: '/favicon.ico'
      });
    }
  }

  /**
   * Format credits for display
   */
  formatCredits(credits: number): string {
    if (credits === 0) return 'No credits';
    if (credits === 1) return '1 credit';
    return `${credits} credits`;
  }

  /**
   * Get tier-specific credit information
   */
  getTierCreditInfo(tier: string) {
    const tierInfo = {
      free: {
        initialCredits: 0,
        description: 'Pay per download',
        costPerCredit: 5.00
      },
      pro: {
        initialCredits: Number.POSITIVE_INFINITY as unknown as number,
        description: 'Unlimited credits',
        costPerCredit: 0.00
      },
      advanced: {
        initialCredits: 2,
        description: '2 free credits + purchase more',
        costPerCredit: 3.00
      }
    };

    return tierInfo[tier as keyof typeof tierInfo] || tierInfo.free;
  }
}

// Export singleton instance
export const creditService = new CreditService();
export default creditService;
