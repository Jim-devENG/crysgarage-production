import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Settings, 
  User, 
  CreditCard, 
  Download, 
  Zap, 
  Shield,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

interface DevTestingPanelProps {
  onDevLogin: (userData: any) => void;
  onDevLogout: () => void;
  onNavigate: (page: string) => void;
  currentUser?: any;
  isDevMode: boolean;
}

export function DevTestingPanel({ 
  onDevLogin, 
  onDevLogout, 
  onNavigate, 
  currentUser,
  isDevMode 
}: DevTestingPanelProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Dev test accounts
  const devAccounts = [
    {
      id: 'dev-free',
      name: 'Dev Free User',
      email: 'dev-free@crysgarage.studio',
      tier: 'free',
      credits: 5,
      description: 'Test free tier functionality'
    },
    {
      id: 'dev-pro',
      name: 'Dev Pro User',
      email: 'dev-pro@crysgarage.studio',
      tier: 'professional',
      credits: 15,
      description: 'Test professional tier functionality'
    },
    {
      id: 'dev-advanced',
      name: 'Dev Advanced User',
      email: 'dev-advanced@crysgarage.studio',
      tier: 'advanced',
      credits: 30,
      description: 'Test advanced tier functionality'
    },
    {
      id: 'dev-admin',
      name: 'Dev Admin',
      email: 'dev-admin@crysgarage.studio',
      tier: 'advanced',
      credits: 9999,
      description: 'Full access for testing all features'
    }
  ];

  const handleDevLogin = (account: any) => {
    const userData = {
      id: account.id,
      name: account.name,
      email: account.email,
      tier: account.tier,
      credits: account.credits,
      join_date: new Date().toISOString(),
      total_tracks: 0,
      total_spent: 0,
      isDevAccount: true
    };
    
    onDevLogin(userData);
  };

  const handleQuickTest = (tier: string) => {
    const account = devAccounts.find(acc => acc.tier === tier);
    if (account) {
      handleDevLogin(account);
      // Navigate to appropriate dashboard
      if (tier === 'free') {
        onNavigate('dashboard');
      } else if (tier === 'professional') {
        onNavigate('professional');
      } else if (tier === 'advanced') {
        onNavigate('advanced');
      }
    }
  };

  // Only show in development mode
  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 shadow-lg"
        title="Dev Testing Panel"
      >
        {isVisible ? <EyeOff className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </Button>

      {/* Dev Panel */}
      {isVisible && (
        <Card className="absolute bottom-16 right-0 w-80 bg-gray-900 border-purple-500 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Shield className="w-5 h-5" />
              Dev Testing Panel
              <Badge variant="secondary" className="bg-purple-600 text-white">
                DEV
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Current Dev User */}
            {currentUser?.isDevAccount && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">
                    {currentUser.name}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Email: {currentUser.email}</div>
                  <div>Tier: {currentUser.tier}</div>
                  <div>Credits: {currentUser.credits}</div>
                </div>
                <Button
                  onClick={onDevLogout}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Dev Logout
                </Button>
              </div>
            )}

            {/* Quick Test Buttons */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Quick Test Access:</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={() => handleQuickTest('free')}
                  variant="outline"
                  size="sm"
                  className="justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Test Free Tier
                </Button>
                <Button
                  onClick={() => handleQuickTest('professional')}
                  variant="outline"
                  size="sm"
                  className="justify-start border-blue-600 text-blue-300 hover:bg-blue-700/20"
                >
                  <Zap className="w-3 h-3 mr-2" />
                  Test Pro Tier
                </Button>
                <Button
                  onClick={() => handleQuickTest('advanced')}
                  variant="outline"
                  size="sm"
                  className="justify-start border-gold-600 text-gold-300 hover:bg-gold-700/20"
                >
                  <Shield className="w-3 h-3 mr-2" />
                  Test Advanced Tier
                </Button>
              </div>
            </div>

            {/* Dev Accounts */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Dev Accounts:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {devAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-2 bg-gray-800 rounded border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-200">
                          {account.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {account.tier} • {account.credits} credits
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDevLogin(account)}
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 py-1 h-auto text-purple-400 hover:bg-purple-500/10"
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev Actions */}
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-500 text-center">
                Development Testing Only
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
