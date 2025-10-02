/**
 * Dev Mode Bypass System
 * Provides instant access to app features during development
 * while preserving production authentication and payment logic
 */

// Dev Mode detection
// Enabled when:
// 1) Local dev with env flag, OR
// 2) Explicit prod override via /dev route or ?dev=1, OR
// 3) Manual unlock flag in localStorage
const envDev = import.meta.env.VITE_DEV_MODE === 'true';
const isLocalhost = typeof window !== 'undefined' && window.location && (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
);
const urlForcesDev = typeof window !== 'undefined' && window.location && (
  window.location.pathname === '/dev' ||
  new URLSearchParams(window.location.search).get('dev') === '1'
);
const localUnlock = typeof window !== 'undefined' && (() => {
  try { return localStorage.getItem('CRG_DEV_UNLOCK') === '1'; } catch { return false; }
})();
export const DEV_MODE = (envDev && isLocalhost) || urlForcesDev || localUnlock;

// Dev Mode User Object
export const DEV_USER = {
  id: 'dev-user',
  name: 'Dev Mode User',
  email: 'dev@local.test',
  tier: 'advanced' as const,
  credits: Infinity,
  join_date: new Date().toISOString(),
  total_tracks: 0,
  total_spent: 0,
  profile_picture: undefined,
  phone: undefined,
  company: undefined,
  location: undefined,
  bio: undefined,
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
  accessGranted: true,
  tier: 'advanced' as const
};

/**
 * Log Dev Mode actions with warning
 * @param action - The action being performed
 * @param data - Optional data to log
 */
export function logDevAction(action: string, data?: any): void {
  if (DEV_MODE) {
    console.warn(`⚠️ Dev Mode: ${action}`, data || '');
  }
}

/**
 * Check if Dev Mode is active
 * @returns boolean - True if Dev Mode is enabled
 */
export function isDevMode(): boolean {
  return DEV_MODE;
}

export function enableDevUnlock(): void {
  try { localStorage.setItem('CRG_DEV_UNLOCK', '1'); } catch {}
}

/**
 * Get Dev Mode user object
 * @returns Dev Mode user object
 */
export function getDevUser() {
  return DEV_USER;
}

/**
 * Get Dev Mode credits response
 * @returns Dev Mode credits response
 */
export function getDevCreditsResponse() {
  return DEV_CREDITS_RESPONSE;
}

/**
 * Initialize Dev Mode warnings
 */
export function initDevMode(): void {
  if (DEV_MODE) {
    console.warn('⚠️ Running in Dev Mode: Auth & Payments bypassed');
    console.warn('⚠️ Dev Mode User:', DEV_USER);
    console.warn('⚠️ Dev Mode Credits:', DEV_CREDITS_RESPONSE);
  }
}
