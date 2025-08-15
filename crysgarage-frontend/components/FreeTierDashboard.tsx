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
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
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

    // Create mastered audio URL using Web Audio API processing
    try {
      console.log('Starting audio processing...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log('Audio decoded, creating offline context...');
      
      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Create source from the audio buffer
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Mastering effects
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = 1.5; // Boost volume by 50%
      
      // Add compression-like effect
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 10;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      
      // Connect the processing chain
      source.connect(compressor).connect(gainNode).connect(offlineContext.destination);
      
      console.log('Starting rendering...');
      // Start processing
      source.start(0);
      
      // Render the processed audio
      const renderedBuffer = await offlineContext.startRendering();
      
      console.log('Rendering complete, converting to WAV...');
      // Convert to WAV and create URL
      const wavBlob = await audioBufferToWav(renderedBuffer);
      const masteredUrl = URL.createObjectURL(wavBlob);
      setMasteredAudioUrl(masteredUrl);
      
      console.log('Mastered audio created successfully:', masteredUrl);
      audioContext.close();
    } catch (error) {
      console.error('Error creating mastered audio:', error);
      // Don't fallback to original - throw error to prevent using original
      throw new Error('Failed to create mastered audio');
    }

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
    if (!masteredAudioElement && masteredAudioUrl) {
      const audio = new Audio(masteredAudioUrl);
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

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white" style={{ marginTop: '-80px', paddingTop: '80px' }}>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-700/50 -mt-16">
        <div className="max-w-7xl mx-auto px-6 py-0">
          <div className="flex justify-center space-x-1">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all ${
                    isActive 
                      ? 'border border-amber-500 border-b-0 text-amber-400 bg-black/50' 
                      : 'text-gray-400 hover:text-amber-400 hover:bg-black/30'
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
      <div className="max-w-7xl mx-auto px-6 pt-0">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-2">
            {/* Welcome Section */}
            <div className="text-center pt-8">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Transform Your Audio
              </h2>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                Upload your tracks and experience professional-grade mastering with our advanced audio processing technology.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
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
                  <Card key={index} className="bg-gray-800 border-gray-700 hover:border-amber-500/50 transition-colors">
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upload Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pt-2">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <h3 className="text-white font-semibold">Upload Your Track</h3>
                </div>
              </CardHeader>
              <CardContent>
                <UploadInterface onFileUpload={handleFileUpload} />
                
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
                    <h4 className="text-white font-medium mb-2">Free Tier Limits</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>3 tracks per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-amber-400" />
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
              <h2 className="text-2xl font-bold text-white mb-4">Processing Your Track</h2>
              <p className="text-gray-400">Applying professional mastering techniques...</p>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                    <FileAudio className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{currentFile.name}</h3>
                    <p className="text-gray-400 text-sm">{formatFileSize(currentFile.size)}</p>
                  </div>
                </div>

                <Progress value={processingProgress} className="h-3 mb-4" />
                <p className="text-amber-400 font-medium text-center">{processingProgress}% Complete</p>

                                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Processing Steps</h4>
                      {[
                        { step: "Audio Analysis", completed: processingProgress >= 10 },
                        { step: "Frequency Balancing", completed: processingProgress >= 30 },
                        { step: "Dynamic Processing", completed: processingProgress >= 50 },
                        { step: "Stereo Enhancement", completed: processingProgress >= 70 },
                        { step: "Final Mastering", completed: processingProgress >= 90 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            item.completed ? 'bg-green-500' : 'bg-gray-700'
                          }`}>
                            {item.completed ? (
                              <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-xs text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-sm ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                            {item.step}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-medium">Processing Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Target Loudness:</span>
                          <span className="text-amber-400">-9.0 LUFS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Peak Limit:</span>
                          <span className="text-amber-400">-0.2 dBTP</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Processing Quality:</span>
                          <span className="text-amber-400">Professional</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Output Format:</span>
                          <span className="text-amber-400">WAV</span>
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
              <h2 className="text-2xl font-bold text-white mb-4">Mastering Complete!</h2>
              <p className="text-gray-400">Your track has been professionally mastered</p>
            </div>

            {/* Audio Comparison Players */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Audio Player */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white font-semibold">Original Audio</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                      <FileAudio className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{currentFile.name}</h4>
                      <p className="text-gray-400 text-sm">Before mastering</p>
                    </div>
                    <Button 
                      onClick={toggleOriginalPlayback}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
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
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>{formatTime(currentTimeOriginal)}</span>
                            <span>{formatTime(originalAudioElement.duration || 0)}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all"
                              style={{ width: `${(currentTimeOriginal / (originalAudioElement.duration || 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                </CardContent>
              </Card>

              {/* Mastered Audio Player */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Volume2Icon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white font-semibold">Mastered Audio</h3>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Professional</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{currentFile.name.replace(/\.[^/.]+$/, '')}_mastered.wav</h4>
                      <p className="text-gray-400 text-sm">After professional mastering</p>
                    </div>
                    <Button 
                      onClick={toggleMasteredPlayback}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
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
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatTime(currentTimeMastered)}</span>
                        <span>{formatTime(masteredAudioElement.duration || 0)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full transition-all"
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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white font-semibold">Original</h3>
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
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{stat.label}</span>
                        </div>
                        <span className="text-white font-medium">{stat.value} {stat.unit}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Mastered Stats */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Volume2Icon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white font-semibold">Mastered</h3>
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
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{stat.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{stat.value} {stat.unit}</span>
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
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Download Your Mastered Track</h3>
                  <p className="text-gray-400 mb-6">Get your professionally mastered audio file</p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                      <Download className="w-4 h-4 mr-2" />
                      Download WAV ($2.99)
                    </Button>
                    <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
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
              <h2 className="text-2xl font-bold text-white mb-4">Your Audio Library</h2>
              <p className="text-gray-400">Manage your uploaded and mastered tracks</p>
            </div>

            {uploadedFiles.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">No Tracks Yet</h3>
                  <p className="text-gray-400 mb-6">Upload your first track to get started with professional mastering</p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 rounded-xl flex items-center justify-center">
                            <FileAudio className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{file.name}</h3>
                            <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={
                            file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            file.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }>
                            {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                          </Badge>
                          
                          {file.status === 'completed' && (
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
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