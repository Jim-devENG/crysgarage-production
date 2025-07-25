import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Receipt, 
  Settings,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package
} from "lucide-react";

interface BillingModalProps {
  userTier: string;
  onClose: () => void;
  onUpgradePlan: () => void;
}

export function BillingModal({ userTier, onClose, onUpgradePlan }: BillingModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'invoices' | 'usage'>('overview');

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
      case 'free':
        return {
          name: 'Free Plan',
          price: '$0',
          billing: 'No billing',
          next: null,
          features: ['5 credits', 'Basic mastering', 'Preview only']
        };
      case 'professional':
        return {
          name: 'Professional Plan',
          price: '$9',
          billing: 'per month',
          next: 'February 15, 2025',
          features: ['100 credits', 'All genres', 'Full downloads', 'Premium quality']
        };
      case 'advanced':
        return {
          name: 'Advanced Plan',
          price: '$20',
          billing: 'per month',
          next: 'February 15, 2025',
          features: ['Unlimited credits', 'Manual controls', 'Real-time preview', 'Premium support']
        };
      default:
        return {
          name: 'Unknown Plan',
          price: '$0',
          billing: '',
          next: null,
          features: []
        };
    }
  };

  const tierInfo = getTierInfo();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-crys-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-crys-gold" />
                Billing & Subscription
              </CardTitle>
              <p className="text-crys-light-grey text-sm mt-1">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-crys-graphite/30 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'usage', label: 'Usage', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-crys-gold text-crys-black'
                    : 'text-crys-light-grey hover:text-crys-white hover:bg-crys-graphite/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border border-crys-gold/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-crys-white text-xl font-semibold">{tierInfo.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-crys-gold text-2xl font-bold">{tierInfo.price}</span>
                      {tierInfo.billing && <span className="text-crys-light-grey text-sm">{tierInfo.billing}</span>}
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-crys-white font-medium mb-2">Plan Features</h4>
                    <ul className="space-y-1">
                      {tierInfo.features.map((feature, index) => (
                        <li key={index} className="text-crys-light-grey text-sm flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-crys-white font-medium mb-2">Billing Information</h4>
                    <div className="space-y-1 text-sm text-crys-light-grey">
                      {tierInfo.next && (
                        <div>Next billing: <span className="text-crys-white">{tierInfo.next}</span></div>
                      )}
                      <div>Payment method: <span className="text-crys-white">•••• 4242</span></div>
                      <div>Status: <span className="text-green-400">Active</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {userTier !== 'advanced' && (
                    <Button 
                      onClick={onUpgradePlan}
                      className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    Change Plan
                  </Button>
                  {userTier !== 'free' && (
                    <Button 
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-crys-gold mx-auto mb-2" />
                    <div className="text-2xl font-bold text-crys-white">$47</div>
                    <div className="text-crys-light-grey text-sm">Total Spent</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <Package className="w-8 h-8 text-crys-gold mx-auto mb-2" />
                    <div className="text-2xl font-bold text-crys-white">156</div>
                    <div className="text-crys-light-grey text-sm">Credits Used</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <Receipt className="w-8 h-8 text-crys-gold mx-auto mb-2" />
                    <div className="text-2xl font-bold text-crys-white">5</div>
                    <div className="text-crys-light-grey text-sm">Invoices</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-crys-white text-lg font-semibold">Payment Methods</h3>
                <Button 
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="bg-crys-graphite/30 border-crys-graphite">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-crys-gold" />
                          </div>
                          <div>
                            <div className="text-crys-white font-medium">
                              •••• •••• •••• {method.last4}
                            </div>
                            <div className="text-crys-light-grey text-sm">
                              {method.type.charAt(0).toUpperCase() + method.type.slice(1)} • Expires {method.expires}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {method.isDefault && (
                            <Badge className="bg-green-500/20 text-green-400">Default</Badge>
                          )}
                          <Button variant="outline" size="sm" className="border-crys-graphite text-crys-light-grey">
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
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

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-crys-white text-lg font-semibold">Billing History</h3>
                <Button 
                  variant="outline"
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>

              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="bg-crys-graphite/30 border-crys-graphite">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-crys-gold" />
                          </div>
                          <div>
                            <div className="text-crys-white font-medium">
                              {invoice.description}
                            </div>
                            <div className="text-crys-light-grey text-sm">
                              {invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-crys-white font-semibold">${invoice.amount.toFixed(2)}</div>
                            <Badge 
                              className={invoice.status === 'paid' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <h3 className="text-crys-white text-lg font-semibold">Usage History</h3>
              
              <div className="space-y-4">
                {usageData.map((usage, index) => (
                  <Card key={index} className="bg-crys-graphite/30 border-crys-graphite">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-crys-white font-medium">{usage.month}</h4>
                        <div className="text-crys-gold font-semibold">${usage.total.toFixed(2)}</div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-crys-light-grey">Credits Used</div>
                          <div className="text-crys-white font-medium">{usage.credits}</div>
                        </div>
                        <div>
                          <div className="text-crys-light-grey">Add-ons Purchased</div>
                          <div className="text-crys-white font-medium">{usage.addons}</div>
                        </div>
                        <div>
                          <div className="text-crys-light-grey">Total Spend</div>
                          <div className="text-crys-white font-medium">${usage.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}