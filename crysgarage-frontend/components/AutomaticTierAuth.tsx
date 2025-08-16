import { useState } from 'react';
import { AuthModal } from './AuthPages';
import { AutomaticTierDashboard } from './AutomaticTierDashboard';

interface AutomaticTierAuthProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function AutomaticTierAuth({ onClose, onUpgrade }: AutomaticTierAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleSignIn = async (email: string, password: string) => {
    try {
      // Mock authentication for now - in real app, this would call your auth API
      const mockUser = {
        id: Date.now(),
        name: email.split('@')[0],
        email: email,
        tier: 'free',
        credits: 5, // 5 free credits for automatic tier
        join_date: new Date().toISOString().split('T')[0],
        total_tracks: 0,
        total_spent: 0
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('crysgarage_user', JSON.stringify(mockUser));
      localStorage.setItem('crysgarage_token', btoa(JSON.stringify({ user_id: mockUser.id, email })));
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      // Mock authentication for now - in real app, this would call your auth API
      const mockUser = {
        id: Date.now(),
        name: name,
        email: email,
        tier: 'free',
        credits: 5, // 5 free credits for automatic tier
        join_date: new Date().toISOString().split('T')[0],
        total_tracks: 0,
        total_spent: 0
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('crysgarage_user', JSON.stringify(mockUser));
      localStorage.setItem('crysgarage_token', btoa(JSON.stringify({ user_id: mockUser.id, email })));
      
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  if (isAuthenticated && user) {
    return (
      <AutomaticTierDashboard 
        user={user}
        onUpgrade={onUpgrade}
        onSignOut={() => {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('crysgarage_user');
          localStorage.removeItem('crysgarage_token');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthModal
          initialMode="signin"
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
