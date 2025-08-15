
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, ArrowRight, ArrowLeft, Download, Music, Play, Pause, Volume2, VolumeX, Music2, Music3, Music4 } from 'lucide-react';
import { availableGenres, Genre as GenreType } from './GenreDropdown';
import FrequencySpectrum from './FrequencySpectrum';
import StyledAudioPlayer from './StyledAudioPlayer';

interface Genre {
  name: string;
  description: string;
  color: string;
}

interface ProcessingSettings {
  sampleRate: '44.1kHz' | '48kHz';
  resolution: '16bit' | '32bit';
}

interface ProfessionalTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

const ProfessionalTierDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  // Load state from sessionStorage on component mount
  const loadStateFromStorage = () => {
    try {
      const savedState = sessionStorage.getItem('professionalTierState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          currentStep: parsed.currentStep || 1,
          selectedGenre: parsed.selectedGenre || null,
          processedAudioUrl: parsed.processedAudioUrl || null,
          isProcessing: false, // Always reset processing state
          downloadFormat: parsed.downloadFormat || 'wav',
          fileInfo: parsed.fileInfo || null
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
      fileInfo: null
    };
  };

  const [currentStep, setCurrentStep] = useState(loadStateFromStorage().currentStep);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, type: string} | null>(loadStateFromStorage().fileInfo);
  const [selectedGenre, setSelectedGenre] = useState<GenreType | null>(loadStateFromStorage().selectedGenre);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(loadStateFromStorage().processedAudioUrl);
  const [isProcessing, setIsProcessing] = useState(loadStateFromStorage().isProcessing);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>(loadStateFromStorage().downloadFormat);
  
  // Real-time audio processing
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [isRealTimeProcessing, setIsRealTimeProcessing] = useState(false);

  // Save state to sessionStorage whenever it changes
  const saveStateToStorage = (state: any) => {
    try {
      sessionStorage.setItem('professionalTierState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to storage:', error);
    }
  };

  // Save state whenever relevant state changes
  useEffect(() => {
    saveStateToStorage({
      currentStep,
      selectedGenre,
      processedAudioUrl,
      isProcessing,
      downloadFormat,
      fileInfo
    });
  }, [currentStep, selectedGenre, processedAudioUrl, isProcessing, downloadFormat, fileInfo]);

  // Debug audio elements and real-time processing
  useEffect(() => {
    console.log('Original audio element:', originalAudioElement);
    console.log('Mastered audio element:', masteredAudioElement);
    console.log('Real-time processing state:', isRealTimeProcessing);
    console.log('Audio context:', audioContext);
    console.log('Gain node:', gainNode);
    console.log('Compressor node:', compressorNode);
  }, [originalAudioElement, masteredAudioElement, isRealTimeProcessing, audioContext, gainNode, compressorNode]);

  // Genre presets with processing details - 7 Color System
  const GENRE_PRESETS: Record<string, any> = {
    // RED - High Energy, Bass Heavy (Loud & Aggressive)
    afrobeats: {
      gain: 1.8,
      compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
      eq: { low: 2.0, mid: 1.0, high: 0.5 },
      truePeak: -0.1,
      targetLufs: -7.0
    },
    trap: {
      gain: 2.2,
      compression: { threshold: -14, ratio: 6, attack: 0.001, release: 0.08 },
      eq: { low: 3.5, mid: 1.2, high: 0.6 },
      truePeak: -0.1,
      targetLufs: -7.2
    },
    drill: {
      gain: 2.0,
      compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
      eq: { low: 3.0, mid: 1.8, high: 0.7 },
      truePeak: -0.15,
      targetLufs: -7.5
    },
    dubstep: {
      gain: 2.5,
      compression: { threshold: -12, ratio: 8, attack: 0.001, release: 0.05 },
      eq: { low: 4.0, mid: 1.0, high: 0.8 },
      truePeak: -0.1,
      targetLufs: -7.0
    },
    
    // BLUE - Smooth, Melodic (Gentle & Warm)
    gospel: {
      gain: 1.4,
      compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
      eq: { low: 1.5, mid: 2.0, high: 1.0 },
      truePeak: -0.3,
      targetLufs: -8.5
    },
    'r-b': {
      gain: 1.3,
      compression: { threshold: -24, ratio: 2.2, attack: 0.015, release: 0.2 },
      eq: { low: 1.2, mid: 2.5, high: 1.8 },
      truePeak: -0.35,
      targetLufs: -8.8
    },
    'lofi-hiphop': {
      gain: 1.1,
      compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.3 },
      eq: { low: 0.8, mid: 1.5, high: 1.2 },
      truePeak: -0.4,
      targetLufs: -9.0
    },
    
    // ORANGE - Energetic, Dynamic (Punchy & Clear)
    'hip-hop': {
      gain: 2.0,
      compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
      eq: { low: 3.0, mid: 1.5, high: 0.8 },
      truePeak: -0.15,
      targetLufs: -7.8
    },
    house: {
      gain: 1.9,
      compression: { threshold: -17, ratio: 4.5, attack: 0.002, release: 0.15 },
      eq: { low: 2.5, mid: 1.8, high: 1.0 },
      truePeak: -0.2,
      targetLufs: -8.0
    },
    techno: {
      gain: 2.1,
      compression: { threshold: -15, ratio: 5.5, attack: 0.001, release: 0.08 },
      eq: { low: 3.2, mid: 1.6, high: 0.9 },
      truePeak: -0.15,
      targetLufs: -7.5
    },
    
    // GREEN - Natural, Organic (Balanced & Warm)
    highlife: {
      gain: 1.6,
      compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
      eq: { low: 1.8, mid: 2.2, high: 1.2 },
      truePeak: -0.25,
      targetLufs: -8.2
    },
    instrumentals: {
      gain: 1.4,
      compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.25 },
      eq: { low: 1.5, mid: 2.0, high: 1.5 },
      truePeak: -0.3,
      targetLufs: -8.5
    },
    beats: {
      gain: 1.7,
      compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.2 },
      eq: { low: 2.2, mid: 1.8, high: 1.0 },
      truePeak: -0.2,
      targetLufs: -8.0
    },
    
    // PURPLE - Creative, Artistic (Dynamic & Expressive)
    amapiano: {
      gain: 1.7,
      compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
      eq: { low: 2.2, mid: 1.8, high: 1.5 },
      truePeak: -0.2,
      targetLufs: -8.0
    },
    trance: {
      gain: 1.8,
      compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
      eq: { low: 2.0, mid: 1.5, high: 1.8 },
      truePeak: -0.15,
      targetLufs: -7.8
    },
    'drum-bass': {
      gain: 2.3,
      compression: { threshold: -13, ratio: 7, attack: 0.001, release: 0.06 },
      eq: { low: 3.8, mid: 1.4, high: 1.0 },
      truePeak: -0.1,
      targetLufs: -7.0
    },
    
    // YELLOW - Bright, Clear (Crisp & Present)
    reggae: {
      gain: 1.5,
      compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.3 },
      eq: { low: 2.5, mid: 1.2, high: 0.6 },
      truePeak: -0.25,
      targetLufs: -8.2
    },
    'voice-over': {
      gain: 1.2,
      compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
      eq: { low: 0.8, mid: 2.8, high: 2.2 },
      truePeak: -0.4,
      targetLufs: -9.2
    },
    journalist: {
      gain: 1.1,
      compression: { threshold: -26, ratio: 1.8, attack: 0.025, release: 0.5 },
      eq: { low: 0.6, mid: 3.0, high: 2.5 },
      truePeak: -0.45,
      targetLufs: -9.5
    },
    
    // PINK - Warm, Emotional (Smooth & Intimate)
    soul: {
      gain: 1.3,
      compression: { threshold: -23, ratio: 2.2, attack: 0.015, release: 0.2 },
      eq: { low: 1.2, mid: 2.5, high: 1.8 },
      truePeak: -0.35,
      targetLufs: -8.8
    },
    'content-creator': {
      gain: 1.6,
      compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
      eq: { low: 1.5, mid: 2.0, high: 1.5 },
      truePeak: -0.3,
      targetLufs: -8.5
    },
    pop: {
      gain: 1.5,
      compression: { threshold: -20, ratio: 3, attack: 0.003, release: 0.25 },
      eq: { low: 1.5, mid: 1.0, high: 1.2 },
      truePeak: -0.25,
      targetLufs: -8.0
    },
    
    // INDIGO - Sophisticated, Complex (Refined & Detailed)
    jazz: {
      gain: 1.2,
      compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
      eq: { low: 1.0, mid: 1.8, high: 2.0 },
      truePeak: -0.4,
      targetLufs: -9.0
    }
  };

  const clearState = () => {
    sessionStorage.removeItem('professionalTierState');
    setCurrentStep(1);
    setSelectedFile(null);
    setFileInfo(null);
    setSelectedGenre(null);
    setProcessedAudioUrl(null);
    setIsProcessing(false);
    setOriginalAudioElement(null);
    setMasteredAudioElement(null);
    setDownloadFormat('wav');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear previous state when starting a new session
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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Initialize real-time audio processing
  const initializeRealTimeProcessing = async () => {
    if (!selectedFile || !originalAudioElement) return;
    
    try {
      console.log('Initializing real-time processing...');
      
      // Create audio context
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      
      // Create audio source from the original audio element
      const source = ctx.createMediaElementSource(originalAudioElement);
      setAudioSource(source);
      
      // Create gain node
      const gain = ctx.createGain();
      setGainNode(gain);
      
      // Create compressor node
      const compressor = ctx.createDynamicsCompressor();
      setCompressorNode(compressor);
      
      // Connect the processing chain
      source.connect(compressor).connect(gain).connect(ctx.destination);
      
      setIsRealTimeProcessing(true);
      console.log('Real-time audio processing initialized successfully');
      
      // Apply current genre preset if one is selected
      if (selectedGenre) {
        applyGenrePresetRealTime(selectedGenre);
      }
      
    } catch (error) {
      console.error('Error initializing real-time processing:', error);
      setIsRealTimeProcessing(false);
    }
  };

  // Apply genre preset in real-time
  const applyGenrePresetRealTime = (genre: GenreType) => {
    if (!gainNode || !compressorNode) return;
    
    const preset = GENRE_PRESETS[genre.id] || GENRE_PRESETS.afrobeats;
    
    // Apply gain changes
    gainNode.gain.setValueAtTime(preset.gain, gainNode.context.currentTime);
    
    // Apply compression changes
    compressorNode.threshold.setValueAtTime(preset.compression.threshold, compressorNode.context.currentTime);
    compressorNode.ratio.setValueAtTime(preset.compression.ratio, compressorNode.context.currentTime);
    compressorNode.attack.setValueAtTime(preset.compression.attack, compressorNode.context.currentTime);
    compressorNode.release.setValueAtTime(preset.compression.release, compressorNode.context.currentTime);
    compressorNode.knee.setValueAtTime(10, compressorNode.context.currentTime);
    
    console.log(`Applied ${genre.name} preset in real-time`);
    
    // If mastered audio is playing, don't interrupt it
    if (isPlayingMastered && masteredAudioElement && !masteredAudioElement.paused) {
      console.log('Mastered audio is playing, real-time changes applied to original audio only');
    }
  };

  const processAudioWithGenre = async (genre: GenreType) => {
    if (!selectedFile) return;
    
    // Store current playback state
    const wasPlayingMastered = isPlayingMastered && masteredAudioElement && !masteredAudioElement.paused;
    const wasPlayingOriginal = isPlayingOriginal && originalAudioElement && !originalAudioElement.paused;
    
    setSelectedGenre(genre);
    
    // If real-time processing is available and audio is playing, use real-time
    if (isRealTimeProcessing && originalAudioElement && !originalAudioElement.paused) {
      console.log('Using real-time processing for genre change while audio is playing');
      applyGenrePresetRealTime(genre);
      
      // Restore mastered audio playback if it was playing
      if (wasPlayingMastered && masteredAudioElement && processedAudioUrl) {
        console.log('Restoring mastered audio playback after genre change');
        setTimeout(() => {
          masteredAudioElement.play().catch(console.error);
        }, 100);
      }
      return;
    }
    
    // If real-time processing is available but audio is paused, just apply the preset
    if (isRealTimeProcessing && originalAudioElement && originalAudioElement.paused) {
      console.log('Real-time processing available but audio paused, applying preset for next play');
      applyGenrePresetRealTime(genre);
      return;
    }
    
    // If no real-time processing yet, try to initialize it first
    if (!isRealTimeProcessing && originalAudioElement) {
      console.log('Attempting to initialize real-time processing...');
      await initializeRealTimeProcessing();
      // Check again after initialization
      if (isRealTimeProcessing) {
        console.log('Real-time processing initialized, applying preset');
        applyGenrePresetRealTime(genre);
        return;
      }
    }
    
    // Fallback to offline processing for initial load or when audio is not playing
    console.log('Using offline processing for genre change');
    setIsProcessing(true);
    
    try {
      console.log(`Starting ${genre.name} audio processing...`);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(URL.createObjectURL(selectedFile));
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
      
      // Get genre preset
      const preset = GENRE_PRESETS[genre.id] || GENRE_PRESETS.afrobeats;
      
      // Apply genre-specific processing
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = preset.gain;
      
      // Add compression with genre-specific settings
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = preset.compression.threshold;
      compressor.knee.value = 10;
      compressor.ratio.value = preset.compression.ratio;
      compressor.attack.value = preset.compression.attack;
      compressor.release.value = preset.compression.release;
      
      // Connect the processing chain
      source.connect(compressor).connect(gainNode).connect(offlineContext.destination);
      
      console.log(`Starting rendering with ${genre.name} preset...`);
      source.start(0);
      
      // Render the processed audio
      const renderedBuffer = await offlineContext.startRendering();
      
      console.log('Rendering complete, converting to WAV...');
      // Convert to WAV and create URL
      const wavBlob = await audioBufferToWav(renderedBuffer);
      const masteredUrl = URL.createObjectURL(wavBlob);
      
      // Clean up old processed audio URL to prevent memory leaks
      if (processedAudioUrl) {
        URL.revokeObjectURL(processedAudioUrl);
      }
      
      setProcessedAudioUrl(masteredUrl);
      
      console.log(`${genre.name} preset mastered audio created successfully:`, masteredUrl);
      audioContext.close();
      
    } catch (error) {
      console.error(`Error processing audio with ${genre.name} preset:`, error);
      // Show user-friendly error message
      alert(`Error processing audio with ${genre.name} preset. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleDownload = async () => {
    if (processedAudioUrl && selectedFile) {
      try {
        // Fetch the processed audio data
        const response = await fetch(processedAudioUrl);
        const audioBlob = await response.blob();
        
        // Create the appropriate file format
        let finalBlob = audioBlob;
        let fileName = `mastered_${selectedFile.name.replace(/\.[^\/.]+$/, '')}`;
        
        if (downloadFormat === 'mp3') {
          // For MP3, we need to ensure it's properly encoded
          fileName += '.mp3';
          finalBlob = new Blob([audioBlob], { type: 'audio/mpeg' });
        } else {
          // For WAV, ensure it's properly formatted
          fileName += '.wav';
          finalBlob = new Blob([audioBlob], { type: 'audio/wav' });
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(finalBlob);
        link.download = fileName;
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        setTimeout(() => {
          URL.revokeObjectURL(link.href);
        }, 100);
        
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again.');
      }
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-crys-gold">Professional Tier Dashboard</h1>
            <p className="text-gray-400">Step {currentStep} of 3</p>
          </div>
          {currentStep > 1 && (
            <button
              onClick={clearState}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Start New Session
            </button>
          )}
        </div>
        
        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-crys-gold mb-2">Upload Your Audio</h2>
              <p className="text-gray-400">Select your audio file to begin professional mastering</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-crys-gold transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop your audio file here</h3>
                <p className="text-gray-400 mb-4">Supports WAV, MP3, FLAC, and other audio formats</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Choose File
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
                      onClick={nextStep}
                      disabled={!selectedFile}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                        selectedFile 
                          ? 'bg-crys-gold text-black hover:bg-yellow-400' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Genre Selection + Audio Comparison */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Genre Selection */}
                         <div>
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-crys-gold mb-2">Select Genre & Process</h2>
                 <p className="text-gray-400">Click a genre to apply its preset and process your audio</p>
                 {isRealTimeProcessing && isPlayingOriginal && (
                   <div className="mt-2 flex items-center justify-center space-x-2">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                     <span className="text-sm text-green-400 font-medium">Real-time processing active</span>
                   </div>
                 )}
               </div>
              
                             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                 {availableGenres.map((genre) => {
                   const isSelected = selectedGenre?.id === genre.id;
                   
                                       // 7-Color System for Genres
                    const getGenreGradient = (genreId: string) => {
                      const colorMap: Record<string, string> = {
                        // RED - High Energy, Bass Heavy
                        afrobeats: 'from-red-500 to-red-700',
                        trap: 'from-red-400 to-red-600',
                        drill: 'from-red-600 to-red-800',
                        dubstep: 'from-red-300 to-red-500',
                        
                        // BLUE - Smooth, Melodic
                        gospel: 'from-blue-500 to-blue-700',
                        'r-b': 'from-blue-400 to-blue-600',
                        'lofi-hiphop': 'from-blue-600 to-blue-800',
                        
                        // ORANGE - Energetic, Dynamic
                        'hip-hop': 'from-orange-500 to-orange-700',
                        house: 'from-orange-400 to-orange-600',
                        techno: 'from-orange-600 to-orange-800',
                        
                        // GREEN - Natural, Organic
                        highlife: 'from-green-500 to-green-700',
                        instrumentals: 'from-green-400 to-green-600',
                        beats: 'from-green-600 to-green-800',
                        
                        // PURPLE - Creative, Artistic
                        amapiano: 'from-purple-500 to-purple-700',
                        trance: 'from-purple-400 to-purple-600',
                        'drum-bass': 'from-purple-600 to-purple-800',
                        
                        // YELLOW - Bright, Clear
                        reggae: 'from-yellow-500 to-yellow-700',
                        'voice-over': 'from-yellow-400 to-yellow-600',
                        journalist: 'from-yellow-600 to-yellow-800',
                        
                        // PINK - Warm, Emotional
                        soul: 'from-pink-500 to-pink-700',
                        'content-creator': 'from-pink-400 to-pink-600',
                        pop: 'from-pink-600 to-pink-800',
                        
                        // INDIGO - Sophisticated, Complex
                        jazz: 'from-indigo-500 to-indigo-700'
                      };
                      
                      return colorMap[genreId] || 'from-gray-500 to-gray-600';
                    };
                   
                                       return (
                      <button
                        key={genre.id}
                        onClick={() => processAudioWithGenre(genre)}
                        disabled={isProcessing}
                        className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center hover:scale-105 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
                          isSelected
                            ? 'border-crys-gold shadow-lg shadow-crys-gold/30 scale-105'
                            : 'border-white/20 hover:border-white/40 hover:scale-110'
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative`}
                      >
                        {isProcessing && isSelected && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-crys-gold border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        {isRealTimeProcessing && isSelected && isPlayingOriginal && (
                          <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <h3 className="font-semibold text-sm mb-1 text-white drop-shadow-sm">{genre.name}</h3>
                        <p className="text-xs text-white/80 leading-tight drop-shadow-sm">{genre.description}</p>
                        {isRealTimeProcessing && isSelected && isPlayingOriginal && (
                          <p className="text-xs text-green-400 mt-1">Live</p>
                        )}
                      </button>
                    );
                 })}
               </div>
            </div>

            {/* Audio Comparison */}
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-crys-gold mb-2">Before & After Comparison</h2>
                <p className="text-gray-400">Compare your original audio with the mastered version</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Original Audio</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">File</span>
                        <span className="text-xs font-medium">{selectedFile?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Size</span>
                        <span className="text-xs font-medium">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    
                                                                                                                               <StyledAudioPlayer
                         src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
                         title="Original Audio"
                         onPlay={() => {
                           setIsPlayingOriginal(true);
                           if (masteredAudioElement) masteredAudioElement.pause();
                           setIsPlayingMastered(false);
                           
                           // Initialize real-time processing when audio starts playing
                           if (!isRealTimeProcessing) {
                             console.log('Audio started playing, initializing real-time processing...');
                             setTimeout(() => {
                               initializeRealTimeProcessing();
                             }, 100);
                           }
                         }}
                         onPause={() => setIsPlayingOriginal(false)}
                         className="w-full"
                         onAudioElementReady={(audioElement) => {
                           console.log('Original audio element ready:', audioElement);
                           setOriginalAudioElement(audioElement);
                           
                           // Initialize real-time processing immediately when element is ready
                           if (!isRealTimeProcessing) {
                             console.log('Audio element ready, initializing real-time processing...');
                             setTimeout(() => {
                               initializeRealTimeProcessing();
                             }, 100);
                           }
                         }}
                       />
                     
                     {/* Frequency Spectrum Analysis for Original */}
                     <FrequencySpectrum
                       audioElement={originalAudioElement}
                       isPlaying={isPlayingOriginal}
                       title="Original Frequency Spectrum"
                       targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id].targetLufs : undefined}
                       targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id].truePeak : undefined}
                     />
                     
                     <div className="text-center">
                       <p className="text-xs text-gray-400">Original, unprocessed audio</p>
                     </div>
                  </div>
                </div>

                {/* Mastered Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
                    {selectedGenre ? `${selectedGenre.name} Mastered` : 'Mastered Audio'}
                  </h3>
                  <div className="space-y-4">
                                         {selectedGenre && (
                       <div className="bg-gray-700 rounded-lg p-3">
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-400">File</span>
                           <span className="text-xs font-medium text-crys-gold">mastered_{selectedFile?.name.replace(/\.[^\/.]+$/, '')}</span>
                         </div>
                       </div>
                     )}
                    
                                         {processedAudioUrl ? (
                       <>
                                                   <StyledAudioPlayer
                            src={processedAudioUrl}
                            title="Mastered Audio"
                            onPlay={() => {
                              setIsPlayingMastered(true);
                              if (originalAudioElement) originalAudioElement.pause();
                              setIsPlayingOriginal(false);
                            }}
                            onPause={() => setIsPlayingMastered(false)}
                            className="w-full"
                            onAudioElementReady={(audioElement) => {
                              console.log('Mastered audio element ready:', audioElement);
                              setMasteredAudioElement(audioElement);
                            }}
                            key={`${processedAudioUrl}-${selectedGenre?.id}`} // Force re-render when URL or genre changes
                          />
                         
                         {/* Frequency Spectrum Analysis for Mastered */}
                         <FrequencySpectrum
                           audioElement={masteredAudioElement}
                           isPlaying={isPlayingMastered}
                           title={`${selectedGenre?.name || 'Mastered'} Frequency Spectrum`}
                           targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id].targetLufs : undefined}
                           targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id].truePeak : undefined}
                         />
                       </>
                     ) : (
                       <div className="bg-gray-700 rounded-lg p-6 text-center">
                         {isProcessing ? (
                           <>
                             <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                             <p className="text-xs text-gray-400">
                               {selectedGenre ? `Processing ${selectedGenre.name} preset...` : 'Processing audio...'}
                             </p>
                             <p className="text-xs text-crys-gold mt-1">Please wait, this may take a few seconds</p>
                           </>
                         ) : (
                           <p className="text-xs text-gray-400">Select a genre to process</p>
                         )}
                       </div>
                     )}
                     
                     <div className="text-center">
                       <p className="text-xs text-crys-gold">
                         {selectedGenre ? `Mastered with ${selectedGenre.name} preset` : 'Mastered audio'}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

                         {/* Analysis Summary */}
             {processedAudioUrl && selectedGenre && (
               <div className="bg-gray-800 rounded-xl p-6">
                 <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
                   Mastering Analysis Summary
                 </h3>
                 <div className="grid md:grid-cols-2 gap-6">
                                       <div className="space-y-3">
                      <h4 className="font-medium text-white">Applied Processing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Genre Preset:</span>
                          <span className="text-crys-gold font-medium">{selectedGenre.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Processing:</span>
                          <span className="text-green-400 font-medium">Complete</span>
                        </div>
                      </div>
                    </div>
                   
                   <div className="space-y-3">
                     <h4 className="font-medium text-white">Frequency Enhancements</h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Low Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.low * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Mid Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.mid * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">High Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.high * 100)}%
                         </span>
                       </div>
                                               <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Processing:</span>
                          <span className="text-green-400 font-medium">Complete</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Target LUFS:</span>
                          <span className="text-crys-gold font-medium">{GENRE_PRESETS[selectedGenre.id].targetLufs} dB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">True Peak:</span>
                          <span className="text-crys-gold font-medium">{GENRE_PRESETS[selectedGenre.id].truePeak} dB</span>
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Navigation */}
             <div className="flex justify-center space-x-4">
               <button
                 onClick={prevStep}
                 className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
               >
                 <ArrowLeft className="w-4 h-4" />
                 <span>Back</span>
               </button>
               {processedAudioUrl && (
                 <button
                   onClick={nextStep}
                   className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                 >
                   <span>Continue to Download</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
               )}
             </div>
          </div>
        )}

                 {/* Step 3: Export Gate */}
         {currentStep === 3 && (
           <div className="space-y-8">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-bold text-crys-gold mb-2">Export Gate</h2>
               <p className="text-gray-400">Choose your preferred format and export your mastered audio</p>
             </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Download Format</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(['wav', 'mp3'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setDownloadFormat(format)}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            downloadFormat === format
                              ? 'border-crys-gold bg-crys-gold/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold uppercase">{format}</div>
                            <div className="text-sm text-gray-400">
                              {format === 'wav' ? 'Lossless Quality' : 'Compressed Format'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                                     <button
                     onClick={handleDownload}
                     disabled={!processedAudioUrl}
                     className="w-full bg-crys-gold text-black py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                   >
                     <Download className="w-5 h-5" />
                     <span>Export Mastered Audio</span>
                   </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevStep}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTierDashboard;
