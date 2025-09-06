import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, CreditCard, CheckCircle, X, ShoppingCart } from "lucide-react";
import { useAuth } from "../../contexts/AuthenticationContext";
import { convertUSDToNGN, formatNGN } from "../../utils/currencyConverter";

interface SimpleCheckoutProps {
  tier: 'free' | 'pro' | 'advanced';
  onSuccess: (credits: number) => void;
  onCancel: () => void;
}

export function SimpleCheckout({ tier, onSuccess, onCancel }: SimpleCheckoutProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const tierPricing = {
    free: { credits: 2, price: 4.99, name: 'Starter Credits' },
    pro: { credits: 12, price: 19.99, name: 'Professional Credits' },
    advanced: { credits: 25, price: 49.99, name: 'Advanced Credits' }
  };

  const selectedTier = tierPricing[tier];

  const handlePayment = async () => {
    if (!user?.email) {
      setErrorMessage('Please sign in first');
      return;
    }

    console.log('Payment initiated for tier:', tier);
    console.log('Selected tier pricing:', selectedTier);
    console.log('User:', user);

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

      // Call backend to get Paystack payment URL
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://crysgarage.studio/api'}/payments/initialize`, {
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
        console.log('Payment response:', data);
        console.log('Paystack response details:', data.paystack_response);
        
        if (data.paystack_response && data.paystack_response.data && data.paystack_response.data.authorization_url) {
          // Redirect to Paystack
          window.location.href = data.paystack_response.data.authorization_url;
          return;
        } else {
          console.error('Invalid response structure:', data);
          throw new Error('Invalid payment response structure');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment request failed:', response.status, errorData);
        throw new Error(`Payment request failed: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error?.message || 'Payment initialization failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Order Summary */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            
            {/* Item */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedTier.name}</p>
                  <p className="text-sm text-gray-500">{selectedTier.credits} download credits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${selectedTier.price}</p>
                <p className="text-sm text-gray-500">{formatNGN(convertUSDToNGN(selectedTier.price).ngn)}</p>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200 mt-4">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900">${selectedTier.price}</span>
                <p className="text-sm text-gray-500">{formatNGN(convertUSDToNGN(selectedTier.price).ngn)}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">What's included:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">{selectedTier.credits} download credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">High-quality audio mastering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Multiple audio formats (WAV, MP3, FLAC)</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !user?.email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pay {formatNGN(convertUSDToNGN(selectedTier.price).ngn)} with Paystack
              </div>
            )}
          </Button>

          {/* User Info */}
          {user?.email && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Payment will be processed for: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              🔒 Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
