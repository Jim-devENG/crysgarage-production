import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  User, 
  ChevronDown, 
  CreditCard, 
  Settings, 
  LogOut,
  Download,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';

interface UserDropdownProps {
  onNavigate: (page: string) => void;
}

export function UserDropdown({ onNavigate }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const getTierIcon = () => {
    switch (user.tier) {
      case 'pro':
        return <Crown className="w-4 h-4 text-crys-gold" />;
      case 'advanced':
        return <Crown className="w-4 h-4 text-purple-400" />;
      default:
        return <User className="w-4 h-4 text-crys-gold" />;
    }
  };

  const getTierColor = () => {
    switch (user.tier) {
      case 'pro':
        return 'text-crys-gold';
      case 'advanced':
        return 'text-purple-400';
      default:
        return 'text-crys-gold';
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crys-gold/10 hover:bg-crys-gold/20 transition-colors"
      >
        <div className="w-8 h-8 bg-crys-gold/20 rounded-full flex items-center justify-center">
          {getTierIcon()}
        </div>
        <span className="text-crys-white text-sm hidden lg:block">
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className="w-4 h-4 text-crys-gold" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-audio-panel-bg border border-crys-graphite rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-crys-graphite">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center">
                {getTierIcon()}
              </div>
              <div>
                <div className="text-crys-white font-medium">{user.name}</div>
                <div className="text-crys-light-grey text-sm">{user.email}</div>
                <div className={`text-xs font-medium ${getTierColor()}`}>
                  {user.tier === 'pro' ? 'Professional' : user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Tier
                </div>
              </div>
            </div>
          </div>

          {/* Credits Balance */}
          <div className="p-3 border-b border-crys-graphite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-crys-gold" />
                <span className="text-crys-white text-sm">Credits</span>
              </div>
              <span className="text-crys-gold font-semibold">{user.credits}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button 
              onClick={() => handleNavigation('profile')}
              className="w-full flex items-center gap-3 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
            >
              <User className="w-4 h-4" />
              <span>Profile & KYC</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('billing')}
              className="w-full flex items-center gap-3 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
            >
              <CreditCard className="w-4 h-4" />
              <span>Billing & Wallet</span>
            </button>
            
            <button 
              onClick={() => handleNavigation('settings')}
              className="w-full flex items-center gap-3 px-3 py-2 text-crys-white hover:bg-crys-gold/10 rounded-lg transition-colors text-left"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <div className="border-t border-crys-graphite my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
