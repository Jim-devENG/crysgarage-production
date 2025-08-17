import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  initialMode?: 'login' | 'signup';
  isLoading?: boolean;
  error?: string | null;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSignup, 
  initialMode = 'login',
  isLoading = false,
  error 
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-crys-light-grey hover:text-crys-white transition-colors z-10"
          disabled={isLoading}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Auth Forms */}
        <div className="relative">
          {mode === 'login' ? (
            <LoginForm
              onLogin={onLogin}
              onSwitchToSignup={() => setMode('signup')}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <SignupForm
              onSignup={onSignup}
              onSwitchToLogin={() => setMode('login')}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
