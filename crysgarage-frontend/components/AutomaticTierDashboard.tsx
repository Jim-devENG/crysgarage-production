import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { UploadInterface } from "./UploadInterface";
import { 
  Upload, 
  FileAudio, 
  Download, 
  Zap, 
  Sparkles,
  Star,
  Gift,
  LogOut,
  CreditCard,
  ShoppingCart,
  FileText
} from "lucide-react";

interface AutomaticTierDashboardProps {
  user: any;
  onUpgrade: () => void;
  onSignOut: () => void;
}

export function AutomaticTierDashboard({ user, onUpgrade, onSignOut }: AutomaticTierDashboardProps) {
  const [userCredits, setUserCredits] = useState(user.credits || 5);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleDownload = () => {
    if (userCredits > 0) {
      setUserCredits(prev => prev - 1);
      // Download logic here
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePurchaseCredits = () => {
    setUserCredits(prev => prev + 5);
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header with Tier Info */}
      <div className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Automatic Tier Dashboard</h1>
                <p className="text-amber-400 text-sm">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-white font-medium">{userCredits} Credits</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSignOut}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Automatic Tier - Free Mastering
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Upload your tracks and get professional mastering for free. Download your mastered tracks for $4.99 (5 credits).
          </p>
        </div>

        {/* Credit System Info */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border-amber-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Credit System</h3>
                  <p className="text-gray-400 text-sm">You have {userCredits} credits remaining</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-semibold">$4.99 = 5 Credits</p>
                <p className="text-gray-400 text-xs">1 Credit = 1 Download</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-semibold">Upload Your Track</h3>
            </div>
          </CardHeader>
          <CardContent>
            <UploadInterface onFileUpload={(file) => console.log('File uploaded:', file)} />
            
            <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm text-gray-400">
              <div>
                <h4 className="text-white font-medium mb-2">Supported Formats</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-amber-400" />
                    <span>WAV (up to 60MB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-amber-400" />
                    <span>MP3 (up to 60MB)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Automatic Tier Features</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Free mastering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download: $4.99 (5 credits)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Download Button */}
        <div className="text-center">
          <Button 
            onClick={handleDownload}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Download className="w-4 h-4 mr-2" />
            Test Download (1 Credit)
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Purchase Credits</h3>
                  <p className="text-gray-400 text-sm">Get 5 download credits</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">5 Credits</span>
                  <span className="text-amber-400 font-bold">$4.99</span>
                </div>
                <p className="text-gray-400 text-sm">1 credit = 1 download of mastered track</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handlePurchaseCredits}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="border-gray-600 text-gray-400 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
