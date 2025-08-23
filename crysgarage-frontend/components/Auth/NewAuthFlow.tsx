import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  Facebook, 
  CreditCard, 
  Lock, 
  User, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Phone,
  MapPin,
  Building
} from 'lucide-react';

interface NewAuthFlowProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  onAuthSuccess: (userData: any) => void;
  onPaymentSuccess: () => void;
}

interface UserData {
  email: string;
  password: string;
  name: string;
  rememberMe: boolean;
}

interface BillingData {
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

type AuthStep = 'login' | 'signup' | 'billing' | 'payment' | 'success';

export function NewAuthFlow({ 
  isOpen, 
  onClose, 
  selectedTier, 
  onAuthSuccess, 
  onPaymentSuccess 
}: NewAuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'facebook'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    name: '',
    rememberMe: false
  });

  const [billingData, setBillingData] = useState<BillingData>({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');

  const tierPricing = {
    professional: { price: 29, credits: 50, features: ['Advanced mastering', 'Genre presets', 'Priority processing'] },
    advanced: { price: 99, credits: 'Unlimited', features: ['All features', 'Custom presets', 'API access'] }
  };

  const currentTier = tierPricing[selectedTier as keyof typeof tierPricing];

  const handleEmailAuth = async (isSignup: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isSignup) {
        // Handle signup
        console.log('Creating account:', userData);
        setCurrentStep('billing');
      } else {
        // Handle login
        console.log('Logging in:', userData);
        setCurrentStep('billing');
      }
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
      setCurrentStep('billing');
    } catch (err) {
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
        onClose();
      }, 2000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to access {selectedTier} tier features</p>
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
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <div className="space-y-3">
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
            <button className="text-sm text-crys-gold hover:text-crys-gold/80">
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          onClick={() => handleEmailAuth(false)}
          disabled={isLoading || !userData.email || !userData.password}
          className="w-full bg-crys-gold hover:bg-crys-gold/90 text-black py-3"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <button
            onClick={() => setCurrentStep('signup')}
            className="text-crys-gold hover:text-crys-gold/80 font-medium"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400">Sign up to access {selectedTier} tier features</p>
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
            <span className="px-2 bg-gray-900 text-gray-400">Or sign up with email</span>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Full name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
          
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={userData.rememberMe}
              onChange={(e) => setUserData({ ...userData, rememberMe: e.target.checked })}
              className="rounded border-gray-600 bg-gray-800 text-crys-gold focus:ring-crys-gold"
            />
            <span className="text-sm text-gray-400">Remember me</span>
          </div>
        </div>

        <Button
          onClick={() => handleEmailAuth(true)}
          disabled={isLoading || !userData.name || !userData.email || !userData.password}
          className="w-full bg-crys-gold hover:bg-crys-gold/90 text-black py-3"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <span className="text-gray-400">Already have an account? </span>
          <button
            onClick={() => setCurrentStep('login')}
            className="text-crys-gold hover:text-crys-gold/80 font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );

  const renderBillingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Billing Information</h2>
        <p className="text-gray-400">Enter your billing details to continue</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="First name"
            value={billingData.firstName}
            onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            type="text"
            placeholder="Last name"
            value={billingData.lastName}
            onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <Input
          type="text"
          placeholder="Company (optional)"
          value={billingData.company}
          onChange={(e) => setBillingData({ ...billingData, company: e.target.value })}
          className="bg-gray-800 border-gray-700 text-white"
        />

        <Input
          type="text"
          placeholder="Address"
          value={billingData.address}
          onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
          className="bg-gray-800 border-gray-700 text-white"
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            type="text"
            placeholder="City"
            value={billingData.city}
            onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            type="text"
            placeholder="State"
            value={billingData.state}
            onChange={(e) => setBillingData({ ...billingData, state: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            type="text"
            placeholder="ZIP Code"
            value={billingData.zipCode}
            onChange={(e) => setBillingData({ ...billingData, zipCode: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Country"
            value={billingData.country}
            onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <Input
            type="tel"
            placeholder="Phone"
            value={billingData.phone}
            onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => setCurrentStep('login')}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleBillingSubmit}
            disabled={isLoading}
            className="flex-1 bg-crys-gold hover:bg-crys-gold/90 text-black"
          >
            {isLoading ? 'Processing...' : 'Continue to Payment'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Payment</h2>
        <p className="text-gray-400">Complete your {selectedTier} tier subscription</p>
      </div>

      {/* Order Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{selectedTier} Tier</span>
            <Badge variant="secondary" className="bg-crys-gold/10 text-crys-gold">
              ${currentTier?.price}/month
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Credits</span>
            <span className="text-white">{currentTier?.credits}</span>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between items-center font-semibold">
              <span className="text-white">Total</span>
              <span className="text-crys-gold">${currentTier?.price}/month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold">Payment Method</h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="text-crys-gold focus:ring-crys-gold"
            />
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span className="text-white">Credit/Debit Card</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="text-crys-gold focus:ring-crys-gold"
            />
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-white">PayPal</span>
          </label>

          <label className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800">
            <input
              type="radio"
              name="paymentMethod"
              value="crypto"
              checked={paymentMethod === 'crypto'}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="text-crys-gold focus:ring-crys-gold"
            />
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="text-white">Cryptocurrency</span>
          </label>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => setCurrentStep('billing')}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            disabled={isLoading}
            className="flex-1 bg-crys-gold hover:bg-crys-gold/90 text-black"
          >
            {isLoading ? 'Processing Payment...' : `Pay $${currentTier?.price}`}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-400">Welcome to {selectedTier} tier. You can now access all features.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Account created successfully</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Payment processed</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Subscription activated</span>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Crys Garage</h1>
              <p className="text-sm text-gray-400">Audio Mastering Studio</p>
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

          {/* Step Content */}
          {currentStep === 'login' && renderLoginStep()}
          {currentStep === 'signup' && renderSignupStep()}
          {currentStep === 'billing' && renderBillingStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}
