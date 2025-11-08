import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  CreditCard, 
  X,
  Save,
  Loader2
} from "lucide-react";

interface CardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: any) => void;
  editingCard?: any;
}

export function CardManagementModal({ isOpen, onClose, onSave, editingCard }: CardManagementModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editingCard) {
      setCardNumber(`•••• •••• •••• ${editingCard.last4}`);
      setExpiryDate(editingCard.expiry);
      setCardholderName(editingCard.cardholderName || '');
      setCvv('');
    } else {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
    }
    setErrors({});
  }, [editingCard, isOpen]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    if (!cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cardData = {
        type: 'card',
        last4: cardNumber.slice(-4),
        brand: 'visa', // In real app, detect from card number
        expiry: expiryDate,
        cardholderName: cardholderName,
        isDefault: false
      };

      onSave(cardData);
    } catch (error) {
      console.error('Failed to save card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardNumberChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format with spaces
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    // Remove non-digits and slash
    const digits = value.replace(/[^\d]/g, '');
    
    // Format as MM/YY
    let formatted = digits;
    if (digits.length >= 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    
    setExpiryDate(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-crys-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-crys-gold" />
            {editingCard ? 'Edit Payment Method' : 'Add Payment Method'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-crys-light-grey hover:text-crys-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-crys-white">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              maxLength={19}
              className={`bg-crys-graphite border-crys-charcoal text-crys-white placeholder:text-crys-light-grey ${
                errors.cardNumber ? 'border-red-500' : ''
              }`}
            />
            {errors.cardNumber && (
              <p className="text-red-400 text-sm">{errors.cardNumber}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName" className="text-crys-white">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={`bg-crys-graphite border-crys-charcoal text-crys-white placeholder:text-crys-light-grey ${
                errors.cardholderName ? 'border-red-500' : ''
              }`}
            />
            {errors.cardholderName && (
              <p className="text-red-400 text-sm">{errors.cardholderName}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-crys-white">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => handleExpiryChange(e.target.value)}
                maxLength={5}
                className={`bg-crys-graphite border-crys-charcoal text-crys-white placeholder:text-crys-light-grey ${
                  errors.expiryDate ? 'border-red-500' : ''
                }`}
              />
              {errors.expiryDate && (
                <p className="text-red-400 text-sm">{errors.expiryDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-crys-white">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                className={`bg-crys-graphite border-crys-charcoal text-crys-white placeholder:text-crys-light-grey ${
                  errors.cvv ? 'border-red-500' : ''
                }`}
              />
              {errors.cvv && (
                <p className="text-red-400 text-sm">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              🔒 Your payment information is encrypted and secure
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-crys-graphite text-crys-light-grey hover:text-crys-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingCard ? 'Update' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
