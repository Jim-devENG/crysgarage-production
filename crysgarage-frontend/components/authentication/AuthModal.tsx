import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedTier?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, selectedTier }: AuthModalProps) {
  console.log('AuthModal render - isOpen:', isOpen, 'selectedTier:', selectedTier);
  const { signup, login, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) clearError();
    if (message) setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage('');

    // Validation
    if (!formData.email || !formData.password) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (isSignup) {
      if (!formData.name) {
        setMessage('Please enter your name');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters');
        return;
      }
    }

    try {
      if (isSignup) {
        await signup(formData.name, formData.email, formData.password);
        setMessage('Account created successfully! You are now signed in.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        await login(formData.email, formData.password);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      // Error is handled by the context
      console.error('Authentication error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      setMessage('');
      await signInWithGoogle();
      setMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setMessage(`Google sign in failed: ${error.message}`);
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    clearError();
    setMessage('');
  };

  if (!isOpen) {
    console.log('AuthModal: Not rendering because isOpen is false');
    return null;
  }
  
  console.log('AuthModal: Rendering modal');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-crys-black border border-crys-graphite">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-crys-white">
            {isSignup ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-crys-light-grey hover:text-crys-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-crys-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-crys-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-crys-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 text-crys-light-grey hover:text-crys-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-crys-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 bg-crys-graphite border-crys-graphite text-crys-white placeholder-crys-light-grey"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-medium"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2" />
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-crys-graphite"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-crys-black text-crys-light-grey">Or</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-crys-black hover:bg-gray-100 font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-crys-gold hover:text-crys-gold/80 text-sm"
              >
                {isSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
