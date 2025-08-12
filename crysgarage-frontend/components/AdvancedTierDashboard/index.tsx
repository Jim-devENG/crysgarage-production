import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileAudio, 
  Upload, 
  Music,
  Zap,
  Download,
  Settings
} from 'lucide-react';
import StudioHeader from './StudioHeader';
import FileUpload from './FileUpload';
import RealTimeMeters from './RealTimeMeters';
import AudioEffects from './AudioEffects';
import ExportSettings from './ExportSettings';
import AudioPlayer from './AudioPlayer';
import FrequencySpectrum from './FrequencySpectrum';
import RealTimeMasteringPlayer from './RealTimeMasteringPlayer';

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
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24' | 'wav32'>('wav16');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
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
    // Free effects
    eq: { low: 0, mid: 0, high: 0 },
    compressor: { threshold: 0, ratio: 1, attack: 10, release: 100 },
    stereoWidener: { width: 0 },
    loudness: { volume: 1 },
    limiter: { threshold: 0, ceiling: -0.1 },
    
    // Premium effects (optional)
    gMasteringCompressor: undefined as any,
    gPrecisionEQ: undefined as any,
    gDigitalTape: undefined as any,
    gLimiter: undefined as any,
    gMultiBand: undefined as any,
    
    // Advanced features
    gSurround: false,
    gTuner: { enabled: false, frequency: 444 },
    solfagio: { enabled: false, frequency: 432 }
  } as any);

  const [surroundEnabled, setSurroundEnabled] = useState(false);
  const [tunerEnabled, setTunerEnabled] = useState(false);
  const [solfagioEnabled, setSolfagioEnabled] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);

  // Refs for real-time analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Clear state function with error handling
  const clearState = () => {
    try {
      sessionStorage.removeItem('advancedTierState');
      setCurrentStep(1);
      setSelectedFile(null);
      setFileInfo(null);
      setProcessedAudioUrl(null);
      setIsProcessing(false);
      setOriginalAudioElement(null);
      setMasteredAudioElement(null);
      setDownloadFormat('wav16');
      // Reset audio effects to initial state
      setAudioEffects({
        eq: { low: 0, mid: 0, high: 0 },
        compressor: { threshold: 0, ratio: 1, attack: 10, release: 100 },
        stereoWidener: { width: 0 },
        loudness: { volume: 1 },
        limiter: { threshold: 0, ceiling: -0.1 },
        gMasteringCompressor: undefined,
        gPrecisionEQ: undefined,
        gDigitalTape: undefined,
        gLimiter: undefined,
        gMultiBand: undefined,
        gSurround: false,
        gTuner: { enabled: false, frequency: 444 },
        solfagio: { enabled: false, frequency: 432 }
      });
      setSampleRate('44.1kHz');
      setSelectedGenre('');
      setIsRealTimeMode(false);
    } catch (error) {
      console.error('Error clearing state:', error);
      // Force reset to step 1
      setCurrentStep(1);
      setSelectedFile(null);
    }
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File upload triggered:', file);
    if (file) {
      clearState();
      setSelectedFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });
      console.log('File set successfully:', file.name);
      // Don't automatically proceed - let user click "Enter Studio" button
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  // Update effect settings for real-time processing
  const updateEffectSettings = (effectType: string, settings: any) => {
    setAudioEffects(prev => ({
      ...prev,
      [effectType]: { ...prev[effectType as keyof typeof prev], ...settings }
    }));
  };

  // Toggle premium effects
  const togglePremiumEffect = (effectType: string, enabled: boolean) => {
    if (enabled) {
      // Initialize premium effect with default settings
      const defaultSettings = {
        gMasteringCompressor: { threshold: -18, ratio: 3, attack: 5, release: 150, makeup: 0 },
        gPrecisionEQ: { bands: Array.from({ length: 8 }, () => ({ frequency: 1000, gain: 0, q: 1, type: 'peaking' as const })) },
        gDigitalTape: { saturation: 50, warmth: 30, compression: 20 },
        gLimiter: { threshold: -0.1, ceiling: -0.01, release: 5 },
        gMultiBand: { low: { threshold: -20, ratio: 4 }, mid: { threshold: -20, ratio: 4 }, high: { threshold: -20, ratio: 4 } }
      };
      
      setAudioEffects(prev => ({
        ...prev,
        [effectType]: defaultSettings[effectType as keyof typeof defaultSettings]
      }));
    } else {
      setAudioEffects(prev => ({
        ...prev,
        [effectType]: undefined
      }));
    }
  };

  // Genre selection handler
  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  // Process audio with all enabled effects
  const processAudio = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create processed audio URL (in real implementation, this would process the audio)
    const processedUrl = URL.createObjectURL(selectedFile);
    setProcessedAudioUrl(processedUrl);
    setIsProcessing(false);
    setCurrentStep(3);
  };

  // Download handler
  const handleDownload = async () => {
    if (!processedAudioUrl || !selectedFile) return;

    try {
      const response = await fetch(processedAudioUrl);
      const blob = await response.blob();
      
      let fileName = `advanced_mastered_${selectedFile.name.replace(/\.[^\/.]+$/, '')}`;
      
      if (downloadFormat === 'mp3') {
        fileName += '.mp3';
      } else {
        fileName += `.wav`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0;
    
    // Sample rate cost
    if (sampleRate === '88.2kHz') total += 3;
    else if (sampleRate === '96kHz') total += 5;
    else if (sampleRate === '192kHz') total += 10;
    
    // Format cost
    if (downloadFormat === 'wav32') total += 2;
    
    // Premium effects cost
    if (audioEffects.gMasteringCompressor) total += 5;
    if (audioEffects.gPrecisionEQ) total += 5;
    if (audioEffects.gDigitalTape) total += 5;
    if (audioEffects.gLimiter) total += 5;
    if (audioEffects.gMultiBand) total += 5;
    
    // Additional features
    if (surroundEnabled) total += 5;
    if (tunerEnabled) total += 2;
    if (solfagioEnabled) total += 3;
    
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Studio Header */}
      <StudioHeader 
        credits={credits}
        currentStep={currentStep}
        onNewSession={clearState}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step 
                    ? 'bg-crys-gold text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-crys-gold' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-400">
              {currentStep === 1 && 'Upload Audio'}
              {currentStep === 2 && 'Studio Processing'}
              {currentStep === 3 && 'Export'}
            </span>
          </div>
        </div>

        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <FileUpload 
            selectedFile={selectedFile}
            fileInfo={fileInfo}
            onFileUpload={handleFileUpload}
            onContinue={() => {
              console.log('onContinue called, setting currentStep to 2');
              setCurrentStep(2);
            }}
          />
        )}

        {/* Step 2: Studio Processing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Real-time Meters */}
            <RealTimeMeters meterData={meterData} />

            {/* Real-Time Mastering Player */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Real-Time Mastering</h3>
                <button
                  onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRealTimeMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }`}
                >
                  {isRealTimeMode ? 'Real-Time Active' : 'Enable Real-Time'}
                </button>
              </div>
              
              {isRealTimeMode && selectedFile && (
                <RealTimeMasteringPlayer
                  audioFile={selectedFile}
                  audioEffects={audioEffects}
                  meterData={meterData}
                  onMeterUpdate={(data) => setMeterData(data)}
                  onEffectChange={(effects) => setAudioEffects(effects)}
                  isProcessing={isProcessing}
                />
              )}
              
              {!isRealTimeMode && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Settings className="w-12 h-12 mx-auto mb-2" />
                    <p>Enable real-time mode to hear effects instantly</p>
                  </div>
                  <button
                    onClick={() => setIsRealTimeMode(true)}
                    className="bg-crys-gold text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                  >
                    Start Real-Time Mastering
                  </button>
                </div>
              )}
            </div>

            {/* Audio Effects */}
            <AudioEffects 
              audioEffects={audioEffects}
              onUpdateEffectSettings={updateEffectSettings}
              onTogglePremiumEffect={togglePremiumEffect}
              surroundEnabled={surroundEnabled}
              tunerEnabled={tunerEnabled}
              solfagioEnabled={solfagioEnabled}
              onToggleSurround={() => setSurroundEnabled(!surroundEnabled)}
              onToggleTuner={() => setTunerEnabled(!tunerEnabled)}
              onToggleSolfagio={() => setSolfagioEnabled(!solfagioEnabled)}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
            />

            {/* Export Settings */}
            <ExportSettings 
              downloadFormat={downloadFormat}
              sampleRate={sampleRate}
              onFormatChange={setDownloadFormat}
              onSampleRateChange={setSampleRate}
              totalCost={calculateTotalCost()}
            />

            {/* Process Button */}
            <div className="text-center">
              <button
                onClick={processAudio}
                disabled={isProcessing}
                className="bg-gradient-to-r from-crys-gold to-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Process Audio</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Export */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Export Your Mastered Audio</h2>
              <p className="text-gray-400">Your audio has been processed with professional studio tools</p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
              {/* Audio Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Original Audio</h3>
                  <AudioPlayer
                    src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                    title="Original"
                    onAudioElementReady={setOriginalAudioElement}
                    onPlay={() => setIsPlayingOriginal(true)}
                    onPause={() => setIsPlayingOriginal(false)}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mastered Audio</h3>
                  <AudioPlayer
                    src={processedAudioUrl || ''}
                    title="Mastered"
                    onAudioElementReady={setMasteredAudioElement}
                    onPlay={() => setIsPlayingMastered(true)}
                    onPause={() => setIsPlayingMastered(false)}
                  />
                </div>
              </div>

              {/* Frequency Spectrum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Original Spectrum</h3>
                  <FrequencySpectrum
                    audioElement={originalAudioElement}
                    isPlaying={isPlayingOriginal}
                    title="Original"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mastered Spectrum</h3>
                  <FrequencySpectrum
                    audioElement={masteredAudioElement}
                    isPlaying={isPlayingMastered}
                    title="Mastered"
                  />
                </div>
              </div>

              {/* Download Section */}
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-crys-gold to-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-yellow-300 transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Download Mastered Audio</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedTierDashboard;
