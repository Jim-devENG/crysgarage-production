import React, { useState } from 'react';
import { Button } from './ui/button';
import { useApp } from '../contexts/AppContext';

interface AuthFixButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const AuthFixButton: React.FC<AuthFixButtonProps> = ({
  variant = 'default',
  size = 'default',
  children = 'Fix Authentication',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useApp();

  const handleFixAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting automatic authentication fix...');
      
      // Use AppContext signIn to properly update the state
      await signIn('demo.free@crysgarage.com', 'password');
      
      console.log('Authentication fixed successfully');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error during auth fix:', error);
      onError?.(error.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceReAuth = async () => {
    setIsLoading(true);
    
    try {
      console.log('Forcing re-authentication...');
      
      // Clear any existing tokens first
      localStorage.removeItem('crysgarage_token');
      
      // Use AppContext signIn to properly update the state
      await signIn('demo.free@crysgarage.com', 'password');
      
      console.log('Re-authentication successful');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error during re-auth:', error);
      onError?.(error.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleFixAuth}
        disabled={isLoading}
      >
        {isLoading ? 'Fixing...' : children}
      </Button>
      
      <Button
        variant="outline"
        size={size}
        onClick={handleForceReAuth}
        disabled={isLoading}
      >
        {isLoading ? 'Re-auth...' : 'Force Re-auth'}
      </Button>
    </div>
  );
}; 