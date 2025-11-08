/**
 * CrysGarage Email Notification Service
 * Handles sending email notifications for user authentication events
 */

interface EmailNotificationData {
  userEmail: string;
  userName: string;
  userTier?: string;
  loginTime?: string;
  ipAddress?: string;
  fileName?: string;
  downloadUrl?: string;
  creditsUsed?: number;
  remainingCredits?: number;
}

class EmailNotificationService {
  private baseUrl: string;

  constructor() {
    // Use the same base URL as other services
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://crysgarage.studio' 
      : 'http://localhost:8002';
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(data: EmailNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/email/welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: data.userEmail,
          user_name: data.userName,
          user_tier: data.userTier || 'free'
        })
      });

      if (response.ok) {
        console.log('Welcome email sent successfully to:', data.userEmail);
        return true;
      } else {
        console.error('Failed to send welcome email:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send login notification email
   */
  async sendLoginNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/email/login-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: data.userEmail,
          user_name: data.userName,
          login_time: data.loginTime || new Date().toISOString(),
          ip_address: data.ipAddress
        })
      });

      if (response.ok) {
        console.log('Login notification sent successfully to:', data.userEmail);
        return true;
      } else {
        console.error('Failed to send login notification:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending login notification:', error);
      return false;
    }
  }

  /**
   * Send processing complete notification
   */
  async sendProcessingComplete(data: EmailNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/email/processing-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: data.userEmail,
          user_name: data.userName,
          file_name: data.fileName,
          download_url: data.downloadUrl
        })
      });

      if (response.ok) {
        console.log('Processing complete email sent successfully to:', data.userEmail);
        return true;
      } else {
        console.error('Failed to send processing complete email:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending processing complete email:', error);
      return false;
    }
  }

  /**
   * Send credit update notification
   */
  async sendCreditUpdate(data: EmailNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/email/credit-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: data.userEmail,
          user_name: data.userName,
          credits_used: data.creditsUsed,
          remaining_credits: data.remainingCredits
        })
      });

      if (response.ok) {
        console.log('Credit update email sent successfully to:', data.userEmail);
        return true;
      } else {
        console.error('Failed to send credit update email:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending credit update email:', error);
      return false;
    }
  }

  /**
   * Get user's IP address (for login notifications)
   */
  async getUserIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting user IP:', error);
      return null;
    }
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();

// Export convenience functions
export const sendWelcomeEmail = (data: EmailNotificationData) => 
  emailNotificationService.sendWelcomeEmail(data);

export const sendLoginNotification = (data: EmailNotificationData) => 
  emailNotificationService.sendLoginNotification(data);

export const sendProcessingComplete = (data: EmailNotificationData) => 
  emailNotificationService.sendProcessingComplete(data);

export const sendCreditUpdate = (data: EmailNotificationData) => 
  emailNotificationService.sendCreditUpdate(data);

export default emailNotificationService;
