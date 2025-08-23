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
  Loader2
} from "lucide-react";
interface BillingPageProps {
  userTier: string;
  onUpgradePlan: () => void;
  onNavigate: (page: string) => void;
}

export function BillingPage({ userTier, onUpgradePlan, onNavigate }: BillingPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'invoices' | 'usage'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods = [
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expires: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '8888',
      expires: '08/26',
      isDefault: false
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      date: '2025-01-15',
      amount: 9.00,
      status: 'paid',
      description: 'Professional Plan - January 2025'
    },
    {
      id: 'INV-002',
      date: '2024-12-15',
      amount: 9.00,
      status: 'paid',
      description: 'Professional Plan - December 2024'
    },
    {
      id: 'INV-003',
      date: '2024-11-15',
      amount: 9.00,
      status: 'paid',
      description: 'Professional Plan - November 2024'
    }
  ];

  const usageData = [
    { month: 'January 2025', credits: 23, addons: 2, total: 14.00 },
    { month: 'December 2024', credits: 45, addons: 1, total: 12.00 },
    { month: 'November 2024', credits: 67, addons: 3, total: 18.00 },
    { month: 'October 2024', credits: 34, addons: 0, total: 9.00 }
  ];

  const getTierInfo = () => {
    switch (userTier) {
      case 'professional':
        return {
          name: 'Professional',
          price: 9,
          credits: 100,
          color: 'bg-blue-500',
          features: ['100 mastering credits', 'All audio formats', 'Up to 192kHz sample rate']
        };
      case 'advanced':
        return {
          name: 'Advanced',
          price: 20,
          credits: -1, // Unlimited
          color: 'bg-purple-500',
          features: ['Unlimited mastering', 'Real-time manual controls', '8-band graphic EQ']
        };
      default:
        return {
          name: 'Free',
          price: 0,
          credits: 5,
          color: 'bg-gray-500',
          features: ['5 mastering credits', 'Basic audio formats', 'Up to 44.1kHz sample rate']
        };
    }
  };

  const tierInfo = getTierInfo();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgradePlan();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
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
                        ${tierInfo.price}/month • {tierInfo.credits === -1 ? 'Unlimited' : `${tierInfo.credits} credits`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-crys-graphite text-crys-light-grey">
                      Active
                    </Badge>
                    {userTier === 'free' && (
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
                      <p className="text-sm text-crys-light-grey">{paymentMethods.length} cards saved</p>
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
                      <h3 className="font-semibold text-crys-white">Recent Invoices</h3>
                      <p className="text-sm text-crys-light-grey">{invoices.length} invoices available</p>
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
              <Button className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card key={method.id} className="bg-audio-panel-bg border-audio-panel-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-crys-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-crys-white">
                            {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
                          </h3>
                          <p className="text-sm text-crys-light-grey">Expires {method.expires}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.isDefault && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                            Default
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-crys-white">Invoices</h2>
            
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-audio-panel-bg border-audio-panel-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-crys-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-crys-white">{invoice.description}</h3>
                          <p className="text-sm text-crys-light-grey">Invoice #{invoice.id} • {invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-crys-white">${invoice.amount.toFixed(2)}</p>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-crys-white">Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {usageData.map((month, index) => (
                <Card key={index} className="bg-audio-panel-bg border-audio-panel-border">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="font-semibold text-crys-white">{month.month}</h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-crys-light-grey">Credits Used:</span>
                          <span className="text-crys-white">{month.credits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crys-light-grey">Add-ons:</span>
                          <span className="text-crys-white">{month.addons}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span className="text-crys-light-grey">Total:</span>
                          <span className="text-crys-white">${month.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
