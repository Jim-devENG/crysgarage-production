import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Receipt, 
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Loader2,
  Wallet
} from "lucide-react";
import { creditsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthenticationContext";
import { CardManagementModal } from "./CardManagementModal";
import { initializeDirectPaystack } from "../Payments/PaystackDirect";
import { convertUSDToNGN, formatNGN } from "../../utils/currencyConverter";

interface BillingPageProps {
  onNavigate: (page: string) => void;
}

export function BillingPage({ onNavigate }: BillingPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'invoices' | 'usage'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'advanced' | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const { user, updateProfile } = useAuth();

  // Debug logging
  React.useEffect(() => {
    console.log('BillingPage mounted, user:', user);
    console.log('Current URL:', window.location.href);
    
    // Check for payment success parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      const tier = urlParams.get('tier');
      const credits = urlParams.get('credits');
      
      if (tier && credits) {
        setMessage(`Payment successful! ${credits} credits have been added to your account.`);
        
        // Update user credits
        if (user) {
          const updatedUser = { ...user, credits: (user.credits || 0) + parseInt(credits) };
          updateProfile(updatedUser);
          localStorage.setItem('crysgarage_user', JSON.stringify(updatedUser));
        }
        
        // Clean up URL
        window.history.replaceState({}, '', '/billing');
        
        // Auto-hide message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      }
    }
  }, [user, updateProfile]);

  const tierPricing = {
    free: { credits: 2, price: 4.99, name: 'Free Tier Credits' },
    pro: { credits: 12, price: 19.99, name: 'Professional Credits' },
    advanced: { credits: 25, price: 49.99, name: 'Advanced Credits' }
  };

  const getTierInfo = () => {
    const userTier = user?.tier || 'free';
    switch (userTier) {
      case 'pro':
        return {
          name: 'Professional',
          price: 19.99,
          credits: 12,
          color: 'bg-blue-500',
          features: ['12 download credits', 'All audio formats', 'Up to 192kHz sample rate']
        };
      case 'advanced':
        return {
          name: 'Advanced',
          price: 49.99,
          credits: 25,
          color: 'bg-purple-500',
          features: ['25 download credits', 'Real-time manual controls', '8-band graphic EQ']
        };
      default:
        return {
          name: 'Free',
          price: 4.99,
          credits: 2,
          color: 'bg-gray-500',
          features: ['2 download credits', 'Basic audio formats', 'Up to 44.1kHz sample rate']
        };
    }
  };

  const tierInfo = getTierInfo();

  // Load payment methods and transaction history
  const loadBillingData = async () => {
    if (!user) return;
    
    setIsLoadingData(true);
    try {
      // Load payment methods (mock data for now)
      const mockPaymentMethods = [
        {
          id: 1,
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiry: '12/25',
          isDefault: true
        }
      ];
      setPaymentMethods(mockPaymentMethods);

      // Load transaction history (mock data for now)
      const mockTransactions = [
        {
          id: 1,
          amount: 19.99,
          credits: 12,
          status: 'completed',
          date: new Date().toISOString(),
          description: 'Professional Credits Purchase'
        },
        {
          id: 2,
          amount: 4.99,
          credits: 2,
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString(),
          description: 'Free Tier Credits Purchase'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load billing data:', error);
      setError('Failed to load billing information');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data when component mounts or user changes
  React.useEffect(() => {
    loadBillingData();
  }, [user]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      onNavigate('studio');
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredits = async (tier: 'free' | 'pro' | 'advanced') => {
    if (!user?.email) {
      onNavigate('login');
      return;
    }
    try {
      setIsPurchasing(true);
      const pkg = tierPricing[tier];
      const credits = pkg.credits;
      const tierKey = tier;
      
      // Convert USD to NGN for Paystack
      const currencyConversion = convertUSDToNGN(pkg.price);
      const reference = `CRYS_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const callbackUrl = `${window.location.origin}/billing?payment=success&tier=${tierKey}&credits=${credits}`;

      // Show Naira amount to user before payment
      const confirmPayment = window.confirm(
        `Confirm payment of ${formatNGN(currencyConversion.ngn)} (${pkg.price} USD) for ${credits} credits?`
      );
      
      if (!confirmPayment) return;

      const authUrl = await initializeDirectPaystack({
        amountCents: currencyConversion.ngnCents, // Use NGN cents for Paystack
        email: user.email,
        reference,
        callbackUrl,
        metadata: { 
          tier: tierKey, 
          credits, 
          user_id: user.id,
          original_usd: pkg.price,
          converted_ngn: currencyConversion.ngn
        }
      });
      if (authUrl !== 'inline_redirect') {
        window.location.href = authUrl;
      }
    } catch (e: any) {
      console.error('Purchase init failed:', e);
      setError(e?.message || 'Failed to start payment');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handlePaymentSuccess = (credits: number) => {
    setMessage(`Successfully purchased ${credits} credits!`);
    setShowPaymentModal(false);
    setSelectedTier(null);
    
    // Add new transaction to history
    const newTransaction = {
      id: Date.now(),
      amount: selectedTier ? tierPricing[selectedTier].price : 0,
      credits: credits,
      status: 'completed',
      date: new Date().toISOString(),
      description: selectedTier ? `${tierPricing[selectedTier].name} Purchase` : 'Credits Purchase'
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Add payment method if it's a new card
    const newPaymentMethod = {
      id: Date.now(),
      type: 'card',
      last4: '4242', // Mock data - in real app this would come from Paystack
      brand: 'visa',
      expiry: '12/25',
      isDefault: paymentMethods.length === 0
    };
    
    if (paymentMethods.length === 0) {
      setPaymentMethods([newPaymentMethod]);
    }
    
    // Refresh user data to update credits
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setSelectedTier(null);
  };

  // Card management functions
  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setShowAddCardModal(true);
  };

  const handleDeleteCard = (cardId: number) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
      setMessage('Payment method deleted successfully');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddCard = () => {
    setEditingCard(null);
    setShowAddCardModal(true);
  };

  const handleSaveCard = (cardData: any) => {
    if (editingCard) {
      // Update existing card
      setPaymentMethods(prev => prev.map(card => 
        card.id === editingCard.id ? { ...card, ...cardData } : card
      ));
      setMessage('Payment method updated successfully');
    } else {
      // Add new card
      const newCard = {
        id: Date.now(),
        ...cardData,
        isDefault: paymentMethods.length === 0
      };
      setPaymentMethods(prev => [...prev, newCard]);
      setMessage('Payment method added successfully');
    }
    setShowAddCardModal(false);
    setEditingCard(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancelCard = () => {
    setShowAddCardModal(false);
    setEditingCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 text-crys-light-grey hover:text-crys-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-crys-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-crys-gold" />
                  Billing & Subscription
                </h1>
                <p className="text-crys-light-grey text-sm mt-1">
                  Manage your subscription, payment methods, and billing history
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'usage', label: 'Usage', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium transition-colors ${
                    isActive 
                      ? 'border-crys-gold text-crys-gold' 
                      : 'border-transparent text-crys-light-grey hover:text-crys-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Balance */}
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardHeader>
                <CardTitle className="text-crys-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-crys-gold" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-crys-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-crys-white">
                        {user?.credits || 0} Credits
                      </h3>
                      <p className="text-crys-light-grey text-sm">
                        Available for downloading mastered tracks
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-crys-gold text-crys-gold">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardHeader>
                <CardTitle className="text-crys-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-crys-gold" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${tierInfo.color} rounded-lg flex items-center justify-center`}>
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-crys-white">{tierInfo.name} Plan</h3>
                      <p className="text-crys-light-grey text-sm">
                        ${tierInfo.price} • {tierInfo.credits} download credits
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-crys-graphite text-crys-light-grey">
                      Active
                    </Badge>
                    {user?.tier === 'free' && (
                      <Button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Upgrade Plan'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-crys-white mb-3">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tierInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-crys-light-grey">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

                         {/* Payment Status */}
             {message && (
               <Card className="bg-audio-panel-bg border-audio-panel-border">
                 <CardContent className="p-6">
                   <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                     <p className="text-green-400 font-medium">{message}</p>
                   </div>
                 </CardContent>
               </Card>
             )}

                           {/* Manual Payment Verification */}
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-crys-gold" />
                    Payment Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-crys-light-grey text-sm mb-4">
                    If you completed a payment but don't see your credits, click below to verify your payment.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        // Refresh user data to check for updated credits
                        window.location.reload();
                      }}
                      className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check Payment Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Manually add credits for testing
                        if (user) {
                          const updatedUser = { ...user, credits: (user.credits || 0) + 2 };
                          updateProfile(updatedUser);
                          localStorage.setItem('crysgarage_user', JSON.stringify(updatedUser));
                          setMessage('Credits added manually. Please check your balance.');
                          setTimeout(() => setMessage(null), 5000);
                        }
                      }}
                      className="w-full border-crys-graphite text-crys-light-grey hover:text-crys-white"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Manual Credit Add (Test)
                    </Button>
                  </div>
                </CardContent>
              </Card>

             {/* Purchase Credits */}
             <Card className="bg-audio-panel-bg border-audio-panel-border">
               <CardHeader>
                 <CardTitle className="text-crys-white flex items-center gap-2">
                   <DollarSign className="w-5 h-5 text-crys-gold" />
                   Purchase Credits
                 </CardTitle>
               </CardHeader>
                             <CardContent className="space-y-4">
                 {error && (
                   <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
                 )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(tierPricing).map(([tier, pkg]) => (
                    <div key={tier} className="bg-crys-graphite rounded-lg p-6 border border-crys-charcoal flex flex-col items-center text-center">
                      <DollarSign className="w-8 h-8 text-crys-gold mb-3" />
                      <h4 className="text-xl font-bold text-crys-white mb-1">{pkg.credits} Credits</h4>
                      <p className="text-crys-light-grey text-sm mb-4">{pkg.name}</p>
                      <div className="text-3xl font-bold text-crys-gold mb-4">${pkg.price}</div>
                      <Button
                        onClick={() => handlePurchaseCredits(tier as 'free' | 'pro' | 'advanced')}
                        disabled={isPurchasing}
                        className="w-full bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                      >
                        {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Purchase'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-crys-white">Payment Methods</h3>
                      <p className="text-sm text-crys-light-grey">
                        {paymentMethods.length > 0 ? `${paymentMethods.length} card${paymentMethods.length > 1 ? 's' : ''} saved` : 'No cards saved'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-crys-graphite text-crys-light-grey hover:text-crys-white"
                    onClick={() => setActiveTab('payment-methods')}
                  >
                    Manage Cards
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-crys-white">Recent Transactions</h3>
                      <p className="text-sm text-crys-light-grey">
                        {transactions.length > 0 ? `${transactions.length} transaction${transactions.length > 1 ? 's' : ''}` : 'No transactions'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-crys-graphite text-crys-light-grey hover:text-crys-white"
                    onClick={() => setActiveTab('invoices')}
                  >
                    View All
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-crys-white">Usage Analytics</h3>
                      <p className="text-sm text-crys-light-grey">Track your usage</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-crys-graphite text-crys-light-grey hover:text-crys-white"
                    onClick={() => setActiveTab('usage')}
                  >
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-crys-white">Payment Methods</h2>
              <Button 
                className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                onClick={handleAddCard}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {isLoadingData ? (
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-crys-gold" />
                  <p className="text-crys-light-grey">Loading payment methods...</p>
                </CardContent>
              </Card>
            ) : paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="bg-audio-panel-bg border-audio-panel-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-crys-white">
                                {method.brand?.toUpperCase()} •••• {method.last4}
                              </h3>
                              {method.isDefault && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-crys-light-grey">Expires {method.expiry}</p>
                          </div>
                        </div>
                                                 <div className="flex items-center gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
                             onClick={() => handleEditCard(method)}
                           >
                             Edit
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                             onClick={() => handleDeleteCard(method.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-crys-graphite rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-crys-light-grey" />
                  </div>
                  <h3 className="text-lg font-semibold text-crys-white mb-2">No Payment Methods</h3>
                  <p className="text-crys-light-grey text-sm mb-6">Add a payment method to purchase credits and manage your subscription.</p>
                  <Button 
                    className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-crys-white">Transaction History</h2>
            
            {isLoadingData ? (
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-crys-gold" />
                  <p className="text-crys-light-grey">Loading transaction history...</p>
                </CardContent>
              </Card>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-audio-panel-bg border-audio-panel-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-crys-white">{transaction.description}</h3>
                            <p className="text-sm text-crys-light-grey">
                              {new Date(transaction.date).toLocaleDateString()} • {transaction.credits} credits
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-crys-white">${transaction.amount}</span>
                            <Badge className={
                              transaction.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/20'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-crys-graphite rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-crys-light-grey" />
                  </div>
                  <h3 className="text-lg font-semibold text-crys-white mb-2">No Transactions</h3>
                  <p className="text-crys-light-grey text-sm mb-6">Your transaction history will appear here once you make purchases.</p>
                  <Button 
                    className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold"
                    onClick={() => setActiveTab('overview')}
                  >
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-crys-white">Usage Analytics</h2>
            
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-crys-graphite rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-crys-light-grey" />
                </div>
                <h3 className="text-lg font-semibold text-crys-white mb-2">No Usage Data</h3>
                <p className="text-crys-light-grey text-sm">Your usage analytics will appear here once you start mastering tracks.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Direct Paystack flow used; modal removed */}

       {/* Card Management Modal */}
       <CardManagementModal
         isOpen={showAddCardModal}
         onClose={handleCancelCard}
         onSave={handleSaveCard}
         editingCard={editingCard}
       />
     </div>
   );
 }
