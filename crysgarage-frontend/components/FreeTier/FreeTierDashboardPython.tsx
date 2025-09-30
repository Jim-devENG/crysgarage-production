import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Play, Pause, Download, ArrowLeft, Music, Settings, CheckCircle, Loader2, Volume2, VolumeX, Activity } from 'lucide-react';
import { pythonAudioService } from '../../services/pythonAudioService';
import { useApp } from '../../contexts/AppContext';
import DownloadStep from './DownloadStep';
import RealTimeAnalysisPanel from '../AdvancedTierDashboard/RealTimeAnalysisPanel';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
  processedSize?: number;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

const FreeTierDashboardPython: React.FC = () => {
  const { user: effectiveUser } = useApp();
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'processing' | 'download'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  
  // Format selection for free tier (2 formats only)
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav24'>('wav24');
  const [downloadSampleRate, setDownloadSampleRate] = useState<number>(44100);

  // Real-time audio player state
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isApplyingEffects, setIsApplyingEffects] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [originalProgress, setOriginalProgress] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  
  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalChainRef = useRef<any>(null);
  const basePreviewGainRef = useRef<number>(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peaksRef = useRef<Float32Array | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Free tier genres (2 genres only)
  const freeTierGenres: Genre[] = [
    {
      id: 'hiphop',
      name: 'Hip Hop',
      color: '#FF6B6B',
      description: 'Bass-heavy sound with punchy drums and clear vocals'
    },
    {
      id: 'afrobeats',
      name: 'Afrobeats',
      color: '#4ECDC4',
      description: 'West African pop blend with infectious rhythms and warm tones'
    }
  ];

  // Auto-initialize audio context on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContextInitialized(true);
      console.log('Audio context initialized for instant effects');
    }
  }, []);

  // Track audio progress
  useEffect(() => {
    const audio = originalAudioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setOriginalProgress(audio.currentTime);
    };

    const updateDuration = () => {
      setOriginalDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
    };
  }, [uploadedFile]);

  // Waveform computation and drawing
  useEffect(() => {
    if (!uploadedFile || !canvasRef.current) return;

    let cancelled = false;
    const compute = async () => {
      if (!uploadedFile) { peaksRef.current = null; drawWaveform(); return; }
      try {
        const arrayBuffer = await uploadedFile.file.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        const numChannels = audioBuffer.numberOfChannels;
        const dataL = audioBuffer.getChannelData(0);
        const dataR = numChannels > 1 ? audioBuffer.getChannelData(1) : null;
        const desiredBuckets = 1000;
        const bucketSize = Math.floor(dataL.length / desiredBuckets);
        const peaks = new Float32Array(desiredBuckets);
        
        for (let i = 0; i < desiredBuckets; i++) {
          if (cancelled) return;
          const start = i * bucketSize;
          const end = Math.min(start + bucketSize, dataL.length);
          let max = 0;
          for (let j = start; j < end; j++) {
            const l = Math.abs(dataL[j]);
            const r = dataR ? Math.abs(dataR[j]) : l;
            max = Math.max(max, l, r);
          }
          peaks[i] = max;
        }
        
        if (!cancelled) {
          peaksRef.current = peaks;
          drawWaveform();
        }
      } catch (error) {
        console.error('Failed to compute waveform:', error);
      }
    };
    
    compute();
    return () => { cancelled = true; };
  }, [uploadedFile]);

  // Draw waveform on canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !peaksRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const peaks = peaksRef.current;
    const progress = originalDuration > 0 ? originalProgress / originalDuration : 0;

    // Clear canvas
    ctx.fillStyle = '#1f1f23';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < peaks.length; i++) {
      const x = (i / peaks.length) * width;
      const peak = peaks[i];
      const y = height / 2;
      const barHeight = peak * (height / 2) * 0.8;
      
      ctx.moveTo(x, y - barHeight);
      ctx.lineTo(x, y + barHeight);
    }
    ctx.stroke();

    // Draw progress
    if (progress > 0) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < peaks.length * progress; i++) {
        const x = (i / peaks.length) * width;
        const peak = peaks[i];
        const y = height / 2;
        const barHeight = peak * (height / 2) * 0.8;
        
        ctx.moveTo(x, y - barHeight);
        ctx.lineTo(x, y + barHeight);
      }
      ctx.stroke();
    }
  };

  // Redraw waveform on resize
  useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [originalProgress, originalDuration]);

  // Build audio processing chain
  const buildPreviewChain = () => {
    if (!audioContextRef.current || !originalAudioRef.current) return false;
    
    // Check if chain already exists
    if (originalChainRef.current?.source) {
      console.log('Audio chain already exists, skipping creation');
      return true;
    }
    
    const ctx = audioContextRef.current;

    // Route audio exclusively through Web Audio graph so effects are audible on live
    try {
      originalAudioRef.current.crossOrigin = 'anonymous';
      (originalAudioRef.current as any).playsInline = true;
    } catch {}

    try {
      // Create processing chain
    const source = ctx.createMediaElementSource(originalAudioRef.current);
    const analyser = ctx.createAnalyser();
    const lowShelf = ctx.createBiquadFilter();
    const lowMidPeaking = ctx.createBiquadFilter();
    const midPeaking = ctx.createBiquadFilter();
    const highMidPeaking = ctx.createBiquadFilter();
    const highShelf = ctx.createBiquadFilter();
    const compressor = ctx.createDynamicsCompressor();
    const limiter = ctx.createDynamicsCompressor();
    const outputGain = ctx.createGain();

    // Configure filters
    lowShelf.type = 'lowshelf';
    lowMidPeaking.type = 'peaking';
    midPeaking.type = 'peaking';
    highMidPeaking.type = 'peaking';
    highShelf.type = 'highshelf';

    // Configure compressor
    compressor.threshold.value = -20;
    compressor.knee.value = 30;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Configure limiter
    limiter.threshold.value = -1;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.01;

    // Connect the chain
    source.connect(lowShelf);
    lowShelf.connect(lowMidPeaking);
    lowMidPeaking.connect(midPeaking);
    midPeaking.connect(highMidPeaking);
    highMidPeaking.connect(highShelf);
    highShelf.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(outputGain);
    outputGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Store chain reference
    originalChainRef.current = {
      source,
      analyser,
      lowShelf,
      lowMidPeaking,
      midPeaking,
      highMidPeaking,
      highShelf,
      compressor,
      limiter,
      outputGain
    };

    console.log('Audio chain created successfully');
    return true;
  } catch (error) {
    console.error('Failed to create audio chain:', error);
    return false;
  }
};

  // Apply instant genre effects for real-time preview
  const applyInstantGenreEffects = async (genre: Genre) => {
    if (!audioContextRef.current || !originalAudioRef.current) {
      console.log('Audio context or audio element not available');
      return;
    }

    try {
      setIsApplyingEffects(true);
      console.log(`Applying ${genre.name.toUpperCase()} instant effects`);
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Build chain if needed
      if (!originalChainRef.current?.source) {
        buildPreviewChain();
        console.log('Audio chain created successfully');
      }

      // Apply genre-specific settings
      const { outputGain, lowShelf, lowMidPeaking, midPeaking, highMidPeaking, highShelf, compressor } = originalChainRef.current;
      
      // Get genre preset
      const preset = getGenrePreset(genre.name);
      
      if (preset) {
        const currentTime = audioContextRef.current.currentTime;
        const exaggerate = 2.5; // Strong enough to hear clear EQ differences
        
        // Apply EQ settings
        lowShelf.frequency.setValueAtTime(preset.eq_curve.low_shelf.freq, currentTime);
        lowShelf.gain.setValueAtTime(preset.eq_curve.low_shelf.gain * exaggerate, currentTime);
        
        lowMidPeaking.frequency.setValueAtTime(preset.eq_curve.low_mid?.freq ?? 250, currentTime);
        lowMidPeaking.Q.setValueAtTime(1.0, currentTime);
        lowMidPeaking.gain.setValueAtTime((preset.eq_curve.low_mid?.gain ?? 0) * exaggerate, currentTime);
        
        midPeaking.frequency.setValueAtTime(preset.eq_curve.mid.freq, currentTime);
        midPeaking.Q.setValueAtTime(1.0, currentTime);
        midPeaking.gain.setValueAtTime(preset.eq_curve.mid.gain * exaggerate, currentTime);
        
        highMidPeaking.frequency.setValueAtTime(preset.eq_curve.high_mid?.freq ?? 3500, currentTime);
        highMidPeaking.Q.setValueAtTime(1.0, currentTime);
        highMidPeaking.gain.setValueAtTime((preset.eq_curve.high_mid?.gain ?? 0) * exaggerate, currentTime);
        
        highShelf.frequency.setValueAtTime(preset.eq_curve.high_shelf.freq, currentTime);
        highShelf.gain.setValueAtTime(preset.eq_curve.high_shelf.gain * exaggerate, currentTime);

        // Apply compression
        const thr = preset.compression.threshold - 4;
        const ratio = Math.min(preset.compression.ratio * 1.35, 10);
        compressor.threshold.setValueAtTime(thr, currentTime);
        compressor.knee.setValueAtTime(20, currentTime);
        compressor.ratio.setValueAtTime(ratio, currentTime);
        compressor.attack.setValueAtTime(Math.max(0.001, preset.compression.attack), currentTime);
        compressor.release.setValueAtTime(preset.compression.release, currentTime);

        // Apply output gain - genre-specific for audible differences
        const targetGain = genre.name === 'Hip Hop' ? 1.4 : 1.1; // Hip Hop louder, Afrobeats softer
        try { outputGain.gain.cancelScheduledValues(currentTime); } catch {}
        const pre = Math.max(0.7, Math.min(1.3, targetGain * 0.9));
        try { outputGain.gain.setValueAtTime(pre, currentTime); } catch {}
        outputGain.gain.linearRampToValueAtTime(targetGain, currentTime + 0.08);
        
        console.log(`Applied ${genre.name} effects successfully!`, {
          lowShelf: { freq: lowShelf.frequency.value, gain: lowShelf.gain.value },
          mid: { freq: midPeaking.frequency.value, gain: midPeaking.gain.value },
          highShelf: { freq: highShelf.frequency.value, gain: highShelf.gain.value },
          compressor: { threshold: compressor.threshold.value, ratio: compressor.ratio.value },
          targetGain
        });
      } else {
        console.warn(`No preset found for genre: ${genre.name}`);
      }
      
      console.log(`Instant ${genre.name} effects applied successfully!`);
    } catch (error) {
      console.error('Failed to apply instant effects:', error);
    } finally {
      setIsApplyingEffects(false);
    }
  };

  // Get genre preset (dramatically different for clear audible differences)
  const getGenrePreset = (genreName: string) => {
    const presets: any = {
      'Hip Hop': {
        eq_curve: {
          low_shelf: { freq: 60, gain: 4.0 },      // Much more bass
          low_mid: { freq: 300, gain: -2.0 },     // Cut low mids
          mid: { freq: 1000, gain: -1.0 },        // Cut mids
          high_mid: { freq: 4000, gain: 2.0 },    // Boost high mids
          high_shelf: { freq: 8000, gain: 1.0 }   // Slight high boost
        },
        compression: {
          threshold: -20,    // More aggressive compression
          ratio: 3.5,        // Higher ratio
          attack: 0.001,     // Very fast attack
          release: 0.1       // Fast release
        }
      },
      'Afrobeats': {
        eq_curve: {
          low_shelf: { freq: 100, gain: 3.0 },    // Strong bass
          low_mid: { freq: 300, gain: 1.5 },      // Boost low mids
          mid: { freq: 1000, gain: 2.0 },         // Boost mids
          high_mid: { freq: 4000, gain: 3.0 },    // Strong high mid boost
          high_shelf: { freq: 8000, gain: 2.5 }   // Strong high boost
        },
        compression: {
          threshold: -18,    // Less aggressive
          ratio: 2.0,        // Lower ratio
          attack: 0.005,     // Slower attack
          release: 0.2       // Slower release
        }
      }
    };
    
    return presets[genreName] || presets['Hip Hop'];
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause for original audio
  const handlePlayPauseOriginal = () => {
    if (!originalAudioRef.current) return;
    // Ensure processing chain exists before playback toggles
    buildPreviewChain();
    // Resume context proactively for reliable playback
    try { if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume(); } catch {}
    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  };

  // Handle instant preview play/pause (for genre effects)
  const handlePlayPauseInstant = () => {
    if (!originalAudioRef.current) return;
    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      // Resume context and play; ensure element not stalled
      try { if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume(); } catch {}
      // Ensure the chain exists before play (only if not already created)
      if (!originalChainRef.current?.source) {
        buildPreviewChain();
      }
      // Slight nudge to retrigger playback capture
      try { originalAudioRef.current.currentTime = Math.max(0, originalAudioRef.current.currentTime - 0.001); } catch {}
      originalAudioRef.current.play().catch(()=>{});
      setIsPlayingOriginal(true);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  };

  // Handle genre selection with instant effects
  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);
    if (!originalAudioRef.current) {
      console.log('No uploaded file or audio element available for preview');
      return;
    }
    // Ensure chain exists and context is running (without recreating source)
    buildPreviewChain();
    try { if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume(); } catch {}
    // Start playback so changes are audible
    try {
      if (originalAudioRef.current.paused) {
        await originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    } catch {}
    console.log('Applying instant effects for genre:', genre.name);
    await applyInstantGenreEffects(genre);
    // Nudge output gain briefly to force audible state update in some browsers
    try {
      const g = originalChainRef.current?.outputGain;
      const ctx = audioContextRef.current;
      if (g && ctx) {
        const v = g.gain.value;
        g.gain.setValueAtTime(v * 0.9, ctx.currentTime);
        g.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.05);
      }
    } catch {}
  };

  const processingSteps = useMemo(
    () => [
      { id: 'upload', label: 'Upload', icon: Upload, completed: !!uploadedFile },
      { id: 'processing', label: 'Processing', icon: Settings, completed: !!masteredAudioUrl },
      { id: 'download', label: 'Download', icon: Download, completed: false }
    ],
    [uploadedFile, masteredAudioUrl]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audioFile: AudioFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file)
      };
      setUploadedFile(audioFile);
      setActiveTab('processing');
    }
  };

  const handleProcessAudio = async () => {
    if (!uploadedFile || !selectedGenre) return;

    // Free tier - no credit checking required
    if (!effectiveUser || !effectiveUser.id) {
      console.error('User not authenticated or missing ID');
      alert('Please log in to process audio');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Convert format for backend (preserve discrete WAV depth options)
      const backendFormat: 'mp3' | 'wav' | 'wav24' =
        downloadFormat === 'wav24' ? 'wav24' : downloadFormat;

      // Process audio with Python service for FINAL output (not preview)
      // Use backend-friendly genre id (not display name); no timeout
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'free',
        selectedGenre.id || selectedGenre.name,
        effectiveUser.id.toString(),
        backendFormat,
        downloadSampleRate
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProcessingProgress(100);

      console.log('Final processing completed:', result);

      // Update uploadedFile with processed file size
      console.log('🎵 DEBUG: Processing result:', result);
      console.log('🎵 DEBUG: Processed file size bytes:', result.processed_file_size_bytes);
      if (uploadedFile && result.processed_file_size_bytes) {
        console.log('🎵 DEBUG: Updating uploadedFile with processed size:', result.processed_file_size_bytes);
        const updatedFile = {
          ...uploadedFile,
          processedSize: result.processed_file_size_bytes
        };
        console.log('🎵 DEBUG: Updated file object:', updatedFile);
        setUploadedFile(updatedFile);
        
        // Force a re-render by updating a dummy state
        setProcessingProgress(prev => prev + 0.001);
      }

      setMasteredAudioUrl(result.url);
      setActiveTab('download');
    } catch (error) {
      console.error('Processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Full error details:', error);
      alert(`Processing failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleDownload = async () => {
    if (!masteredAudioUrl) return;
    
    try {
      console.log('🎵 Simple download starting');
      console.log('🎵 DEBUG: masteredAudioUrl:', masteredAudioUrl);
      
      // Use simple direct download like local server
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const baseUrl = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio';
      
      // Extract file ID from URL or use simple download URL from response
      let downloadUrl;
      if (masteredAudioUrl.includes('simple_download_url')) {
        downloadUrl = `${baseUrl}${masteredAudioUrl}`;
      } else {
        // Fallback: try to extract file ID from URL
        const fileId = masteredAudioUrl.split('/').pop()?.split('.')[0] || 'unknown';
        // Use the full filename with extension for download
        const fullFilename = masteredAudioUrl.split('/').pop() || 'unknown';
        downloadUrl = `${baseUrl}/download/${fullFilename}`;
      }
      
      console.log('🎵 Download URL:', downloadUrl);
      
      const res = await fetch(downloadUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
      
      // 🎵 DEBUG: Log response headers and content length
      console.log('🎵 DEBUG: Response headers:', Object.fromEntries(res.headers.entries()));
      console.log('🎵 DEBUG: Content-Length header:', res.headers.get('content-length'));
      console.log('🎵 DEBUG: Content-Type header:', res.headers.get('content-type'));
      
      const blob = await res.blob();
      console.log('🎵 DEBUG: Download blob size:', blob.size, 'bytes');
      console.log('🎵 DEBUG: Blob type:', blob.type);
      
      if (blob.size < 1024) {
        console.error('🎵 DEBUG: Blob too small:', blob.size);
        throw new Error(`Downloaded file too small (${blob.size} bytes)`);
      }
      
      const objectUrl = URL.createObjectURL(blob);
      const baseName = (uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'audio');
      const ext = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${baseName}_garage_${selectedGenre?.name?.toLowerCase().replace(/\s+/g, '_')}_mastered_24bit_48k.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      
      console.log('🎵 Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crys-gold mb-4">Free Tier Audio Mastering</h1>
          <p className="text-crys-light-grey text-lg">Professional quality mastering with 2 genres and 2 formats</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = step.completed;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isActive ? 'bg-crys-gold text-crys-black' : 
                    isCompleted ? 'bg-crys-graphite text-crys-gold' : 
                    'bg-crys-charcoal text-crys-light-grey'
                  }`}>
                    <Icon size={20} />
                    <span className="font-medium">{step.label}</span>
                    {isCompleted && <CheckCircle size={16} />}
                  </div>
                  {index < processingSteps.length - 1 && (
                    <div className="w-8 h-0.5 bg-crys-graphite"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-crys-charcoal rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-crys-gold mb-4" />
              <h2 className="text-2xl font-bold mb-4">Upload Your Audio</h2>
              <p className="text-crys-light-grey mb-6">
                Upload your audio file to get started with professional mastering
              </p>
              
              <div className="border-2 border-dashed border-crys-graphite rounded-lg p-8 hover:border-crys-gold transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-crys-gold mb-2">
                    <Upload size={32} className="mx-auto" />
                  </div>
                  <p className="text-crys-white font-medium">Click to upload or drag and drop</p>
                  <p className="text-crys-light-grey text-sm mt-2">
                    Supports MP3, WAV, FLAC, and other audio formats
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && uploadedFile && (
          <div className="max-w-6xl mx-auto">
            {/* File Info */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-crys-gold" />
                  </div>
                  <div>
                    <h3 className="text-crys-white font-medium">{uploadedFile.name}</h3>
                    <p className="text-crys-light-grey text-sm">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <button
                  onClick={handlePlayPauseInstant}
                  className="flex items-center space-x-2 bg-crys-blue/20 hover:bg-crys-blue/30 text-crys-blue px-4 py-2 rounded-lg transition-colors"
                >
                  {isPlayingOriginal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="text-sm">Instant Preview</span>
                </button>
              </div>
            </div>

            {/* Hidden Audio Element for Instant Preview */}
            <audio ref={originalAudioRef} src={uploadedFile.url} preload="metadata" className="hidden" />

            {/* Static Waveform Seekbar (canvas) */}
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-crys-light-grey w-8">{formatTime(originalProgress)}</span>
                <div className="flex-1">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-20 rounded-md cursor-pointer select-none bg-[#1f1f23]"
                    onMouseDown={(e) => {
                      if (!originalAudioRef.current || !originalDuration) return;
                      const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
                      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                      originalAudioRef.current.currentTime = ratio * originalDuration;
                    }}
                  />
                </div>
                <span className="text-xs text-crys-light-grey w-8">{formatTime(originalDuration)}</span>
              </div>
            </div>

            {/* Real-time Analysis directly under waveform */}
            <div className="mt-3">
              <RealTimeAnalysisPanel analyser={originalChainRef.current?.analyser || null} isPlaying={isPlayingOriginal} />
            </div>

            {/* Genre Selection - Directly Beneath Player */}
            <div className="bg-crys-graphite rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                <Activity className="w-5 h-5 mr-2 text-crys-gold" />
                Select Genre (2 Free Options)
                {isApplyingEffects && (
                  <div className="ml-2 flex items-center text-sm text-crys-gold">
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Applying effects...
                  </div>
                )}
              </h3>
              
              {/* Instructions - Centered */}
              <div className="mb-6 p-4 bg-crys-dark rounded-lg text-center">
                <p className="text-sm text-crys-light-grey">
                  💡 <strong>Real-time Preview:</strong> Click any genre to hear instant effects. Make sure your audio is playing.
                </p>
              </div>

              {/* Genre Grid - Centered */}
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {freeTierGenres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre)}
                    className={`p-3 rounded-lg text-left transition-all hover:scale-105 focus:outline-none ${
                      selectedGenre?.id === genre.id
                        ? 'bg-crys-gold/20 border-2 border-crys-gold text-crys-gold'
                        : 'bg-crys-charcoal border-2 border-crys-graphite text-crys-light-grey hover:border-crys-gold/50 hover:bg-crys-graphite'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: genre.color }}
                      ></div>
                      <h4 className="font-medium">{genre.name}</h4>
                    </div>
                    <p className="text-sm opacity-75">{genre.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            {selectedGenre && (
              <div className="bg-crys-charcoal rounded-lg p-6 mb-6">
                <h3 className="text-crys-white font-medium mb-4">Download Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDownloadFormat('mp3')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      downloadFormat === 'mp3'
                        ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                        : 'border-crys-graphite bg-crys-charcoal text-crys-light-grey hover:border-crys-gold/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium">MP3</div>
                      <div className="text-sm opacity-75">320 kbps • ~6MB</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setDownloadFormat('wav24')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      downloadFormat === 'wav24'
                        ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                        : 'border-crys-graphite bg-crys-charcoal text-crys-light-grey hover:border-crys-gold/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium">WAV 24-bit</div>
                      <div className="text-sm opacity-75">Studio Quality • ~40MB</div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-crys-light-grey text-sm">
                    Selected: <span className="text-crys-gold font-medium">{downloadFormat.toUpperCase()}</span> • 
                    Sample Rate: <span className="text-crys-gold font-medium">{downloadSampleRate/1000}kHz</span>
                  </p>
                </div>
              </div>
            )}

            {/* Process Button */}
            {selectedGenre && (
              <div className="text-center">
                <button
                  onClick={handleProcessAudio}
                  disabled={isProcessing}
                  className="bg-crys-gold hover:bg-crys-gold/90 disabled:bg-crys-gold/50 text-crys-black px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing... {processingProgress.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <Settings size={20} />
                      <span>Process Audio</span>
                    </>
                  )}
                </button>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="w-full bg-crys-graphite rounded-full h-2">
                      <div 
                        className="bg-crys-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Download Tab */}
        {activeTab === 'download' && masteredAudioUrl && (
          <DownloadStep
            uploadedFile={uploadedFile}
            selectedGenre={selectedGenre}
            onBack={() => setActiveTab('processing')}
            onNewUpload={() => {
              setUploadedFile(null);
              setSelectedGenre(null);
              setMasteredAudioUrl(null);
              setActiveTab('upload');
            }}
            onDownload={handleDownload}
            masteredAudioUrl={masteredAudioUrl}
            downloadFormat={downloadFormat}
            onFormatChange={(f: 'mp3' | 'wav24') => setDownloadFormat(f)}
            tier="free"
          />
        )}
      </div>
    </div>
  );
};

export default FreeTierDashboardPython;
