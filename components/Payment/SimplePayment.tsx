import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, CreditCard, CheckCircle, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthenticationContext";
import { convertUSDToNGN, formatNGN } from "../../utils/currencyConverter";

// Declare Paystack types
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        callback: (response: any) => void;
        onClose: () => void;
        metadata?: any;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface SimplePaymentProps {
  tier: 'free' | 'pro' | 'advanced';
  onSuccess: (credits: number) => void;
  onCancel: () => void;
}

export function SimplePayment({ tier, onSuccess, onCancel }: SimplePaymentProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const tierPricing = {
    free: { credits: 2, price: 4.99, name: 'Free Tier Credits' },
    pro: { credits: 12, price: 19.99, name: 'Professional Credits' },
    advanced: { credits: 25, price: 49.99, name: 'Advanced Credits' }
  };

  const selectedTier = tierPricing[tier];

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!user?.email) {
      setErrorMessage('Please sign in first');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(selectedTier.price);
      
      // Show Naira amount to user before payment
      const confirmPayment = window.confirm(
        `Confirm payment of ${formatNGN(currencyConversion.ngn)} (${selectedTier.price} USD) for ${selectedTier.credits} credits?`
      );
      
      if (!confirmPayment) {
        setIsLoading(false);
        return;
      }

      // First, try to get the public key from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://crysgarage.studio/api'}/test-paystack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: currencyConversion.ngnCents, // Use NGN cents for Paystack
          email: user.email,
          reference: `CRYS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          callback_url: `${window.location.origin}/billing?payment=success&tier=${tier}&credits=${selectedTier.credits}`,
          metadata: { 
            tier, 
            credits: selectedTier.credits, 
            user_id: user.id,
            original_usd: selectedTier.price,
            converted_ngn: currencyConversion.ngn
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.paystack_response && data.paystack_response.data && data.paystack_response.data.authorization_url) {
          // Redirect to Paystack directly
          window.location.href = data.paystack_response.data.authorization_url;
          return;
        }
      }

      // Fallback: Try direct Paystack integration if available
      if (window.PaystackPop) {
        const reference = `CRYS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('Starting direct Paystack payment:', {
          amount: selectedTier.price,
          email: user.email,
          reference,
          tier,
          ngnAmount: currencyConversion.ngn,
          ngnCents: currencyConversion.ngnCents
        });

        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_512f1f5c8b0b8b0b8b0b8b0b8b0b8b0b8b0b8b0b',
          email: user.email,
          amount: currencyConversion.ngnCents, // Use NGN cents for Paystack
          currency: 'NGN',
          ref: reference,
          metadata: {
            tier: tier,
            credits: selectedTier.credits,
            user_id: user.id,
            original_usd: selectedTier.price,
            converted_ngn: currencyConversion.ngn,
            custom_fields: [
              {
                display_name: "Package",
                variable_name: "package",
                value: selectedTier.name
              }
            ]
          },
          callback: (response: any) => {
            console.log('Payment successful:', response);
            setIsLoading(false);
            onSuccess(selectedTier.credits);
          },
          onClose: () => {
            console.log('Payment cancelled');
            setIsLoading(false);
            setErrorMessage('Payment was cancelled');
          }
        });

        handler.openIframe();
      } else {
        throw new Error('Paystack is not available');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error?.message || 'Payment initialization failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-audio-panel-bg border border-crys-graphite rounded-lg max-w-md w-full">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="absolute right-2 top-2 text-crys-light-grey hover:text-crys-white"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-crys-gold" />
            </div>
            <CardTitle className="text-crys-white text-xl mb-2">
              Purchase {selectedTier.name}
            </CardTitle>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-crys-gold">${selectedTier.price}</span>
            </div>
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
              {selectedTier.credits} Credits
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-crys-white font-medium">What you get:</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0" />
                <span className="text-crys-light-grey text-sm">{selectedTier.credits} download credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0" />
                <span className="text-crys-light-grey text-sm">High-quality audio mastering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0" />
                <span className="text-crys-light-grey text-sm">Multiple audio formats</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !user?.email}
            className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pay with Paystack
              </div>
            )}
          </Button>

          {/* User Info */}
          {user?.email && (
            <div className="text-center">
              <p className="text-crys-light-grey text-sm">
                Payment will be processed for: {user.email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
