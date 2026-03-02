import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';
import { initializeDirectPaystackInline } from '../Payments/PaystackDirect';
import { convertUSDToNGN, formatNGN } from '../../utils/currencyConverter';
import { CryptoPaymentModal } from '../Payment/CryptoPaymentModal';

interface DownloadPaymentModalProps {
  isOpen: boolean;
  onPaymentSuccess: () => void;
  onClose: () => void;
  downloadFormat: string;
  sampleRate: string;
  processedAudioUrl?: string | null;
  originalFile?: File | null;
  genre?: string;
}

export function DownloadPaymentModal({
  isOpen,
  onPaymentSuccess,
  onClose,
  downloadFormat,
  sampleRate,
  processedAudioUrl,
  originalFile,
  genre
}: DownloadPaymentModalProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  // Reset processing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setShowCryptoModal(false);
    }
  }, [isOpen]);

  // Handle crypto payment success
  const handleCryptoPaymentSuccess = (credits: number) => {
    console.log('✅ Crypto payment successful, calling onPaymentSuccess');
    setShowCryptoModal(false);
    setIsProcessing(false);
    onPaymentSuccess();
  };

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onClose]);

  const handlePayment = async () => {
    if (!user?.email) {
      alert('Please sign in to make a payment');
      return;
    }

    setIsProcessing(true);

    try {
      // $4 per download
      const price = 4.00;
      const currencyConversion = convertUSDToNGN(price);
      const reference = `CRYS_PRO_DL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Starting download payment:', {
        price,
        ngnAmount: currencyConversion.ngn,
        ngnCents: currencyConversion.ngnCents,
        format: downloadFormat,
        sampleRate,
        hasProcessedUrl: !!processedAudioUrl,
        hasOriginalFile: !!originalFile
      });

      // CRITICAL: Use inline Paystack payment (no redirect)
      // Call onPaymentSuccess directly when payment succeeds
      await initializeDirectPaystackInline({
        amountCents: currencyConversion.ngnCents,
        email: user.email,
        reference,
        onSuccess: () => {
          console.log('✅ Payment successful, calling onPaymentSuccess');
          setIsProcessing(false);
          onPaymentSuccess();
        },
        onClose: () => {
          console.log('Payment cancelled');
          setIsProcessing(false);
        },
        metadata: {
          tier: 'professional',
          item: 'single_download',
          usd: price,
          format: downloadFormat,
          sampleRate
        }
      });
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      alert('Payment failed to start. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const price = 4.00;
  const currencyConversion = convertUSDToNGN(price);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Allow closing by clicking outside (but not while processing)
        if (!isProcessing && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-crys-graphite border border-crys-gold/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-crys-gold/20 rounded-lg">
              <Lock className="w-6 h-6 text-crys-gold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-crys-white">Payment Required</h2>
              <p className="text-sm text-crys-light-grey">Download requires payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-crys-light-grey hover:text-crys-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-crys-black/50 rounded-lg p-4 border border-crys-graphite">
            <div className="flex justify-between items-center mb-2">
              <span className="text-crys-light-grey">Download Format:</span>
              <span className="text-crys-white font-medium">{downloadFormat}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-crys-light-grey">Sample Rate:</span>
              <span className="text-crys-white font-medium">{sampleRate}</span>
            </div>
            <div className="border-t border-crys-graphite mt-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-crys-light-grey">Price:</span>
                <span className="text-crys-gold text-xl font-bold">${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-crys-light-grey text-xs">NGN:</span>
                <span className="text-crys-white text-sm">{formatNGN(currencyConversion.ngn)}</span>
              </div>
            </div>
          </div>

          <div className="bg-crys-gold/10 border border-crys-gold/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-crys-gold mt-0.5 flex-shrink-0" />
              <p className="text-xs text-crys-light-grey">
                Payment is required to download. Once payment is completed, your download will begin automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing || showCryptoModal}
            className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-crys-black border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {formatNGN(currencyConversion.ngn)} NGN
              </>
            )}
          </button>

          <button
            onClick={() => setShowCryptoModal(true)}
            disabled={isProcessing || showCryptoModal}
            className="w-full bg-transparent border border-crys-gold text-crys-gold hover:bg-crys-gold/10 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pay with Crypto
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing || showCryptoModal}
            className="w-full bg-transparent border border-crys-graphite hover:border-crys-light-grey text-crys-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-center text-crys-light-grey mt-4">
          Secure payment via Paystack or Crypto. Your download will start after successful payment.
        </p>
      </div>

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        selectedTier="professional"
        onPaymentSuccess={handleCryptoPaymentSuccess}
      />
    </div>
  );
}

