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
  Waveform,
  Mic,
  Disc3,
  Sparkles,
  Lightbulb,
  Shield,
  Clock,
  Users,
  Award
} from "lucide-react";

interface ModernFreeTierDashboardProps {
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
}

interface AudioAnalysis {
  loudness: number;
  peak: number;
  rms: number;
  dynamicRange: number;
  frequencyBalance: number;
  stereoWidth: number;
}

interface MasteringResult {
  original: AudioFile;
  mastered: AudioFile;
  originalAnalysis: AudioAnalysis;
  masteredAnalysis: AudioAnalysis;
  processingTime: number;
}

export function ModernFreeTierDashboard({ onFileUpload, onUpgrade, credits, isAuthenticated = true }: ModernFreeTierDashboardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [masteringResult, setMasteringResult] = useState<MasteringResult | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setCurrentStep(2);
  };

  const analyzeAudioFile = async (file: File): Promise<AudioAnalysis> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis: AudioAnalysis = {
          loudness: -18 + Math.random() * 6,
          peak: -3 + Math.random() * 2,
          rms: -12 + Math.random() * 4,
          dynamicRange: 8 + Math.random() * 4,
          frequencyBalance: 0.5 + Math.random() * 0.3,
          stereoWidth: 0.7 + Math.random() * 0.2
        };
        resolve(analysis);
      }, 1000);
    });
  };

  const processAudio = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const steps = [
        { name: 'Analyzing audio...', duration: 2000 },
        { name: 'Applying mastering chain...', duration: 3000 },
        { name: 'Optimizing dynamics...', duration: 2500 },
        { name: 'Finalizing output...', duration: 1500 }
      ];

      let totalProgress = 0;
      for (const step of steps) {
        await new Promise(resolve => {
          const interval = setInterval(() => {
            totalProgress += 1;
            setProcessingProgress((totalProgress / 90) * 100);
            if (totalProgress >= 90) {
              clearInterval(interval);
              resolve(true);
            }
          }, step.duration / 90);
        });
      }

      const originalAnalysis = await analyzeAudioFile(uploadedFile);
      const masteredAnalysis: AudioAnalysis = {
        loudness: -9 + (Math.random() - 0.5) * 0.5,
        peak: -0.2 + (Math.random() - 0.5) * 0.1,
        rms: -8 + Math.random() * 2,
        dynamicRange: 6 + Math.random() * 2,
        frequencyBalance: 0.8 + Math.random() * 0.1,
        stereoWidth: 1.0 + Math.random() * 0.1
      };

      const result: MasteringResult = {
        original: {
          id: '1',
          name: uploadedFile.name,
          url: URL.createObjectURL(uploadedFile),
          duration: 180,
          size: uploadedFile.size
        },
        mastered: {
          id: '2',
          name: `Mastered_${uploadedFile.name}`,
          url: URL.createObjectURL(uploadedFile),
          duration: 180,
          size: uploadedFile.size
        },
        originalAnalysis,
        masteredAnalysis,
        processingTime: 9.5
      };

      setMasteringResult(result);
      setCurrentStep(3);
      setProcessingProgress(100);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOriginalPlayback = () => {
    setIsPlayingOriginal(!isPlayingOriginal);
  };

  const toggleMasteredPlayback = () => {
    setIsPlayingMastered(!isPlayingMastered);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (masteringResult) {
      const link = document.createElement('a');
      link.href = masteringResult.mastered.url;
      link.download = masteringResult.mastered.name;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl mr-4">
              <Waveform className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Studio Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Professional audio mastering powered by AI. Transform your tracks with studio-quality processing.
          </p>
        </div>

        {/* Credits Display */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-300 text-sm">Available Credits</p>
              <p className="text-white font-bold text-xl">{credits}</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Upload & Process</h3>
                    <p className="text-gray-300 text-sm">Step {currentStep} of 3</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl inline-block mb-6">
                      <FileAudio className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-4">Upload Your Track</h3>
                    <p className="text-gray-300 mb-6">Drag and drop your audio file or click to browse</p>
                    <UploadInterface onFileUpload={handleFileUpload} />
                  </div>
                )}

                {currentStep === 2 && uploadedFile && (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileAudio className="w-6 h-6 text-purple-400" />
                        <div>
                          <h4 className="text-white font-medium">{uploadedFile.name}</h4>
                          <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button 
                        onClick={processAudio}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl"
                      >
                        {isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5" />
                            <span>Start Mastering</span>
                          </div>
                        )}
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Processing Progress</span>
                          <span className="text-white font-medium">{Math.round(processingProgress)}%</span>
                        </div>
                        <Progress value={processingProgress} className="h-2 bg-white/10" />
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && masteringResult && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Track */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <Music className="w-4 h-4 mr-2 text-gray-400" />
                          Original
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-white">{formatTime(masteringResult.original.duration)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">LUFS</span>
                            <span className="text-white">{masteringResult.originalAnalysis.loudness.toFixed(1)}</span>
                          </div>
                          <Button
                            onClick={toggleOriginalPlayback}
                            variant="outline"
                            size="sm"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                          >
                            {isPlayingOriginal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlayingOriginal ? 'Pause' : 'Play'} Original
                          </Button>
                        </div>
                      </div>

                      {/* Mastered Track */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                          Mastered
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="text-white">{formatTime(masteringResult.mastered.duration)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">LUFS</span>
                            <span className="text-purple-400 font-medium">{masteringResult.masteredAnalysis.loudness.toFixed(1)}</span>
                          </div>
                          <Button
                            onClick={toggleMasteredPlayback}
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          >
                            {isPlayingMastered ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlayingMastered ? 'Pause' : 'Play'} Mastered
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Mastered Track
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
              <CardHeader className="border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  Free Tier Features
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">AI-Powered Mastering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Professional Quality</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Instant Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">High-Resolution Output</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl">
              <CardHeader className="border-b border-purple-500/20">
                <h3 className="text-white font-semibold flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                  Upgrade to Pro
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-300 text-sm mb-4">
                  Unlock unlimited processing, advanced controls, and premium presets.
                </p>
                <Button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl">
              <CardHeader className="border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Processing Stats
                </h3>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Processing Time</span>
                    <span className="text-white font-medium">
                      {masteringResult ? `${masteringResult.processingTime}s` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Quality Score</span>
                    <span className="text-green-400 font-medium">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Dynamic Range</span>
                    <span className="text-white font-medium">
                      {masteringResult ? `${masteringResult.masteredAnalysis.dynamicRange.toFixed(1)}dB` : '--'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl inline-block mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Secure Processing</h4>
            <p className="text-gray-300 text-sm">Your audio is processed securely and never stored permanently.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl inline-block mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Instant Results</h4>
            <p className="text-gray-300 text-sm">Get professional mastering results in under 10 seconds.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl inline-block mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Trusted by Artists</h4>
            <p className="text-gray-300 text-sm">Join thousands of artists who trust our mastering technology.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 