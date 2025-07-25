import { useState, useEffect, useCallback } from 'react';
import { creditsAPI, User } from '../services/api';

interface UseCreditsReturn {
  credits: number;
  tier: string;
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
  canUpload: boolean;
  getCreditsRequired: (tier: string) => number;
}

export const useCredits = (user: User | null): UseCreditsReturn => {
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get credits required for different tiers
  const getCreditsRequired = useCallback((userTier: string): number => {
    switch (userTier) {
      case 'free':
        return 1;
      case 'pro':
        return 1;
      case 'advanced':
        return 2;
      default:
        return 1;
    }
  }, []);

  // Check if user can upload
  const canUpload = credits >= getCreditsRequired(tier);

  // Refresh credits from API
  const refreshCredits = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const balance = await creditsAPI.getBalance();
      setCredits(balance.credits);
      setTier(balance.tier);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load credits';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initialize credits from user data
  useEffect(() => {
    if (user) {
      setCredits(user.credits);
      setTier(user.tier);
    }
  }, [user]);

  return {
    credits,
    tier,
    isLoading,
    error,
    refreshCredits,
    canUpload,
    getCreditsRequired,
  };
}; 