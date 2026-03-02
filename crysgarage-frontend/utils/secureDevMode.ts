/**
 * Secure Dev Mode System for Production Testing
 * Allows bypassing authentication and payment for functional testing
 * Activated via secret key for security
 */

// Dev Mode Secret Key (should match backend)
const DEV_SECRET = '2gyZ3GDw3LHZQKDhPmPDL3sjREVRXPr8';

// Check if dev mode is enabled via environment variable
const envDevMode = import.meta.env.VITE_DEV_MODE === 'true';

// Check if running on localhost
const isLocalhost = typeof window !== 'undefined' && window.location && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

/**
 * Check if dev mode secret key is provided
 * Can be activated via:
 * 1. URL parameter: ?dev_key=SECRET
 * 2. localStorage: localStorage.setItem('CRG_DEV_KEY', 'SECRET')
 */
function hasValidDevKey(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlKey = urlParams.get('dev_key');
  if (urlKey === DEV_SECRET) {
    // Store in localStorage for persistence
    localStorage.setItem('CRG_DEV_KEY', DEV_SECRET);
    // Remove from URL to hide the secret
    urlParams.delete('dev_key');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
    return true;
  }
  
  // Check localStorage
  const storedKey = localStorage.getItem('CRG_DEV_KEY');
  return storedKey === DEV_SECRET;
}

/**
 * Enable dev mode
 * Options:
 * 1. Localhost + VITE_DEV_MODE=true (development)
 * 2. Production + valid dev key (testing)
 */
export const DEV_MODE = envDevMode && isLocalhost || hasValidDevKey();

/**
 * Disable dev mode (clears localStorage key)
 */
export function disableDevMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('CRG_DEV_KEY');
    console.log('🔒 Dev Mode Disabled');
    window.location.reload();
  }
}

/**
 * Enable dev mode with key
 */
export function enableDevMode(key: string): boolean {
  if (key === DEV_SECRET) {
    localStorage.setItem('CRG_DEV_KEY', key);
    console.log('🧪 Dev Mode Enabled');
    window.location.reload();
    return true;
  }
  console.error('❌ Invalid dev mode key');
  return false;
}

/**
 * Check if currently in dev mode
 */
export function isDevMode(): boolean {
  return DEV_MODE;
}

/**
 * Check if dev mode is active (alias for compatibility)
 * Can be called from any component to check dev mode status
 */
export function isDevModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check multiple sources for dev mode
  return (
    DEV_MODE || // Main dev mode check
    hasValidDevKey() || // Check localStorage key
    (typeof window !== 'undefined' && (window as any).devMode?.enabled === true) || // Check window object
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') // Localhost always dev
  );
}

/**
 * Get dev mode status info
 */
export function getDevModeInfo() {
  return {
    enabled: DEV_MODE,
    isLocalhost,
    envDevMode,
    hasValidKey: hasValidDevKey(),
  };
}

// Dev Mode User Object
export const DEV_USER = {
  id: 'dev-user',
  name: 'Dev Mode User',
  email: 'dev@crysgarage.studio',
  tier: 'developer' as const,
  credits: Infinity,
  join_date: new Date().toISOString(),
  total_tracks: 0,
  total_spent: 0,
  profile_picture: undefined,
  phone: undefined,
  company: 'CrysGarage Testing',
  location: 'Dev Environment',
  bio: 'Development and testing account with unlimited access',
  website: undefined,
  instagram: undefined,
  twitter: undefined,
  facebook: undefined,
  youtube: undefined,
  tiktok: undefined,
  kyc_verified: false
};

// Dev Mode Credit Response
export const DEV_CREDITS_RESPONSE = {
  credits: Infinity,
  tier: 'developer',
  unlimited: true
};

/**
 * Log dev mode action
 */
export function logDevAction(action: string): void {
  if (DEV_MODE) {
    console.log(`🧪 [DEV MODE] ${action}`);
  }
}

/**
 * Get dev mode user
 */
export function getDevUser() {
  return DEV_MODE ? DEV_USER : null;
}

/**
 * Get dev mode credits response
 */
export function getDevCreditsResponse() {
  return DEV_MODE ? DEV_CREDITS_RESPONSE : null;
}

/**
 * Initialize dev mode with warnings
 */
export function initDevMode(): void {
  if (DEV_MODE) {
    console.warn('╔══════════════════════════════════════════════════════════╗');
    console.warn('║       🧪 DEV MODE ACTIVE - AUTH & PAYMENTS BYPASSED      ║');
    console.warn('╚══════════════════════════════════════════════════════════╝');
    console.warn('Dev Mode Info:', getDevModeInfo());
    console.warn('Dev Mode User:', DEV_USER);
    console.warn('Dev Mode Credits:', DEV_CREDITS_RESPONSE);
    console.warn('');
    console.warn('To disable dev mode in production:');
    console.warn('  localStorage.removeItem("CRG_DEV_KEY")');
    console.warn('  window.location.reload()');
    console.warn('');
    console.warn('Or call: disableDevMode()');
  }
}

/**
 * Get auth headers for dev mode requests
 */
export function getDevAuthHeaders(): Record<string, string> {
  if (!DEV_MODE) return {};
  
  return {
    'X-Dev-Auth-Key': DEV_SECRET,
    'X-Dev-Mode': 'true',
  };
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initDevMode();
}

// Export for global access (for debugging in console)
if (typeof window !== 'undefined' && DEV_MODE) {
  (window as any).devMode = {
    disable: disableDevMode,
    enable: enableDevMode,
    info: getDevModeInfo,
    user: DEV_USER,
  };
  console.log('💡 Dev mode controls available: window.devMode');
}

