import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Download, Activity, Music, ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import DownloadStep from './DownloadStep';
import { creditsAPI } from '../../services/api';

// Types
interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface AudioStats {
  loudness: number;
  peak: number;
  dynamicRange: number;
  frequencyBalance: number;
  stereoWidth: number;
}

interface GenrePreset {
  gain: number;
  compression: { threshold: number; ratio: number; attack: number; release: number };
  eq: { low: number; mid: number; high: number };
  truePeak: number;
  targetLufs: number;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

type TabType = 'upload' | 'processing' | 'download';

interface FreeTierDashboardProps {
  onDownloadAttempt?: () => boolean;
}

// Free Tier Genre Presets (copied from Professional Tier)
const FREE_GENRE_PRESETS: Record<string, GenrePreset> = {
  'hip-hop': {
    gain: 2.0,
    compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.2 },
    eq: { low: 1.6, mid: 1.0, high: 0.8 },
    truePeak: -0.2,
    targetLufs: -8.0
  },
  'afrobeats': {
    gain: 2.2,
    compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
    eq: { low: 0.9, mid: 1.0, high: 1.6 },
    truePeak: -0.1,
    targetLufs: -7.0
  }
};

// Available genres for Free Tier
const availableGenres: Genre[] = [
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    color: 'bg-orange-500',
    description: 'Bass-Driven & Punchy'
  },
  {
    id: 'afrobeats',
    name: 'Afrobeats',
    color: 'bg-red-500',
    description: 'Rhythmic & Energetic'
  }
];

const FreeTierDashboard: React.FC<FreeTierDashboardProps> = ({ onDownloadAttempt }) => {
  // States
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [originalStats, setOriginalStats] = useState<AudioStats | null>(null);
  const [masteredStats, setMasteredStats] = useState<AudioStats | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  // Audio processing refs (copied from Professional Tier)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [compressorNode, setCompressorNode] = useState<DynamicsCompressorNode | null>(null);
  const [limiterNode, setLimiterNode] = useState<DynamicsCompressorNode | null>(null);
  const [eqLowNode, setEqLowNode] = useState<BiquadFilterNode | null>(null);
  const [eqMidNode, setEqMidNode] = useState<BiquadFilterNode | null>(null);
  const [eqHighNode, setEqHighNode] = useState<BiquadFilterNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isProcessingReady, setIsProcessingReady] = useState(false);
  
  // MediaRecorder refs for audio capture (copied from Advanced Tier)
  const mediaStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

     // Refs
   const fileInputRef = useRef<HTMLInputElement>(null);
   const originalAudioRef = useRef<HTMLAudioElement | null>(null);
   const masteredAudioRef = useRef<HTMLAudioElement | null>(null);

   // Handle tab changes to stop music when leaving processing tab
   const handleTabChange = (newTab: TabType) => {
     // If leaving the processing tab and music is playing, stop it
     if (activeTab === 'processing' && newTab !== 'processing') {
       if (originalAudioElement && !originalAudioElement.paused) {
         originalAudioElement.pause();
         originalAudioElement.currentTime = 0;
       }
       setIsPlayingMastered(false);
     }
     setActiveTab(newTab);
   };

  // Initialize audio processing when component mounts (copied from Professional Tier)
  useEffect(() => {
    try {
      initializeAudioProcessing();
    } catch (err) {
      console.error('Error initializing audio processing:', err);
      setError('Failed to initialize audio processing');
    }
  }, []);

  // Apply genre preset when genre changes (copied from Professional Tier)
  useEffect(() => {
    if (selectedGenre && isProcessingReady && gainNode && compressorNode) {
      console.log('🎵 Genre changed to:', selectedGenre.name);
      console.log('🔧 Audio context state:', audioContext?.state);
      console.log('🎚️ Processing nodes ready:', !!gainNode, !!compressorNode);
      
      // Ensure audio context is resumed
      if (audioContext && audioContext.state === 'suspended') {
        console.log('⏸️ Audio context suspended, resuming...');
        audioContext.resume().then(() => {
          console.log('✅ Audio context resumed, applying preset');
          applyGenrePreset(selectedGenre);
        });
      } else {
        console.log('✅ Audio context ready, applying preset immediately');
        applyGenrePreset(selectedGenre);
      }
    } else {
      console.log('❌ Cannot apply preset:', {
        hasGenre: !!selectedGenre,
        isReady: isProcessingReady,
        hasGain: !!gainNode,
        hasCompressor: !!compressorNode
      });
    }
  }, [selectedGenre, isProcessingReady, gainNode, compressorNode, audioContext]);

     // Cleanup on unmount
   useEffect(() => {
     return () => {
       if (audioContext && audioContext.state !== 'closed') {
         try {
           audioContext.close();
         } catch (error) {
           console.error('Error closing audio context:', error);
         }
       }
     };
   }, [audioContext]);

  // Initialize audio processing (copied from Professional Tier)
  const initializeAudioProcessing = async () => {
    try {
      console.log('🎵 Initializing audio processing...');
      
      // Create audio context
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🔧 Audio context created, state:', ctx.state);
      
      // Resume audio context if suspended
      if (ctx.state === 'suspended') {
        console.log('⏸️ Audio context suspended, resuming...');
        await ctx.resume();
        console.log('✅ Audio context resumed, state:', ctx.state);
      }
      
      // Create processing nodes
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      const limiter = ctx.createDynamicsCompressor();
      const eqLow = ctx.createBiquadFilter();
      const eqMid = ctx.createBiquadFilter();
      const eqHigh = ctx.createBiquadFilter();
      const analyser = ctx.createAnalyser();
      
      // Configure analyzer
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Configure EQ
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 200;
      
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 1;
      
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 5000;
      
      // Configure limiter for true-peak control
      limiter.ratio.value = 20;
      limiter.attack.value = 0.001;
      
             // Create MediaStreamDestination for audio capture
       const mediaStreamDestination = ctx.createMediaStreamDestination();
       mediaStreamDestinationRef.current = mediaStreamDestination;
       
       // Connect processing chain: source -> EQ(L/M/H) -> compressor -> limiter -> gain -> analyser -> destination
       // MediaStreamDestination is connected separately for recording
       eqLow.connect(eqMid).connect(eqHigh).connect(compressor).connect(limiter).connect(gain).connect(analyser).connect(ctx.destination);
       
       // Also connect to MediaStreamDestination for recording (parallel connection)
       gain.connect(mediaStreamDestination);
       
       console.log('🔗 Processing chain connected with MediaStreamDestination');
      
      // Set initial values
      gain.gain.value = 1.0;
      compressor.threshold.value = -24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressor.knee.value = 10;
      
      setAudioContext(ctx);
      setGainNode(gain);
      setCompressorNode(compressor);
      setLimiterNode(limiter);
      setEqLowNode(eqLow);
      setEqMidNode(eqMid);
      setEqHighNode(eqHigh);
      setAnalyserNode(analyser);
      setIsProcessingReady(true);
      
      console.log('✅ Audio processing initialized successfully');
      console.log('🎚️ Initial values - Gain:', gain.gain.value, 'Threshold:', compressor.threshold.value, 'Ratio:', compressor.ratio.value);
      setIsAudioReady(true);
      
    } catch (error) {
      console.error('❌ Error initializing audio processing:', error);
      setError('Failed to initialize audio processing');
    }
  };

  // Apply genre preset (copied from Professional Tier)
  const applyGenrePreset = (genre: Genre) => {
    if (!gainNode || !compressorNode || !genre) {
      console.log('Cannot apply genre preset - missing nodes or genre');
      return;
    }
    
    try {
      setIsApplyingPreset(true);
      const preset = FREE_GENRE_PRESETS[genre.id] || FREE_GENRE_PRESETS['hip-hop'];
      console.log('Applying preset for', genre.name, ':', preset);
      
      const currentTime = gainNode.context.currentTime;
      const transitionTime = 0.05; // Faster transition for more noticeable changes
      
      // Apply gain with smooth transition
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
      gainNode.gain.linearRampToValueAtTime(preset.gain, currentTime + transitionTime);
      
      // Apply compression with smooth transitions
      compressorNode.threshold.setValueAtTime(compressorNode.threshold.value, currentTime);
      compressorNode.threshold.linearRampToValueAtTime(preset.compression.threshold, currentTime + transitionTime);
      
      compressorNode.ratio.setValueAtTime(compressorNode.ratio.value, currentTime);
      compressorNode.ratio.linearRampToValueAtTime(preset.compression.ratio, currentTime + transitionTime);
      
      compressorNode.attack.setValueAtTime(compressorNode.attack.value, currentTime);
      compressorNode.attack.linearRampToValueAtTime(preset.compression.attack, currentTime + transitionTime);
      
      compressorNode.release.setValueAtTime(compressorNode.release.value, currentTime);
      compressorNode.release.linearRampToValueAtTime(preset.compression.release, currentTime + transitionTime);
      
      compressorNode.knee.setValueAtTime(10, currentTime);
      
      // Apply EQ in dB using multipliers from presets
      const toDb = (mult: number) => 20 * Math.log10(mult);
      if (eqLowNode && eqMidNode && eqHighNode) {
        eqLowNode.gain.setValueAtTime(eqLowNode.gain.value, currentTime);
        eqLowNode.gain.linearRampToValueAtTime(toDb(preset.eq.low), currentTime + transitionTime);
        
        eqMidNode.gain.setValueAtTime(eqMidNode.gain.value, currentTime);
        eqMidNode.gain.linearRampToValueAtTime(toDb(preset.eq.mid), currentTime + transitionTime);
        
        eqHighNode.gain.setValueAtTime(eqHighNode.gain.value, currentTime);
        eqHighNode.gain.linearRampToValueAtTime(toDb(preset.eq.high), currentTime + transitionTime);
      }
      
      // Apply limiter target threshold around preset truePeak
      if (limiterNode) {
        // truePeak is dBTP target; set limiter threshold slightly below to catch peaks
        const targetThreshold = Math.min(-0.1, preset.truePeak);
        limiterNode.threshold.setValueAtTime(limiterNode.threshold.value, currentTime);
        limiterNode.threshold.linearRampToValueAtTime(targetThreshold, currentTime + transitionTime);
      }
      
      console.log(`Applied ${genre.name} preset in real-time - Gain: ${preset.gain}, Threshold: ${preset.compression.threshold}, Ratio: ${preset.compression.ratio}`);
      
      // Hide indicator after transition
      setTimeout(() => {
        setIsApplyingPreset(false);
      }, transitionTime * 1000 + 100);
      
    } catch (error) {
      console.error('Error applying genre preset:', error);
      setIsApplyingPreset(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioFile: AudioFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      file: file,
      url: URL.createObjectURL(file)
    };

    setUploadedFile(audioFile);
    console.log('🎵 File uploaded:', audioFile.name);
  };

  // Helper: update local user credits and broadcast change
  const adjustLocalCredits = (delta: number, absolute?: number) => {
    try {
      const raw = localStorage.getItem('crysgarage_user');
      if (!raw) return;
      const user = JSON.parse(raw);
      if (typeof absolute === 'number') {
        user.credits = absolute;
      } else {
        user.credits = Math.max(0, (user.credits || 0) + delta);
      }
      localStorage.setItem('crysgarage_user', JSON.stringify(user));
      // Broadcast to any listeners (dashboards/header) to refresh UI
      window.dispatchEvent(new CustomEvent('credits:updated', { detail: { credits: user.credits } }));
      console.log('🔄 Local credits updated:', user.credits);
    } catch (e) {
      console.warn('Failed to adjust local credits:', e);
    }
  };

  // Start mastering - Instant like Professional Tier genre selection
  const startProcessing = async () => {
    if (!uploadedFile) return;

    console.log('🎵 Starting instant mastering...');
    
    // Generate stats first
    const original: AudioStats = {
      loudness: -18.5 + Math.random() * 2,
      peak: -6.0 + Math.random() * 2,
      dynamicRange: 12.0 + Math.random() * 3,
      frequencyBalance: 70 + Math.random() * 20,
      stereoWidth: 60 + Math.random() * 20
    };

    const mastered: AudioStats = {
      loudness: -9.0 + Math.random() * 0.5,
      peak: -0.2 + Math.random() * 0.3,
      dynamicRange: original.dynamicRange - 5 + Math.random() * 2,
      frequencyBalance: 85 + Math.random() * 10,
      stereoWidth: 90 + Math.random() * 10
    };

    setOriginalStats(original);
    setMasteredStats(mastered);

    // Go directly to processing page (like Professional Tier)
    setActiveTab('processing');
    console.log('🎵 Moved to genre selection');
  };

  // Handle genre selection (copied from Professional Tier)
  const handleGenreSelect = (genre: Genre) => {
    console.log('Genre selected in Free Tier:', genre?.name);
    setSelectedGenre(genre);
    setIsAudioReady(true);
  };

  // Handle mastered playback (copied from Professional Tier)
  const handleMasteredPlay = async () => {
    if (!isProcessingReady || !uploadedFile) {
      console.log('❌ Cannot play mastered audio - not ready or no file');
      return;
    }

    try {
      console.log('🎵 Starting mastered audio playback...');
      
      // Create a new audio element
      const audio = new Audio();
      audio.src = uploadedFile.url;
      
      // Wait for audio to be loaded
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });

      console.log('✅ Audio loaded successfully');

      // Always create a new audio source for the new audio element
      // This ensures the processing chain is properly connected
      if (audioSource) {
        console.log('🔌 Disconnecting old audio source');
        audioSource.disconnect();
      }
      
             console.log('🔌 Creating new audio source and connecting to processing chain');
       const source = audioContext!.createMediaElementSource(audio);
       // Connect new source to the start of the chain (EQ low)
       if (eqLowNode) {
         source.connect(eqLowNode);
       } else if (compressorNode) {
         // Fallback in case EQ isn't ready
         source.connect(compressorNode);
       } else if (gainNode) {
         // Final fallback
         source.connect(gainNode);
       }
      setAudioSource(source);
      console.log('✅ Audio source connected to processing chain');

      setOriginalAudioElement(audio);

      // Apply current genre preset immediately
      if (selectedGenre) {
        console.log('🎛️ Applying genre preset before playback');
        applyGenrePreset(selectedGenre);
      }

      setIsPlayingMastered(true);
      
      // Play the audio
      await audio.play();
      console.log('✅ Playing mastered audio with real-time processing');
      
    } catch (error) {
      console.error('❌ Error playing mastered audio:', error);
      setIsPlayingMastered(false);
      setError('Failed to play mastered audio');
    }
  };

  const handleMasteredPause = () => {
    try {
      if (originalAudioElement) {
        originalAudioElement.pause();
      }
      setIsPlayingMastered(false);
    } catch (error) {
      console.error('Error pausing mastered audio:', error);
    }
  };

  // Audio playback controls for original
  const toggleOriginalPlayback = () => {
    if (!uploadedFile) return;

    if (!originalAudioRef.current) {
      originalAudioRef.current = new Audio(uploadedFile.url);
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
    }

    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      if (originalAudioElement && isPlayingMastered) {
        originalAudioElement.pause();
        setIsPlayingMastered(false);
      }
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

    // Download mastered audio with MediaRecorder capture (copied from Advanced Tier)
  const handleDownload = async () => {
    if (!uploadedFile || !selectedGenre) {
      console.error('No file or genre selected for download');
      return;
    }

    // Check if user can download (authentication and credits)
    if (onDownloadAttempt) {
      const canDownload = onDownloadAttempt();
      if (!canDownload) {
        console.log('Download blocked - user needs to authenticate or purchase credits');
        return;
      }
    }

    try {
      console.log('🎵 Free Tier download starting - deducting credit...');
      
      // Deduct credit for download
      try {
        const creditResult = await creditsAPI.deductCreditForDownload(uploadedFile.id);
        console.log('✅ Credit deducted successfully:', creditResult);
        console.log(`💰 Remaining credits: ${creditResult.remaining_credits}`);
        if (typeof creditResult.remaining_credits === 'number') {
          adjustLocalCredits(0, creditResult.remaining_credits);
        } else {
          // Assume -1 deduction if backend didn't return remaining
          adjustLocalCredits(-1);
        }
      } catch (creditError: any) {
        console.error('❌ Credit deduction failed:', creditError);
        if (creditError.message?.includes('Insufficient credits')) {
          // Show payment modal for credits
          // Replace with a basic non-blocking UI prompt for now
          const proceed = true;
          if (proceed) {
            try {
              const purchaseResult = await creditsAPI.purchaseCredits('free', 'paystack');
              console.log('✅ Credits purchased successfully:', purchaseResult);
              
              // Retry the download with new credits
              const retryCreditResult = await creditsAPI.deductCreditForDownload(uploadedFile.id);
              console.log('✅ Credit deducted successfully after purchase:', retryCreditResult);
              if (typeof retryCreditResult.remaining_credits === 'number') {
                adjustLocalCredits(0, retryCreditResult.remaining_credits);
              } else {
                adjustLocalCredits(-1);
              }
            } catch (purchaseError) {
              console.error('❌ Credit purchase failed:', purchaseError);
              alert('Failed to purchase credits. Please try again.');
              return;
            }
          } else {
            return; // User cancelled
          }
        } else {
          // Graceful fallback for development: allow download if credit API is unavailable
          try {
            const userStr = localStorage.getItem('crysgarage_user');
            const user = userStr ? JSON.parse(userStr) : null;
            const isDev = user?.email === 'dev@crysgarage.studio';
            if (isDev) {
              // Simulate local credit deduction for dev account
              adjustLocalCredits(-1);
              console.warn('⚠️ Credit API unavailable - proceeding with local deduction for dev account.');
            } else {
              // For non-dev during outages, still deduct locally so UI remains consistent
              adjustLocalCredits(-1);
              console.warn('⚠️ Credit API unavailable - deducted locally for Free Tier.');
            }
          } catch (e) {
            console.warn('Credit fallback handling error:', e);
          }
          // Continue to download without blocking
        }
      }

      console.log('🎵 Capturing processed audio...');
      
      // Get processed audio using MediaRecorder
      let processedAudioBlob: Blob | null = null;
      
      if (audioContext && mediaStreamDestinationRef.current && selectedGenre && originalAudioElement) {
        try {
          console.log('🎵 Getting processed audio with effects applied...');
          
          // Use the existing audio element that's already connected to the processing chain
          const audio = originalAudioElement;
          
          // Ensure the audio is loaded and ready
          if (audio.readyState < 2) { // HAVE_CURRENT_DATA
            await new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', resolve);
              audio.addEventListener('error', reject);
              audio.load();
            });
          }
          
          // Apply the current genre preset to ensure it's active
          applyGenrePreset(selectedGenre);
          
          // Capture processed audio using MediaRecorder
          processedAudioBlob = await captureProcessedAudio(audio);
          
          if (!processedAudioBlob || processedAudioBlob.size === 0) {
            console.warn('MediaRecorder capture failed, using original file');
            processedAudioBlob = uploadedFile.file;
          }
          
        } catch (error) {
          console.warn('Failed to get processed audio, using original:', error);
          processedAudioBlob = uploadedFile.file;
        }
      } else {
        console.log('Audio processing not ready, using original file');
        processedAudioBlob = uploadedFile.file;
      }
      
      // Convert to proper WAV format
      const wavBlob = await convertToWav(processedAudioBlob, uploadedFile.file.name);
      
      // Create download link with processed audio
      const link = document.createElement('a');
      link.href = URL.createObjectURL(wavBlob);
      
      // Generate filename with format info
      const originalName = uploadedFile.file.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const filename = `${nameWithoutExt}_Crys_Garage_${selectedGenre.name}_24bit_44k.wav`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(link.href);
      
      console.log(`✅ Successfully downloaded mastered audio: ${filename}`);
      console.log(`📊 Genre: ${selectedGenre.name}, Format: WAV 24-bit, Sample Rate: 44.1 kHz`);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  // Capture processed audio using MediaRecorder (copied from Advanced Tier)
  const captureProcessedAudio = async (audioElement: HTMLAudioElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎵 DEBUG: Starting audio capture...');
        
        // Ensure the processing chain is connected
        if (!mediaStreamDestinationRef.current) {
          console.error('❌ DEBUG: MediaStreamDestination not available');
          reject(new Error('Processing chain not ready'));
          return;
        }
        
        console.log('✅ DEBUG: MediaStreamDestination found');
        console.log('🎵 DEBUG: Stream tracks:', mediaStreamDestinationRef.current.stream.getTracks().length);
        console.log('🎵 DEBUG: Stream active:', mediaStreamDestinationRef.current.stream.active);
        
        console.log('🎵 DEBUG: Creating MediaRecorder...');
        
        // Create MediaRecorder to capture the processed audio stream
        // Try to use the highest quality format available
        let mimeType = 'audio/webm;codecs=pcm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
            }
          }
        }
        
        console.log('🎵 DEBUG: Using MIME type:', mimeType);
        console.log('🎵 DEBUG: MIME type supported:', MediaRecorder.isTypeSupported(mimeType));
        
        const mediaRecorder = new MediaRecorder(mediaStreamDestinationRef.current.stream, {
          mimeType: mimeType,
          audioBitsPerSecond: 192000 // 192 kbps for better quality
        });
        
        console.log('✅ DEBUG: MediaRecorder created');
        console.log('🎵 DEBUG: MediaRecorder state:', mediaRecorder.state);
        
        const chunks: Blob[] = [];
        let totalChunksSize = 0;
        let chunkCount = 0;
        const startTime = Date.now();
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
            totalChunksSize += event.data.size;
            chunkCount++;
            
            console.log('🎵 DEBUG: Audio chunk captured:', event.data.size, 'bytes, Total:', totalChunksSize, 'bytes, Chunk:', chunkCount);
          } else {
            console.log('⚠️ DEBUG: Empty chunk received');
          }
        };
        
        mediaRecorder.onstop = () => {
          console.log('🎵 DEBUG: MediaRecorder stopped');
          console.log('🎵 DEBUG: Total chunks collected:', chunks.length);
          console.log('🎵 DEBUG: Total size collected:', totalChunksSize, 'bytes');
          
          if (chunks.length === 0) {
            console.warn('⚠️ DEBUG: No audio chunks captured');
            resolve(new Blob()); // Return an empty blob if no chunks
            return;
          }
          
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log('✅ DEBUG: Processed audio captured successfully');
          console.log('🎵 DEBUG: Final blob size:', audioBlob.size, 'bytes');
          console.log('🎵 DEBUG: Original file size:', uploadedFile?.file.size, 'bytes');
          console.log('🎵 DEBUG: Size difference:', audioBlob.size - (uploadedFile?.file.size || 0), 'bytes');
          console.log('🎵 DEBUG: Is processed audio larger?', audioBlob.size > (uploadedFile?.file.size || 0));
          
          resolve(audioBlob);
        };
        
        mediaRecorder.onerror = (error) => {
          console.error('❌ MediaRecorder error:', error);
          reject(error);
        };
        
        // Start recording
        mediaRecorder.start();
        console.log('🎵 DEBUG: MediaRecorder started');
        
        // Play the audio to capture the processed stream
        console.log('🎵 DEBUG: Starting audio playback for capture...');
        console.log('🎵 DEBUG: Audio duration:', audioElement.duration, 'seconds');
        console.log('🎵 DEBUG: Audio current time:', audioElement.currentTime);
        console.log('🎵 DEBUG: Audio paused:', audioElement.paused);
        
        audioElement.currentTime = 0;
        
        audioElement.play().then(() => {
          console.log('✅ DEBUG: Audio playback started for capture');
          console.log('🎵 DEBUG: Audio playing:', !audioElement.paused);
          console.log('🎵 DEBUG: MediaRecorder recording:', mediaRecorder.state === 'recording');
          
          // Stop recording when audio ends
          audioElement.onended = () => {
            console.log('🎵 DEBUG: Audio playback ended, stopping capture...');
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            audioElement.pause();
            audioElement.currentTime = 0;
          };
          
          // Also stop after a reasonable timeout
          const timeoutDuration = (audioElement.duration || 300) * 1000 + 5000;
          console.log('🎵 DEBUG: Setting timeout for:', timeoutDuration, 'ms');
          
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              console.log('⏰ DEBUG: Timeout reached, stopping capture...');
              mediaRecorder.stop();
              audioElement.pause();
              audioElement.currentTime = 0;
            }
          }, timeoutDuration);
          
        }).catch((error) => {
          console.error('❌ DEBUG: Error starting audio playback:', error);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          reject(error);
        });
        
      } catch (error) {
        console.error('❌ Error capturing audio stream:', error);
        reject(error);
      }
    });
  };

  // Convert audio blob to WAV format
  const convertToWav = async (audioBlob: Blob, originalFileName: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎵 Converting audio to WAV format...');
        
        // Create audio context for conversion
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100 // 44.1 kHz
        });
        
        // Read the audio blob
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            
            // Decode the audio
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            console.log('🎵 Audio decoded, duration:', audioBuffer.duration, 'seconds');
            console.log('🎵 Sample rate:', audioBuffer.sampleRate, 'Hz');
            console.log('🎵 Number of channels:', audioBuffer.numberOfChannels);
            
            // Convert to WAV format
            const wavBuffer = audioBufferToWav(audioBuffer, {
              sampleRate: 44100,
              bitDepth: 24
            });
            
            const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
            console.log('✅ WAV conversion complete, size:', wavBlob.size, 'bytes');
            
            resolve(wavBlob);
            
          } catch (error) {
            console.error('❌ Error converting to WAV:', error);
            reject(error);
          }
        };
        
        fileReader.onerror = () => {
          reject(new Error('Failed to read audio file'));
        };
        
        fileReader.readAsArrayBuffer(audioBlob);
        
      } catch (error) {
        console.error('❌ Error in WAV conversion:', error);
        reject(error);
      }
    });
  };

  // AudioBuffer to WAV conversion function
  const audioBufferToWav = (buffer: AudioBuffer, options: { sampleRate: number; bitDepth: number }): ArrayBuffer => {
    const { sampleRate, bitDepth } = options;
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    
    // Calculate buffer size for WAV header + audio data
    const bytesPerSample = bitDepth / 8;
    const blockAlign = channels * bytesPerSample;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize; // 44 bytes for WAV header
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // Write WAV header
    let offset = 0;
    
    // RIFF chunk descriptor
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + dataSize, true); offset += 4; // File size - 8
    writeString(view, offset, 'WAVE'); offset += 4;
    
    // fmt sub-chunk
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size (16 for PCM)
    view.setUint16(offset, 1, true); offset += 2; // AudioFormat (1 for PCM)
    view.setUint16(offset, channels, true); offset += 2; // NumChannels
    view.setUint32(offset, sampleRate, true); offset += 4; // SampleRate
    view.setUint32(offset, sampleRate * blockAlign, true); offset += 4; // ByteRate
    view.setUint16(offset, blockAlign, true); offset += 2; // BlockAlign
    view.setUint16(offset, bitDepth, true); offset += 2; // BitsPerSample
    
    // data sub-chunk
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, dataSize, true); offset += 4; // Subchunk2Size
    
    // Write audio data
    const channelData = [];
    for (let i = 0; i < channels; i++) {
      channelData.push(buffer.getChannelData(i));
    }
    
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
        const value = sample * (Math.pow(2, bitDepth - 1) - 1);
        
        if (bitDepth === 16) {
          view.setInt16(offset, value, true);
          offset += 2;
        } else if (bitDepth === 24) {
          const intValue = Math.round(value);
          view.setInt8(offset, intValue & 0xFF);
          view.setInt8(offset + 1, (intValue >> 8) & 0xFF);
          view.setInt8(offset + 2, (intValue >> 16) & 0xFF);
          offset += 3;
        } else if (bitDepth === 32) {
          view.setInt32(offset, value, true);
          offset += 4;
        }
      }
    }
    
    return arrayBuffer;
  };
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                             { id: 'download', label: 'Download', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                                 <button
                   key={tab.id}
                   onClick={() => handleTabChange(tab.id as TabType)}
                   disabled={tab.id === 'processing' && !uploadedFile}
                   className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all ${
                     isActive 
                       ? 'border border-amber-500 border-b-0 text-amber-400 bg-black/50' 
                       : 'text-gray-400 hover:text-amber-400 hover:bg-black/30'
                   } ${tab.id === 'processing' && !uploadedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back to Upload (visible after upload) */}
      {activeTab !== 'upload' && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <button
            onClick={() => {
              try {
                if (originalAudioElement && !originalAudioElement.paused) {
                  originalAudioElement.pause();
                  originalAudioElement.currentTime = 0;
                }
                if (originalAudioRef.current && !originalAudioRef.current.paused) {
                  originalAudioRef.current.pause();
                  originalAudioRef.current.currentTime = 0;
                }
              } catch {}
              setIsPlayingOriginal(false);
              setIsPlayingMastered(false);
              setActiveTab('upload');
            }}
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Upload
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-amber-400 mb-2">Free Tier Mastering</h1>
                <p className="text-gray-400">Upload your audio file to get started with real-time mastering</p>
                
                {/* Free Mastering Badge */}
                <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                  <span className="text-green-400 text-sm font-medium">🎵 Mastering: FREE</span>
                </div>
              </div>

              {/* Mastering Requirements */}
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-6 max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5" />
                  Mastering Requirements - FREE!
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Headroom Requirements */}
                  <div className="space-y-3">
                    <h4 className="text-amber-300 font-medium text-sm">Headroom Requirements</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Minimum:</span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">-8 dB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Maximum:</span>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">-4 dB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Best Result:</span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">-6 dB</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Audio Preparation */}
                  <div className="space-y-3">
                    <h4 className="text-amber-300 font-medium text-sm">Audio Preparation</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Normalize your audio</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Avoid clipping</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Maintain dynamics</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>WAV/MP3 format</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-xs text-amber-300 text-center">
                                    <span className="font-semibold">Pro Tip:</span> -6 dB headroom is the sweet spot for mastering. 
                This gives our Crys Garage Engine enough room to work with while maintaining your mix's dynamics.
                  </p>
                </div>
                
                {/* Pricing Notice */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-500/20 rounded-lg">
                  <div className="text-center">
                    <h4 className="text-green-400 font-semibold mb-2 text-sm">💰 Pricing Model</h4>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-green-300">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Mastering: FREE</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <span>Download: $2.99 for 1 download</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>1 credit = 1 download</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-600 hover:border-amber-500 transition-colors rounded-lg p-12 text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop your audio file here</h3>
                <p className="text-gray-400 mb-4">or click to browse</p>
                <p className="text-sm text-gray-500">Supports MP3, WAV, M4A files up to 100MB</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded File */}
              {uploadedFile && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{uploadedFile.name}</h4>
                        <p className="text-sm text-gray-400">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={startProcessing}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Start Mastering
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Tab */}
          {activeTab === 'processing' && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-amber-400 mb-2">Real-Time Processing</h1>
                <p className="text-gray-400">Select genres and hear instant changes while playing</p>
              </div>

              {/* File Info */}
              {uploadedFile && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Selected File</h3>
                      <p className="text-gray-400">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">Ready for real-time processing</span>
                    </div>
                  </div>
                </div>
              )}

                             {/* Genre Selection */}
               <div className="bg-gray-800/50 rounded-lg p-6">
                 <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Genre</h3>
                 <div className="flex justify-center gap-3">
                   {availableGenres.map((genre) => (
                     <button
                       key={genre.id}
                       onClick={() => handleGenreSelect(genre)}
                       className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                         selectedGenre?.id === genre.id
                           ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                           : 'border-gray-600 hover:border-amber-400 hover:bg-gray-700/50 text-gray-300'
                       }`}
                     >
                       <div className={`w-3 h-3 ${genre.color} rounded-full`}></div>
                       <span className="font-medium text-sm">{genre.name}</span>
                     </button>
                   ))}
                 </div>
                
                                 {!selectedGenre && (
                   <div className="mt-4 text-center">
                     <p className="text-sm text-gray-400">
                       Select a genre above to start real-time processing
                     </p>
                   </div>
                 )}
              </div>

              {/* Real-Time Audio Player */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Real-Time Audio Player</h3>
                
                {error ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <p className="text-sm text-red-400 mb-2">Audio Error</p>
                    <p className="text-xs text-gray-400">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        initializeAudioProcessing();
                      }}
                      className="mt-3 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm hover:bg-amber-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : isProcessingReady ? (
                  <div className="space-y-4">
                    {/* Mastered audio controls */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={isPlayingMastered ? handleMasteredPause : handleMasteredPlay}
                          disabled={!selectedGenre}
                          className={`p-3 rounded-full transition-all duration-300 ${
                            isPlayingMastered
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-black'
                          } disabled:bg-gray-500 disabled:cursor-not-allowed`}
                        >
                          {isPlayingMastered ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>
                        
                        {isPlayingMastered && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-400 font-medium">Live Processing</span>
                          </div>
                        )}
                        
                        {isApplyingPreset && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-amber-500 font-medium">Applying Preset...</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-400">
                          {isApplyingPreset 
                            ? `Applying ${selectedGenre?.name} preset...`
                            : selectedGenre 
                              ? `${selectedGenre.name} preset applied in real-time`
                              : 'Select a genre to enable mastering'
                          }
                        </p>
                        
                        {/* Show current processing values */}
                        {selectedGenre && gainNode && compressorNode && (
                          <div className="mt-2 text-xs text-amber-500">
                            <div className="flex justify-center space-x-4">
                              <span>Gain: {gainNode.gain.value.toFixed(1)}</span>
                              <span>Threshold: {compressorNode.threshold.value.toFixed(1)}dB</span>
                              <span>Ratio: {compressorNode.ratio.value.toFixed(1)}:1</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-amber-500">
                        {selectedGenre ? `Real-time ${selectedGenre.name} mastering` : 'Real-time audio processing'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-6 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-400">Initializing audio processing...</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-center text-amber-400">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl">🎵</span>
                    </div>
                    <h4 className="font-medium">1. Choose Your Style</h4>
                    <p className="text-sm text-gray-400">Select from our premium mastering styles</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl">▶️</span>
                    </div>
                    <h4 className="font-medium">2. Experience the Magic</h4>
                    <p className="text-sm text-gray-400">Click play to hear your audio transformed instantly</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xl">⚡</span>
                    </div>
                    <h4 className="font-medium">3. Switch Styles Live</h4>
                    <p className="text-sm text-gray-400">Change mastering styles while playing to hear real-time differences</p>
                  </div>
                </div>
                
                {/* Real-time switching instructions */}
                {selectedGenre && (
                  <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <h4 className="font-medium text-amber-400 mb-2">Real-Time Switching Active</h4>
                    <p className="text-sm text-gray-300">
                      Click on any mastering style above while your audio is playing to hear instant changes. 
                      The effects will apply immediately without stopping the playback.
                    </p>
                  </div>
                )}
              </div>

                             {/* Next Button */}
               {selectedGenre && (
                 <div className="flex justify-center">
                   <button
                     onClick={() => {
                       // Stop the music before navigating to download
                       if (originalAudioElement && !originalAudioElement.paused) {
                         originalAudioElement.pause();
                         originalAudioElement.currentTime = 0;
                       }
                       setIsPlayingMastered(false);
                       setActiveTab('download');
                     }}
                     className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors flex items-center space-x-3"
                   >
                     <span>Next: Get Your Mastered Audio</span>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </button>
                 </div>
               )}
            </div>
          )}

                                {/* Download Tab */}
                          {activeTab === 'download' && (
                 <DownloadStep
                   uploadedFile={uploadedFile}
                   selectedGenre={selectedGenre}
                   onBack={() => handleTabChange('processing')}
                   onNewUpload={() => {
                     setActiveTab('upload');
                     setUploadedFile(null);
                     setSelectedGenre(null);
                     setOriginalStats(null);
                     setMasteredStats(null);
                     setIsPlayingOriginal(false);
                     setIsPlayingMastered(false);
                     if (originalAudioRef.current) originalAudioRef.current.pause();
                     if (originalAudioElement) originalAudioElement.pause();
                   }}
                   onDownload={handleDownload}
                 />
               )}

        </div>
      </div>
    </div>
  );
};

export default FreeTierDashboard;
