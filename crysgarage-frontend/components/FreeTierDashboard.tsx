import { useState } from 'react';
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
  Gift,
  CreditCard,
  Star,
  Lock,
  AlertTriangle,
  X
} from "lucide-react";

interface FreeTierDashboardProps {
  onFileUpload: (file: File) => void;
  onUpgrade: () => void;
  credits: number;
}

export function FreeTierDashboard({ onFileUpload, onUpgrade, credits }: FreeTierDashboardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleFileUpload = (file: File) => {
    if (credits <= 0) {
      setShowPaymentModal(true);
      return;
    }
    onFileUpload(file);
  };

  const handleUpgradeClick = () => {
    setShowPaymentModal(false);
    onUpgrade();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
          <Gift className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Free Trial Experience</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-4">
          Try Professional
          <span className="block text-crys-gold">Mastering for Free</span>
        </h1>
        
        <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
          Experience our Crys Garage Engine with 5 free mastering credits. 
          Perfect for testing our platform before upgrading.
        </p>
        
        {/* Credits Display */}
        <div className="inline-flex items-center gap-4 bg-crys-graphite/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full pulse-gold"></div>
            <span className="text-crys-white">Free Credits Remaining:</span>
          </div>
          <Badge 
            variant="secondary" 
            className={`
              ${credits > 2 ? 'bg-green-500/20 text-green-400' : 
                credits > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              } text-lg px-3 py-1
            `}
          >
            {credits} / 5
          </Badge>
          {credits <= 2 && credits > 0 && (
            <span className="text-yellow-400 text-sm">⚠️ Running low</span>
          )}
          {credits === 0 && (
            <span className="text-red-400 text-sm">❌ Exhausted</span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey mb-12">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-crys-gold" />
            <span>Under 2 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-crys-gold" />
            <span>Basic genres included</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-crys-gold" />
            <span>Preview only</span>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <UploadInterface 
        onFileUpload={handleFileUpload}
        disabled={credits <= 0}
      />
      
      {/* Free Tier Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Basic AI Mastering</h3>
            <p className="text-crys-light-grey text-sm">
              Experience our Crys Garage Engine with automatic genre optimization
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Standard Quality</h3>
            <p className="text-crys-light-grey text-sm">
              44.1kHz/16-bit processing perfect for streaming platforms
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border opacity-60">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-graphite/20 rounded-lg flex items-center justify-center mx-auto mb-4 relative">
              <Download className="w-6 h-6 text-crys-light-grey" />
              <Lock className="w-3 h-3 text-red-400 absolute -top-1 -right-1" />
            </div>
            <h3 className="text-crys-light-grey text-lg mb-2">Preview Only</h3>
            <p className="text-crys-light-grey text-sm">
              Listen to your master, upgrade to download files
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Limitations Notice */}
      <Card className="bg-yellow-500/5 border-yellow-500/30 mb-12">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Free Tier Limitations</h3>
              <ul className="text-crys-light-grey text-sm space-y-1">
                <li>• Cannot download mastered files (preview only)</li>
                <li>• Limited to 5 free mastering sessions</li>
                <li>• Basic genres only (premium genres cost $1 each)</li>
                <li>• Standard quality processing (44.1kHz/16-bit)</li>
                <li>• No access to manual controls</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
        <CardContent className="p-8 text-center">
          <Star className="w-12 h-12 text-crys-gold mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-crys-white mb-4">
            Ready for Professional Features?
          </h3>
          <p className="text-crys-light-grey mb-6">
            Upgrade to Professional or Advanced tiers for downloads, higher quality, 
            and advanced mastering controls.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onUpgrade}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Upgrade Options
            </Button>
            <Button 
              variant="outline"
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              Learn More
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/20"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-audio-panel-bg border-audio-panel-border rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-crys-gold" />
                <h3 className="text-crys-white font-semibold">Credits Exhausted</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
                className="border-crys-graphite text-crys-light-grey hover:bg-crys-graphite/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-crys-light-grey mb-6">
              You've used all your free mastering credits. Upgrade to continue mastering your tracks.
            </p>
            
            <div className="space-y-4">
              <div className="bg-crys-graphite/30 rounded-lg p-4">
                <h4 className="text-crys-white font-medium mb-2">What's Next?</h4>
                <ul className="text-crys-light-grey text-sm space-y-1">
                  <li>• Professional Tier: $9 for 100 credits</li>
                  <li>• Advanced Tier: $20/month unlimited</li>
                  <li>• Download capabilities included</li>
                  <li>• Higher quality processing available</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleUpgradeClick}
                  className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black flex-1"
                >
                  Upgrade Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}