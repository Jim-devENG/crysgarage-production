
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { UploadInterface } from "./UploadInterface";
import { 
  Music, 
  Zap, 
  Download, 
  Clock, 

  Star,
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
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
          <Star className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">Professional Experience</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-crys-white mb-4">
          Professional
          <span className="block text-crys-gold">Mastering Studio</span>
        </h1>
        
        <p className="text-xl text-crys-light-grey mb-8 max-w-2xl mx-auto">
          Enhanced mastering with professional features, multiple formats, 
          and full download capabilities for serious producers and artists.
        </p>
        
        {/* Credits Display */}
        <div className="inline-flex items-center gap-4 bg-crys-graphite/30 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full pulse-gold"></div>
            <span className="text-crys-white">Professional Credits:</span>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-blue-500/20 text-blue-400 text-lg px-3 py-1"
          >
            {credits} / 100
          </Badge>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-crys-light-grey mb-12">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-crys-gold" />
            <span>Under 2 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-crys-gold" />
            <span>Multiple formats</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-crys-gold" />
            <span>Full downloads</span>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <UploadInterface onFileUpload={onFileUpload} />
      
      {/* Professional Tier Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Enhanced AI Processing</h3>
            <p className="text-crys-light-grey text-sm">
              Advanced Crys Garage Engine with genre-specific optimization and better quality
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Included</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Quality Options</h3>
            <p className="text-crys-light-grey text-sm">
              44.1kHz/48kHz, up to 192kHz (+$5), 16-bit to 32-bit processing
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Multiple Options</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-crys-white text-lg mb-2">Full Downloads</h3>
            <p className="text-crys-light-grey text-sm">
              Download WAV, MP3, FLAC formats ready for streaming platforms
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Unlimited</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Professional Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-crys-gold" />
              Genre Support
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey text-sm">Free Genres</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Pop, Rock, Reggae
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-crys-light-grey text-sm">Premium Genres</span>
                <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                  $1 each
                </Badge>
              </div>
              <p className="text-crys-light-grey text-xs">
                Includes Afrobeats, Gospel, Hip-Hop, R&B, Jazz, Electronic, and more
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardContent className="p-6">
            <h3 className="text-crys-white text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-crys-gold" />
              Enhanced Processing
            </h3>
            <ul className="space-y-2 text-crys-light-grey text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>444Hz tuning correction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Advanced noise reduction</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Streaming optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Dynamic range enhancement</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Usage Statistics */}
      <Card className="bg-crys-charcoal/30 border-crys-graphite">
        <CardContent className="p-6">
          <h3 className="text-crys-white text-lg mb-4">Your Professional Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{100 - credits}</div>
              <div className="text-crys-light-grey text-sm">Tracks Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">{credits}</div>
              <div className="text-crys-light-grey text-sm">Credits Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">3</div>
              <div className="text-crys-light-grey text-sm">Formats Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold mb-1">∞</div>
              <div className="text-crys-light-grey text-sm">Downloads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}