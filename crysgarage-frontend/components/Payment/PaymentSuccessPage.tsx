import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface PaymentSuccessPageProps {
  onNavigate: (page: string) => void;
}

export function PaymentSuccessPage({ onNavigate }: PaymentSuccessPageProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [credits, setCredits] = useState(0);
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const tier = urlParams.get('tier');
        const creditsParam = urlParams.get('credits');

        console.log('Payment success page loaded with params:', { reference, tier, creditsParam });

        if (!reference || !tier || !creditsParam) {
          setStatus('error');
          setMessage('Invalid payment parameters');
          return;
        }

        setCredits(parseInt(creditsParam));

        // Verify payment with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://crysgarage.studio/api'}/paystack/verify/${reference}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Payment verification response:', data);

          if (data.status && data.data && data.data.status === 'success') {
            // Payment verified successfully
            setStatus('success');
            setMessage(`Payment successful! ${creditsParam} credits have been added to your account.`);

            // Update user credits
            if (user) {
              const updatedUser = { ...user, credits: (user.credits || 0) + parseInt(creditsParam) };
              updateProfile(updatedUser);
              localStorage.setItem('crysgarage_user', JSON.stringify(updatedUser));
            }

            // Clean up URL
            window.history.replaceState({}, '', '/payment-success');
          } else {
            setStatus('error');
            setMessage('Payment verification failed. Please contact support.');
          }
        } else {
          setStatus('error');
          setMessage('Unable to verify payment. Please check your account balance.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [user, updateProfile]);

  const handleContinue = () => {
    onNavigate('billing');
  };

  const handleGoToDashboard = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full">
        <CardHeader className="text-center pb-4">
          {status === 'verifying' && (
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          )}
          
          <CardTitle className="text-xl text-crys-white">
            {status === 'verifying' && 'Verifying Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Error'}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {status === 'verifying' && (
            <div>
              <p className="text-crys-light-grey mb-4">
                Please wait while we verify your payment...
              </p>
              <div className="w-8 h-8 border-4 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">{message}</p>
              </div>
              
              <div className="p-4 bg-crys-graphite rounded-lg">
                <p className="text-crys-white font-semibold">Credits Added</p>
                <p className="text-2xl font-bold text-crys-gold">{credits}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Go to Billing
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoToDashboard}
                  className="w-full border-crys-graphite text-crys-light-grey hover:text-crys-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400">{message}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                >
                  Go to Billing
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoToDashboard}
                  className="w-full border-crys-graphite text-crys-light-grey hover:text-crys-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
