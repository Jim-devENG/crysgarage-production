/**
 * Email Notification Service
 * Handles sending welcome emails and login notifications
 */

export interface EmailNotificationData {
  userEmail: string;
  userName: string;
  userTier?: string;
  loginTime?: string;
  ipAddress?: string;
}

class EmailNotificationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:8004' 
      : 'https://crysgarage.studio/email';
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(data: EmailNotificationData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/welcome`, {
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
      const response = await fetch(`${this.baseUrl}/login-notification`, {
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
   * Get user's IP address for login notifications
   */
  async getUserIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting user IP:', error);
      return 'Unknown';
    }
  }
}

export const emailNotificationService = new EmailNotificationService();