import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
  X,
  AlertCircle
} from "lucide-react";
import { authAPI } from '../services/api';

interface AuthPagesProps {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, name: string) => void;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignInPage({ onSignIn, onClose, onSwitchToSignUp }: { 
  onSignIn: (email: string, password: string) => void; 
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add ESC key support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Close modal immediately
    onClose();
    
    try {
      await onSignIn(email, password);
    } catch (err: any) {
      // If authentication fails, we can't show error in modal since it's closed
      // The error will be handled by the AppContext and shown in the main app
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-crys-light-grey hover:text-crys-white hover:bg-crys-graphite/50 rounded-lg transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-crys-gold" />
          </div>
          <CardTitle className="text-xl text-crys-white">Welcome Back</CardTitle>
          <p className="text-crys-light-grey text-sm">Sign in to your Crysgarage Studio account</p>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}





          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-crys-white text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-crys-graphite/30 border-crys-graphite text-crys-white h-9"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-crys-white text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 bg-crys-graphite/30 border-crys-graphite text-crys-white h-9"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-crys-white"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black h-9"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3 h-3 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Sign Up */}
          {onSwitchToSignUp && (
            <div className="text-center">
              <p className="text-crys-light-grey text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-crys-gold hover:text-crys-gold-muted font-medium"
                  disabled={isLoading}
                >
                  Sign up
                </button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SignUpPage({ onSignUp, onClose, onSwitchToSignIn }: { 
  onSignUp: (email: string, password: string, name: string) => void; 
  onClose: () => void;
  onSwitchToSignIn?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Add ESC key support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Close modal immediately
    onClose();
    
    try {
      await onSignUp(formData.email, formData.password, formData.name);
    } catch (err: any) {
      // If authentication fails, we can't show error in modal since it's closed
      // The error will be handled by the AppContext and shown in the main app
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full max-h-[75vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-crys-light-grey hover:text-crys-white hover:bg-crys-graphite/50 rounded-lg transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        <CardHeader className="text-center pb-3">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-crys-gold" />
          </div>
          <CardTitle className="text-xl text-crys-white">Create Account</CardTitle>
          <p className="text-crys-light-grey text-sm">Join Crysgarage Studio and start mastering</p>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}



          {/* Benefits - Compact */}
          <div className="bg-crys-gold/5 border border-crys-gold/20 rounded-lg p-3">
            <h4 className="text-crys-white text-sm font-medium mb-2">What you get:</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-crys-light-grey">
              <div className="flex items-center gap-1">
                <Check className="w-2 h-2 text-green-400 flex-shrink-0" />
                <span>5 free credits</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-2 h-2 text-green-400 flex-shrink-0" />
                <span>Basic genres</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-2 h-2 text-green-400 flex-shrink-0" />
                <span>AI mastering</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-2 h-2 text-green-400 flex-shrink-0" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>



          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-crys-white text-xs">Name</Label>
                <div className="relative">
                  <User className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-7 bg-crys-graphite/30 border-crys-graphite text-crys-white h-8 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-crys-white text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-7 bg-crys-graphite/30 border-crys-graphite text-crys-white h-8 text-xs"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-crys-white text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-7 pr-8 bg-crys-graphite/30 border-crys-graphite text-crys-white h-8 text-xs"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-crys-white"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-crys-graphite rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-crys-light-grey min-w-12">{getPasswordStrengthText()}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-crys-white text-xs">Confirm</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-crys-light-grey" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-7 pr-8 bg-crys-graphite/30 border-crys-graphite text-crys-white h-8 text-xs"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-crys-white"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <label className="flex items-start space-x-2 text-xs cursor-pointer">
              <input
                id="terms"
                type="checkbox"
                className="rounded border-crys-graphite bg-crys-graphite/30 scale-75 mt-0.5 flex-shrink-0"
                required
                disabled={isLoading}
              />
              <span className="text-crys-light-grey leading-tight">
                I agree to the{' '}
                <Button variant="link" className="text-crys-gold hover:text-crys-gold-muted p-0 h-auto text-xs" disabled={isLoading}>
                  Terms
                </Button>
                {' '}and{' '}
                <Button variant="link" className="text-crys-gold hover:text-crys-gold-muted p-0 h-auto text-xs" disabled={isLoading}>
                  Privacy
                </Button>
              </span>
            </label>

            <Button 
              type="submit"
              size="sm"
              className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-3 h-3 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Sign In */}
          {onSwitchToSignIn && (
            <div className="text-center">
              <p className="text-crys-light-grey text-xs">
                Already have an account?{' '}
                <Button
                  variant="link"
                  size="sm"
                  className="text-crys-gold hover:text-crys-gold-muted p-0 h-auto"
                  onClick={onSwitchToSignIn}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Combined Auth Component for easier navigation
export function AuthModal({ 
  initialMode = 'signin',
  onSignIn, 
  onSignUp, 
  onClose 
}: {
  initialMode?: 'signin' | 'signup';
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, name: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  if (mode === 'signin') {
    return (
      <SignInPage 
        onSignIn={onSignIn}
        onClose={onClose}
        onSwitchToSignUp={() => setMode('signup')}
      />
    );
  }

  return (
    <SignUpPage 
      onSignUp={onSignUp}
      onClose={onClose}
      onSwitchToSignIn={() => setMode('signin')}
    />
  );
}