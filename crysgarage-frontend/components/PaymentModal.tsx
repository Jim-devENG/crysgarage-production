import { useState } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CardContent, CardHeader } from "./ui/card";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  X,
  Zap,
  Crown,
  ExternalLink
} from "lucide-react";
import { convertUSDToNGN, formatNGN } from "../utils/currencyConverter";
import { initializeDirectPaystack } from "../components/Payments/PaystackDirect";
import { useAuth } from "../contexts/AuthenticationContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  onPaymentSuccess: (credits: number) => void;
}

interface TierInfo {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  selectedTier, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const tiers: Record<string, TierInfo> = {
    professional: {
      id: 'professional',
      name: 'Professional',
      price: 9,
      credits: 100,
      description: 'Perfect for active producers',
      features: [
        '100 mastering credits',
        'All audio formats',
        'Up to 192kHz sample rate',
        '24-bit/32-bit resolution',
        'Free: Pop, Rock, Reggae',
        'Premium genres ($1 each)',
        '+16 tuning correction',
        'Noise reduction',
        'Download in WAV/MP3/FLAC'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    pro: {
      id: 'pro',
      name: 'Professional',
      price: 9,
      credits: 100,
      description: 'Perfect for active producers',
      features: [
        '100 mastering credits',
        'All audio formats',
        'Up to 192kHz sample rate',
        '24-bit/32-bit resolution',
        'Free: Pop, Rock, Reggae',
        'Premium genres ($1 each)',
        '+16 tuning correction',
        'Noise reduction',
        'Download in WAV/MP3/FLAC'
      ],
      icon: <Zap className="w-6 h-6" />
    },
    advanced: {
      id: 'advanced',
      name: 'Advanced Manual',
      price: 20,
      credits: -1, // Unlimited
      description: 'Full control for professionals',
      features: [
        'Unlimited mastering',
        'Real-time manual controls',
        '8-band graphic EQ',
        'Advanced compression',
        'Stereo imaging controls',
        'Limiter settings',
        'A/B comparison',
        'All sample rates & formats',
        '+16 tuning (free)',
        'All genres included',
        'Live preview & feedback'
      ],
      icon: <Crown className="w-6 h-6" />
    },
    free: {
      id: 'free',
      name: 'Download Credits',
      price: 5,
      credits: 1,
      description: 'Download your mastered track',
      features: [
        '1 download credit',
        'High-quality mastered track',
        'Download in WAV/MP3/FLAC',
        'Professional mastering',
        'Instant download'
      ],
      icon: <Shield className="w-6 h-6" />
    }
  };

  const selectedTierInfo = tiers[selectedTier] || tiers['free'];

  const handlePaystackPayment = async () => {
    if (!user?.email) {
      alert('Please sign in to make a payment');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(selectedTierInfo.price);
      const reference = `CRYS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const callbackUrl = `${window.location.origin}/billing?payment=success&tier=${selectedTier}&credits=${selectedTierInfo.credits}`;

      console.log('Starting Paystack payment:', {
        tier: selectedTier,
        price: selectedTierInfo.price,
        ngnAmount: currencyConversion.ngn,
        ngnCents: currencyConversion.ngnCents,
        credits: selectedTierInfo.credits
      });

      // Use direct Paystack integration
      const authUrl = await initializeDirectPaystack({
        amountCents: currencyConversion.ngnCents,
        email: user.email,
        reference,
        callbackUrl,
        metadata: { 
          tier: selectedTier, 
          credits: selectedTierInfo.credits, 
          user_id: user.id,
          original_usd: selectedTierInfo.price,
          converted_ngn: currencyConversion.ngn
        }
      });

      if (authUrl === 'inline_redirect') {
        // Paystack modal is already opened inline
        console.log('Paystack modal opened inline');
      } else if (authUrl) {
        // Redirect to Paystack payment page
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to initialize payment');
      }
      
    } catch (error) {
      console.error('Paystack payment failed:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-crys-black border border-crys-graphite rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-crys-light-grey hover:text-crys-white hover:bg-crys-graphite/20"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-crys-gold">
              {selectedTierInfo.icon}
            </div>
            <h2 className="text-crys-white text-xl mb-2">Purchase {selectedTierInfo.name}</h2>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-crys-gold">${selectedTierInfo.price}</span>
            </div>
            <p className="text-crys-gold text-sm">
              {selectedTierInfo.credits === -1 ? 'Unlimited credits' : `${selectedTierInfo.credits} credits`}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-crys-white font-medium">What's included:</h3>
            <div className="space-y-1">
              {selectedTierInfo.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-crys-gold flex-shrink-0" />
                  <span className="text-crys-light-grey text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <h3 className="text-crys-white font-medium">Payment Details</h3>
            <div className="bg-crys-graphite/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-crys-light-grey">Amount (USD):</span>
                <span className="text-crys-white font-medium">${selectedTierInfo.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crys-light-grey">Amount (NGN):</span>
                <span className="text-crys-white font-medium">{formatNGN(convertUSDToNGN(selectedTierInfo.price).ngn)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crys-light-grey">Credits:</span>
                <span className="text-crys-white font-medium">
                  {selectedTierInfo.credits === -1 ? 'Unlimited' : selectedTierInfo.credits}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crys-light-grey">Payment Method:</span>
                <span className="text-crys-gold font-medium">Paystack Gateway</span>
              </div>
            </div>
          </div>

          {/* Paystack Payment Button */}
          <div className="space-y-4">
            <div className="bg-crys-graphite/20 border border-crys-graphite rounded-lg p-4 text-center">
              <p className="text-crys-light-grey text-sm mb-4">
                You'll be redirected to Paystack to complete your payment securely.
              </p>
              <Button
                onClick={handlePaystackPayment}
                disabled={isProcessing}
                className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-crys-black"></div>
                    Initializing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Purchase Credits - {formatNGN(convertUSDToNGN(selectedTierInfo.price).ngn)}
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-crys-light-grey text-xs">
            <Shield className="w-4 h-4" />
            <span>Your payment is secured with SSL encryption</span>
          </div>
        </CardContent>
      </div>
    </div>
  );
}