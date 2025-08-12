import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileAudio, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Settings, 
  Download,
  Zap,
  Music,
  BarChart3,
  Gauge,
  Headphones,
  Monitor,
  Sliders,
  Filter,
  Maximize2,
  Target,
  DollarSign,
  CheckCircle,
  Lock
} from 'lucide-react';
import { availableGenres } from './GenreDropdown';
import FrequencySpectrum from './FrequencySpectrum';
import StyledAudioPlayer from './StyledAudioPlayer';

interface AdvancedTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

interface AudioEffect {
  id: string;
  name: string;
  type: 'free' | 'paid';
  price?: number;
  enabled: boolean;
  settings: any;
}

interface MeterData {
  lufs: number;
  peak: number;
  rms: number;
  correlation: number;
  leftPeak: number;
  rightPeak: number;
  leftRms: number;
  rightRms: number;
}

const AdvancedTierDashboard: React.FC<AdvancedTierDashboardProps> = ({ 
  onFileUpload, 
  credits = 0 
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, type: string} | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>('wav');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [bitDepth, setBitDepth] = useState<'16bit' | '24bit' | '32bit'>('24bit');
  const [meterData, setMeterData] = useState<MeterData>({
    lufs: -20,
    peak: -6,
    rms: -12,
    correlation: 0.8,
    leftPeak: -6,
    rightPeak: -6,
    leftRms: -12,
    rightRms: -12
  });

  // Audio effects state
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([
    // Free effects
    { id: 'genre', name: 'Genre Preset', type: 'free', enabled: false, settings: {} },
    { id: 'eq3band', name: '3-Band EQ', type: 'free', enabled: false, settings: { low: 0, mid: 0, high: 0 } },
    { id: 'compressor', name: 'Compressor', type: 'free', enabled: false, settings: { threshold: -20, ratio: 4, attack: 0.01, release: 0.1 } },
    { id: 'stereoWidener', name: 'Stereo Widener', type: 'free', enabled: false, settings: { width: 1.2 } },
    { id: 'loudness', name: 'Loudness', type: 'free', enabled: false, settings: { gain: 0 } },
    { id: 'limiter', name: 'Limiter', type: 'free', enabled: false, settings: { threshold: -1.0 } },
    
    // Paid effects
    { id: 'gMasteringComp', name: 'G-Mastering Compressor', type: 'paid', price: 5, enabled: false, settings: { threshold: -18, ratio: 3, attack: 0.005, release: 0.15 } },
    { id: 'gPrecisionEq', name: 'G-Precision 8-Band EQ', type: 'paid', price: 5, enabled: false, settings: { bands: [0, 0, 0, 0, 0, 0, 0, 0] } },
    { id: 'gDigitalTape', name: 'G-Digital Tape Machine', type: 'paid', price: 5, enabled: false, settings: { saturation: 0.5, warmth: 0.3 } },
    { id: 'gLimiter', name: 'G-Limiter', type: 'paid', price: 5, enabled: false, settings: { threshold: -0.1, release: 0.05 } },
    { id: 'gMultiband', name: 'G-Multi-Band', type: 'paid', price: 5, enabled: false, settings: { low: { threshold: -20, ratio: 4 }, mid: { threshold: -20, ratio: 4 }, high: { threshold: -20, ratio: 4 } } },
  ]);

  const [surroundEnabled, setSurroundEnabled] = useState(false);
  const [tunerEnabled, setTunerEnabled] = useState(false);
  const [solfagioEnabled, setSolfagioEnabled] = useState(false);

  // Refs for real-time analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Load state from sessionStorage
  const loadStateFromStorage = () => {
    try {
      const savedState = sessionStorage.getItem('advancedTierState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          currentStep: parsed.currentStep || 1,
          selectedGenre: parsed.selectedGenre || null,
          processedAudioUrl: parsed.processedAudioUrl || null,
          isProcessing: false,
          downloadFormat: parsed.downloadFormat || 'wav',
          fileInfo: parsed.fileInfo || null,
          audioEffects: parsed.audioEffects || [],
          sampleRate: parsed.sampleRate || '44.1kHz',
          bitDepth: parsed.bitDepth || '24bit'
        };
      }
    } catch (error) {
      console.error('Error loading state from storage:', error);
    }
    return {
      currentStep: 1,
      selectedGenre: null,
      processedAudioUrl: null,
      isProcessing: false,
      downloadFormat: 'wav',
      fileInfo: null,
      audioEffects: [],
      sampleRate: '44.1kHz',
      bitDepth: '24bit'
    };
  };

  // Initialize state from storage
  useEffect(() => {
    const savedState = loadStateFromStorage();
    setCurrentStep(savedState.currentStep);
    setSelectedGenre(savedState.selectedGenre);
    setProcessedAudioUrl(savedState.processedAudioUrl);
    setDownloadFormat(savedState.downloadFormat);
    setFileInfo(savedState.fileInfo);
    setAudioEffects(savedState.audioEffects);
    setSampleRate(savedState.sampleRate);
    setBitDepth(savedState.bitDepth);
  }, []);

  // Save state to sessionStorage
  const saveStateToStorage = useCallback((state: any) => {
    try {
      sessionStorage.setItem('advancedTierState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to storage:', error);
    }
  }, []);

  // Save state whenever relevant state changes
  useEffect(() => {
    saveStateToStorage({
      currentStep,
      selectedGenre,
      processedAudioUrl,
      isProcessing,
      downloadFormat,
      fileInfo,
      audioEffects,
      sampleRate,
      bitDepth
    });
  }, [currentStep, selectedGenre, processedAudioUrl, isProcessing, downloadFormat, fileInfo, audioEffects, sampleRate, bitDepth, saveStateToStorage]);

  // Clear state function
  const clearState = () => {
    sessionStorage.removeItem('advancedTierState');
    setCurrentStep(1);
    setSelectedFile(null);
    setFileInfo(null);
    setSelectedGenre(null);
    setProcessedAudioUrl(null);
    setIsProcessing(false);
    setOriginalAudioElement(null);
    setMasteredAudioElement(null);
    setDownloadFormat('wav');
    setAudioEffects(audioEffects.map(effect => ({ ...effect, enabled: false })));
    setSampleRate('44.1kHz');
    setBitDepth('24bit');
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      clearState();
      setSelectedFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });
      setCurrentStep(2);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  // Real-time meter analysis
  const updateMeters = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += (dataArray[i] / 255) ** 2;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const rmsDb = 20 * Math.log10(rms);

    // Calculate peak
    const peak = Math.max(...Array.from(dataArray).map(val => val / 255));
    const peakDb = 20 * Math.log10(peak);

    // Simulate LUFS (simplified)
    const lufs = rmsDb - 3;

    // Simulate correlation (simplified)
    const correlation = 0.5 + 0.5 * Math.sin(Date.now() * 0.001);

    setMeterData({
      lufs,
      peak: peakDb,
      rms: rmsDb,
      correlation,
      leftPeak: peakDb - 0.5,
      rightPeak: peakDb + 0.3,
      leftRms: rmsDb - 0.8,
      rightRms: rmsDb + 0.2
    });

    animationRef.current = requestAnimationFrame(updateMeters);
  }, []);

  // Start real-time analysis
  useEffect(() => {
    if (originalAudioElement && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioContextRef.current.createMediaElementSource(originalAudioElement);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      updateMeters();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [originalAudioElement, updateMeters]);

  // Effect toggle handler
  const toggleEffect = (effectId: string) => {
    setAudioEffects(prev => prev.map(effect => 
      effect.id === effectId 
        ? { ...effect, enabled: !effect.enabled }
        : effect
    ));
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
    
    // Bit depth cost
    if (bitDepth === '32bit') total += 2;
    
    // Paid effects cost
    audioEffects.forEach(effect => {
      if (effect.enabled && effect.type === 'paid' && effect.price) {
        total += effect.price;
      }
    });
    
    // Additional features
    if (surroundEnabled) total += 5;
    if (tunerEnabled) total += 2;
    if (solfagioEnabled) total += 3;
    
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-crys-gold">Advanced Studio</h1>
                <p className="text-sm text-gray-400">Professional Audio Mastering Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-700 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-300">Credits: </span>
                <span className="text-crys-gold font-bold">{credits}</span>
              </div>
              {currentStep > 1 && (
                <button
                  onClick={clearState}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  New Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
              <p className="text-gray-400">Drag and drop your audio file or click to browse</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
              <div className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center hover:border-crys-gold transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Choose Audio File</h3>
                  <p className="text-gray-400 mb-4">WAV, MP3, FLAC, or other audio formats</p>
                  <div className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-block">
                    Browse Files
                  </div>
                </label>
              </div>
              
              {(selectedFile || fileInfo) && (
                <div className="mt-6 bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileAudio className="w-6 h-6 text-crys-gold" />
                      <div>
                        <h4 className="font-semibold">{selectedFile?.name || fileInfo?.name}</h4>
                        <p className="text-sm text-gray-400">
                          {selectedFile 
                            ? (selectedFile.size / 1024 / 1024).toFixed(2) 
                            : fileInfo 
                              ? (fileInfo.size / 1024 / 1024).toFixed(2) 
                              : '0'
                          } MB
                        </p>
                        {!selectedFile && fileInfo && (
                          <p className="text-xs text-yellow-400 mt-1">
                            ⚠️ File needs to be re-uploaded to continue
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedFile}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                        selectedFile 
                          ? 'bg-crys-gold text-black hover:bg-yellow-400' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Enter Studio</span>
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Studio Processing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Real-time Meters */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Real-Time Analysis
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* LUFS Meter */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">LUFS</span>
                  </div>
                  <div className="bg-gray-800 rounded h-32 relative">
                    <div 
                      className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                      style={{ height: `${Math.max(0, Math.min(100, (meterData.lufs + 60) * 1.67))}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-lg font-bold">{meterData.lufs.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Peak Meter */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">Peak</span>
                  </div>
                  <div className="bg-gray-800 rounded h-32 relative">
                    <div 
                      className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                      style={{ height: `${Math.max(0, Math.min(100, (meterData.peak + 60) * 1.67))}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-lg font-bold">{meterData.peak.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Correlation Meter */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">Correlation</span>
                  </div>
                  <div className="bg-gray-800 rounded h-32 relative">
                    <div 
                      className="bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                      style={{ height: `${meterData.correlation * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-lg font-bold">{meterData.correlation.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* RMS Meter */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">RMS</span>
                  </div>
                  <div className="bg-gray-800 rounded h-32 relative">
                    <div 
                      className="bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                      style={{ height: `${Math.max(0, Math.min(100, (meterData.rms + 60) * 1.67))}%` }}
                    />
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <span className="text-lg font-bold">{meterData.rms.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left/Right Meters */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">Left Channel</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-800 rounded h-24 relative">
                      <div 
                        className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                        style={{ height: `${Math.max(0, Math.min(100, (meterData.leftPeak + 60) * 1.67))}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded h-24 relative">
                      <div 
                        className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                        style={{ height: `${Math.max(0, Math.min(100, (meterData.leftRms + 60) * 1.67))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Peak: {meterData.leftPeak.toFixed(1)}</span>
                    <span>RMS: {meterData.leftRms.toFixed(1)}</span>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-center mb-2">
                    <span className="text-sm text-gray-400">Right Channel</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-800 rounded h-24 relative">
                      <div 
                        className="bg-blue-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                        style={{ height: `${Math.max(0, Math.min(100, (meterData.rightPeak + 60) * 1.67))}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-gray-800 rounded h-24 relative">
                      <div 
                        className="bg-green-500 absolute bottom-0 left-0 right-0 transition-all duration-100"
                        style={{ height: `${Math.max(0, Math.min(100, (meterData.rightRms + 60) * 1.67))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Peak: {meterData.rightPeak.toFixed(1)}</span>
                    <span>RMS: {meterData.rightRms.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Effects */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Audio Effects
              </h3>

              {/* Free Effects */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Free Effects
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {audioEffects.filter(effect => effect.type === 'free').map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => toggleEffect(effect.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        effect.enabled
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{effect.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Effects */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Premium Effects ($5 each)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {audioEffects.filter(effect => effect.type === 'paid').map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => toggleEffect(effect.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        effect.enabled
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{effect.name}</div>
                      <div className="text-xs text-gray-400">${effect.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Advanced Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSurroundEnabled(!surroundEnabled)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      surroundEnabled
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">G-Surround</div>
                    <div className="text-xs text-gray-400">$5</div>
                  </button>
                  
                  <button
                    onClick={() => setTunerEnabled(!tunerEnabled)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tunerEnabled
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">G-Tuner (444Hz)</div>
                    <div className="text-xs text-gray-400">$2</div>
                  </button>
                  
                  <button
                    onClick={() => setSolfagioEnabled(!solfagioEnabled)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      solfagioEnabled
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-sm font-medium">Solfagio Tuning</div>
                    <div className="text-xs text-gray-400">$3</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Export Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Format</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="mp3"
                        checked={downloadFormat === 'mp3'}
                        onChange={(e) => setDownloadFormat(e.target.value as 'wav' | 'mp3')}
                        className="text-crys-gold"
                      />
                      <span>MP3 (320kbps) - Free</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="wav"
                        checked={downloadFormat === 'wav'}
                        onChange={(e) => setDownloadFormat(e.target.value as 'wav' | 'mp3')}
                        className="text-crys-gold"
                      />
                      <span>WAV (16bit) - Free</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="wav"
                        checked={downloadFormat === 'wav'}
                        onChange={(e) => setDownloadFormat(e.target.value as 'wav' | 'mp3')}
                        className="text-crys-gold"
                      />
                      <span>WAV (24bit) - Free</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="wav"
                        checked={downloadFormat === 'wav'}
                        onChange={(e) => setDownloadFormat(e.target.value as 'wav' | 'mp3')}
                        className="text-crys-gold"
                      />
                      <span>WAV (32bit) - $2</span>
                    </label>
                  </div>
                </div>

                {/* Sample Rate Selection */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Sample Rate</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sampleRate"
                        value="44.1kHz"
                        checked={sampleRate === '44.1kHz'}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                      />
                      <span>44.1kHz - Free</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sampleRate"
                        value="48kHz"
                        checked={sampleRate === '48kHz'}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                      />
                      <span>48kHz - Free</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sampleRate"
                        value="88.2kHz"
                        checked={sampleRate === '88.2kHz'}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                      />
                      <span>88.2kHz - $3</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sampleRate"
                        value="96kHz"
                        checked={sampleRate === '96kHz'}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                      />
                      <span>96kHz - $5</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sampleRate"
                        value="192kHz"
                        checked={sampleRate === '192kHz'}
                        onChange={(e) => setSampleRate(e.target.value as any)}
                        className="text-crys-gold"
                      />
                      <span>192kHz - $10</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="mt-6 bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Cost:</span>
                  <span className="text-2xl font-bold text-crys-gold">${calculateTotalCost()}</span>
                </div>
              </div>
            </div>

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
                  <StyledAudioPlayer
                    src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                    title="Original"
                    onAudioElementReady={setOriginalAudioElement}
                    onPlay={() => setIsPlayingOriginal(true)}
                    onPause={() => setIsPlayingOriginal(false)}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mastered Audio</h3>
                  <StyledAudioPlayer
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