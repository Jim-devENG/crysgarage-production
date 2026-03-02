import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { creditService } from '../../services/creditService';
import { userService } from '../../services/userService';

interface PaymentSuccessPageProps {
  onNavigate: (page: string) => void;
}

export function PaymentSuccessPage({ onNavigate }: PaymentSuccessPageProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [credits, setCredits] = useState(0);
  const { user, updateProfile, refreshUser } = useAuth();
  
  // CRITICAL: One-time execution guard - prevents re-processing on re-render
  const hasProcessed = useRef(false);
  
  // CRITICAL: Extract params ONCE at mount, not on every render
  const paymentParams = useRef<{
    reference: string | null;
    tier: string | null;
    creditsParam: string | null;
    mode: string | null;
  } | null>(null);

  useEffect(() => {
    // Extract URL params ONCE at mount
    if (!paymentParams.current) {
      const urlParams = new URLSearchParams(window.location.search);
      paymentParams.current = {
        reference: urlParams.get('reference'),
        tier: urlParams.get('tier'),
        creditsParam: urlParams.get('credits'),
        mode: urlParams.get('mode')
      };
    }
    
    const { reference, tier, creditsParam, mode } = paymentParams.current;

    const verifyPayment = async () => {
      // CRITICAL: Validate params IMMEDIATELY - exit if invalid
      // NO credit logic should run after this check
        if (!reference || !tier || !creditsParam) {
        console.error('❌ Invalid payment parameters:', { reference, tier, creditsParam });
          setStatus('error');
          setMessage('Invalid payment parameters');
          return;
        }

      // CRITICAL: Prevent duplicate processing by reference
      // Check localStorage to see if this payment reference has already been processed
      const processedKey = `payment_processed_${reference}`;
      if (localStorage.getItem(processedKey)) {
        console.warn('⚠️ Payment reference already processed:', reference);
        setStatus('success');
        setMessage('Payment already processed. Credits have been added to your account.');
        // Still show credits from URL param for display
        setCredits(parseInt(creditsParam));
        return;
      }

      // CRITICAL: One-time execution guard - prevents re-processing on re-render/auth refresh
      if (hasProcessed.current) {
        console.log('⚠️ Payment processing already in progress or completed');
        return;
      }
      
      hasProcessed.current = true;

      console.log('Payment success page loaded with params:', { reference, tier, creditsParam, mode, userId: user?.id });

      setCredits(parseInt(creditsParam));

      // CRITICAL: Wait for user to be loaded AND backend user to exist
      // Backend user MUST exist before adding credits
      if (!user?.id) {
        console.log('⏳ Waiting for user to load...');
        setStatus('verifying');
        setMessage('Loading user profile...');
        // Reset guard so we can retry when user loads
        hasProcessed.current = false;
        return;
      }
      
      // CRITICAL: Verify backend user exists before proceeding with payment
      // If user was just created, backend user should exist from sync
      // But we verify here to be safe
      try {
        await userService.getUserProfile(user.id);
        console.log('✅ Backend user verified - proceeding with payment');
      } catch (backendError) {
        // Backend user doesn't exist - cannot proceed
        console.error('❌ Backend user does not exist - cannot process payment:', backendError);
        setStatus('error');
        setMessage('User account not fully set up. Please refresh the page and try again.');
        hasProcessed.current = false;
        return;
      }

      // CRITICAL: Test mode ONLY skips payment verification, NOT credit persistence
      // Credits MUST be stored in backend database - never bypassed
      // Test mode is for testing Paystack integration, not for bypassing credit system
      if (mode === 'test') {
        console.log('🔧 TEST MODE: Skipping payment verification, but crediting via backend.');
        
        try {
          // CRITICAL: Always use backend for credit addition - test mode does NOT bypass backend
          // Test mode only skips Paystack verification, not credit persistence
          console.log('🔧 TEST MODE: Adding credits via backend (test mode skips verification only):', {
            userId: user.id,
            amount: parseInt(creditsParam),
            tier: tier,
            transactionId: reference
          });
          
          const creditData = await creditService.addCredits(
            user.id,
            parseInt(creditsParam),
            tier,
            reference
          ) as any;
          
          console.log('✅ TEST MODE: Credits added via backend:', creditData);
          
          // CRITICAL: Check if this was a duplicate transaction
          if (creditData.duplicate === true) {
            console.warn('⚠️ TEST MODE: Duplicate transaction detected - credits were not added again');
            localStorage.setItem(processedKey, 'true');
            if (user) {
              try {
                await refreshUser();
                console.log('✅ TEST MODE: User refreshed from backend (duplicate transaction)');
              } catch (refreshError) {
                console.warn('Could not refresh user from backend:', refreshError);
              }
            }
            setStatus('success');
            setMessage(`Payment already processed. Current balance: ${creditData.new_balance || 0} credit(s).`);
            setCredits(creditData.new_balance || parseInt(creditsParam));
            return;
          }
          
          // CRITICAL: Mark payment as processed to prevent duplicate processing
          localStorage.setItem(processedKey, 'true');
          
          // Backend returns: { success, credits_added, new_balance, tier, transaction_id, message }
          const newBalance = creditData.new_balance || creditData.credits_added || parseInt(creditsParam);
          
          // Generate invoice for this transaction
          try {
            const baseUrl = window.location.hostname === 'localhost' 
              ? 'http://localhost:8002' 
              : 'https://crysgarage.studio';
            
            const invoiceResponse = await fetch(`${baseUrl}/invoices/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: user.id,
                amount: parseFloat(creditsParam) * (tier === 'free' ? 5.00 : tier === 'advanced' ? 25.00 / 6 : 0),
                tier: tier,
                credits: parseInt(creditsParam),
                payment_method: 'card',
                transaction_id: reference,
                invoice_data: {
                  description: `${tier} tier - ${creditsParam} credits`,
                  original_usd: tier === 'free' ? 5.00 : tier === 'advanced' ? 25.00 : 0
                }
              })
            });
            
            if (invoiceResponse.ok) {
              const invoiceData = await invoiceResponse.json();
              console.log('✅ Invoice generated:', invoiceData.invoice_number);
            }
          } catch (invoiceError) {
            console.warn('Could not generate invoice:', invoiceError);
            // Don't fail the payment if invoice generation fails
          }
          
          // CRITICAL: Refresh user from backend to get authoritative credit balance
          if (user) {
            try {
              await refreshUser();
              console.log('✅ TEST MODE: User refreshed from backend with credits:', newBalance);
            } catch (refreshError) {
              console.warn('Could not refresh user from backend:', refreshError);
            }
          }

          setStatus('success');
          setMessage(`Test payment successful! ${creditsParam} credits have been added to your account.`);

          // CRITICAL: Clean up URL and navigate away after successful processing
          window.history.replaceState({}, '', '/payment-success');
          
          // Auto-navigate to the correct tier dashboard based on purchased tier
          const targetPage = tier === 'advanced' ? 'advanced' : tier === 'professional' ? 'professional' : 'dashboard';
          setTimeout(() => {
            onNavigate(targetPage);
          }, 2000);
        } catch (creditError) {
          // Reset guard on error so user can retry
          hasProcessed.current = false;
          console.error('❌ TEST MODE: Exception adding credits via backend:', creditError);
          console.error('❌ TEST MODE: Error details:', {
            message: creditError instanceof Error ? creditError.message : String(creditError),
            stack: creditError instanceof Error ? creditError.stack : undefined,
            name: creditError instanceof Error ? creditError.name : undefined
          });
          setStatus('error');
          setMessage(`Error adding credits: ${creditError instanceof Error ? creditError.message : String(creditError)}`);
        }
        return;
      }

      // PRODUCTION: Verify payment with backend
      try {
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
            // Payment verified successfully - add credits to user account
            try {
              const addCreditsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://crysgarage.studio'}/credits/add`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  amount: parseInt(creditsParam),
                  tier: tier,
                  transaction_id: reference,
                  description: `Credits purchased for ${tier} tier`
                })
              });

              if (addCreditsResponse.ok) {
                const creditData = await addCreditsResponse.json();
                console.log('Credits added successfully:', creditData);
                
                // CRITICAL: Mark payment as processed to prevent duplicate processing
                localStorage.setItem(processedKey, 'true');
                
                // Generate invoice for this transaction
                try {
                  const baseUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:8002' 
                    : 'https://crysgarage.studio';
                  
                  const invoiceResponse = await fetch(`${baseUrl}/invoices/create`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      user_id: user.id,
                      amount: parseFloat(creditsParam) * (tier === 'free' ? 5.00 : tier === 'advanced' ? 25.00 / 6 : 0),
                      tier: tier,
                      credits: parseInt(creditsParam),
                      payment_method: 'card',
                      transaction_id: reference,
                      invoice_data: {
                        description: `${tier} tier - ${creditsParam} credits`,
                        original_usd: tier === 'free' ? 5.00 : tier === 'advanced' ? 25.00 : 0
                      }
                    })
                  });
                  
                  if (invoiceResponse.ok) {
                    const invoiceData = await invoiceResponse.json();
                    console.log('✅ Invoice generated:', invoiceData.invoice_number);
                  }
                } catch (invoiceError) {
                  console.warn('Could not generate invoice:', invoiceError);
                  // Don't fail the payment if invoice generation fails
                }
                
                // CRITICAL: Do NOT update credits via Firebase - credits come from backend only
                // Refresh user from backend to get authoritative credit balance
                if (user) {
                  try {
                    await refreshUser();
                    console.log('✅ PRODUCTION: User refreshed from backend with credits:', creditData.new_balance);
                  } catch (refreshError) {
                    console.warn('Could not refresh user from backend:', refreshError);
                }
            }

            setStatus('success');
            setMessage(`Payment successful! ${creditsParam} credits have been added to your account.`);

                // CRITICAL: Clean up URL and navigate away after successful processing
                window.history.replaceState({}, '', '/payment-success');
                
                // Auto-navigate to the correct tier dashboard based on purchased tier
                const targetPage = tier === 'advanced' ? 'advanced' : tier === 'professional' ? 'professional' : 'dashboard';
                setTimeout(() => {
                  onNavigate(targetPage);
                }, 2000);
              } else {
                // Reset guard on error so user can retry
                hasProcessed.current = false;
                const errorText = await addCreditsResponse.text();
                console.error('Failed to add credits:', errorText);
                setStatus('error');
                setMessage('Failed to add credits. Please contact support.');
              }
            } catch (creditError) {
              // Reset guard on error so user can retry
              hasProcessed.current = false;
              console.error('Error adding credits:', creditError);
              setStatus('error');
              setMessage('Error adding credits. Please contact support.');
            }
          } else {
            // Reset guard on verification failure
            hasProcessed.current = false;
            setStatus('error');
            setMessage('Payment verification failed. Please contact support.');
          }
        } else {
          // Reset guard on API error
          hasProcessed.current = false;
          setStatus('error');
          setMessage('Unable to verify payment. Please check your account balance.');
        }
      } catch (error) {
        // Reset guard on exception
        hasProcessed.current = false;
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
    // FIXED: Removed refreshUser and updateProfile from dependencies to prevent loops
    // These functions are stable (memoized) and don't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id - refreshUser is memoized and stable

  const handleContinue = () => {
    // Check redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    
    if (redirect === 'dashboard') {
      onNavigate('dashboard');
    } else if (redirect === 'advanced') {
      onNavigate('advanced');
    } else {
      onNavigate('billing');
    }
  };

  const handleGoToDashboard = () => {
    // Get tier from payment params to navigate to correct dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier');
    const redirect = urlParams.get('redirect');
    
    // If redirect is specified, use it; otherwise use tier to determine dashboard
    if (redirect === 'dashboard') {
      onNavigate('dashboard');
    } else if (redirect === 'advanced') {
      onNavigate('advanced');
    } else if (tier === 'advanced') {
      onNavigate('advanced');
    } else if (tier === 'professional') {
      onNavigate('professional');
    } else {
      onNavigate('dashboard'); // Default to free tier dashboard
    }
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
