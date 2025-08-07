
import React, { useState, useRef, useEffect } from 'react';
import ProcessedAudioAnalysis from './ProcessedAudioAnalysis';
import { Music, Upload, FileAudio, ArrowRight, ArrowLeft, Download, Play, Pause, Settings, Headphones } from 'lucide-react';


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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    sampleRate: '44.1kHz',
    resolution: '16bit'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);
  const [currentTimeProcessed, setCurrentTimeProcessed] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('wav');
  const [audioAnalysis, setAudioAnalysis] = useState<{
    dominantFrequencies: number[];
    dynamicRange: number;
    bassContent: number;
    midContent: number;
    trebleContent: number;
    rhythmComplexity: number;
    vocalPresence: number;
    suggestedGenres: string[];
  } | null>(null);
  
  const [processedAudioAnalysis, setProcessedAudioAnalysis] = useState<{
    dominantFrequencies: number[];
    dynamicRange: number;
    bassContent: number;
    midContent: number;
    trebleContent: number;
    rhythmComplexity: number;
    vocalPresence: number;
    appliedSettings: {
      gain: number;
      bassBoost: number;
      midCut: number;
      presenceBoost: number;
      clarityBoost: number;
      airBoost: number;
      compressionThreshold: number;
      compressionRatio: number;
    };
  } | null>(null);
  
  const processedAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const genres: Genre[] = [
    { name: 'Pop', description: 'Mainstream pop music with clear vocals and catchy melodies', color: 'bg-pink-500' },
    { name: 'Hip Hop / Rap', description: 'Bass-heavy hip hop and rap with punchy dynamics and clear vocals', color: 'bg-purple-600' },
    { name: 'Hip Hop Deluxe', description: 'AI-enhanced hip hop with intelligent parameter adjustments', color: 'bg-indigo-700' }
  ];

  const analyzeAudio = async (audioBuffer: AudioBuffer) => {
    const analysis = {
      dominantFrequencies: [] as number[],
      dynamicRange: 0,
      bassContent: 0,
      midContent: 0,
      trebleContent: 0,
      rhythmComplexity: 0,
      vocalPresence: 0,
      suggestedGenres: [] as string[]
    };

    // Analyze frequency content
    const fftSize = 2048;
    const analyser = new AudioContext().createAnalyser();
    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Create a temporary source to analyze
    const tempContext = new AudioContext();
    const tempSource = tempContext.createBufferSource();
    tempSource.buffer = audioBuffer;
    tempSource.connect(analyser);
    tempSource.start(0);

    // Get frequency data
    analyser.getByteFrequencyData(dataArray);

    // Calculate frequency bands
    const bassSum = dataArray.slice(0, Math.floor(bufferLength * 0.1)).reduce((a, b) => a + b, 0);
    const midSum = dataArray.slice(Math.floor(bufferLength * 0.1), Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0);
    const trebleSum = dataArray.slice(Math.floor(bufferLength * 0.5)).reduce((a, b) => a + b, 0);

    analysis.bassContent = bassSum / (bufferLength * 0.1);
    analysis.midContent = midSum / (bufferLength * 0.4);
    analysis.trebleContent = trebleSum / (bufferLength * 0.5);

    // Find dominant frequencies
    const peaks: { frequency: number; magnitude: number }[] = [];
    for (let i = 0; i < bufferLength; i++) {
      const frequency = i * tempContext.sampleRate / fftSize;
      if (dataArray[i] > 128) { // Threshold for significant frequencies
        peaks.push({ frequency, magnitude: dataArray[i] });
      }
    }
    peaks.sort((a, b) => b.magnitude - a.magnitude);
    analysis.dominantFrequencies = peaks.slice(0, 5).map(p => p.frequency);

    // Analyze dynamic range
    const samples = audioBuffer.getChannelData(0);
    const rms = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
    const peak = Math.max(...samples.map(Math.abs));
    analysis.dynamicRange = peak / (rms + 0.0001);

    // Estimate rhythm complexity (simplified)
    const zeroCrossings = samples.reduce((count, sample, i) => {
      if (i > 0 && (sample >= 0) !== (samples[i - 1] >= 0)) count++;
      return count;
    }, 0);
    analysis.rhythmComplexity = zeroCrossings / samples.length;

    // Estimate vocal presence (simplified - look for human voice frequencies)
    const voiceFreqSum = dataArray.slice(
      Math.floor(80 * fftSize / tempContext.sampleRate),
      Math.floor(8000 * fftSize / tempContext.sampleRate)
    ).reduce((a, b) => a + b, 0);
    analysis.vocalPresence = voiceFreqSum / (8000 - 80);

    // Suggest genres based on analysis
    const suggestions: string[] = [];

    // Bass-heavy genres
    if (analysis.bassContent > 150) {
      if (analysis.trebleContent > 120) suggestions.push('Trap', 'Drill', 'Electronic / EDM');
      else suggestions.push('Hip Hop / Rap', 'Gqom / Amapiano');
    }

    // Vocal-focused genres
    if (analysis.vocalPresence > 100) {
      if (analysis.bassContent > 120) suggestions.push('R&B / Soul', 'Pop', 'Afrobeats / Afro Pop');
      else suggestions.push('Gospel', 'A Cappella', 'Opera');
    }

    // High-frequency genres
    if (analysis.trebleContent > 140) {
      suggestions.push('K-Pop / J-Pop / C-Pop', 'Future Bass', 'Electronic / EDM');
    }

    // Mid-heavy genres
    if (analysis.midContent > 130) {
      suggestions.push('Rock', 'Alternative R&B', 'Neo-Soul');
    }

    // Low complexity (ambient)
    if (analysis.rhythmComplexity < 0.1) {
      suggestions.push('Ambient / Chillout', 'Classical');
    }

    // High dynamic range
    if (analysis.dynamicRange > 10) {
      suggestions.push('Classical', 'Jazz', 'Post-Rock');
    }

    // Remove duplicates and limit to top 5
    analysis.suggestedGenres = [...new Set(suggestions)].slice(0, 5);

    return analysis;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }

      // Analyze the uploaded audio
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const analysis = await analyzeAudio(audioBuffer);
        setAudioAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing audio:', error);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processAudioWithGenre = async (audioBuffer: AudioBuffer, genre: Genre): Promise<AudioBuffer> => {
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create processing chain - Simple Free Tier style
    const gainNode = offlineContext.createGain();
    const compressor = offlineContext.createDynamicsCompressor();
    
    // Create EQ bands (reused across genres)
    const lowShelf60 = offlineContext.createBiquadFilter();
    const lowShelf120 = offlineContext.createBiquadFilter();
    const peaking400 = offlineContext.createBiquadFilter();
    const peaking1000 = offlineContext.createBiquadFilter();
    const peaking3200 = offlineContext.createBiquadFilter();
    const highShelf10000 = offlineContext.createBiquadFilter();

    // Get intelligent adjustments if analysis is available
    const adjustments = audioAnalysis ? getIntelligentPresetAdjustments(genre, audioAnalysis) : {
      gainAdjustment: 0,
      bassBoost: 0,
      midBoost: 0,
      trebleBoost: 0,
      compressionAdjustment: 0,
      intelligentGain: 2.0,
      adaptiveThreshold: -12,
      adaptiveRatio: 3.0,
      adaptiveAttack: 0.005,
      adaptiveRelease: 0.25,
      adaptiveKnee: 8,
      makeupGain: 2.0,
      limiterThreshold: -1.0,
      limiterRatio: 8
    };

    // Genre-specific processing - Only Pop for now (exact Free Tier settings)
    switch (genre.name) {
      case 'Pop':
        // Pop - Exact Copy from Free Tier Dashboard
        gainNode.gain.value = 1.5; // Boost volume by 50% (exact Free Tier)
        // Exact compression settings from Free Tier
        compressor.threshold.value = -20; compressor.ratio.value = 3; compressor.attack.value = 0.003; compressor.release.value = 0.25; compressor.knee.value = 10;
        break;
        
      case 'Hip Hop / Rap':
        // Hip Hop/Rap - Industry Standard Settings
        gainNode.gain.value = 2.0; // Boost volume by 100% for loud, punchy sound
        
        // Use existing EQ bands (already declared at the top)
        
        // EQ Settings for Hip Hop/Rap
        // Bass boost for heavy, punchy low end
        lowShelf60.type = 'lowshelf';
        lowShelf60.frequency.value = 60;
        lowShelf60.gain.value = 3.5; // Strong bass boost
        
        lowShelf120.type = 'lowshelf';
        lowShelf120.frequency.value = 120;
        lowShelf120.gain.value = 2.0; // Additional low-mid boost
        
        // Mid-range control for vocals and instruments
        peaking400.type = 'peaking';
        peaking400.frequency.value = 400;
        peaking400.Q.value = 0.7;
        peaking400.gain.value = -2.0; // Cut muddiness
        
        peaking1000.type = 'peaking';
        peaking1000.frequency.value = 1000;
        peaking1000.Q.value = 0.7;
        peaking1000.gain.value = 1.0; // Boost presence
        
        // High-end for clarity and air
        peaking3200.type = 'peaking';
        peaking3200.frequency.value = 3200;
        peaking3200.Q.value = 0.7;
        peaking3200.gain.value = 1.5; // Boost clarity
        
        highShelf10000.type = 'highshelf';
        highShelf10000.frequency.value = 10000;
        highShelf10000.gain.value = 2.0; // Add air and sparkle
        
        // Compression settings for Hip Hop/Rap
        compressor.threshold.value = -15; // Lower threshold for more aggressive compression
        compressor.ratio.value = 4.5; // Higher ratio for punchy, controlled sound
        compressor.attack.value = 0.005; // Slightly slower attack to preserve transients
        compressor.release.value = 0.25; // Standard release
        compressor.knee.value = 6; // Harder knee for more aggressive compression
        
        // Connect the processing chain for Hip Hop/Rap
        source.connect(lowShelf60);
        lowShelf60.connect(lowShelf120);
        lowShelf120.connect(peaking400);
        peaking400.connect(peaking1000);
        peaking1000.connect(peaking3200);
        peaking3200.connect(highShelf10000);
        highShelf10000.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        source.start(0);
        return await offlineContext.startRendering();
        
      case 'Hip Hop Deluxe':
        // Hip Hop Deluxe - AI-Enhanced Intelligent Settings
        const getIntelligentAdjustments = () => {
          if (!audioAnalysis) {
            return {
              bassBoost: 3.5,
              lowMidBoost: 2.0,
              midCut: -2.0,
              presenceBoost: 1.0,
              clarityBoost: 1.5,
              airBoost: 2.0,
              gainBoost: 2.0,
              compressionThreshold: -15,
              compressionRatio: 4.5,
              compressionAttack: 0.005,
              compressionRelease: 0.25,
              compressionKnee: 6
            };
          }

          // Intelligent adjustments based on audio analysis
          return {
            // Bass adjustments based on existing bass content
            bassBoost: Math.max(2.5, Math.min(5.0, 3.5 + (150 - audioAnalysis.bassContent) / 50)),
            lowMidBoost: Math.max(1.5, Math.min(3.0, 2.0 + (120 - audioAnalysis.bassContent) / 60)),
            
            // Mid-range adjustments based on vocal presence
            midCut: audioAnalysis.vocalPresence > 120 ? -1.5 : -2.5,
            presenceBoost: Math.max(0.5, Math.min(2.0, 1.0 + audioAnalysis.vocalPresence / 100)),
            
            // High-end adjustments based on treble content
            clarityBoost: Math.max(1.0, Math.min(2.5, 1.5 + (140 - audioAnalysis.trebleContent) / 40)),
            airBoost: Math.max(1.5, Math.min(3.0, 2.0 + (130 - audioAnalysis.trebleContent) / 50)),
            
            // Gain adjustments based on dynamic range
            gainBoost: Math.max(1.8, Math.min(2.5, 2.0 + (audioAnalysis.dynamicRange - 10) / 20)),
            
            // Compression adjustments based on dynamic range and rhythm complexity
            compressionThreshold: Math.max(-20, Math.min(-10, -15 + (audioAnalysis.dynamicRange - 8) / 4)),
            compressionRatio: Math.max(3.5, Math.min(6.0, 4.5 + audioAnalysis.rhythmComplexity * 2)),
            compressionAttack: Math.max(0.003, Math.min(0.008, 0.005 - audioAnalysis.rhythmComplexity * 0.001)),
            compressionRelease: Math.max(0.2, Math.min(0.3, 0.25 + audioAnalysis.rhythmComplexity * 0.01)),
            compressionKnee: Math.max(4, Math.min(8, 6 + audioAnalysis.dynamicRange / 5))
          };
        };

        const adjustments = getIntelligentAdjustments();
        
        // Use existing EQ bands for Hip Hop Deluxe

        // Apply intelligent adjustments
        gainNode.gain.value = adjustments.gainBoost;
        
        // EQ Settings with intelligent adjustments
        lowShelf60.type = 'lowshelf';
        lowShelf60.frequency.value = 60;
        lowShelf60.gain.value = adjustments.bassBoost;
        
        lowShelf120.type = 'lowshelf';
        lowShelf120.frequency.value = 120;
        lowShelf120.gain.value = adjustments.lowMidBoost;
        
        peaking400.type = 'peaking';
        peaking400.frequency.value = 400;
        peaking400.Q.value = 0.7;
        peaking400.gain.value = adjustments.midCut;
        
        peaking1000.type = 'peaking';
        peaking1000.frequency.value = 1000;
        peaking1000.Q.value = 0.7;
        peaking1000.gain.value = adjustments.presenceBoost;
        
        peaking3200.type = 'peaking';
        peaking3200.frequency.value = 3200;
        peaking3200.Q.value = 0.7;
        peaking3200.gain.value = adjustments.clarityBoost;
        
        highShelf10000.type = 'highshelf';
        highShelf10000.frequency.value = 10000;
        highShelf10000.gain.value = adjustments.airBoost;
        
        // Intelligent compression settings
        compressor.threshold.value = adjustments.compressionThreshold;
        compressor.ratio.value = adjustments.compressionRatio;
        compressor.attack.value = adjustments.compressionAttack;
        compressor.release.value = adjustments.compressionRelease;
        compressor.knee.value = adjustments.compressionKnee;
        
        // Connect the processing chain for Hip Hop Deluxe
        source.connect(lowShelf60);
        lowShelf60.connect(lowShelf120);
        lowShelf120.connect(peaking400);
        peaking400.connect(peaking1000);
        peaking1000.connect(peaking3200);
        peaking3200.connect(highShelf10000);
        highShelf10000.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        source.start(0);
        return await offlineContext.startRendering();
        
      case 'Hip Hop / Rap':
        // Hip Hop/Rap - Industry Standard Settings
        gainNode.gain.value = 2.0; // Boost volume by 100% for loud, punchy sound
        
        // EQ Settings for Hip Hop/Rap
        // Bass boost for heavy, punchy low end
        lowShelf60.type = 'lowshelf';
        lowShelf60.frequency.value = 60;
        lowShelf60.gain.value = 3.5; // Strong bass boost
        
        lowShelf120.type = 'lowshelf';
        lowShelf120.frequency.value = 120;
        lowShelf120.gain.value = 2.0; // Additional low-mid boost
        
        // Mid-range control for vocals and instruments
        peaking400.type = 'peaking';
        peaking400.frequency.value = 400;
        peaking400.Q.value = 0.7;
        peaking400.gain.value = -2.0; // Cut muddiness
        
        peaking1000.type = 'peaking';
        peaking1000.frequency.value = 1000;
        peaking1000.Q.value = 0.7;
        peaking1000.gain.value = 1.0; // Boost presence
        
        // High-end for clarity and air
        peaking3200.type = 'peaking';
        peaking3200.frequency.value = 3200;
        peaking3200.Q.value = 0.7;
        peaking3200.gain.value = 1.5; // Boost clarity
        
        highShelf10000.type = 'highshelf';
        highShelf10000.frequency.value = 10000;
        highShelf10000.gain.value = 2.0; // Add air and sparkle
        
        // Compression settings for Hip Hop/Rap
        compressor.threshold.value = -15; // Lower threshold for more aggressive compression
        compressor.ratio.value = 4.5; // Higher ratio for punchy, controlled sound
        compressor.attack.value = 0.005; // Slightly slower attack to preserve transients
        compressor.release.value = 0.25; // Standard release
        compressor.knee.value = 6; // Harder knee for more aggressive compression
        
        // Connect the processing chain for Hip Hop/Rap
        source.connect(lowShelf60);
        lowShelf60.connect(lowShelf120);
        lowShelf120.connect(peaking400);
        peaking400.connect(peaking1000);
        peaking1000.connect(peaking3200);
        peaking3200.connect(highShelf10000);
        highShelf10000.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        source.start(0);
        return await offlineContext.startRendering();
        
      default:
        // All genres use exact Free Tier Pop preset
        gainNode.gain.value = 1.5; // Boost volume by 50% (exact Free Tier)
        // Exact compression settings from Free Tier
        compressor.threshold.value = -20; compressor.ratio.value = 3; compressor.attack.value = 0.003; compressor.release.value = 0.25; compressor.knee.value = 10;
    }

    // Connect the processing chain - Simple Free Tier style
    source.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(offlineContext.destination);

    source.start(0);
    return await offlineContext.startRendering();
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
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

  const handleGenreSelect = async (genre: Genre) => {
    // Stop any currently playing processed audio
    if (isPlayingProcessed && processedAudioRef.current) {
      processedAudioRef.current.pause();
      setIsPlayingProcessed(false);
      // Clean up previous processed audio
      if (processedAudioRef.current) {
        processedAudioRef.current.src = '';
        processedAudioRef.current = null;
      }
    }
    
    setSelectedGenre(genre);
    setProcessedAudioUrl(null); // Clear previous processed audio
    
    if (selectedFile) {
      setIsProcessing(true);
      
      // Set initial analysis data immediately for real-time display
      const initialAnalysis = {
        dominantFrequencies: [440, 880, 1320],
        dynamicRange: 12.5,
        bassContent: 45,
        midContent: 55,
        trebleContent: 40,
        rhythmComplexity: 75,
        vocalPresence: 60,
        appliedSettings: {
          gain: 1.5,
          bassBoost: 2.0,
          midCut: 0,
          presenceBoost: 1.5,
          clarityBoost: 1.0,
          airBoost: 0.5,
          compressionThreshold: -20,
          compressionRatio: 3
        }
      };
      setProcessedAudioAnalysis(initialAnalysis);
      try {
        // Check for mobile device and handle audio context accordingly
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        if (!AudioContextClass) {
          throw new Error('Web Audio API not supported on this device');
        }
        
        const audioContext = new AudioContextClass();
        
        // For mobile devices, ensure audio context is resumed
        if (isMobile && audioContext.state === 'suspended') {
          console.log('Mobile device detected - audio context suspended, waiting for user interaction');
          // The audio context will be resumed when user interacts with the audio element
        }
        
        const arrayBuffer = await selectedFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const processedBuffer = await processAudioWithGenre(audioBuffer, genre);
        console.log('Processed buffer for', genre.name, ':', processedBuffer);
        const wavBlob = audioBufferToWav(processedBuffer);
        const url = URL.createObjectURL(wavBlob);
        setProcessedAudioUrl(url);
        console.log('Set processed audio URL for', genre.name, ':', url);
        
        // Analyze the processed audio and store applied settings
        const processedAnalysis = await analyzeAudio(processedBuffer);
        
        // Get applied settings based on genre
        let appliedSettings = {
          gain: 1.5,
          bassBoost: 0,
          midCut: 0,
          presenceBoost: 0,
          clarityBoost: 0,
          airBoost: 0,
          compressionThreshold: -20,
          compressionRatio: 3
        };
        
        if (genre.name === 'Hip Hop / Rap') {
          appliedSettings = {
            gain: 2.0,
            bassBoost: 3.5,
            midCut: -2.0,
            presenceBoost: 1.0,
            clarityBoost: 1.5,
            airBoost: 2.0,
            compressionThreshold: -15,
            compressionRatio: 4.5
          };
        } else if (genre.name === 'Hip Hop Deluxe') {
          // Calculate intelligent settings
          const adjustments = (() => {
            if (!audioAnalysis) {
              return {
                bassBoost: 3.5,
                lowMidBoost: 2.0,
                midCut: -2.0,
                presenceBoost: 1.0,
                clarityBoost: 1.5,
                airBoost: 2.0,
                gainBoost: 2.0,
                compressionThreshold: -15,
                compressionRatio: 4.5
              };
            }
            
            return {
              bassBoost: Math.max(2.5, Math.min(5.0, 3.5 + (150 - audioAnalysis.bassContent) / 50)),
              lowMidBoost: Math.max(1.5, Math.min(3.0, 2.0 + (120 - audioAnalysis.bassContent) / 60)),
              midCut: audioAnalysis.vocalPresence > 120 ? -1.5 : -2.5,
              presenceBoost: Math.max(0.5, Math.min(2.0, 1.0 + audioAnalysis.vocalPresence / 100)),
              clarityBoost: Math.max(1.0, Math.min(2.5, 1.5 + (140 - audioAnalysis.trebleContent) / 40)),
              airBoost: Math.max(1.5, Math.min(3.0, 2.0 + (130 - audioAnalysis.trebleContent) / 50)),
              gainBoost: Math.max(1.8, Math.min(2.5, 2.0 + (audioAnalysis.dynamicRange - 10) / 20)),
              compressionThreshold: Math.max(-20, Math.min(-10, -15 + (audioAnalysis.dynamicRange - 8) / 4)),
              compressionRatio: Math.max(3.5, Math.min(6.0, 4.5 + audioAnalysis.rhythmComplexity * 2))
            };
          })();
          
          appliedSettings = {
            gain: adjustments.gainBoost,
            bassBoost: adjustments.bassBoost,
            midCut: adjustments.midCut,
            presenceBoost: adjustments.presenceBoost,
            clarityBoost: adjustments.clarityBoost,
            airBoost: adjustments.airBoost,
            compressionThreshold: adjustments.compressionThreshold,
            compressionRatio: adjustments.compressionRatio
          };
        }
        
        setProcessedAudioAnalysis({
          ...processedAnalysis,
          appliedSettings
        });
        console.log('Set processed audio analysis:', {
          ...processedAnalysis,
          appliedSettings
        });
        
        // Automatically start playback of the processed audio
        setTimeout(() => {
          if (url) {
            const audio = new Audio(url);
            audio.addEventListener('timeupdate', () => setCurrentTimeProcessed(audio.currentTime));
            audio.addEventListener('ended', () => setIsPlayingProcessed(false));
            
            // Mobile-specific audio setup
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
              // Set mobile-specific audio properties
              audio.preload = 'metadata';
              audio.crossOrigin = 'anonymous';
              
              // Add mobile-specific event listeners
              audio.addEventListener('canplay', () => {
                console.log('Mobile audio ready to play');
              });
              
              audio.addEventListener('error', (e) => {
                console.error('Mobile audio error:', e);
              });
            }
            
            processedAudioRef.current = audio;
            
            // For mobile, don't auto-play - let user interact first
            if (!isMobile) {
              audio.play().then(() => {
                setIsPlayingProcessed(true);
              }).catch(error => {
                console.log('Auto-play prevented by browser:', error);
              });
            } else {
              console.log('Mobile device detected - waiting for user interaction to play audio');
            }
          }
        }, 100);
        
      } catch (error) {
        console.error('Error processing audio:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const autoMaster = async () => {
    if (!selectedFile || !audioAnalysis || audioAnalysis.suggestedGenres.length === 0) return;
    
    // Auto-select the first suggested genre and process it
    const suggestedGenre = genres.find(g => g.name === audioAnalysis.suggestedGenres[0]);
    if (suggestedGenre) {
      await handleGenreSelect(suggestedGenre);
    }
  };

  const getIntelligentPresetAdjustments = (genre: Genre, analysis: any) => {
    // Simple, clean adjustments - no complex AI for now
    return {
      gainAdjustment: 0,
      bassBoost: 0,
      midBoost: 0,
      trebleBoost: 0,
      compressionAdjustment: 0,
      intelligentGain: 2.0, // Simple base gain
      adaptiveThreshold: -12,
      adaptiveRatio: 3.0,
      adaptiveAttack: 0.005,
      adaptiveRelease: 0.25,
      adaptiveKnee: 8,
      makeupGain: 2.0,
      limiterThreshold: -1.0,
      limiterRatio: 8
    };
  };



  const toggleProcessedPlayback = () => {
    if (!processedAudioRef.current && processedAudioUrl) {
      const audio = new Audio(processedAudioUrl);
      audio.addEventListener('timeupdate', () => setCurrentTimeProcessed(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlayingProcessed(false));
      
      // Mobile-specific audio setup
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        audio.preload = 'metadata';
        audio.crossOrigin = 'anonymous';
        
        audio.addEventListener('canplay', () => {
          console.log('Mobile audio ready to play');
        });
        
        audio.addEventListener('error', (e) => {
          console.error('Mobile audio error:', e);
        });
      }
      
      processedAudioRef.current = audio;
      
      // For mobile, ensure audio context is resumed before playing
      if (isMobile) {
        // Resume any suspended audio context
        const audioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            audio.play().then(() => {
              setIsPlayingProcessed(true);
            }).catch(error => {
              console.error('Mobile audio play failed:', error);
            });
          });
        } else {
          audio.play().then(() => {
            setIsPlayingProcessed(true);
          }).catch(error => {
            console.error('Mobile audio play failed:', error);
          });
        }
      } else {
        audio.play().then(() => {
          setIsPlayingProcessed(true);
        }).catch(error => {
          console.error('Audio play failed:', error);
        });
      }
    } else if (processedAudioRef.current) {
      if (isPlayingProcessed) {
        processedAudioRef.current.pause();
        setIsPlayingProcessed(false);
      } else {
        processedAudioRef.current.play().then(() => {
          setIsPlayingProcessed(true);
        }).catch(error => {
          console.error('Audio play failed:', error);
        });
      }
    }
  };

  const seekProcessed = (time: number) => {
    if (processedAudioRef.current) {
      processedAudioRef.current.currentTime = time;
      setCurrentTimeProcessed(time);
    }
  };

  const handleDownload = () => {
    if (processedAudioUrl) {
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      link.download = `mastered_${selectedFile?.name.replace(/\.[^\/.]+$/, '')}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white" style={{ marginTop: '-120px', paddingTop: '60px' }}>
      {/* Header */}
      <div className="border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-crys-gold/90 to-yellow-500/80 rounded-md flex items-center justify-center">
                <Music className="w-4 h-4 text-black/90" />
              </div>
              <div>
                <h1 className="text-base font-bold text-crys-gold leading-none mb-0.5">Professional Tier</h1>
                <p className="text-[10px] text-gray-400 leading-none">Advanced Audio Mastering</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 leading-none mb-0.5">Step {currentStep} of 5</p>
                <div className="w-20 h-1 bg-gray-700/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-crys-gold/90 to-yellow-500/80 transition-all duration-500"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 leading-none mb-0.5">Credits</p>
                <p className="text-sm font-bold text-crys-gold leading-none">{credits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <>
          {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
              <p className="text-gray-400 text-lg">Select your audio file to begin professional mastering</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-crys-gold transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Drop your audio file here</h3>
                <p className="text-gray-400 mb-6">Supports WAV, MP3, FLAC, and other audio formats</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-8 space-y-6">
                  {/* File Info */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <FileAudio className="w-8 h-8 text-crys-gold" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedFile.name}</h4>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={nextStep}
                        className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Analysis & Suggestions */}
                  {audioAnalysis && (
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h4 className="font-semibold text-crys-gold mb-4">🎵 Audio Analysis & Smart Suggestions</h4>
                      
                      {/* Audio Characteristics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{Math.round(audioAnalysis.bassContent)}</div>
                          <div className="text-xs text-gray-400">Bass Content</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{Math.round(audioAnalysis.midContent)}</div>
                          <div className="text-xs text-gray-400">Mid Content</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{Math.round(audioAnalysis.trebleContent)}</div>
                          <div className="text-xs text-gray-400">Treble Content</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{Math.round(audioAnalysis.vocalPresence)}</div>
                          <div className="text-xs text-gray-400">Vocal Presence</div>
                        </div>
                      </div>

                      {/* Suggested Genres */}
                      {audioAnalysis.suggestedGenres.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-gray-300 mb-3">🎯 Recommended Genres:</h5>
                          <div className="flex flex-wrap gap-2">
                            {audioAnalysis.suggestedGenres.map((genreName, index) => {
                              const genre = genres.find(g => g.name === genreName);
                              return genre ? (
                                <button
                                  key={genre.name}
                                  onClick={() => handleGenreSelect(genre)}
                                  disabled={isProcessing}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                                    selectedGenre?.name === genre.name
                                      ? 'bg-crys-gold text-black'
                                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${genre.color}`} />
                                    <span>{genre.name}</span>
                                  </div>
                                </button>
                              ) : null;
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Based on your audio's frequency content, dynamic range, and characteristics
                          </p>
                          
                          {/* Auto-Master Button */}
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <button
                              onClick={autoMaster}
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <span>🤖</span>
                              <span>Auto-Master with Best Genre</span>
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Automatically applies the most suitable genre preset for your audio
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Genre Selection & Mastering */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Select Genre & Master</h2>
              <p className="text-gray-400 text-lg">Choose your genre and master your audio with professional presets</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Genre Selection */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-crys-gold">Choose Genre</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {genres.map((genre) => (
                    <button
                      key={genre.name}
                      onClick={() => handleGenreSelect(genre)}
                      disabled={isProcessing}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 text-left ${
                        selectedGenre?.name === genre.name
                          ? 'border-crys-gold bg-crys-gold/10 shadow-lg shadow-crys-gold/20'
                          : 'border-gray-600 hover:border-crys-gold/50 bg-gray-800/50 hover:bg-gray-800/70'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${genre.color}`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{genre.name}</h4>
                          <p className="text-xs text-gray-400">{genre.description}</p>
                          {selectedGenre?.name === genre.name && (
                            <div className="flex items-center space-x-2 mt-1">
                              {isProcessing ? (
                                <>
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                  <span className="text-xs text-yellow-400">Processing...</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                                  <span className="text-xs text-green-400">Applied & Playing</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Audio Playback & Analysis */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-crys-gold">Audio Playback</h3>
                
                {selectedGenre && (
                  <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${selectedGenre.color}`} />
                      <div>
                        <h4 className="font-semibold">{selectedGenre.name}</h4>
                        <p className="text-sm text-gray-400">{selectedGenre.description}</p>
                        {audioAnalysis && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-purple-400">🤖</span>
                            <span className="text-xs text-purple-400">Intelligent adjustments applied</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isProcessing && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Processing Status:</span>
                          <span className="text-sm text-yellow-400">Processing...</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-crys-gold h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Mastered Audio Playback */}
                {processedAudioUrl && (
                  <div className="bg-gray-800 rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-crys-gold">🎵 Live Mastered Audio</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Genre: {selectedGenre?.name}</span>
                        <button
                          onClick={toggleProcessedPlayback}
                          className="bg-crys-gold hover:bg-yellow-400 text-black p-2 rounded-lg transition-colors"
                        >
                          {isPlayingProcessed ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 cursor-pointer"
                           onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const clickX = e.clientX - rect.left;
                             const percentage = clickX / rect.width;
                             const duration = processedAudioRef.current?.duration || 0;
                             seekProcessed(percentage * duration);
                           }}>
                        <div 
                          className="bg-gradient-to-r from-crys-gold to-yellow-500 h-3 rounded-full transition-all duration-100"
                          style={{ width: `${(currentTimeProcessed / (processedAudioRef.current?.duration || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{Math.floor(currentTimeProcessed / 60)}:{(currentTimeProcessed % 60).toFixed(0).padStart(2, '0')}</span>
                        <span>{Math.floor((processedAudioRef.current?.duration || 0) / 60)}:{((processedAudioRef.current?.duration || 0) % 60).toFixed(0).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real-Time Audio Analysis */}
                <ProcessedAudioAnalysis 
                  analysis={processedAudioAnalysis} 
                  genreName={selectedGenre?.name}
                  audioUrl={processedAudioUrl}
                  isPlaying={isPlayingProcessed}
                  isProcessing={isProcessing}
                  audioElement={processedAudioRef.current}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                disabled={!processedAudioUrl}
                className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sample Rate & Resolution */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Audio Settings</h2>
              <p className="text-gray-400 text-lg">Configure your output format and quality</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Sample Rate */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-crys-gold" />
                  <span>Sample Rate</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['44.1kHz', '48kHz'] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setProcessingSettings(prev => ({ ...prev, sampleRate: rate }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        processingSettings.sampleRate === rate
                          ? 'border-crys-gold bg-crys-gold/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{rate}</div>
                        <div className="text-sm text-gray-400">
                          {rate === '44.1kHz' ? 'CD Quality' : 'Professional Standard'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Resolution */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Headphones className="w-5 h-5 text-crys-gold" />
                  <span>Bit Depth</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(['16bit', '32bit'] as const).map((resolution) => (
                    <button
                      key={resolution}
                      onClick={() => setProcessingSettings(prev => ({ ...prev, resolution }))}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        processingSettings.resolution === resolution
                          ? 'border-crys-gold bg-crys-gold/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold">{resolution}</div>
                        <div className="text-sm text-gray-400">
                          {resolution === '16bit' ? 'Standard Quality' : 'High Dynamic Range'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={nextStep}
                className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Before & After */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Before & After</h2>
              <p className="text-gray-400 text-lg">Compare your original and mastered audio</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Original Audio */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Original Audio</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-400">File: {selectedFile?.name}</span>
                      <br />
                      <span className="text-sm text-gray-400">
                        {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedFile) {
                          const url = URL.createObjectURL(selectedFile);
                          const audio = new Audio(url);
                          audio.play();
                        }
                      }}
                      disabled={!selectedFile}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: '0%' }}
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    0:00 / 0:00
                  </div>
                  
                  {/* Original Audio Analysis */}
                  {audioAnalysis && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Original Analysis</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Bass: {Math.round(audioAnalysis.bassContent)}%</div>
                        <div>Mid: {Math.round(audioAnalysis.midContent)}%</div>
                        <div>Treble: {Math.round(audioAnalysis.trebleContent)}%</div>
                        <div>Vocals: {Math.round(audioAnalysis.vocalPresence)}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Processed Audio */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Mastered Audio</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-400">Genre: {selectedGenre?.name}</span>
                      <br />
                      <span className="text-sm text-gray-400">
                        {processingSettings.sampleRate} / {processingSettings.resolution}
                      </span>
                    </div>
                    <button
                      onClick={toggleProcessedPlayback}
                      disabled={!processedAudioUrl}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors"
                    >
                      {isPlayingProcessed ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${(currentTimeProcessed / (processedAudioRef.current?.duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    {Math.floor(currentTimeProcessed / 60)}:{(currentTimeProcessed % 60).toFixed(0).padStart(2, '0')} / 
                    {Math.floor((processedAudioRef.current?.duration || 0) / 60)}:{((processedAudioRef.current?.duration || 0) % 60).toFixed(0).padStart(2, '0')}
                  </div>
                  

                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
              >
                <span>Download</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Download */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Download Your Mastered Audio</h2>
              <p className="text-gray-400 text-lg">Choose your preferred format and download</p>
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
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Processing Summary</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Genre: {selectedGenre?.name}</div>
                      <div>Sample Rate: {processingSettings.sampleRate}</div>
                      <div>Resolution: {processingSettings.resolution}</div>
                      <div>Output Format: {downloadFormat.toUpperCase()}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    disabled={!processedAudioUrl}
                    className="w-full bg-crys-gold text-black py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Mastered Audio</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </>
    </div>
  </div>
);
};

export default ProfessionalTierDashboard;
