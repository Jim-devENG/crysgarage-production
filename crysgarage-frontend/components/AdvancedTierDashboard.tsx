import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { UploadInterface } from "./UploadInterface";
import { 
  Music, 
  Zap, 
  Download, 
  Clock, 
  Headphones,
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
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">Advanced Professional Studio</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-4">
          Advanced Manual
          <span className="block text-crys-gold">Mastering Suite</span>
        </h1>
        
        <p className="text-xl text-crys-light-grey mb-8 max-w-3xl mx-auto">
          Complete mastering control with real-time parameters, unlimited sessions, 
          and professional-grade tools for mastering engineers and serious producers.
        </p>
        
        {/* Unlimited Badge */}
        <div className="inline-flex items-center gap-4 bg-crys-graphite/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full pulse-gold"></div>
            <span className="text-crys-white">Mastering Sessions:</span>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-purple-500/20 text-purple-400 text-lg px-3 py-1 flex items-center gap-1"
          >
            <Infinity className="w-4 h-4" />
            Unlimited
          </Badge>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey mb-12">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-crys-gold" />
            <span>Real-time controls</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-crys-gold" />
            <span>Live preview</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-crys-gold" />
            <span>Professional analysis</span>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <UploadInterface onFileUpload={onFileUpload} />
      
      {/* Advanced Tier Features Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-16 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sliders className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white mb-2">Manual Controls</h3>
            <p className="text-crys-light-grey text-sm">
              8-band EQ, compression, limiting with real-time adjustment
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Full Access</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white mb-2">Live Preview</h3>
            <p className="text-crys-light-grey text-sm">
              Hear changes instantly with A/B comparison capabilities
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Real-time</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white mb-2">Pro Analysis</h3>
            <p className="text-crys-light-grey text-sm">
              Spectrum analyzer, loudness meters, phase correlation
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Advanced</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Infinity className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white mb-2">Unlimited</h3>
            <p className="text-crys-light-grey text-sm">
              No session limits, unlimited file size, all features
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Everything</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Features */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-crys-gold" />
              Manual Mastering Tools
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-crys-gold text-sm font-medium">EQ & Dynamics</h4>
                <ul className="space-y-1 text-crys-light-grey text-xs">
                  <li>• 8-band graphic EQ</li>
                  <li>• Multiband compression</li>
                  <li>• Dynamic EQ</li>
                  <li>• Stereo imaging</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-crys-gold text-sm font-medium">Limiting & Effects</h4>
                <ul className="space-y-1 text-crys-light-grey text-xs">
                  <li>• Advanced limiting</li>
                  <li>• Harmonic enhancement</li>
                  <li>• Tape saturation</li>
                  <li>• Mid-side processing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-crys-gold" />
              Analysis & Monitoring
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-crys-gold text-sm font-medium">Visual Analysis</h4>
                <ul className="space-y-1 text-crys-light-grey text-xs">
                  <li>• Real-time spectrum</li>
                  <li>• Loudness metering</li>
                  <li>• Phase correlation</li>
                  <li>• Waveform display</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-crys-gold text-sm font-medium">Reference Tools</h4>
                <ul className="space-y-1 text-crys-light-grey text-xs">
                  <li>• A/B comparison</li>
                  <li>• Reference matching</li>
                  <li>• Before/after toggle</li>
                  <li>• Bypass controls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality & Format Options */}
      <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30 mb-12">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-crys-white text-center mb-6">
            Complete Quality & Format Support
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <FileAudio className="w-8 h-8 text-crys-gold mx-auto mb-3" />
              <h4 className="text-crys-white font-medium mb-2">All Sample Rates</h4>
              <p className="text-crys-light-grey text-sm">44.1kHz to 192kHz</p>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 mt-2">
                Included
              </Badge>
            </div>
            <div className="text-center">
              <Settings className="w-8 h-8 text-crys-gold mx-auto mb-3" />
              <h4 className="text-crys-white font-medium mb-2">All Bit Depths</h4>
              <p className="text-crys-light-grey text-sm">16/24/32-bit processing</p>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 mt-2">
                Included
              </Badge>
            </div>
            <div className="text-center">
              <Music className="w-8 h-8 text-crys-gold mx-auto mb-3" />
              <h4 className="text-crys-white font-medium mb-2">All Genres</h4>
              <p className="text-crys-light-grey text-sm">Every genre optimization</p>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 mt-2">
                Included
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Workflow */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-audio-panel-bg border-audio-panel-border text-center">
          <CardContent className="p-4">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-crys-gold font-bold">1</span>
            </div>
            <h4 className="text-crys-white text-sm font-medium">Upload & Analyze</h4>
            <p className="text-crys-light-grey text-xs mt-1">Automatic audio analysis</p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border text-center">
          <CardContent className="p-4">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-crys-gold font-bold">2</span>
            </div>
            <h4 className="text-crys-white text-sm font-medium">Manual Control</h4>
            <p className="text-crys-light-grey text-xs mt-1">Real-time parameter adjustment</p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border text-center">
          <CardContent className="p-4">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-crys-gold font-bold">3</span>
            </div>
            <h4 className="text-crys-white text-sm font-medium">Live Preview</h4>
            <p className="text-crys-light-grey text-xs mt-1">A/B comparison & feedback</p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border text-center">
          <CardContent className="p-4">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-crys-gold font-bold">4</span>
            </div>
            <h4 className="text-crys-white text-sm font-medium">Export & Share</h4>
            <p className="text-crys-light-grey text-xs mt-1">Multiple formats ready</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}