import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ProfileEditModal } from "./ProfileEditModal";
import { BillingModal } from "./BillingModal";
import { AddonsMarketplace } from "./AddonsMarketplace";
import { 
  User, 
  Wallet, 
  Music, 
  Settings, 
 
  Star,

  CreditCard,
  Package,
  TrendingUp,
  CheckCircle,
  Plus,
  History,
  Crown,
  Zap,

  Volume2,
  ExternalLink,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  name: string;
  email: string;
  tier: string;
  joinDate: string;
  totalTracks: number;
  totalSpent: number;
  isSignedIn: boolean;
}

interface PurchasedAddon {
  id: string;
  name: string;
  category: 'genre' | 'quality' | 'processing' | 'format';
  price: number;
  purchaseDate: string;
  usageCount: number;
  icon: React.ReactNode;
}

interface UserProfileProps {
  onClose: () => void;
  userData: UserData;
  userCredits: number;
  userTier: string;
  onNavigate?: (page: string) => void;
  onUpdateUser?: (userData: UserData) => void;
}

export function UserProfile({ 
  onClose, 
  userData, 
  userCredits, 
  userTier, 
  onNavigate,
  onUpdateUser 
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  
  const [purchasedAddons, setPurchasedAddons] = useState<PurchasedAddon[]>([
    {
      id: 'noise-reduction',
      name: 'Advanced Noise Reduction',
      category: 'processing',
      price: 5,
      purchaseDate: '2025-01-15',
      usageCount: 12,
      icon: <Volume2 className="w-4 h-4" />
    },
    {
      id: 'afrobeats-premium',
      name: 'Afrobeats Premium',
      category: 'genre',
      price: 1,
      purchaseDate: '2025-01-10',
      usageCount: 8,
      icon: <Music className="w-4 h-4" />
    },
    {
      id: 'hd-quality',
      name: '192kHz Processing',
      category: 'quality',
      price: 5,
      purchaseDate: '2025-01-08',
      usageCount: 5,
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'gospel-premium',
      name: 'Gospel Premium',
      category: 'genre',
      price: 1,
      purchaseDate: '2025-01-05',
      usageCount: 15,
      icon: <Music className="w-4 h-4" />
    }
  ]);

  const [recentActivity] = useState([
    { action: 'Mastered track', details: 'Afrobeats - Track_001.wav', time: '2 hours ago', cost: 1 },
    { action: 'Purchased add-on', details: 'Advanced Noise Reduction', time: '1 day ago', cost: 5 },
    { action: 'Mastered track', details: 'Gospel - Praise_Song.wav', time: '2 days ago', cost: 1 },
    { action: 'Upgraded tier', details: 'Professional Plan', time: '1 week ago', cost: 9 }
  ]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-500/20 text-green-400';
      case 'professional': return 'bg-blue-500/20 text-blue-400';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Package className="w-4 h-4" />;
      case 'professional': return <Star className="w-4 h-4" />;
      case 'advanced': return <Crown className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'genre': return 'bg-blue-500/20 text-blue-400';
      case 'quality': return 'bg-purple-500/20 text-purple-400';
      case 'processing': return 'bg-green-500/20 text-green-400';
      case 'format': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const totalAddonValue = purchasedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalUsage = purchasedAddons.reduce((sum, addon) => sum + addon.usageCount, 0);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleBilling = () => {
    setShowBilling(true);
  };

  const handleBrowseAddons = () => {
    setShowAddons(true);
  };

  const handleUpgradePlan = () => {
    onNavigate?.('studio');
    onClose();
  };

  const handleSupport = () => {
    onNavigate?.('help');
    onClose();
  };

  const handleSaveProfile = (updatedData: UserData) => {
    if (onUpdateUser) {
      onUpdateUser(updatedData);
    }
    toast.success("Profile updated successfully!");
  };

  const handlePurchaseAddon = (addonId: string, price: number) => {
    // Simulate addon purchase
    const newAddon: PurchasedAddon = {
      id: addonId,
      name: addonId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      category: 'processing',
      price: price,
      purchaseDate: new Date().toISOString().split('T')[0],
      usageCount: 0,
      icon: <Zap className="w-4 h-4" />
    };
    
    setPurchasedAddons(prev => [...prev, newAddon]);
    toast.success(`Purchased ${newAddon.name} for $${price}!`);
    setShowAddons(false);
  };

  const handleViewAllActivity = () => {
    toast.info("Activity history feature coming soon!");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-audio-panel-bg border border-audio-panel-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-crys-graphite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-crys-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-crys-white">{userData.name}</h2>
                  <p className="text-crys-light-grey text-sm">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getTierColor(userTier)}>
                  {getTierIcon(userTier)}
                  <span className="ml-1 capitalize">{userTier}</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-crys-graphite/50 m-6 mb-0">
              <TabsTrigger value="overview" className="text-crys-white">Overview</TabsTrigger>
              <TabsTrigger value="wallet" className="text-crys-white">Wallet</TabsTrigger>
              <TabsTrigger value="activity" className="text-crys-white">Activity</TabsTrigger>
              <TabsTrigger value="settings" className="text-crys-white">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-crys-gold mb-1">{userData.totalTracks}</div>
                    <div className="text-crys-light-grey text-sm">Tracks Mastered</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-crys-gold mb-1">{userCredits}</div>
                    <div className="text-crys-light-grey text-sm">Credits Remaining</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-crys-gold mb-1">${userData.totalSpent}</div>
                    <div className="text-crys-light-grey text-sm">Total Spent</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-crys-gold mb-1">{purchasedAddons.length}</div>
                    <div className="text-crys-light-grey text-sm">Add-ons Owned</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-crys-gold" />
                      Account Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-crys-light-grey">Member Since</span>
                      <span className="text-crys-white">{userData.joinDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-crys-light-grey">Current Tier</span>
                      <Badge className={getTierColor(userTier)}>
                        {getTierIcon(userTier)}
                        <span className="ml-1 capitalize">{userTier}</span>
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-crys-light-grey">Total Add-on Value</span>
                      <span className="text-crys-gold font-medium">${totalAddonValue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-crys-light-grey">Total Usage</span>
                      <span className="text-crys-white">{totalUsage} sessions</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-crys-gold" />
                      Quick Add-ons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Hip-Hop Premium', price: 1, category: 'genre' },
                      { name: '32-bit Processing', price: 3, category: 'quality' },
                      { name: 'Harmonic Enhancement', price: 4, category: 'processing' }
                    ].map((addon, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="text-crys-white text-sm">{addon.name}</div>
                          <Badge className={getCategoryColor(addon.category)} variant="secondary">
                            {addon.category}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handlePurchaseAddon(addon.name.toLowerCase().replace(' ', '-'), addon.price)}
                          className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                        >
                          ${addon.price}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-crys-white">Your Wallet</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => toast.info("Buy Credits feature coming soon!")}
                    variant="outline"
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy Credits
                  </Button>
                  <Button 
                    onClick={handleBrowseAddons}
                    className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Browse Add-ons
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-crys-gold" />
                      <span className="text-crys-light-grey text-sm">Current Credits</span>
                    </div>
                    <div className="text-2xl font-bold text-crys-gold mb-1">{userCredits}</div>
                    <div className="text-crys-light-grey text-xs">
                      {userTier === 'advanced' ? 'Unlimited' : 'credits remaining'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-crys-gold" />
                      <span className="text-crys-light-grey text-sm">Active Tier</span>
                    </div>
                    <Badge className={getTierColor(userTier)} variant="secondary">
                      {getTierIcon(userTier)}
                      <span className="ml-1 capitalize">{userTier}</span>
                    </Badge>
                    {userTier !== 'advanced' && (
                      <Button 
                        size="sm"
                        onClick={handleUpgradePlan}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black mt-2 text-xs"
                      >
                        Upgrade Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-crys-gold" />
                      <span className="text-crys-light-grey text-sm">Owned Add-ons</span>
                    </div>
                    <div className="text-2xl font-bold text-crys-gold mb-1">{purchasedAddons.length}</div>
                    <div className="text-crys-light-grey text-xs">
                      ${totalAddonValue} total value
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-crys-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-crys-gold" />
                  Your Add-ons
                </h4>

                <div className="grid md:grid-cols-2 gap-4">
                  {purchasedAddons.map((addon) => (
                    <Card key={addon.id} className="bg-crys-graphite/30 border-crys-graphite">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center text-crys-gold">
                              {addon.icon}
                            </div>
                            <div>
                              <h4 className="text-crys-white font-medium">{addon.name}</h4>
                              <Badge className={getCategoryColor(addon.category)} variant="secondary">
                                {addon.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-crys-gold font-semibold">${addon.price}</div>
                            <div className="text-crys-light-grey text-xs">one-time</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-crys-light-grey">Purchased</span>
                            <span className="text-crys-white">{new Date(addon.purchaseDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-crys-light-grey">Usage</span>
                            <span className="text-crys-white">{addon.usageCount} times</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-crys-light-grey">Status</span>
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30 mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wallet className="w-6 h-6 text-crys-gold" />
                      <h4 className="text-crys-white font-medium">Wallet Summary</h4>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crys-gold mb-1">${totalAddonValue}</div>
                        <div className="text-crys-light-grey text-sm">Total Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crys-gold mb-1">{totalUsage}</div>
                        <div className="text-crys-light-grey text-sm">Total Uses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-crys-gold mb-1">{purchasedAddons.length}</div>
                        <div className="text-crys-light-grey text-sm">Add-ons Owned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-crys-white">Recent Activity</h3>
                <Button 
                  variant="outline" 
                  onClick={handleViewAllActivity}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                >
                  <History className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <Card key={index} className="bg-crys-graphite/30 border-crys-graphite">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                            {activity.action.includes('Mastered') ? (
                              <Music className="w-5 h-5 text-crys-gold" />
                            ) : activity.action.includes('Purchased') ? (
                              <Package className="w-5 h-5 text-crys-gold" />
                            ) : (
                              <TrendingUp className="w-5 h-5 text-crys-gold" />
                            )}
                          </div>
                          <div>
                            <div className="text-crys-white font-medium">{activity.action}</div>
                            <div className="text-crys-light-grey text-sm">{activity.details}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-crys-gold font-semibold">${activity.cost}</div>
                          <div className="text-crys-light-grey text-xs">{activity.time}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6 space-y-6">
              <h3 className="text-xl font-semibold text-crys-white">Account Settings</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <User className="w-5 h-5 text-crys-gold" />
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-crys-light-grey text-sm">Full Name</label>
                      <div className="text-crys-white">{userData.name}</div>
                    </div>
                    <div>
                      <label className="text-crys-light-grey text-sm">Email</label>
                      <div className="text-crys-white">{userData.email}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleEditProfile}
                      className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                    >
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-crys-gold" />
                      Billing & Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-crys-light-grey text-sm">Current Plan</label>
                      <div className="flex items-center gap-2">
                        <Badge className={getTierColor(userTier)}>
                          {getTierIcon(userTier)}
                          <span className="ml-1 capitalize">{userTier}</span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-crys-light-grey text-sm">Next Billing</label>
                      <div className="text-crys-white">February 15, 2025</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleUpgradePlan}
                        className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                      >
                        Upgrade Plan
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleBilling}
                        className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/50"
                      >
                        Manage Billing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-crys-gold" />
                      Add-ons & Marketplace
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-crys-light-grey text-sm">Owned Add-ons</label>
                      <div className="text-crys-white">{purchasedAddons.length} active</div>
                    </div>
                    <div>
                      <label className="text-crys-light-grey text-sm">Total Value</label>
                      <div className="text-crys-white">${totalAddonValue}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleBrowseAddons}
                      className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 w-full"
                    >
                      Browse Marketplace
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-crys-graphite/30 border-crys-graphite">
                  <CardHeader>
                    <CardTitle className="text-crys-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-crys-gold" />
                      Support & Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={handleSupport}
                      className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 w-full"
                    >
                      Help Center
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => toast.info("Contact support feature coming soon!")}
                      className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/50 w-full"
                    >
                      Contact Support
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => toast.info("Documentation coming soon!")}
                      className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/50 w-full"
                    >
                      API Documentation
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile && (
        <ProfileEditModal
          userData={userData}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showBilling && (
        <BillingModal
          userTier={userTier}
          onClose={() => setShowBilling(false)}
          onUpgradePlan={handleUpgradePlan}
        />
      )}

      {showAddons && (
        <AddonsMarketplace
          userTier={userTier}
          onClose={() => setShowAddons(false)}
          onPurchase={handlePurchaseAddon}
          onUpgrade={handleUpgradePlan}
        />
      )}
    </>
  );
}