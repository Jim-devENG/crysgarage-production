import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { UploadInterface } from "./UploadInterface";
import { tierAPI, TierFeatures, TierDashboard } from "../services/api";
import { 
  Music, 
  Zap, 
  Download, 
  Clock, 
  Headphones,
  Gift,
  CreditCard,
  Star,
  Lock,
  AlertTriangle,
  X,
  Loader2,
  Crown,
  CheckCircle,
  TrendingUp,
  Settings,
  FileAudio,
  Sliders,
  Eye,
  Infinity,
  BarChart3
} from "lucide-react";

interface AdvancedTierDashboardProps {
  onFileUpload: (file: File) => void;
}

export function AdvancedTierDashboard({ onFileUpload }: AdvancedTierDashboardProps) {
  const [tierFeatures, setTierFeatures] = useState<TierFeatures | null>(null);
  const [tierDashboard, setTierDashboard] = useState<TierDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tier-specific data on component mount
  useEffect(() => {
    const fetchTierData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tier features and dashboard data
        const [featuresResponse, dashboardResponse] = await Promise.all([
          tierAPI.getTierFeatures(),
          tierAPI.getTierDashboard()
        ]);

        setTierFeatures(featuresResponse.features);
        setTierDashboard(dashboardResponse.dashboard);
      } catch (err: any) {
        console.error('Failed to fetch tier data:', err);
        setError(err.response?.data?.message || 'Failed to load tier information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTierData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-crys-gold animate-spin mx-auto mb-4" />
          <h2 className="text-crys-white text-xl font-semibold mb-2">Loading Advanced Tier Dashboard</h2>
          <p className="text-crys-light-grey">Preparing your master-level mastering experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <h2 className="text-crys-white text-xl font-semibold mb-2">Failed to Load Dashboard</h2>
          <p className="text-crys-light-grey mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Get tier-specific data
  const features = tierFeatures || {
    name: 'Advanced Tier',
    max_file_size: 500,
    max_tracks_per_month: -1,
    supported_formats: ['wav', 'mp3', 'flac', 'aiff'],
    supported_genres: ['afrobeats', 'gospel', 'hip_hop', 'highlife'],
    processing_quality: 'master',
    download_formats: ['wav', 'mp3', 'flac'],
    features: [
      'Master quality audio mastering',
      'Unlimited processing',
      'All genres and formats',
      'Custom presets',
      'Advanced analytics',
      'Priority support',
      'Custom processing algorithms'
    ],
    limitations: [
      'No limitations'
    ]
  };

  const dashboard = tierDashboard || {
    user_info: {
      name: 'User',
      email: '',
      tier: 'advanced',
      credits: -1,
      join_date: ''
    },
    audio_stats: {
      total_tracks: 0,
      recent_tracks: []
    },
    tier_specific: {
      unlimited_tracks: true,
      advanced_analytics: {},
      quick_actions: {
        upload_audio: true,
        view_analytics: true,
        manage_presets: true,
        contact_support: true,
        custom_algorithms: true
      }
    }
  };

  const analytics = dashboard.tier_specific.advanced_analytics || {};

  return (
    <div className="max-w-7xl mx-auto" style={{ marginTop: '-80px', paddingTop: '80px' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">Advanced Tier</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-4">
          Advanced
          <span className="block text-crys-gold">Mastering Studio</span>
        </h1>
        
        <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
          Master-level audio processing with unlimited capabilities, custom algorithms, and advanced analytics.
        </p>
        
        {/* Unlimited Status */}
        <div className="inline-flex items-center gap-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <Infinity className="w-4 h-4 text-purple-400" />
            <span className="text-crys-white">Unlimited Processing</span>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-purple-500/20 text-purple-400 text-lg px-3 py-1"
          >
            ∞ Unlimited
          </Badge>
          <span className="text-purple-400 text-sm">✨ Master tier</span>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey mb-12">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-crys-gold" />
            <span>Priority processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-crys-gold" />
            <span>All genres supported</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-crys-gold" />
            <span>All formats available</span>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <UploadInterface 
        onFileUpload={onFileUpload}
        disabled={false}
      />

      {/* Advanced Analytics */}
      <Card className="bg-audio-panel-bg border-audio-panel-border mt-8">
        <CardContent className="p-6">
          <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-crys-gold" />
            Advanced Analytics
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{dashboard.audio_stats.total_tracks}</div>
              <div className="text-crys-light-grey text-sm">Total Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">∞</div>
              <div className="text-crys-light-grey text-sm">Credits Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{features.supported_formats.length}</div>
              <div className="text-crys-light-grey text-sm">Formats Supported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{features.supported_genres.length}</div>
              <div className="text-crys-light-grey text-sm">Genres Available</div>
            </div>
            </div>
          </CardContent>
        </Card>
        
      {/* Advanced Tier Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Master AI Processing</h3>
            <p className="text-crys-light-grey text-sm">
              Custom algorithms and master-quality processing for professional studios
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sliders className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">{features.processing_quality} Quality</h3>
            <p className="text-crys-light-grey text-sm">
              {features.processing_quality === 'master' ? '96kHz/32-bit' : '192kHz/32-bit'} processing for studio-quality results
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">All Formats</h3>
            <p className="text-crys-light-grey text-sm">
              Download in {features.download_formats.join(', ')} formats for any platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features */}
      <Card className="bg-purple-500/5 border-purple-500/30 mt-8">
          <CardContent className="p-6">
          <h3 className="text-purple-400 text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Advanced Features
            </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-crys-white font-medium mb-2">Included Features:</h4>
              <ul className="text-crys-light-grey text-sm space-y-1">
                {features.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                </ul>
              </div>
            <div>
              <h4 className="text-crys-white font-medium mb-2">Technical Specs:</h4>
              <ul className="text-crys-light-grey text-sm space-y-1">
                <li>• Max file size: {features.max_file_size}MB</li>
                <li>• Formats: {features.supported_formats.join(', ')}</li>
                <li>• Quality: {features.processing_quality}</li>
                <li>• Monthly tracks: Unlimited</li>
                <li>• Custom algorithms: Available</li>
                <li>• Priority support: 24/7</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
      {/* Quick Actions */}
      <Card className="bg-audio-panel-bg border-audio-panel-border mt-8">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-crys-gold" />
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 h-12"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline"
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 h-12"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Manage Presets
            </Button>
            <Button 
              variant="outline"
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 h-12"
            >
              <Eye className="w-4 h-4 mr-2" />
              Custom Algorithms
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}