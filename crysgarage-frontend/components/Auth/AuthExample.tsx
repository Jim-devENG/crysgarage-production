import React, { useState } from 'react';
import { Button } from "../ui/button";
import { AuthModal } from './AuthModal';
import { useAuth } from '../../contexts/AuthContext';

export function AuthExample() {
  const { user, isAuthenticated, logout, isLoading, error } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogin = async (email: string, password: string) => {
    try {
      await useAuth().login({ email, password });
      setShowAuthModal(false);
      // Redirect or show success message
    } catch (error) {
      // Error is handled by the context
      console.error('Login failed:', error);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await useAuth().signup({ name, email, password });
      setShowAuthModal(false);
      // Redirect or show success message
    } catch (error) {
      // Error is handled by the context
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home or show logout message
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-crys-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="p-6 bg-crys-graphite/50 rounded-lg">
        <h2 className="text-xl font-bold text-crys-white mb-4">
          Welcome, {user.name}!
        </h2>
        <div className="space-y-2 text-crys-light-grey">
          <p>Email: {user.email}</p>
          <p>Tier: {user.tier}</p>
          <p>Credits: {user.credits}</p>
          <p>Total Tracks: {user.total_tracks}</p>
        </div>
        <Button 
          onClick={handleLogout}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-crys-graphite/50 rounded-lg">
      <h2 className="text-xl font-bold text-crys-white mb-4">
        Welcome to Crys Garage Studio
      </h2>
      <p className="text-crys-light-grey mb-4">
        Sign in to start mastering your music or create a new account.
      </p>
      
      <div className="space-x-4">
        <Button 
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
          className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
        >
          Sign In
        </Button>
        <Button 
          onClick={() => {
            setAuthMode('signup');
            setShowAuthModal(true);
          }}
          variant="outline"
          className="border-crys-gold text-crys-gold hover:bg-crys-gold hover:text-crys-black"
        >
          Sign Up
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        initialMode={authMode}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
