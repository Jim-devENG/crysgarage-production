import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PaymentModal } from "./PaymentModal";
import { 
  Search, 
  Music, 
  Volume2, 
  Star, 
  Settings,
  Download,
  X,
  Filter,
  TrendingUp,
  Zap,
  Headphones,
  Mic,
  Sliders,
  Sparkles,
  BookOpen,
  Play,
  Users,
  Palette,
  Activity,
  Layers,
  MonitorSpeaker,
  Radio,
  Disc3,
  Gauge,
  FileAudio,
  Music2,
  Music3,
  Music4,
  Lightbulb,
  Target,
  Wrench,
  ShoppingCart,
  Crown,
  Award,
  Clock,
  Globe,
  Heart,
  Gamepad2,
  Film,
  Camera,
  Podcast,
  Tv,
  Speaker,
  Smartphone,
  Laptop,
  Tablet,
  Database,
  Cloud,
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  Video,
  Image,
  PenTool,
  Brush,
  Scissors,

  Share2,
  Link2,
  MessageSquare,
  ThumbsUp,
  Coffee,
  Gift,
  CheckCircle
} from "lucide-react";

interface AddonsMarketplaceProps {
  onClose: () => void;
  onPurchase: (addonId: string, price: number) => void;
  userTier: string;
  onUpgrade?: () => void;
}

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'genre' | 'quality' | 'processing' | 'format' | 'samples' | 'presets' | 'education' | 'services' | 'tools';
  rating: number;
  purchases: number;
  tier: string[];
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  new?: boolean;
  size?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export function AddonsMarketplace({ onClose, onPurchase, userTier, onUpgrade }: AddonsMarketplaceProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Mock purchased addons - in real app this would come from props/API
  const [purchasedAddonIds] = useState<string[]>([
    'afrobeats-premium',
    'gospel-premium',
    'noise-reduction-pro',
    'hq-192khz',
    'mastering-masterclass'
  ]);

  const addons: Addon[] = [
    // GENRE PACKS
    {
      id: 'afrobeats-premium',
      name: 'Afrobeats Premium',
      description: 'Advanced Afrobeats processing with authentic percussion enhancement and vocal clarity optimization.',
      price: 1,
      category: 'genre',
      rating: 4.9,
      purchases: 1247,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['Authentic drum processing', 'Vocal clarity', 'Bass enhancement', 'Stereo widening'],
      icon: <Music className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'gospel-premium',
      name: 'Gospel Premium',
      description: 'Specialized processing for gospel music with enhanced vocal presence and harmonic richness.',
      price: 1,
      category: 'genre',
      rating: 4.7,
      purchases: 634,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['Vocal enhancement', 'Harmonic processing', 'Reverb optimization', 'Dynamic control'],
      icon: <Music className="w-5 h-5" />
    },
    {
      id: 'hip-hop-premium',
      name: 'Hip-Hop Premium',
      description: 'Street-ready hip-hop mastering with punchy drums, crisp highs, and deep bass.',
      price: 1,
      category: 'genre',
      rating: 4.8,
      purchases: 956,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['Punchy drums', 'Bass enhancement', 'Vocal presence', 'Modern loudness'],
      icon: <Mic className="w-5 h-5" />
    },
    {
      id: 'amapiano-deluxe',
      name: 'Amapiano Deluxe',
      description: 'Authentic South African Amapiano mastering with deep piano processing and log drum enhancement.',
      price: 2,
      category: 'genre',
      rating: 4.8,
      purchases: 789,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['Piano processing', 'Log drum enhancement', 'Bass boost', 'Spatial imaging'],
      icon: <Music2 className="w-5 h-5" />,
      popular: true
    },

    // PROCESSING TOOLS
    {
      id: 'noise-reduction-pro',
      name: 'Advanced Noise Reduction',
              description: 'Crys Garage Engine-powered noise reduction that preserves musical content while removing unwanted artifacts.',
      price: 5,
      category: 'processing',
      rating: 4.8,
      purchases: 892,
      tier: ['free professional', 'professional', 'advanced'],
              features: ['Crys Garage Engine-powered detection', 'Musical content preservation', 'Real-time processing', 'Spectral repair'],
      icon: <Volume2 className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'harmonic-enhancer',
      name: 'Harmonic Enhancement',
      description: 'Add warmth and richness with intelligent harmonic generation and tube-style saturation.',
      price: 4,
      category: 'processing',
      rating: 4.5,
      purchases: 723,
      tier: ['professional', 'advanced'],
      features: ['Harmonic generation', 'Tube saturation', 'Warmth enhancement', 'Analog modeling'],
      icon: <Sparkles className="w-5 h-5" />
    },

    // QUALITY UPGRADES
    {
      id: 'hq-192khz',
      name: '192kHz Processing',
      description: 'Ultra-high quality 192kHz/32-bit processing for audiophile-grade masters.',
      price: 5,
      category: 'quality',
      rating: 4.6,
      purchases: 445,
      tier: ['professional', 'advanced'],
      features: ['192kHz sample rate', '32-bit processing', 'Extended frequency response', 'Minimal aliasing'],
      icon: <Star className="w-5 h-5" />,
      new: true
    },

    // SAMPLE PACKS
    {
      id: 'afrobeats-drums-vol1',
      name: 'Afrobeats Drums Vol. 1',
      description: 'Authentic Afrobeats drum samples recorded in Lagos studios with traditional instruments.',
      price: 15,
      category: 'samples',
      rating: 4.8,
      purchases: 1123,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['200+ drum samples', 'Authentic recordings', 'Multiple velocities', 'Royalty-free'],
      icon: <Disc3 className="w-5 h-5" />,
      size: '500MB',
      popular: true
    },

    // EDUCATIONAL CONTENT
    {
      id: 'mastering-masterclass',
      name: 'Mastering Masterclass',
      description: 'Complete video course on professional mastering techniques by industry experts.',
      price: 49,
      category: 'education',
      rating: 4.9,
      purchases: 1456,
      tier: ['free professional', 'professional', 'advanced'],
      features: ['12 hours of video', 'Industry experts', 'Practical exercises', 'Certificate included'],
      icon: <BookOpen className="w-5 h-5" />,
      duration: '12 hours',
      level: 'intermediate',
      popular: true
    },

    // TOOLS
    {
      id: 'reference-matching-tool',
      name: 'Reference Matching Tool',
              description: 'Crys Garage Engine-powered tool to match your master to commercial references with precision.',
      price: 25,
      category: 'tools',
      rating: 4.6,
      purchases: 567,
      tier: ['professional', 'advanced'],
              features: ['Crys Garage Engine-powered matching', 'Commercial references', 'Precision analysis', 'Auto-adjustment'],
      icon: <Target className="w-5 h-5" />,
      new: true
    }
  ];

  // Utility functions for addon states
  const isAddonOwned = (addonId: string) => purchasedAddonIds.includes(addonId);
  const isAddonAvailable = (addon: Addon) => addon.tier.includes(userTier);
  const isAddonLocked = (addon: Addon) => !addon.tier.includes(userTier);
  
  const getAddonState = (addon: Addon): 'owned' | 'available' | 'locked' => {
    if (isAddonOwned(addon.id)) return 'owned';
    if (isAddonAvailable(addon)) return 'available';
    return 'locked';
  };

  // Get tier-appropriate addons only
  const getTierRelevantAddons = () => {
    return addons.filter(addon => {
      // Free Professional: Show addons available to their tier + upgrade path addons
      if (userTier === 'free professional') {
        return addon.tier.includes('free professional') || 
               addon.tier.includes('professional') || 
               addon.tier.includes('advanced');
      }
      
      // Professional: Show addons available to their tier + upgrade path addons  
      if (userTier === 'professional') {
        return addon.tier.includes('professional') || 
               addon.tier.includes('advanced');
      }
      
      // Advanced: Show all addons since they have access to everything
      if (userTier === 'advanced') {
        return true;
      }
      
      // Default: show all addons
      return true;
    });
  };

  const tierRelevantAddons = getTierRelevantAddons();

  // Filter counts for tabs (based on tier-relevant addons only)
  const getFilterCounts = () => {
    const owned = tierRelevantAddons.filter(addon => isAddonOwned(addon.id)).length;
    const available = tierRelevantAddons.filter(addon => isAddonAvailable(addon) && !isAddonOwned(addon.id)).length;
    const locked = tierRelevantAddons.filter(addon => isAddonLocked(addon)).length;
    
    return {
      all: tierRelevantAddons.length,
      owned,
      available,
      locked
    };
  };

  const filterCounts = getFilterCounts();

  const filteredAddons = tierRelevantAddons
    .filter(addon => {
      const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           addon.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || addon.category === selectedCategory;
      
      // Tab filter logic
      const addonState = getAddonState(addon);
      const matchesTabFilter = 
        activeTab === 'all' ||
        (activeTab === 'owned' && addonState === 'owned') ||
        (activeTab === 'available' && addonState === 'available') ||
        (activeTab === 'locked' && addonState === 'locked');
      
      return matchesSearch && matchesCategory && matchesTabFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.purchases - a.purchases;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'genre': return 'bg-blue-500/20 text-blue-400';
      case 'quality': return 'bg-purple-500/20 text-purple-400';
      case 'processing': return 'bg-green-500/20 text-green-400';
      case 'format': return 'bg-orange-500/20 text-orange-400';
      case 'samples': return 'bg-pink-500/20 text-pink-400';
      case 'presets': return 'bg-yellow-500/20 text-yellow-400';
      case 'education': return 'bg-indigo-500/20 text-indigo-400';
      case 'services': return 'bg-red-500/20 text-red-400';
      case 'tools': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const handleAddonClick = (addon: Addon) => {
    setSelectedAddon(addon);
    setShowPaymentModal(true);
  };

  const handlePurchase = (addon: Addon) => {
    const addonState = getAddonState(addon);
    
    if (addonState === 'locked') {
      // Show tier upgrade prompt instead of purchase
      return;
    }
    
    if (addonState === 'owned') {
      // Already owned, no action needed
      return;
    }
    
    // Purchase the addon
    onPurchase(addon.id, addon.price);
  };

  const handlePaymentModalPurchase = (addonId: string, price: number) => {
    onPurchase(addonId, price);
    setShowPaymentModal(false);
    setSelectedAddon(null);
  };

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      onClose();
    }
  };

  const renderAddonCard = (addon: Addon) => {
    const addonState = getAddonState(addon);
    const isOwned = addonState === 'owned';
    const isAvailable = addonState === 'available';
    const isLocked = addonState === 'locked';
    
    // Determine minimum required tier for this addon
    const getMinRequiredTier = (addon: Addon): string => {
      if (addon.tier.includes('free professional')) return 'free professional';
      if (addon.tier.includes('professional')) return 'professional';
      return 'advanced';
    };
    
    const minRequiredTier = getMinRequiredTier(addon);

    return (
      <Card 
        key={addon.id} 
        className={`
          bg-crys-graphite/30 border-crys-graphite hover:border-crys-gold/50 transition-all duration-200 cursor-pointer
          ${isLocked ? 'opacity-60' : ''} 
          ${isOwned ? 'border-green-500/30 bg-green-500/5' : ''}
        `}
        onClick={() => handleAddonClick(addon)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isLocked ? 'bg-crys-graphite/50 text-crys-light-grey' : 'bg-crys-gold/20 text-crys-gold'
              }`}>
                {isLocked ? <Lock className="w-6 h-6" /> : addon.icon}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isLocked ? 'text-crys-light-grey' : 'text-crys-white'
                }`}>
                  {addon.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCategoryColor(addon.category)} variant="secondary">
                    {addon.category}
                  </Badge>
                  {/* Show tier requirement */}
                  <Badge className={isLocked ? 'bg-red-500/20 text-red-400' : 'bg-crys-gold/20 text-crys-gold'} variant="secondary">
                    {minRequiredTier === 'free professional' ? 'Free+' : 
                     minRequiredTier === 'professional' ? 'Pro+' : 'Advanced'}
                  </Badge>
                  {addon.popular && (
                    <Badge className="bg-orange-500/20 text-orange-400" variant="secondary">
                      Popular
                    </Badge>
                  )}
                  {addon.new && (
                    <Badge className="bg-green-500/20 text-green-400" variant="secondary">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${isLocked ? 'text-crys-light-grey' : 'text-crys-gold'}`}>
                ${addon.price}
              </div>
              <div className="flex items-center gap-1 text-sm text-crys-light-grey">
                <Star className="w-4 h-4 fill-current" />
                {addon.rating}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`text-sm mb-4 ${isLocked ? 'text-crys-light-grey' : 'text-crys-light-grey'}`}>
            {addon.description}
          </p>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {addon.features.slice(0, 3).map((feature, index) => (
                <span key={index} className={`text-xs px-2 py-1 rounded ${
                  isLocked ? 'bg-crys-graphite/50 text-crys-light-grey' : 'bg-crys-graphite text-crys-white'
                }`}>
                  {feature}
                </span>
              ))}
              {addon.features.length > 3 && (
                <span className={`text-xs px-2 py-1 rounded ${
                  isLocked ? 'bg-crys-graphite/50 text-crys-light-grey' : 'bg-crys-graphite text-crys-white'
                }`}>
                  +{addon.features.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-crys-light-grey">
              {addon.purchases} purchases
            </div>
            
            {isOwned ? (
              <Badge className="bg-green-500/20 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Owned
              </Badge>
            ) : isLocked ? (
              <Button
                size="sm"
                variant="outline"
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpgradeClick();
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                {minRequiredTier === 'professional' && userTier === 'free professional' ? 'Upgrade to Pro' :
                 minRequiredTier === 'advanced' && userTier !== 'advanced' ? 'Upgrade to Advanced' :
                 'Upgrade Tier'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddonClick(addon);
                }}
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy ${addon.price}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-audio-panel-bg border border-audio-panel-border rounded-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-crys-graphite flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-crys-white">Add-ons Marketplace</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-crys-light-grey text-sm">Enhance your mastering experience with premium add-ons</p>
                <Badge className="bg-crys-gold/20 text-crys-gold" variant="secondary">
                  {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-crys-light-grey" />
              <Input
                placeholder="Search add-ons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-crys-graphite/30 border border-crys-graphite rounded-md text-crys-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="genre">Genres</option>
              <option value="processing">Processing</option>
              <option value="quality">Quality</option>
              <option value="samples">Sample Packs</option>
              <option value="education">Education</option>
              <option value="tools">Tools</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-crys-graphite/30 border border-crys-graphite rounded-md text-crys-white text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0">
            <TabsList className="grid w-full grid-cols-4 bg-crys-graphite/50 mx-6 mt-4 mb-0">
              <TabsTrigger value="all" className="text-crys-white">
                All ({filterCounts.all})
              </TabsTrigger>
              <TabsTrigger value="owned" className="text-crys-white">
                Owned ({filterCounts.owned})
              </TabsTrigger>
              <TabsTrigger value="available" className="text-crys-white">
                Available ({filterCounts.available})
              </TabsTrigger>
              <TabsTrigger value="locked" className="text-crys-white">
                Locked ({filterCounts.locked})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="all" className="p-6 space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAddons.map(renderAddonCard)}
              </div>
            </TabsContent>

            <TabsContent value="owned" className="p-6 space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAddons.map(renderAddonCard)}
              </div>
            </TabsContent>

            <TabsContent value="available" className="p-6 space-y-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAddons.map(renderAddonCard)}
              </div>
            </TabsContent>

            <TabsContent value="locked" className="p-6 space-y-6 m-0">
              <div className="text-center mb-6">
                <h3 className="text-xl text-crys-white mb-2">Locked Add-ons</h3>
                <p className="text-crys-light-grey">
                  {userTier === 'free professional' 
                    ? 'Upgrade to Professional or Advanced tier to access these premium features'
                    : userTier === 'professional'
                    ? 'Upgrade to Advanced tier to access these exclusive features'
                    : 'These add-ons require a higher tier'
                  }
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAddons.map(renderAddonCard)}
              </div>
            </TabsContent>

            {filteredAddons.length === 0 && (
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 text-crys-light-grey mx-auto mb-4" />
                <p className="text-crys-light-grey">No add-ons found matching your criteria</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAddon && (
        <PaymentModal
          {...{
            addon: selectedAddon,
            userTier,
            isOwned: isAddonOwned(selectedAddon.id),
            isLocked: isAddonLocked(selectedAddon),
            onClose: () => {
              setShowPaymentModal(false);
              setSelectedAddon(null);
            },
            onPurchase: handlePaymentModalPurchase,
            onUpgrade: handleUpgradeClick
          } as any}
        />
      )}
    </div>
  );
}