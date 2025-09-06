import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: string;
}

const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedTier 
}) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    isLoading, 
    error 
  } = useFirebaseAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  console.log('FirebaseAuthModal render - isOpen:', isOpen, 'selectedTier:', selectedTier);

  if (!isOpen) {
    console.log('FirebaseAuthModal: Not rendering because isOpen is false');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage('');
  };

  const handleGoogleSignIn = async () => {
    try {
      setMessage('');
      await signInWithGoogle();
      setMessage('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage(`Google sign in failed: ${error.message}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isSignUp) {
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
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.name);
        setMessage('Account created successfully! You are now signed in.');
      } else {
        await signInWithEmail(formData.email, formData.password);
        setMessage('Successfully signed in!');
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage(`Authentication failed: ${error.message}`);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-crys-graphite rounded-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-crys-light-grey hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-crys-light-grey">
                {selectedTier && `Access ${selectedTier} tier features`}
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-crys-graphite py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-crys-light-grey"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-crys-graphite text-crys-light-grey">Or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey" size={20} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={isSignUp}
                    className="w-full bg-crys-dark-grey text-white pl-10 pr-4 py-3 rounded-lg border border-crys-light-grey focus:border-crys-accent focus:outline-none"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-crys-dark-grey text-white pl-10 pr-4 py-3 rounded-lg border border-crys-light-grey focus:border-crys-accent focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-crys-dark-grey text-white pl-10 pr-12 py-3 rounded-lg border border-crys-light-grey focus:border-crys-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-crys-light-grey" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={isSignUp}
                    className="w-full bg-crys-dark-grey text-white pl-10 pr-4 py-3 rounded-lg border border-crys-light-grey focus:border-crys-accent focus:outline-none"
                  />
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('failed') || message.includes('Error') 
                    ? 'bg-red-900 text-red-200' 
                    : 'bg-green-900 text-green-200'
                }`}>
                  {message}
                </div>
              )}

              {/* Error from context */}
              {error && (
                <div className="p-3 rounded-lg text-sm bg-red-900 text-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-crys-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-crys-accent-hover transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center mt-4">
              <button
                onClick={toggleSignUp}
                className="text-crys-accent hover:text-crys-accent-hover transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirebaseAuthModal;