import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Check,
  Users,
  Shield,
  Star,
  ArrowLeft,
  Download,
  CreditCard
} from "lucide-react";
import { authService } from '../../services/authService';
import googleAuthService from '../../services/googleAuth';
import facebookAuthService from '../../services/facebookAuth';

interface AuthPageProps {
  mode: 'login' | 'signup';
  selectedTier?: string;
  onAuthSuccess: (userData: any) => void;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export function AuthPage({ 
  mode, 
  selectedTier = 'free', 
  onAuthSuccess, 
  onPaymentSuccess,
  onBack 
}: AuthPageProps) {
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [currentStep, setCurrentStep] = useState<'auth' | 'billing' | 'payment' | 'success'>('auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  // Reset form when mode changes
  useEffect(() => {
    setIsSignup(mode === 'signup');
    setCurrentStep('auth');
    setError(null);
    setUserData({ name: '', email: '', password: '', confirmPassword: '' });
  }, [mode]);

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setError(null);

    // Validate form
    if (!userData.email || !userData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (isSignup) {
      if (!userData.name) {
        setError('Please enter your full name.');
        setIsLoading(false);
        return;
      }
      if (userData.password !== userData.confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isSignup) {
        // Handle signup using Laravel auth service
        const response = await authService.signup({
          name: userData.name,
          email: userData.email,
          password: userData.password
        });
        
        console.log('Account created successfully:', response.user);
        onAuthSuccess(response.user);
        
        // For paid tiers, proceed to billing
        if (selectedTier !== 'free') {
          setCurrentStep('billing');
        } else {
          // For free tier, complete immediately
          onPaymentSuccess();
        }
      } else {
        // Handle login using Laravel auth service
        const response = await authService.login({
          email: userData.email,
          password: userData.password
        });
        
        console.log('Login successful:', response.user);
        onAuthSuccess(response.user);
        
        // For paid tiers, proceed to billing
        if (selectedTier !== 'free') {
          setCurrentStep('billing');
        } else {
          // For free tier, complete immediately
          onPaymentSuccess();
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google OAuth is available
      if (!googleAuthService.isAvailable()) {
        setError('Google OAuth is not configured. Please use email/password login or contact support.');
        setIsLoading(false);
        return;
      }

      const response = await googleAuthService.signInWithGoogle();
      console.log('Google authentication successful:', response.user);
      onAuthSuccess(response.user);
      
      // For paid tiers, proceed to billing
      if (selectedTier !== 'free') {
        setCurrentStep('billing');
      } else {
        // For free tier, complete immediately
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Google authentication failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await facebookAuthService.signInWithFacebook();
      console.log('Facebook authentication successful:', response.user);
      
      // Convert Facebook user to our app's user format
      const appUser = {
        id: parseInt(response.user.id.replace('fb_', '')),
        name: response.user.name,
        email: response.user.email,
        tier: 'free',
        credits: 5,
        join_date: new Date().toISOString(),
        total_tracks: 0,
        total_spent: 0
      };
      
      onAuthSuccess(appUser);
      
      // For paid tiers, proceed to billing
      if (selectedTier !== 'free') {
        setCurrentStep('billing');
      } else {
        // For free tier, complete immediately
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Facebook authentication error:', err);
      setError('Facebook authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate billing data
      if (!billingData.firstName || !billingData.lastName || !billingData.address) {
        throw new Error('Please fill in all required billing fields.');
      }

      console.log('Billing data:', billingData);
      setCurrentStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Billing validation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Payment successful with method:', paymentMethod);
      setCurrentStep('success');
      
      // Call success callback after a delay
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      // Simple password strength calculation
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[a-z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2:
      case 3: return 'bg-yellow-500';
      case 4:
      case 5: return 'bg-green-500';
      default: return 'bg-crys-graphite';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2:
      case 3: return 'Medium';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  };

  const renderAuthStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            {isSignup ? <Users className="w-6 h-6 text-crys-gold" /> : <User className="w-6 h-6 text-crys-gold" />}
          </div>
          <CardTitle className="text-xl text-crys-white">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <p className="text-crys-light-grey text-sm">
            {isSignup 
              ? `Sign up to access ${selectedTier} tier features` 
              : `Sign in to access ${selectedTier} tier features`
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading || !googleAuthService.isAvailable()}
              className={`w-full font-semibold py-3 border ${
                googleAuthService.isAvailable() 
                  ? 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300' 
                  : 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
              }`}
              title={!googleAuthService.isAvailable() ? 'Google OAuth is not configured. Please use email/password login.' : ''}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing in...' : `Continue with Google`}
                {!googleAuthService.isAvailable() && <span className="ml-2 text-xs">(Not Available)</span>}
              </div>
            </Button>

            <Button
              onClick={handleFacebookAuth}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {isLoading ? 'Signing in...' : `Continue with Facebook`}
              </div>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-crys-graphite" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-audio-panel-bg text-crys-light-grey">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-crys-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-crys-graphite border-crys-charcoal text-crys-white"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-crys-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-crys-graphite border-crys-charcoal text-crys-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-crys-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={userData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-crys-graphite border-crys-charcoal text-crys-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-crys-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {isSignup && userData.password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-crys-light-grey">Password strength:</span>
                    <span className={`${getPasswordStrengthColor() === 'bg-green-500' ? 'text-green-400' : 
                                     getPasswordStrengthColor() === 'bg-yellow-500' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-crys-graphite rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-crys-white">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={userData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="bg-crys-graphite border-crys-charcoal text-crys-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-crys-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleEmailAuth}
            disabled={isLoading}
            className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold py-3"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2" />
                {isSignup ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              <div className="flex items-center">
                {isSignup ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-crys-gold hover:text-crys-gold-muted text-sm"
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-crys-light-grey hover:text-crys-white text-sm flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingStep = () => {
    // Get tier pricing and details
    const getTierDetails = () => {
      switch (selectedTier) {
        case 'professional':
          return {
            name: 'Professional Tier',
            price: 29.99,
            period: 'month',
            features: [
              'Advanced mastering tools',
              'Unlimited tracks',
              'Priority processing',
              'Professional presets',
              '24/7 support'
            ]
          };
        case 'advanced':
          return {
            name: 'Advanced Tier',
            price: 99.99,
            period: 'month',
            features: [
              'Studio-grade mastering',
              'Unlimited tracks',
              'Real-time processing',
              'Custom presets',
              'Dedicated support',
              'API access'
            ]
          };
        default:
          return {
            name: 'Free Tier',
            price: 0,
            period: 'month',
            features: ['Basic mastering', '5 tracks per month']
          };
      }
    };

    const tierDetails = getTierDetails();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shopping Cart / Order Summary */}
          <Card className="bg-audio-panel-bg border-audio-panel-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-crys-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-crys-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Shopping Cart
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Cart Item */}
              <div className="bg-crys-graphite rounded-lg p-4 border border-crys-charcoal">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-crys-white font-semibold">{tierDetails.name}</h3>
                    <div className="text-crys-light-grey text-sm mt-1">
                      {tierDetails.features.slice(0, 3).join(' • ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-crys-gold font-bold text-lg">
                      ${tierDetails.price}
                    </div>
                    <div className="text-crys-light-grey text-sm">
                      per {tierDetails.period}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="text-crys-white font-medium">What's included:</h4>
                <ul className="space-y-1">
                  {tierDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-crys-light-grey text-sm">
                      <svg className="w-4 h-4 mr-2 text-crys-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Total */}
              <div className="border-t border-crys-charcoal pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-crys-white font-medium">Total</span>
                  <div className="text-right">
                    <div className="text-crys-gold font-bold text-xl">
                      ${tierDetails.price}
                    </div>
                    <div className="text-crys-light-grey text-sm">
                      per {tierDetails.period}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information Form */}
          <Card className="bg-audio-panel-bg border-audio-panel-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-crys-white flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-crys-gold" />
                Billing Information
              </CardTitle>
              <p className="text-crys-light-grey text-sm">Complete your checkout</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-crys-white">First Name</Label>
                    <Input
                      value={billingData.firstName}
                      onChange={(e) => setBillingData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-crys-graphite border-crys-charcoal text-crys-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-crys-white">Last Name</Label>
                    <Input
                      value={billingData.lastName}
                      onChange={(e) => setBillingData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-crys-graphite border-crys-charcoal text-crys-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-crys-white">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="billing@example.com"
                    className="bg-crys-graphite border-crys-charcoal text-crys-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-crys-white">Address</Label>
                  <Input
                    value={billingData.address}
                    onChange={(e) => setBillingData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-crys-graphite border-crys-charcoal text-crys-white"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-crys-white">City</Label>
                    <Input
                      value={billingData.city}
                      onChange={(e) => setBillingData(prev => ({ ...prev, city: e.target.value }))}
                      className="bg-crys-graphite border-crys-charcoal text-crys-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-crys-white">State</Label>
                    <Input
                      value={billingData.state}
                      onChange={(e) => setBillingData(prev => ({ ...prev, state: e.target.value }))}
                      className="bg-crys-graphite border-crys-charcoal text-crys-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-crys-white">ZIP</Label>
                    <Input
                      value={billingData.zipCode}
                      onChange={(e) => setBillingData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="bg-crys-graphite border-crys-charcoal text-crys-white"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBillingSubmit}
                disabled={isLoading}
                className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold py-3"
              >
                {isLoading ? 'Processing...' : `Proceed to Payment - $${tierDetails.price}`}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('auth')}
                  className="text-crys-light-grey hover:text-crys-white text-sm"
                >
                  Back to Authentication
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    // Get tier pricing and details
    const getTierDetails = () => {
      switch (selectedTier) {
        case 'professional':
          return {
            name: 'Professional Tier',
            price: 29.99,
            period: 'month'
          };
        case 'advanced':
          return {
            name: 'Advanced Tier',
            price: 99.99,
            period: 'month'
          };
        default:
          return {
            name: 'Free Tier',
            price: 0,
            period: 'month'
          };
      }
    };

    const tierDetails = getTierDetails();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="bg-audio-panel-bg border-audio-panel-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-crys-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-crys-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Order Details */}
              <div className="bg-crys-graphite rounded-lg p-4 border border-crys-charcoal">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-crys-white font-semibold">{tierDetails.name}</h3>
                  <div className="text-crys-gold font-bold text-lg">
                    ${tierDetails.price}
                  </div>
                </div>
                <div className="text-crys-light-grey text-sm">
                  Billing cycle: {tierDetails.period}ly
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-2">
                <h4 className="text-crys-white font-medium">Billing Address</h4>
                <div className="bg-crys-graphite rounded-lg p-3 border border-crys-charcoal">
                  <div className="text-crys-light-grey text-sm">
                    {billingData.firstName} {billingData.lastName}<br />
                    {billingData.address}<br />
                    {billingData.city}, {billingData.state} {billingData.zipCode}
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-crys-charcoal pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-crys-white font-medium">Total</span>
                  <div className="text-right">
                    <div className="text-crys-gold font-bold text-xl">
                      ${tierDetails.price}
                    </div>
                    <div className="text-crys-light-grey text-sm">
                      per {tierDetails.period}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card className="bg-audio-panel-bg border-audio-panel-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-crys-white flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-crys-gold" />
                Payment Method
              </CardTitle>
              <p className="text-crys-light-grey text-sm">Choose how you'd like to pay</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-crys-white">Select Payment Method</Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        paymentMethod === 'card' 
                          ? 'border-crys-gold bg-crys-gold/10' 
                          : 'border-crys-charcoal bg-crys-graphite hover:border-crys-gold/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <CreditCard className="w-6 h-6 mr-3 text-crys-gold" />
                        <div>
                          <div className="text-crys-white font-medium">Credit/Debit Card</div>
                          <div className="text-crys-light-grey text-sm">Visa, Mastercard, American Express</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        paymentMethod === 'paypal' 
                          ? 'border-crys-gold bg-crys-gold/10' 
                          : 'border-crys-charcoal bg-crys-graphite hover:border-crys-gold/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-3 bg-blue-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <div>
                          <div className="text-crys-white font-medium">PayPal</div>
                          <div className="text-crys-light-grey text-sm">Pay with your PayPal account</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Form (simplified) */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-4 border-t border-crys-charcoal">
                    <div className="space-y-2">
                      <Label className="text-crys-white">Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        className="bg-crys-graphite border-crys-charcoal text-crys-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-crys-white">Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          className="bg-crys-graphite border-crys-charcoal text-crys-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-crys-white">CVV</Label>
                        <Input
                          placeholder="123"
                          className="bg-crys-graphite border-crys-charcoal text-crys-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handlePaymentSubmit}
                disabled={isLoading}
                className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold py-3"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2" />
                    Processing Payment...
                  </div>
                ) : (
                  `Complete Purchase - $${tierDetails.price}`
                )}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('billing')}
                  className="text-crys-light-grey hover:text-crys-white text-sm"
                >
                  Back to Billing
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle className="text-xl text-crys-white">Success!</CardTitle>
          <p className="text-crys-light-grey text-sm">Your account has been created successfully</p>
        </CardHeader>

        <CardContent className="text-center">
          <div className="w-16 h-16 border-4 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-crys-white">Redirecting to your dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );

  // Render based on current step
  switch (currentStep) {
    case 'auth':
      return renderAuthStep();
    case 'billing':
      return renderBillingStep();
    case 'payment':
      return renderPaymentStep();
    case 'success':
      return renderSuccessStep();
    default:
      return renderAuthStep();
  }
}
