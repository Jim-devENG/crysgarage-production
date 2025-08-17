import React from 'react';
import { useApp } from '../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredTier?: 'free' | 'pro' | 'advanced';
}

export function ProtectedRoute({ children, fallback, requiredTier }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useApp();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-crys-black">
        <div className="text-crys-white text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show fallback or redirect
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default fallback - redirect to landing
    window.location.href = '/';
    return null;
  }

  // Check tier requirements if specified
  if (requiredTier && user) {
    const tierHierarchy = { free: 0, pro: 1, advanced: 2 };
    const userTierLevel = tierHierarchy[user.tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      // User doesn't have required tier
      return (
        <div className="flex items-center justify-center min-h-screen bg-crys-black">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-crys-white text-xl font-semibold mb-4">
              Upgrade Required
            </h2>
            <p className="text-crys-light-grey mb-6">
              This feature requires {requiredTier} tier or higher. 
              Your current tier is {user.tier}.
            </p>
            <button
              onClick={() => window.location.href = '/studio'}
              className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-2 rounded-lg font-semibold"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required tier, show protected content
  return <>{children}</>;
}
