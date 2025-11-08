import React, { createContext, useContext, useState, useEffect } from 'react';

interface DevUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  credits: number;
  join_date: string;
  total_tracks: number;
  total_spent: number;
  isDevAccount: boolean;
}

interface DevContextType {
  devUser: DevUser | null;
  isDevMode: boolean;
  devLogin: (userData: DevUser) => void;
  devLogout: () => void;
  isDevAccount: (user: any) => boolean;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: React.ReactNode }) {
  const [devUser, setDevUser] = useState<DevUser | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development' || 
                  window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';
    setIsDevMode(isDev);
  }, []);

  // Load dev user from localStorage on mount
  useEffect(() => {
    if (isDevMode) {
      try {
        const stored = localStorage.getItem('crysgarage_dev_user');
        if (stored) {
          const userData = JSON.parse(stored);
          if (userData.isDevAccount) {
            setDevUser(userData);
          }
        }
      } catch (error) {
        console.warn('Failed to load dev user from localStorage:', error);
      }
    }
  }, [isDevMode]);

  const devLogin = (userData: DevUser) => {
    setDevUser(userData);
    localStorage.setItem('crysgarage_dev_user', JSON.stringify(userData));
    console.log('🔧 Dev account logged in:', userData.name);
  };

  const devLogout = () => {
    setDevUser(null);
    localStorage.removeItem('crysgarage_dev_user');
    console.log('🔧 Dev account logged out');
  };

  const isDevAccount = (user: any) => {
    return user?.isDevAccount === true;
  };

  return (
    <DevContext.Provider value={{
      devUser,
      isDevMode,
      devLogin,
      devLogout,
      isDevAccount
    }}>
      {children}
    </DevContext.Provider>
  );
}

export function useDev() {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDev must be used within a DevProvider');
  }
  return context;
}
