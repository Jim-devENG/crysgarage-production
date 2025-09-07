/**
 * Authentication Service with Dev Mode Support
 * Wraps Firebase authentication with development bypass functionality
 */

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { isDevMode, getDevUser, logDevAction } from '../utils/devMode';

/**
 * Initialize authentication with Dev Mode support
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} - Unsubscribe function
 */
export function initAuth(callback) {
  // Check if we're in dev mode
  if (isDevMode()) {
    logDevAction("Authentication bypassed - returning dev user");
    
    // Return fake user immediately
    const devUser = getDevUser();
    callback(devUser);
    
    // Return a no-op unsubscribe function
    return () => {
      logDevAction("Dev mode auth unsubscribe (no-op)");
    };
  }
  
  // Normal Firebase authentication flow
  logDevAction("Using normal Firebase authentication");
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Convert Firebase user to our app's user format
      const appUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        // Add any additional user properties you need
      };
      callback(appUser);
    } else {
      callback(null);
    }
  });
}

/**
 * Sign in with Google (with Dev Mode support)
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export async function signInWithGoogle(onSuccess, onError) {
  if (isDevMode()) {
    logDevAction("Google sign-in bypassed");
    const devUser = getDevUser();
    onSuccess(devUser);
    return;
  }
  
  // Normal Google sign-in logic would go here
  // For now, we'll just call the error callback
  if (onError) {
    onError(new Error("Google sign-in not implemented in this example"));
  }
}

/**
 * Sign out (with Dev Mode support)
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export async function signOut(onSuccess, onError) {
  if (isDevMode()) {
    logDevAction("Sign out bypassed");
    if (onSuccess) onSuccess();
    return;
  }
  
  try {
    await auth.signOut();
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
  }
}

/**
 * Get current user (with Dev Mode support)
 * @returns {object|null} - Current user or null
 */
export function getCurrentUser() {
  if (isDevMode()) {
    return getDevUser();
  }
  
  return auth.currentUser;
}

/**
 * Check if user is authenticated (with Dev Mode support)
 * @returns {boolean} - True if user is authenticated
 */
export function isAuthenticated() {
  if (isDevMode()) {
    return true;
  }
  
  return !!auth.currentUser;
}
