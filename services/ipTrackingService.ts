/**
 * IP Tracking Service
 * Handles device IP tracking for signup prevention
 */

export interface IPTrackingResponse {
  success: boolean;
  ip?: string;
  is_registered?: boolean;
  message: string;
}

class IPTrackingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8002' 
      : 'https://crysgarage.studio';
  }

  /**
   * Check if current IP is already registered
   */
  async checkIPRegistration(): Promise<IPTrackingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ip-tracking/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to check IP registration');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking IP registration:', error);
      throw error;
    }
  }

  /**
   * Register current IP address (called during signup)
   */
  async registerIP(): Promise<IPTrackingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ip-tracking/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register IP');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering IP:', error);
      throw error;
    }
  }

  /**
   * Get IP tracking system status (admin only)
   */
  async getIPTrackingStatus(): Promise<{
    total_registered_ips: number;
    system_active: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ip-tracking/status`);
      if (!response.ok) {
        throw new Error('Failed to get IP tracking status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting IP tracking status:', error);
      throw error;
    }
  }

  /**
   * Clear all registered IPs (admin only)
   */
  async clearIPTracking(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/ip-tracking/clear`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to clear IP tracking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing IP tracking:', error);
      throw error;
    }
  }

  /**
   * Handle IP registration error with user-friendly message
   */
  handleIPRegistrationError(error: Error): string {
    if (error.message.includes('already been created from this device')) {
      return 'An account has already been created from this device. Please use your existing account or contact support if you believe this is an error.';
    }
    
    if (error.message.includes('Unable to determine IP address')) {
      return 'Unable to verify your device. Please try again or contact support.';
    }
    
    return 'Unable to complete registration. Please try again or contact support.';
  }

  /**
   * Check if error is IP-related
   */
  isIPRegistrationError(error: Error): boolean {
    return error.message.includes('already been created from this device') ||
           error.message.includes('Unable to determine IP address') ||
           error.message.includes('IP registration failed');
  }
}

// Export singleton instance
export const ipTrackingService = new IPTrackingService();
export default ipTrackingService;
