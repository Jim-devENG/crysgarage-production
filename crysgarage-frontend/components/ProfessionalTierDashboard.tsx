
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
  CheckCircle,
  TrendingUp,
  Settings,
  FileAudio
} from "lucide-react";

interface ProfessionalTierDashboardProps {
  onFileUpload: (file: File) => void;
  credits: number;
}

export function ProfessionalTierDashboard({ onFileUpload, credits }: ProfessionalTierDashboardProps) {
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
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-crys-gold animate-spin mx-auto mb-4" />
          <h2 className="text-crys-white text-xl font-semibold mb-2">Loading Professional Tier Dashboard</h2>
          <p className="text-crys-light-grey">Preparing your advanced mastering experience...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
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
    name: 'Professional Tier',
    max_file_size: 200,
    max_tracks_per_month: 20,
    supported_formats: ['wav', 'mp3', 'flac'],
    supported_genres: ['afrobeats', 'gospel', 'hip_hop', 'highlife'],
    processing_quality: 'high',
    download_formats: ['wav', 'mp3'],
    features: [
      'Advanced audio mastering',
      'High quality output',
      'All genres supported',
      'Priority processing',
      'Custom processing settings',
      'Professional support'
    ],
    limitations: [
      'No unlimited processing',
      'No advanced analytics',
      'No custom presets'
    ]
  };

  const dashboard = tierDashboard || {
    user_info: {
      name: 'User',
      email: '',
      tier: 'professional',
      credits: credits,
      join_date: ''
    },
    audio_stats: {
      total_tracks: 0,
      recent_tracks: []
    },
    tier_specific: {
      tracks_remaining: 20,
      processing_queue: [],
      quick_actions: {
        upload_audio: true,
        view_analytics: true,
        manage_presets: true,
        contact_support: true
      }
    }
  };

  const tracksRemaining = dashboard.tier_specific.tracks_remaining || 20;
  const processingQueue = dashboard.tier_specific.processing_queue || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-crys-gold/10 border border-crys-gold/30 rounded-full px-4 py-2 mb-6">
          <Star className="w-4 h-4 text-crys-gold" />
          <span className="text-crys-gold text-sm">Professional Tier</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-4">
          Professional
          <span className="block text-crys-gold">Audio Mastering</span>
        </h1>
        
        <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
          Advanced mastering with high-quality output, priority processing, and professional features.
        </p>
        
        {/* Credits Display */}
        <div className="inline-flex items-center gap-4 bg-crys-graphite/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-crys-gold rounded-full pulse-gold"></div>
            <span className="text-crys-white">Professional Credits:</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`
              ${credits > 20 ? 'bg-green-500/20 text-green-400' : 
                credits > 5 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              } text-lg px-3 py-1
            `}
          >
            {credits === -1 ? '∞ Unlimited' : `${credits} remaining`}
          </Badge>
          {credits <= 5 && credits > 0 && (
            <span className="text-yellow-400 text-sm">⚠️ Running low</span>
          )}
          {credits === 0 && (
            <span className="text-red-400 text-sm">❌ Exhausted</span>
          )}
        </div>

        {/* Tracks Remaining */}
        <div className="inline-flex items-center gap-4 bg-crys-graphite/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-crys-gold" />
            <span className="text-crys-white">Tracks Remaining This Month:</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`
              ${tracksRemaining > 5 ? 'bg-green-500/20 text-green-400' : 
                tracksRemaining > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              } text-lg px-3 py-1
            `}
          >
            {tracksRemaining === -1 ? '∞ Unlimited' : `${tracksRemaining} / ${features.max_tracks_per_month}`}
          </Badge>
          {tracksRemaining <= 5 && tracksRemaining > 0 && (
            <span className="text-yellow-400 text-sm">⚠️ Running low</span>
          )}
          {tracksRemaining === 0 && (
            <span className="text-red-400 text-sm">❌ Monthly limit reached</span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey mb-12">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-crys-gold" />
            <span>Priority processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-crys-gold" />
            <span>{features.supported_genres.join(', ')} genres</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-crys-gold" />
            <span>Download enabled</span>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <UploadInterface 
        onFileUpload={onFileUpload}
        disabled={credits <= 0 || (tracksRemaining <= 0 && tracksRemaining !== -1)}
      />

      {/* Processing Queue */}
      {processingQueue.length > 0 && (
        <Card className="bg-audio-panel-bg border-audio-panel-border mt-8">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-crys-gold" />
              Processing Queue
            </h3>
            <div className="space-y-3">
              {processingQueue.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-crys-graphite/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileAudio className="w-4 h-4 text-crys-gold" />
                    <div>
                      <p className="text-crys-white text-sm font-medium">{item.file_name}</p>
                      <p className="text-crys-light-grey text-xs">{item.genre} • {item.tier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-crys-gold rounded-full animate-pulse"></div>
                    <span className="text-crys-gold text-sm">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Professional Tier Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Advanced AI Mastering</h3>
            <p className="text-crys-light-grey text-sm">
              Professional-grade mastering with custom processing settings
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">{features.processing_quality} Quality</h3>
            <p className="text-crys-light-grey text-sm">
              {features.processing_quality === 'high' ? '48kHz/24-bit' : '96kHz/32-bit'} processing for professional results
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Download Enabled</h3>
            <p className="text-crys-light-grey text-sm">
              Download your mastered tracks in {features.download_formats.join(', ')} formats
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="bg-crys-charcoal/30 border-crys-graphite">
        <CardContent className="p-6">
          <h3 className="text-crys-white text-lg mb-4">Your Professional Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{dashboard.audio_stats.total_tracks}</div>
              <div className="text-crys-light-grey text-sm">Tracks Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{credits === -1 ? '∞' : credits}</div>
              <div className="text-crys-light-grey text-sm">Credits Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{features.supported_formats.length}</div>
              <div className="text-crys-light-grey text-sm">Formats Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{features.supported_genres.length}</div>
              <div className="text-crys-light-grey text-sm">Genres Supported</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Features */}
      <Card className="bg-crys-gold/5 border-crys-gold/30 mt-8">
        <CardContent className="p-6">
          <h3 className="text-crys-gold text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Professional Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-crys-white font-medium mb-2">Included Features:</h4>
              <ul className="text-crys-light-grey text-sm space-y-1">
                {features.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-crys-gold flex-shrink-0" />
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
                <li>• Monthly tracks: {features.max_tracks_per_month === -1 ? 'Unlimited' : features.max_tracks_per_month}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}