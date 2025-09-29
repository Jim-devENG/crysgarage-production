/**
 * Credit Service
 * Handles credit tracking, usage, and purchase logic
 */

import { DEV_MODE } from '../utils/devMode';

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
      if (DEV_MODE) {
        return {
          current: Number.POSITIVE_INFINITY,
          total_purchased: 0,
          total_used: 0,
        };
      }
      const response = await fetch(`${this.baseUrl}/credits/balance/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credit balance');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      // Return default balance if API fails
      return {
        current: DEV_MODE ? Number.POSITIVE_INFINITY : 0,
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
      if (DEV_MODE) {
        return {
          id: `dev-${Date.now()}`,
          userId,
          type: 'usage',
          amount: 0,
          description: `DEV_MODE bypass: ${description}`,
          timestamp: new Date(),
        };
      }
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
      if (DEV_MODE) {
        return {
          id: `dev-add-${Date.now()}`,
          userId,
          type: 'bonus',
          amount,
          description: `DEV_MODE: added credits for ${tier}`,
          timestamp: new Date(),
          tier,
        };
      }
      const response = await fetch(`${this.baseUrl}/credits/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: amount,
          tier: tier,
          transaction_id: transactionId,
          description: `Credits purchased for ${tier} tier`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add credits');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, required: number = 1): Promise<boolean> {
    try {
      if (DEV_MODE) return true;
      const balance = await this.getCreditBalance(userId);
      return balance.current >= required;
    } catch (error) {
      console.error('Error checking credits:', error);
      return DEV_MODE ? true : false;
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
    if (DEV_MODE) {
      // Suppress exhaustion notifications in Dev Mode
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
        costPerCredit: 3.00
      },
      pro: {
        initialCredits: 2,
        description: '2 free credits + purchase more',
        costPerCredit: 3.00
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
