import { useState } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  X,
  Zap,

  Crown
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  onPaymentSuccess: (tier: string, credits: number) => void;
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });

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
        '444 tuning correction',
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
        '444 tuning (free)',
        'All genres included',
        'Live preview & feedback'
      ],
      icon: <Crown className="w-6 h-6" />
    }
  };

  const selectedTierInfo = tiers[selectedTier];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryChange = (value: string) => {
    // Format expiry date
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    handleInputChange('expiryDate', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      onPaymentSuccess(selectedTier, selectedTierInfo.credits);
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-audio-panel-bg border border-crys-graphite rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-crys-light-grey hover:text-crys-white"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-crys-gold">
              {selectedTierInfo.icon}
            </div>
            <h2 className="text-crys-white text-xl mb-2">Subscribe to {selectedTierInfo.name}</h2>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-crys-gold">${selectedTierInfo.price}</span>
              <span className="text-crys-light-grey">/month</span>
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

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-crys-white font-medium">Payment Method</h3>
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('card')}
                className={paymentMethod === 'card' 
                  ? 'bg-crys-gold hover:bg-crys-gold-muted text-crys-black' 
                  : 'border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10'
                }
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Credit Card
              </Button>
              <Button
                variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaymentMethod('paypal')}
                className={paymentMethod === 'paypal' 
                  ? 'bg-crys-gold hover:bg-crys-gold-muted text-crys-black' 
                  : 'border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10'
                }
              >
                PayPal
              </Button>
            </div>
          </div>

          {/* Credit Card Form */}
          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-crys-white">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  maxLength={19}
                  required
                  className="bg-crys-graphite border-crys-graphite text-crys-white placeholder:text-crys-light-grey"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-crys-white">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    maxLength={5}
                    required
                    className="bg-crys-graphite border-crys-graphite text-crys-white placeholder:text-crys-light-grey"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-crys-white">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={4}
                    required
                    className="bg-crys-graphite border-crys-graphite text-crys-white placeholder:text-crys-light-grey"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName" className="text-crys-white">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  required
                  className="bg-crys-graphite border-crys-graphite text-crys-white placeholder:text-crys-light-grey"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-crys-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="bg-crys-graphite border-crys-graphite text-crys-white placeholder:text-crys-light-grey"
                />
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-crys-black"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Pay ${selectedTierInfo.price}/month
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* PayPal Option */}
          {paymentMethod === 'paypal' && (
            <div className="space-y-4">
              <div className="bg-crys-graphite/20 border border-crys-graphite rounded-lg p-4 text-center">
                <p className="text-crys-light-grey text-sm mb-4">
                  You'll be redirected to PayPal to complete your payment securely.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isProcessing ? 'Processing...' : 'Pay with PayPal'}
                </Button>
              </div>
            </div>
          )}

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