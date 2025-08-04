import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { UploadInterface } from "./UploadInterface";
import { 
  Upload, 
  FileAudio, 
  Play,
  Pause,
  Download, 
  Zap, 
  Music, 
  Headphones, 
  BarChart3,
  Activity,
  Volume2, 
  CheckCircle, 
  ArrowRight, 
  Crown,
  Star,
  DollarSign,
  Settings,
  Radio,
  Target,
  TrendingUp,
  Sparkles,
  Mic,
  Disc3,
  VolumeX,
  Volume1,
  Volume2 as Volume2Icon,
  Gauge,
  Timer,
  FileText,
  Users,
  Award,
  Gift
} from "lucide-react";

interface FreeTierDashboardProps {
  onFileUpload: (file: File) => void;
  onUpgrade: () => void;
  credits: number;
  isAuthenticated?: boolean;
}

interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number;
  size: number;
  status: 'uploading' | 'analyzing' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface AudioStats {
  loudness: number;
  peak: number;
  dynamicRange: number;
  frequencyBalance: number;
  stereoWidth: number;
}

export function FreeTierDashboard({ onFileUpload, onUpgrade, credits, isAuthenticated = true }: FreeTierDashboardProps) {
  const [uploadedFiles, setUploadedFiles] = useState<AudioFile[]>([]);
  const [currentFile, setCurrentFile] = useState<AudioFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [originalStats, setOriginalStats] = useState<AudioStats | null>(null);
  const [masteredStats, setMasteredStats] = useState<AudioStats | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [currentTimeOriginal, setCurrentTimeOriginal] = useState(0);
  const [currentTimeMastered, setCurrentTimeMastered] = useState(0);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'processing' | 'results' | 'library'>('upload');

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    const newFile: AudioFile = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      duration: 0,
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);
    setActiveTab('processing');

    // Simulate file processing
    await processFile(newFile);
  };

  // Simulate file processing
  const processFile = async (file: AudioFile) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Update file status
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'analyzing' } : f
    ));

    // Simulate analysis
    for (let i = 0; i <= 30; i += 10) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Generate original stats
    const original: AudioStats = {
      loudness: -18.5 + Math.random() * 2,
      peak: -6.0 + Math.random() * 2,
      dynamicRange: 12.0 + Math.random() * 3,
      frequencyBalance: 70 + Math.random() * 20,
      stereoWidth: 60 + Math.random() * 20
    };
    setOriginalStats(original);

    // Update file status
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'processing' } : f
    ));

    // Simulate processing
    for (let i = 30; i <= 100; i += 5) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Generate mastered stats
    const mastered: AudioStats = {
      loudness: -9.0 + Math.random() * 0.5,
      peak: -0.2 + Math.random() * 0.3,
      dynamicRange: original.dynamicRange - 5 + Math.random() * 2,
      frequencyBalance: 85 + Math.random() * 10,
      stereoWidth: 90 + Math.random() * 10
    };
    setMasteredStats(mastered);

    // Update file status
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
    ));

    setIsProcessing(false);
    setActiveTab('results');
  };

  // Audio playback functions
  const toggleOriginalPlayback = () => {
    if (!originalAudioElement && currentFile) {
      const audio = new Audio(currentFile.url);
      audio.addEventListener('timeupdate', () => setCurrentTimeOriginal(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlayingOriginal(false));
      setOriginalAudioElement(audio);
      audio.play();
      setIsPlayingOriginal(true);
    } else if (originalAudioElement) {
      if (isPlayingOriginal) {
        originalAudioElement.pause();
        setIsPlayingOriginal(false);
      } else {
        originalAudioElement.play();
        setIsPlayingOriginal(true);
      }
    }
  };

  const toggleMasteredPlayback = () => {
    if (!masteredAudioElement && currentFile) {
      const audio = new Audio(currentFile.url); // Using same URL for demo, in real app this would be mastered file
      audio.addEventListener('timeupdate', () => setCurrentTimeMastered(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlayingMastered(false));
      setMasteredAudioElement(audio);
      audio.play();
      setIsPlayingMastered(true);
    } else if (masteredAudioElement) {
      if (isPlayingMastered) {
        masteredAudioElement.pause();
        setIsPlayingMastered(false);
      } else {
        masteredAudioElement.play();
        setIsPlayingMastered(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-graphite to-crys-black text-crys-white">
      {/* Navigation Tabs */}
      <div className="bg-audio-panel-bg/30 border-b border-audio-panel-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {[
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'processing', label: 'Processing', icon: Activity },
              { id: 'results', label: 'Results', icon: BarChart3 },
              { id: 'library', label: 'Library', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-audio-panel-bg border border-audio-panel-border border-b-0 text-crys-gold' 
                      : 'text-crys-light-grey hover:text-crys-white hover:bg-audio-panel-bg/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-2">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-crys-gold" />
              </div>
              <h2 className="text-2xl font-bold text-crys-white mb-3">
                Transform Your Audio
              </h2>
              <p className="text-crys-light-grey max-w-2xl mx-auto">
                Upload your tracks and experience professional-grade mastering with our advanced audio processing technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: Radio,
                  title: "Advanced Processing",
                  description: "Professional-grade algorithms for optimal sound quality"
                },
                {
                  icon: BarChart3,
                  title: "Smart EQ",
                  description: "Intelligent frequency balancing for perfect clarity"
                },
                {
                  icon: Activity,
                  title: "Dynamic Control",
                  description: "Precise compression for radio-ready loudness"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="bg-audio-panel-bg border-audio-panel-border hover:border-crys-gold/30 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-crys-gold" />
                      </div>
                      <h3 className="text-crys-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-crys-light-grey text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upload Section */}
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-crys-gold" />
                  <h3 className="text-crys-white font-semibold">Upload Your Track</h3>
                </div>
              </CardHeader>
              <CardContent>
                <UploadInterface onFileUpload={handleFileUpload} />
                
                <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm text-crys-light-grey">
                  <div>
                    <h4 className="text-crys-white font-medium mb-2">Supported Formats</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-crys-gold" />
                        <span>WAV (up to 60MB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-crys-gold" />
                        <span>MP3 (up to 60MB)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-crys-white font-medium mb-2">Free Tier Limits</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-crys-gold" />
                        <span>3 tracks per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-crys-gold" />
                        <span>Standard processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && currentFile && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-crys-white mb-4">Processing Your Track</h2>
              <p className="text-crys-light-grey">Applying professional mastering techniques...</p>
            </div>

            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                    <FileAudio className="w-6 h-6 text-crys-gold" />
                  </div>
                  <div>
                    <h3 className="text-crys-white font-semibold">{currentFile.name}</h3>
                    <p className="text-crys-light-grey text-sm">{formatFileSize(currentFile.size)}</p>
                  </div>
                </div>

                <Progress value={processingProgress} className="h-3 mb-4" />
                <p className="text-crys-gold font-medium text-center">{processingProgress}% Complete</p>

                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-crys-white font-medium">Processing Steps</h4>
                    {[
                      { step: "Audio Analysis", completed: processingProgress >= 10 },
                      { step: "Frequency Balancing", completed: processingProgress >= 30 },
                      { step: "Dynamic Processing", completed: processingProgress >= 50 },
                      { step: "Stereo Enhancement", completed: processingProgress >= 70 },
                      { step: "Final Mastering", completed: processingProgress >= 90 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-crys-graphite'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs text-crys-light-grey">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm ${item.completed ? 'text-crys-white' : 'text-crys-light-grey'}`}>
                          {item.step}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-crys-white font-medium">Processing Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-crys-light-grey">Target Loudness:</span>
                        <span className="text-crys-gold">-9.0 LUFS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crys-light-grey">Peak Limit:</span>
                        <span className="text-crys-gold">-0.2 dBTP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crys-light-grey">Processing Quality:</span>
                        <span className="text-crys-gold">Professional</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crys-light-grey">Output Format:</span>
                        <span className="text-crys-gold">WAV</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && currentFile && originalStats && masteredStats && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-crys-white mb-4">Mastering Complete!</h2>
              <p className="text-crys-light-grey">Your track has been professionally mastered</p>
            </div>

            {/* Audio Comparison Players */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Audio Player */}
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-crys-gold" />
                    <h3 className="text-crys-white font-semibold">Original Audio</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                      <FileAudio className="w-6 h-6 text-crys-gold" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-crys-white font-medium">{currentFile.name}</h4>
                      <p className="text-crys-light-grey text-sm">Before mastering</p>
                    </div>
                    <Button 
                      onClick={toggleOriginalPlayback}
                      className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
                    >
                      {isPlayingOriginal ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>

                  {originalAudioElement && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-crys-light-grey">
                        <span>{formatTime(currentTimeOriginal)}</span>
                        <span>{formatTime(originalAudioElement.duration || 0)}</span>
                      </div>
                      <div className="w-full bg-crys-graphite rounded-full h-2">
                        <div 
                          className="bg-crys-gold h-2 rounded-full transition-all"
                          style={{ width: `${(currentTimeOriginal / (originalAudioElement.duration || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mastered Audio Player */}
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Volume2Icon className="w-4 h-4 text-crys-gold" />
                    <h3 className="text-crys-white font-semibold">Mastered Audio</h3>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Professional</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-crys-gold" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-crys-white font-medium">{currentFile.name.replace(/\.[^/.]+$/, '')}_mastered.wav</h4>
                      <p className="text-crys-light-grey text-sm">After professional mastering</p>
                    </div>
                    <Button 
                      onClick={toggleMasteredPlayback}
                      className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
                    >
                      {isPlayingMastered ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>

                  {masteredAudioElement && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-crys-light-grey">
                        <span>{formatTime(currentTimeMastered)}</span>
                        <span>{formatTime(masteredAudioElement.duration || 0)}</span>
                      </div>
                      <div className="w-full bg-crys-graphite rounded-full h-2">
                        <div 
                          className="bg-crys-gold h-2 rounded-full transition-all"
                          style={{ width: `${(currentTimeMastered / (masteredAudioElement.duration || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Stats */}
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-crys-gold" />
                    <h3 className="text-crys-white font-semibold">Original</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Loudness', value: originalStats.loudness.toFixed(1), unit: 'LUFS', icon: Volume1 },
                    { label: 'Peak', value: originalStats.peak.toFixed(1), unit: 'dBTP', icon: Target },
                    { label: 'Dynamic Range', value: originalStats.dynamicRange.toFixed(1), unit: 'dB', icon: Gauge },
                    { label: 'Frequency Balance', value: originalStats.frequencyBalance.toFixed(0), unit: '%', icon: BarChart3 },
                    { label: 'Stereo Width', value: originalStats.stereoWidth.toFixed(0), unit: '%', icon: Radio }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-crys-light-grey" />
                          <span className="text-crys-light-grey text-sm">{stat.label}</span>
                        </div>
                        <span className="text-crys-white font-medium">{stat.value} {stat.unit}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Mastered Stats */}
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Volume2Icon className="w-4 h-4 text-crys-gold" />
                    <h3 className="text-crys-white font-semibold">Mastered</h3>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Professional</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Loudness', value: masteredStats.loudness.toFixed(1), unit: 'LUFS', icon: Volume1, improvement: masteredStats.loudness - originalStats.loudness },
                    { label: 'Peak', value: masteredStats.peak.toFixed(1), unit: 'dBTP', icon: Target, improvement: masteredStats.peak - originalStats.peak },
                    { label: 'Dynamic Range', value: masteredStats.dynamicRange.toFixed(1), unit: 'dB', icon: Gauge, improvement: originalStats.dynamicRange - masteredStats.dynamicRange },
                    { label: 'Frequency Balance', value: masteredStats.frequencyBalance.toFixed(0), unit: '%', icon: BarChart3, improvement: masteredStats.frequencyBalance - originalStats.frequencyBalance },
                    { label: 'Stereo Width', value: masteredStats.stereoWidth.toFixed(0), unit: '%', icon: Radio, improvement: masteredStats.stereoWidth - originalStats.stereoWidth }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    const isPositive = stat.improvement > 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-crys-light-grey" />
                          <span className="text-crys-light-grey text-sm">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-crys-white font-medium">{stat.value} {stat.unit}</span>
                          <span className={`text-xs ${isPositive ? 'text-green-400' : 'text-blue-400'}`}>
                            {isPositive ? '+' : ''}{stat.improvement.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Download Section */}
            <Card className="bg-audio-panel-bg border-audio-panel-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-crys-white font-semibold mb-2">Download Your Mastered Track</h3>
                  <p className="text-crys-light-grey mb-6">Get your professionally mastered audio file</p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
                      <Download className="w-4 h-4 mr-2" />
                      Download WAV ($2.99)
                    </Button>
                    <Button variant="outline" className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10">
                      <Upload className="w-4 h-4 mr-2" />
                      Master Another Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-crys-white mb-4">Your Audio Library</h2>
              <p className="text-crys-light-grey">Manage your uploaded and mastered tracks</p>
            </div>

            {uploadedFiles.length === 0 ? (
              <Card className="bg-audio-panel-bg border-audio-panel-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-crys-gold" />
                  </div>
                  <h3 className="text-crys-white font-semibold mb-2">No Tracks Yet</h3>
                  <p className="text-crys-light-grey mb-6">Upload your first track to get started with professional mastering</p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="bg-audio-panel-bg border-audio-panel-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-crys-gold/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                            <FileAudio className="w-6 h-6 text-crys-gold" />
                          </div>
                          <div>
                            <h3 className="text-crys-white font-medium">{file.name}</h3>
                            <p className="text-crys-light-grey text-sm">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={
                            file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            file.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-crys-gold/20 text-crys-gold'
                          }>
                            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                          </Badge>
                          
                          {file.status === 'completed' && (
                            <Button size="sm" className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}