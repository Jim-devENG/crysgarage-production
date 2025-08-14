import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileAudio, 
  Upload, 
  Music,
  Zap,
  Download,
  Settings,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import StudioHeader from './StudioHeader';
import FileUpload from './FileUpload';
import RealTimeMeters from './RealTimeMeters';
import AudioEffects from './AudioEffects';
import ExportGate from './ExportGate';
import RealTimeMasteringPlayer, { RealTimeMasteringPlayerRef } from './RealTimeMasteringPlayer';
import StudioDashboard from './StudioDashboard';
import GenrePresets from './GenrePresets';
import { GENRE_PRESETS, multiplierToDb } from './sharedGenrePresets';

interface AdvancedTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftLevel: number;
  rightLevel: number;
  frequencyData: number[];
  goniometerData: number[];
}

const AdvancedTierDashboard: React.FC<AdvancedTierDashboardProps> = ({ 
  onFileUpload, 
  credits = 0 
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, type: string} | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [meterData, setMeterData] = useState<MeterData>({
    lufs: -20,
    peak: -6,
    rms: -12,
    correlation: 0.8,
    leftLevel: -6,
    rightLevel: -6,
    frequencyData: new Array(256).fill(0),
    goniometerData: new Array(256).fill(0)
  });

  // Audio effects state - structured for real-time processing
  const [audioEffects, setAudioEffects] = useState({
    // Free effects - enabled by default
    eq: { low: 0, mid: 0, high: 0, enabled: true },
    compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
    stereoWidener: { width: 0, enabled: true },
    loudness: { volume: 1, enabled: true },
    limiter: { threshold: -1, ceiling: -0.1, enabled: true },
    
    // Premium effects (optional)
    gMasteringCompressor: { threshold: -20, ratio: 4, attack: 10, release: 100, makeup: 0, reduction: 0, outputLevel: -20, enabled: false },
    gPrecisionEQ: { 
      bands: [
        { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
        { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
        { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
      ], 
      enabled: false 
    },
    gDigitalTape: { saturation: 0, warmth: 0, compression: 0, enabled: false },
    gLimiter: { threshold: -1, inputGain: 0, outputGain: 0, reduction: 0, outputPeak: -20, enabled: false },
    gMultiBand: { 
      low: { threshold: -20, ratio: 4 }, 
      mid: { threshold: -20, ratio: 4 }, 
      high: { threshold: -20, ratio: 4 }, 
      enabled: false 
    },
    
    // Advanced features
    gSurround: { width: 0, depth: 0, enabled: false },
    gTuner: { enabled: false, frequency: 444 }
  });

  const [surroundEnabled, setSurroundEnabled] = useState(false);
  const [tunerEnabled, setTunerEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Refs for real-time analysis
  const realTimeMasteringPlayerRef = useRef<RealTimeMasteringPlayerRef>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
      }
    };
  }, [processedAudioUrl]);

  const manualInit = useCallback(() => {
    try {
      realTimeMasteringPlayerRef.current?.manualInitializeAudioContext();
    } catch {}
  }, []);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setCurrentStep(2);
    }
  };

  // Continue to mastering
  const handleContinueToMastering = () => {
    if (selectedFile) {
      setCurrentStep(2);
    }
  };

  // Continue to export
  const handleContinueToExport = () => {
    // Generate a processed audio URL (simulate mastered audio)
    if (selectedFile) {
      // For now, we'll use the original file as the "processed" audio
      // In a real implementation, this would be the actual processed audio
      const processedUrl = URL.createObjectURL(selectedFile);
      setProcessedAudioUrl(processedUrl);
      setCurrentStep(3);
    }
  };

  // Effect update handlers
  const handleUpdateEffectSettings = (effectType: string, settings: any) => {
    setAudioEffects(prev => ({
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], ...settings }
    }));
  };

  const handleToggleEffect = (effectType: string, enabled: boolean) => {
    setAudioEffects(prev => ({
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], enabled }
    }));
  };

  const handleTogglePremiumEffect = (effectType: string, enabled: boolean) => {
    setAudioEffects(prev => ({
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], enabled }
    }));
  };

  // Genre selection
  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
    const preset = GENRE_PRESETS[genreId];
    if (preset) {
      // Map preset to current effect controls
      setAudioEffects(prev => ({
        ...prev,
        eq: { ...prev.eq, low: multiplierToDb(preset.eq.low), mid: multiplierToDb(preset.eq.mid), high: multiplierToDb(preset.eq.high), enabled: true },
        compressor: { ...prev.compressor, threshold: preset.compression.threshold, ratio: preset.compression.ratio, attack: Math.round(preset.compression.attack * 1000), release: Math.round(preset.compression.release * 1000), enabled: true },
        loudness: { ...prev.loudness, volume: preset.gain, enabled: true },
        limiter: { ...prev.limiter, threshold: -1, ceiling: preset.truePeak, enabled: true }
      }));
      // Ensure audio is initialized for immediate preview
      setTimeout(() => manualInit(), 0);
    }
  };

  // Show toast notification
  const showToastNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // New session handler
  const handleNewSession = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setFileInfo(null);
    setProcessedAudioUrl(null);
    setIsProcessing(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVolume(1);
    setSelectedGenre('');
    setMeterData({
      lufs: -20,
      peak: -6,
      rms: -12,
      correlation: 0.8,
      leftLevel: -6,
      rightLevel: -6,
      frequencyData: new Array(256).fill(0),
      goniometerData: new Array(256).fill(0)
    });
    setAudioEffects({
      eq: { low: 0, mid: 0, high: 0, enabled: true },
      compressor: { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: true },
      stereoWidener: { width: 0, enabled: true },
      loudness: { volume: 1, enabled: true },
      limiter: { threshold: -1, ceiling: -0.1, enabled: true },
      gMasteringCompressor: { threshold: -20, ratio: 4, attack: 10, release: 100, makeup: 0, reduction: 0, outputLevel: -20, enabled: false },
      gPrecisionEQ: { 
        bands: [
          { frequency: 60, gain: 0, q: 1, type: 'lowshelf' as const },
          { frequency: 150, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 400, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 1000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 2500, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 6000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 10000, gain: 0, q: 1, type: 'peaking' as const },
          { frequency: 16000, gain: 0, q: 1, type: 'highshelf' as const }
        ], 
        enabled: false 
      },
      gDigitalTape: { saturation: 0, warmth: 0, compression: 0, enabled: false },
      gLimiter: { threshold: -1, inputGain: 0, outputGain: 0, reduction: 0, outputPeak: -20, enabled: false },
      gMultiBand: { 
        low: { threshold: -20, ratio: 4 }, 
        mid: { threshold: -20, ratio: 4 }, 
        high: { threshold: -20, ratio: 4 }, 
        enabled: false 
      },
      gSurround: { width: 0, depth: 0, enabled: false },
      gTuner: { enabled: false, frequency: 444 }
    });
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUpload
            selectedFile={selectedFile}
            fileInfo={fileInfo}
            onFileUpload={handleFileUpload}
            onContinue={handleContinueToMastering}
          />
        );
      
      case 2:
        return (
          <div className="space-y-6">
            {/* Main Layout - Player/Meters on top, Genre under player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Player and Genre */}
              <div className="lg:col-span-2 space-y-4">
                {/* Real-time Mastering Player */}
                <RealTimeMasteringPlayer
                  ref={realTimeMasteringPlayerRef}
                  audioFile={selectedFile}
                  audioEffects={audioEffects}
                  meterData={meterData}
                  onMeterUpdate={setMeterData}
                  onEffectChange={(effects) => setAudioEffects(effects as any)}
                  isProcessing={isProcessing}
                />
                
                {/* Genre Presets - Directly under player */}
                <GenrePresets
                  selectedGenre={selectedGenre}
                  onGenreSelect={handleGenreSelect}
                />
              </div>

              {/* Right Column - Real-time Meters */}
              <div className="lg:col-span-1">
                <RealTimeMeters meterData={meterData} />
              </div>
            </div>

            {/* Studio Dashboard - Full width below */}
            <div className="grid grid-cols-1 gap-4">
              <StudioDashboard
                audioEffects={audioEffects}
                onUpdateEffectSettings={handleUpdateEffectSettings}
                onTogglePremiumEffect={handleTogglePremiumEffect}
                onToggleEffect={handleToggleEffect}
                selectedGenre={selectedGenre}
                onGenreSelect={handleGenreSelect}
                meterData={meterData}
                onManualInit={manualInit}
              />
            </div>

            {/* Continue to Export Button */}
            <div className="text-center">
              <button
                onClick={handleContinueToExport}
                className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Continue to Export Gate
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <ExportGate
            originalFile={selectedFile}
            processedAudioUrl={processedAudioUrl}
            audioEffects={audioEffects}
            onBack={() => setCurrentStep(2)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Studio Header */}
      <StudioHeader currentStep={currentStep} credits={credits} onNewSession={handleNewSession} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderCurrentStep()}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdvancedTierDashboard;
