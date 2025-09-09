import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
// Tabs removed
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  PlayCircle,
  Zap,
  Music,
  Settings,
  Download,
  Clock,
  Star
} from "lucide-react";

interface HelpPageProps {
  onGetStarted: () => void;
}

export function HelpPage({ onGetStarted }: HelpPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // Tabs removed: single page layout


  const contactOptions = [
    {
      method: 'Email Support',
      description: 'Send us a detailed message',
      availability: 'Response within 4 hours',
      icon: <Mail className="w-6 h-6" />,
      action: 'Send Email',
      primary: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold mb-4">
            Help & Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-crys-white mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
            Find answers to common questions, explore tutorials, or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-crys-light-grey" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-crys-graphite/30 border-crys-graphite text-crys-white"
            />
          </div>
        </div>

        {/* Quick Actions - removed Live Chat and Documentation cards as requested */}

        {/* Getting Started */}
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-crys-gold" />
                    Your First Master
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-crys-gold text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="text-crys-white font-medium">Choose Your Tier</h4>
                        <p className="text-crys-light-grey text-sm">Start with Free tier for 5 credits or upgrade for more features</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-crys-gold text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="text-crys-white font-medium">Upload Your Track</h4>
                        <p className="text-crys-light-grey text-sm">Drag and drop your audio file (WAV, MP3, FLAC supported)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-crys-gold text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="text-crys-white font-medium">Configure Settings</h4>
                        <p className="text-crys-light-grey text-sm">Select genre, quality, and processing options</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-crys-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-crys-gold text-sm font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="text-crys-white font-medium">Get Your Master</h4>
                        <p className="text-crys-light-grey text-sm">Download your professionally mastered track</p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={onGetStarted}
                    className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black w-full"
                  >
                    Try It Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-crys-gold" />
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-crys-white font-medium">Upload Quality Audio</h4>
                        <p className="text-crys-light-grey text-sm">Use WAV or FLAC files at 24-bit/44.1kHz or higher for best results</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-crys-white font-medium">Leave Headroom</h4>
                        <p className="text-crys-light-grey text-sm">Keep your mix peaks around -6dB to -3dB for optimal processing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-crys-white font-medium">Choose the Right Genre</h4>
                        <p className="text-crys-light-grey text-sm">Accurate genre selection ensures optimal processing algorithms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-crys-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-crys-white font-medium">Use Reference Tracks</h4>
                        <p className="text-crys-light-grey text-sm">Compare your master to professionally released tracks in your genre</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>

        {/* Contact */}
        <div className="space-y-8 mt-12">
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <Card key={index} className="bg-audio-panel-bg border-audio-panel-border text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4 text-crys-gold">
                      {option.icon}
                    </div>
                    <h3 className="text-crys-white font-semibold mb-2">{option.method}</h3>
                    <p className="text-crys-light-grey text-sm mb-2">{option.description}</p>
                    <p className="text-crys-gold text-xs mb-4">{option.availability}</p>
                    <Button 
                      onClick={() => {
                        window.open('mailto:info@crysgarage.studio', '_blank');
                      }}
                      className={option.primary ? 
                        "bg-crys-gold hover:bg-crys-gold-muted text-crys-black w-full" : 
                        "border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10 w-full"
                      }
                      variant={option.primary ? "default" : "outline"}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-crys-gold/10 via-crys-gold/5 to-crys-gold/10 border-crys-gold/30">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-crys-white mb-4">
                  Still need help?
                </h3>
                <p className="text-crys-light-grey mb-6">
                  Our support team is standing by to help you get the most out of Crys Garage Studio.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => window.open('mailto:info@crysgarage.studio', '_blank')}
                    variant="outline"
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}