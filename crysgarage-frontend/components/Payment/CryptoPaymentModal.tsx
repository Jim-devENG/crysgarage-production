import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthenticationContext';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: 'free' | 'professional' | 'advanced';
  onPaymentSuccess: (credits: number) => void;
}

interface CryptoOption {
  asset: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  networks: { value: string; label: string; icon?: string }[];
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  {
    asset: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    color: '#f7931a',
    gradient: 'linear-gradient(135deg, #f7931a 0%, #ffa64d 100%)',
    networks: [{ value: 'bitcoin', label: 'Bitcoin (Mainnet)' }]
  },
  {
    asset: 'USDT',
    name: 'Tether',
    icon: '₮',
    color: '#26a17b',
    gradient: 'linear-gradient(135deg, #26a17b 0%, #3dd5a8 100%)',
    networks: [
      { value: 'bsc', label: 'BNB Smart Chain (BEP20)', icon: '🔶' },
      { value: 'ethereum', label: 'Ethereum (ERC20)', icon: '💎' }
    ]
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    color: '#627eea',
    gradient: 'linear-gradient(135deg, #627eea 0%, #8fa4f3 100%)',
    networks: [
      { value: 'ethereum', label: 'Ethereum (Mainnet)', icon: '💎' },
      { value: 'base', label: 'Base (Mainnet)', icon: '🔵' }
    ]
  },
  {
    asset: 'SOL',
    name: 'Solana',
    icon: '◎',
    color: '#9945ff',
    gradient: 'linear-gradient(135deg, #9945ff 0%, #c77dff 100%)',
    networks: [{ value: 'solana', label: 'Solana (Mainnet)' }]
  }
];

const TIER_PRICES: Record<string, number> = {
  free: 5.0,
  professional: 4.0,
  advanced: 25.0
};

export function CryptoPaymentModal({
  isOpen,
  onClose,
  selectedTier,
  onPaymentSuccess
}: CryptoPaymentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'payment' | 'verify'>('select');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [expectedAmount, setExpectedAmount] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>('');
  const [networkConfirmed, setNetworkConfirmed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8002'
    : 'https://crysgarage.studio';

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedCrypto('');
      setSelectedNetwork('');
      setPaymentId('');
      setDestinationAddress('');
      setExpectedAmount(0);
      setTxHash('');
      setNetworkConfirmed(false);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Inject CSS directly to ensure styles work - MUST be before early return
  useEffect(() => {
    const styleId = 'crypto-payment-modal-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .crypto-modal-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(4px) !important;
          -webkit-backdrop-filter: blur(4px) !important;
          z-index: 9999 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 1rem !important;
        }
        .crypto-modal-card {
          width: 100% !important;
          max-width: 42rem !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          background-color: #0a0a0a !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .crypto-modal-header {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 1.5rem !important;
          border-bottom: 1px solid #2a2a2a !important;
        }
        .crypto-modal-title {
          color: #d4af37 !important;
          font-size: 1.5rem !important;
          font-weight: bold !important;
          margin: 0 !important;
        }
        .crypto-modal-content {
          padding: 1.5rem !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1.5rem !important;
        }
        .crypto-modal-text {
          color: #e8e8e8 !important;
        }
        .crypto-modal-text-white {
          color: #ffffff !important;
        }
        .crypto-modal-button-primary {
          padding: 0.625rem 1.25rem !important;
          border-radius: 0.5rem !important;
          border: none !important;
          cursor: pointer !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%) !important;
          background-size: 200% 100% !important;
          color: #0a0a0a !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.375rem !important;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .crypto-modal-button-primary::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: -100% !important;
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
          transition: left 0.5s ease !important;
        }
        .crypto-modal-button-primary:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4) !important;
          background-position: 100% 0 !important;
        }
        .crypto-modal-button-primary:hover::before {
          left: 100% !important;
        }
        .crypto-modal-button-primary:active {
          transform: translateY(0) !important;
        }
        .crypto-modal-button-primary:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        .crypto-modal-button-secondary {
          padding: 0.625rem 1.25rem !important;
          border-radius: 0.5rem !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          cursor: pointer !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          background: rgba(42, 42, 42, 0.5) !important;
          backdrop-filter: blur(10px) !important;
          color: #ffffff !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .crypto-modal-button-secondary:hover {
          background: rgba(42, 42, 42, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }
        .crypto-modal-button-secondary:active {
          transform: translateY(0) !important;
        }
        .crypto-modal-input {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 0.25rem !important;
          padding: 0.5rem 0.75rem !important;
          font-family: monospace !important;
          font-size: 0.875rem !important;
        }
        .crypto-modal-crypto-option {
          border: 2px solid #2a2a2a !important;
          border-radius: 1rem !important;
          padding: 1.25rem !important;
          background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer !important;
          position: relative !important;
          overflow: hidden !important;
        }
        .crypto-modal-crypto-option::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          opacity: 0 !important;
          transition: opacity 0.3s ease !important;
          z-index: 0 !important;
        }
        .crypto-modal-crypto-option:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
          border-color: rgba(212, 175, 55, 0.3) !important;
        }
        .crypto-modal-crypto-option.selected {
          border-color: #d4af37 !important;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1), 0 8px 24px rgba(212, 175, 55, 0.2) !important;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(26, 26, 26, 0.9) 100%) !important;
        }
        .crypto-icon-circle {
          width: 3.5rem !important;
          height: 3.5rem !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1.75rem !important;
          font-weight: bold !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          position: relative !important;
          z-index: 1 !important;
        }
        .crypto-network-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.375rem !important;
          padding: 0.375rem 0.75rem !important;
          border-radius: 0.5rem !important;
          background: rgba(42, 42, 42, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          font-size: 0.8125rem !important;
          transition: all 0.2s ease !important;
        }
        .crypto-network-badge:hover {
          background: rgba(212, 175, 55, 0.15) !important;
          border-color: rgba(212, 175, 55, 0.3) !important;
        }
        .crypto-network-badge.selected {
          background: rgba(212, 175, 55, 0.2) !important;
          border-color: #d4af37 !important;
          color: #d4af37 !important;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .crypto-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent) !important;
          background-size: 1000px 100% !important;
          animation: shimmer 2s infinite !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .crypto-modal-spinner {
          animation: spin 1s linear infinite !important;
          display: inline-block !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      // Don't remove styles on unmount - they should persist
    };
  }, []);

  const handleCryptoSelect = async () => {
    if (!selectedCrypto || !selectedNetwork) {
      setError('Please select both crypto asset and network');
      return;
    }

    if (!user?.id) {
      setError('Please sign in to make a payment');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/crypto/payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          tier_id: selectedTier,
          crypto_asset: selectedCrypto,
          network: selectedNetwork
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create payment intent');
      }

      const data = await response.json();
      setPaymentId(data.payment_id);
      setDestinationAddress(data.destination_address);
      setExpectedAmount(data.expected_amount);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to create payment intent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(destinationAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) {
      setError('Please enter transaction hash');
      return;
    }

    if (!networkConfirmed) {
      setError('Please confirm you sent on the correct network');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('verify');

    try {
      const response = await fetch(`${baseUrl}/crypto/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          tx_hash: txHash.trim(),
          network: selectedNetwork
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Transaction verification failed');
      }

      const data = await response.json();
      
      const credits = selectedTier === 'advanced' ? 6 : 1;
      onPaymentSuccess(credits);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transaction verification failed');
      setStep('payment');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCryptoOption = CRYPTO_OPTIONS.find(c => c.asset === selectedCrypto);
  const price = TIER_PRICES[selectedTier] || 5.0;

  if (!isOpen) return null;

  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '42rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderBottom: '1px solid #2a2a2a'
  };

  const titleStyle: React.CSSProperties = {
    color: '#d4af37',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0
  };

  const contentStyle: React.CSSProperties = {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#d4af37',
    color: '#0a0a0a'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #2a2a2a'
  };

  return (
    <div className="crypto-modal-overlay" style={modalStyle} onClick={onClose}>
      <div className="crypto-modal-card" style={cardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crypto-modal-header" style={headerStyle}>
          <h2 className="crypto-modal-title" style={titleStyle}>Pay with Crypto</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#e8e8e8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#e8e8e8'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="crypto-modal-content" style={contentStyle}>
          {/* Step 1: Select Crypto */}
          {step === 'select' && (
            <>
              <div>
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{ 
                    color: '#ffffff', 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem' 
                  }}>
                    Choose Your Payment Method
                  </h3>
                  <p className="crypto-modal-text" style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                    Select cryptocurrency and network • {selectedTier} tier • ${price} USD
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {CRYPTO_OPTIONS.map((option) => {
                    const isSelected = selectedCrypto === option.asset;
                    return (
                      <div
                        key={option.asset}
                        className={`crypto-modal-crypto-option ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          // Don't handle if clicking on network buttons or their children
                          const target = e.target as HTMLElement;
                          if (target.closest('button.crypto-network-badge') || target.tagName === 'BUTTON' || target.closest('button')) {
                            return;
                          }
                          setSelectedCrypto(option.asset);
                          if (option.networks.length === 1) {
                            setSelectedNetwork(option.networks[0].value);
                          } else if (!isSelected) {
                            setSelectedNetwork('');
                          }
                        }}
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          cursor: 'pointer'
                        }}
                      >
                        {/* Crypto Icon */}
                        <div 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            marginBottom: option.networks.length > 1 && isSelected ? '1rem' : '0'
                          }}
                        >
                          <div 
                            className="crypto-icon-circle"
                            style={{
                              background: option.gradient,
                              color: '#ffffff',
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                          >
                            {option.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              color: '#ffffff', 
                              fontWeight: '700', 
                              fontSize: '1.125rem',
                              marginBottom: '0.125rem'
                            }}>
                              {option.asset}
                            </div>
                            <div style={{ 
                              color: '#9ca3af', 
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {option.name}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{
                              width: '1.5rem',
                              height: '1.5rem',
                              borderRadius: '50%',
                              background: '#d4af37',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.2)'
                            }}>
                              <Check size={14} style={{ color: '#0a0a0a' }} />
                            </div>
                          )}
                        </div>
                        
                        {/* Network Selection */}
                        {isSelected && option.networks.length > 1 && (
                          <div style={{ 
                            marginTop: '1rem', 
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            <div style={{ 
                              color: '#9ca3af', 
                              fontSize: '0.75rem', 
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '0.25rem'
                            }}>
                              Select Network
                            </div>
                            {option.networks.map((network) => (
                              <button
                                key={network.value}
                                type="button"
                                className="crypto-network-badge"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  console.log('Network button clicked:', network.value);
                                  setSelectedNetwork(network.value);
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                                onMouseUp={(e) => {
                                  e.stopPropagation();
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: selectedNetwork === network.value ? '#d4af37' : '#e8e8e8',
                                  backgroundColor: selectedNetwork === network.value 
                                    ? 'rgba(212, 175, 55, 0.2)' 
                                    : 'rgba(42, 42, 42, 0.8)',
                                  borderColor: selectedNetwork === network.value 
                                    ? '#d4af37' 
                                    : 'rgba(255, 255, 255, 0.1)',
                                  border: '1px solid',
                                  borderRadius: '0.5rem',
                                  padding: '0.5rem 0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  width: '100%',
                                  textAlign: 'left',
                                  fontFamily: 'inherit',
                                  fontSize: '0.8125rem',
                                  background: selectedNetwork === network.value 
                                    ? 'rgba(212, 175, 55, 0.2)' 
                                    : 'rgba(42, 42, 42, 0.8)',
                                  position: 'relative',
                                  zIndex: 10
                                }}
                              >
                                {network.icon && <span style={{ fontSize: '0.875rem' }}>{network.icon}</span>}
                                <span style={{ flex: 1 }}>{network.label}</span>
                                {selectedNetwork === network.value && (
                                  <Check size={14} />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(153, 27, 27, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                  <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="crypto-modal-button-secondary"
                  onClick={onClose}
                  style={{
                    ...secondaryButtonStyle,
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  className="crypto-modal-button-primary"
                  onClick={handleCryptoSelect}
                  disabled={isLoading || !selectedCrypto || !selectedNetwork}
                  style={{
                    flex: 1,
                    width: '100%'
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="crypto-modal-spinner" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Payment Instructions */}
          {step === 'payment' && (
            <>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>
                  Send Payment
                </h3>
                
                <div style={{
                  backgroundColor: 'rgba(26, 26, 26, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid #2a2a2a'
                }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#e8e8e8', display: 'block', marginBottom: '0.25rem' }}>
                      Destination Address
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="crypto-modal-input"
                        value={destinationAddress}
                        readOnly
                        style={{
                          flex: 1,
                          backgroundColor: '#2a2a2a',
                          color: '#ffffff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.25rem',
                          border: '1px solid #2a2a2a',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}
                      />
                      <button
                        onClick={handleCopyAddress}
                        style={{
                          ...primaryButtonStyle,
                          padding: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.9)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4af37'}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#e8e8e8', display: 'block', marginBottom: '0.25rem' }}>
                      Network
                    </label>
                    <p style={{ color: '#ffffff', fontWeight: '600', margin: 0 }}>
                      {selectedCryptoOption?.networks.find(n => n.value === selectedNetwork)?.label}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#e8e8e8', display: 'block', marginBottom: '0.25rem' }}>
                      Amount
                    </label>
                    <p style={{ color: '#ffffff', fontWeight: '600', margin: 0 }}>
                      {expectedAmount.toLocaleString(undefined, { 
                        minimumFractionDigits: expectedAmount < 0.01 ? 8 : expectedAmount < 1 ? 6 : 2,
                        maximumFractionDigits: expectedAmount < 0.01 ? 8 : expectedAmount < 1 ? 6 : 2
                      })} {selectedCrypto} (≈ ${price} USD)
                    </p>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  backgroundColor: 'rgba(161, 98, 7, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertTriangle size={20} style={{ color: '#fbbf24', marginTop: '0.125rem', flexShrink: 0 }} />
                    <p style={{ color: '#fbbf24', fontSize: '0.875rem', margin: 0 }}>
                      ⚠️ Send ONLY on the specified network. Wrong-network transfers are unrecoverable.
                    </p>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: '#3b82f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.125rem'
                    }}>
                      <span style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>i</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#93c5fd', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                        How to get your transaction hash:
                      </p>
                      <ol style={{ color: '#bfdbfe', fontSize: '0.875rem', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                        <li>Copy the destination address above</li>
                        <li>Open your crypto wallet (MetaMask, Trust Wallet, etc.)</li>
                        <li>Send the exact amount to the copied address on the correct network</li>
                        <li>After sending, your wallet will show a transaction hash (also called TX ID)</li>
                        <li>Copy that transaction hash and paste it in the next step</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(153, 27, 27, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                  <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('select')}
                  style={{
                    ...secondaryButtonStyle,
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('verify')}
                  style={{
                    ...primaryButtonStyle,
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d4af37'}
                >
                  I have paid
                </button>
              </div>
            </>
          )}

          {/* Step 3: Verify Transaction */}
          {step === 'verify' && (
            <>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>
                  Verify Payment
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <p style={{ color: '#bfdbfe', fontSize: '0.8125rem', margin: 0, lineHeight: '1.5' }}>
                      <strong style={{ color: '#93c5fd' }}>Where to find it:</strong> After sending the payment from your wallet, look for the transaction confirmation. The transaction hash (TX ID) is usually shown in your wallet's transaction history or confirmation screen. It's a long string of letters and numbers.
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#e8e8e8', marginBottom: '0.5rem', display: 'block' }}>
                      Transaction Hash (TX ID)
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste transaction hash from your wallet (e.g., 0x1234... or bc1q...)"
                      style={{
                        width: '100%',
                        backgroundColor: '#2a2a2a',
                        color: '#ffffff',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #2a2a2a',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }}
                    />
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                      Example formats: Bitcoin (64 chars), Ethereum (0x + 66 chars), Solana (base58 string)
                    </p>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={networkConfirmed}
                      onChange={(e) => setNetworkConfirmed(e.target.checked)}
                      style={{ accentColor: '#d4af37', width: '1rem', height: '1rem' }}
                    />
                    <span style={{ color: '#e8e8e8', fontSize: '0.875rem' }}>
                      I confirm I sent the payment on {selectedCryptoOption?.networks.find(n => n.value === selectedNetwork)?.label}
                    </span>
                  </label>
                </div>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(153, 27, 27, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                  <span style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('payment')}
                  disabled={isLoading}
                  style={{
                    ...secondaryButtonStyle,
                    flex: 1,
                    opacity: isLoading ? 0.5 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#2a2a2a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={isLoading || !txHash.trim() || !networkConfirmed}
                  style={{
                    ...primaryButtonStyle,
                    flex: 1,
                    opacity: (isLoading || !txHash.trim() || !networkConfirmed) ? 0.5 : 1,
                    cursor: (isLoading || !txHash.trim() || !networkConfirmed) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && txHash.trim() && networkConfirmed) {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && txHash.trim() && networkConfirmed) {
                      e.currentTarget.style.backgroundColor = '#d4af37';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} style={{ 
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                      }} />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify Payment'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
