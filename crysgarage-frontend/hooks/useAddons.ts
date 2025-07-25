import { useState, useEffect, useCallback } from 'react';
import { addonAPI, Addon, User } from '../services/api';

interface UseAddonsReturn {
  addons: Addon[];
  userAddons: Addon[];
  isLoading: boolean;
  error: string | null;
  refreshAddons: () => Promise<void>;
  purchaseAddon: (addonId: number, paymentMethod: string) => Promise<void>;
  canAccessAddon: (addon: Addon) => boolean;
  getFilteredAddons: () => Addon[];
}

export const useAddons = (user: User | null): UseAddonsReturn => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [userAddons, setUserAddons] = useState<Addon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user can access an addon based on their tier
  const canAccessAddon = useCallback((addon: Addon): boolean => {
    if (!user) return false;
    
    const tierHierarchy = { free: 0, pro: 1, advanced: 2 };
    const userTierLevel = tierHierarchy[user.tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[addon.required_tier as keyof typeof tierHierarchy] || 0;
    
    return userTierLevel >= requiredTierLevel;
  }, [user]);

  // Get addons filtered by user's tier
  const getFilteredAddons = useCallback((): Addon[] => {
    return addons.filter(addon => {
      // Show all addons, but mark inaccessible ones
      return true;
    });
  }, [addons]);

  // Refresh addons from API
  const refreshAddons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [allAddons, purchasedAddons] = await Promise.all([
        addonAPI.getAddons(),
        user ? addonAPI.getUserAddons() : Promise.resolve([])
      ]);
      
      setAddons(allAddons);
      setUserAddons(purchasedAddons);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load addons';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Purchase addon
  const purchaseAddon = useCallback(async (addonId: number, paymentMethod: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await addonAPI.purchaseAddon(addonId, paymentMethod);
      
      // Refresh addons to update purchased status
      await refreshAddons();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase addon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAddons]);

  // Load addons on mount
  useEffect(() => {
    refreshAddons();
  }, [refreshAddons]);

  return {
    addons,
    userAddons,
    isLoading,
    error,
    refreshAddons,
    purchaseAddon,
    canAccessAddon,
    getFilteredAddons,
  };
}; 