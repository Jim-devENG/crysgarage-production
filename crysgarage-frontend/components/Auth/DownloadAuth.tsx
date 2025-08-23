import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Mail, 
  Facebook, 
  Lock, 
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

interface DownloadAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function DownloadAuth({ isOpen, onClose, onAuthSuccess }: DownloadAuthProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'facebook'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);

  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: false
  });

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`${isSignup ? 'Creating account' : 'Logging in'}:`, userData);
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate Facebook auth
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Facebook authentication');
      onAuthSuccess();
      onClose();
    } catch (err) {
      setError('Facebook authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Download Required</h1>
              <p className="text-sm text-gray-400">Sign in to download your mastered audio</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-crys-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400">
                {isSignup 
                  ? 'Create an account to download your mastered audio' 
                  : 'Sign in to download your mastered audio'
                }
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleFacebookAuth}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Continue with Facebook
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {isSignup && (
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                )}
                
                <Input
                  type="email"
                  placeholder="Email address"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={userData.rememberMe}
                      onChange={(e) => setUserData({ ...userData, rememberMe: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-800 text-crys-gold focus:ring-crys-gold"
                    />
                    <span className="text-sm text-gray-400">Remember me</span>
                  </label>
                  {!isSignup && (
                    <button className="text-sm text-crys-gold hover:text-crys-gold/80">
                      Forgot password?
                    </button>
                  )}
                </div>
              </div>

              <Button
                onClick={handleEmailAuth}
                disabled={isLoading || !userData.email || !userData.password || (isSignup && !userData.name)}
                className="w-full bg-crys-gold hover:bg-crys-gold/90 text-black py-3"
              >
                {isLoading 
                  ? (isSignup ? 'Creating account...' : 'Signing in...') 
                  : (isSignup ? 'Create Account' : 'Sign In')
                }
              </Button>

              <div className="text-center">
                <span className="text-gray-400">
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                </span>
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-crys-gold hover:text-crys-gold/80 font-medium"
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
