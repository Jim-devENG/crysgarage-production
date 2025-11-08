/**
 * Payment Service with Dev Mode Support
 * Wraps Paystack payments with development bypass functionality
 */

import { isDevMode, getDevCredits, logDevAction } from '../utils/devMode';

/**
 * Handle payment with Dev Mode bypass
 * @param {function} grantAccessToFeature - Function to call when payment succeeds
 * @param {string} userEmail - User's email address
 * @param {number} amount - Payment amount in kobo (Nigerian currency)
 * @param {function} updateCredits - Function to update user credits
 * @param {object} options - Additional options for payment
 * @returns {Promise} - Payment promise
 */
export async function handlePayment(
  grantAccessToFeature, 
  userEmail, 
  amount, 
  updateCredits,
  options = {}
) {
  // Check if we're in dev mode
  if (isDevMode(userEmail)) {
    logDevAction("Fake Paystack payment successful");
    
    // Simulate successful payment
    const devCredits = getDevCredits();
    
    // Update credits with unlimited amount
    if (updateCredits) {
      updateCredits("dev-user-001", devCredits);
    }
    
    // Grant access to feature immediately
    if (grantAccessToFeature) {
      grantAccessToFeature();
    }
    
    return Promise.resolve({
      success: true,
      devMode: true,
      credits: devCredits,
      message: "Dev Mode: Payment bypassed successfully"
    });
  }
  
  // Normal Paystack payment flow
  logDevAction("Using normal Paystack payment");
  return new Promise((resolve, reject) => {
    // Your existing Paystack implementation would go here
    // This is a simplified example - replace with your actual Paystack code
    
    const paystackConfig = {
      key: process.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      ref: `crysgarage_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "User Email",
            variable_name: "user_email",
            value: userEmail
          }
        ]
      },
      callback: function(response) {
        logDevAction("Paystack payment successful", response);
        
        // Update credits based on payment amount
        const creditsToAdd = Math.floor(amount / 1000); // Example: 1000 kobo = 1 credit
        if (updateCredits) {
          updateCredits(userEmail, creditsToAdd);
        }
        
        // Grant access to feature
        if (grantAccessToFeature) {
          grantAccessToFeature();
        }
        
        resolve({
          success: true,
          devMode: false,
          reference: response.reference,
          credits: creditsToAdd
        });
      },
      onClose: function() {
        logDevAction("Paystack payment cancelled");
        reject({
          success: false,
          devMode: false,
          message: "Payment cancelled by user"
        });
      }
    };
    
    // Initialize Paystack
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } else {
      reject({
        success: false,
        devMode: false,
        message: "Paystack not loaded"
      });
    }
  });
}

/**
 * Initialize Paystack payment for a specific tier
 * @param {string} tier - Payment tier (free, professional, advanced)
 * @param {string} userEmail - User's email
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 * @param {function} updateCredits - Function to update credits
 */
export function initializeTierPayment(tier, userEmail, onSuccess, onError, updateCredits) {
  const tierConfig = {
    free: { amount: 300, credits: 1, name: "Pay Per Download" },
    professional: { amount: 1500, credits: 5, name: "Professional" },
    advanced: { amount: 2500, credits: 6, name: "Advanced Manual" }
  };
  
  const config = tierConfig[tier];
  if (!config) {
    if (onError) onError(new Error(`Invalid tier: ${tier}`));
    return;
  }
  
  const grantAccess = () => {
    logDevAction(`Access granted to ${config.name} tier`);
    if (onSuccess) onSuccess(config);
  };
  
  handlePayment(grantAccess, userEmail, config.amount, updateCredits)
    .then((result) => {
      if (result.success) {
        logDevAction(`Payment successful for ${tier} tier`, result);
      }
    })
    .catch((error) => {
      logDevAction(`Payment failed for ${tier} tier`, error);
      if (onError) onError(error);
    });
}

/**
 * Check if user has sufficient credits (with Dev Mode support)
 * @param {string} userEmail - User's email
 * @param {number} requiredCredits - Credits required for action
 * @param {function} getUserCredits - Function to get user's current credits
 * @returns {boolean} - True if user has sufficient credits
 */
export function hasSufficientCredits(userEmail, requiredCredits, getUserCredits) {
  if (isDevMode(userEmail)) {
    logDevAction(`Dev Mode: Unlimited credits available (required: ${requiredCredits})`);
    return true;
  }
  
  const currentCredits = getUserCredits ? getUserCredits() : 0;
  const hasCredits = currentCredits >= requiredCredits;
  
  logDevAction(`Credit check: ${currentCredits}/${requiredCredits} - ${hasCredits ? 'SUFFICIENT' : 'INSUFFICIENT'}`);
  return hasCredits;
}

/**
 * Deduct credits from user account (with Dev Mode support)
 * @param {string} userEmail - User's email
 * @param {number} creditsToDeduct - Credits to deduct
 * @param {function} updateCredits - Function to update credits
 * @returns {boolean} - True if credits were deducted successfully
 */
export function deductCredits(userEmail, creditsToDeduct, updateCredits) {
  if (isDevMode(userEmail)) {
    logDevAction(`Dev Mode: Credits deduction bypassed (would deduct: ${creditsToDeduct})`);
    return true;
  }
  
  if (updateCredits) {
    updateCredits(userEmail, -creditsToDeduct);
    logDevAction(`Credits deducted: ${creditsToDeduct}`);
    return true;
  }
  
  return false;
}
