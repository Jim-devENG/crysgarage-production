import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Play, Pause, Download, Activity, Music, ArrowLeft, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import DownloadStep from './DownloadStep';
import ComparisonPlayer from './ComparisonPlayer';
import { creditsAPI } from '../../services/api';
import { pythonAudioService, TierInfo, GenreInfo } from '../../services/pythonAudioService';
import { useAuth } from '../../contexts/AuthenticationContext';

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

const FreeTierDashboardPython: React.FC<FreeTierDashboardProps> = ({ onDownloadAttempt }) => {
  const { user } = useAuth();
  
  // Debug: Log user on component mount
  useEffect(() => {
    console.log('FreeTierDashboardPython - user from useAuth:', user);
  }, [user]);
  
  // Fallback user for dev mode
  const effectiveUser = user || {
    id: 'dev-user',
    name: 'Dev Mode User',
    email: 'dev@local.test',
    tier: 'free',
    credits: Infinity
  };
  
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
  const [error, setError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('mp3');
  const processingSteps = useMemo(
    () => [
      'EQ Processing',
      'Compression',
      'Limiting',
      'Comprehensive Normalization',
      'LUFS Normalization',
      'Peak Normalization',
      'Soft Limiting'
    ],
    []
  );
  const [processingStepIndex, setProcessingStepIndex] = useState<number>(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!isProcessing) return;
    setProcessingStepIndex(0);
    const interval = setInterval(() => {
      setProcessingStepIndex((idx) => (idx + 1) % processingSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isProcessing, processingSteps]);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);

  // WebAudio preview chain
  const audioContextRef = useRef<AudioContext | null>(null);
  // Two independent chains: original and mastered
  const originalChainRef = useRef({
    source: null as MediaElementAudioSourceNode | null,
    lowShelf: null as BiquadFilterNode | null,
    lowMid: null as BiquadFilterNode | null,
    mid: null as BiquadFilterNode | null,
    highMid: null as BiquadFilterNode | null,
    highShelf: null as BiquadFilterNode | null,
    compressor: null as DynamicsCompressorNode | null,
    panner: null as StereoPannerNode | null,
  });
  const masteredChainRef = useRef({
    source: null as MediaElementAudioSourceNode | null,
    lowShelf: null as BiquadFilterNode | null,
    lowMid: null as BiquadFilterNode | null,
    mid: null as BiquadFilterNode | null,
    highMid: null as BiquadFilterNode | null,
    highShelf: null as BiquadFilterNode | null,
    compressor: null as DynamicsCompressorNode | null,
    panner: null as StereoPannerNode | null,
  });
  const presetCacheRef = useRef<Record<string, GenreInfo>>({});
  
  // Additional refs for instant effects
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqNodeRef = useRef<BiquadFilterNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const fxNodesRef = useRef<AudioNode[]>([]);

  // Initialize audio context and source for instant effects
  const initializeAudioForInstantEffects = (audioUrl: string) => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create audio element for instant effects
      const audioElement = new Audio(audioUrl);
      audioElement.crossOrigin = 'anonymous';
      // Help autoplay policies on mobile/desktop
      try { (audioElement as any).playsInline = true; } catch {}
      try { audioElement.preload = 'auto'; } catch {}
      
      // Create media element source and tag it on the element for reuse guards
      const source = audioContextRef.current.createMediaElementSource(audioElement);
      try { (audioElement as any).__crys_source = source; } catch {}
      
      // Create gain node
      const gain = audioContextRef.current.createGain();
      
      // Connect source to gain to destination
      source.connect(gain);
      gain.connect(audioContextRef.current.destination);
      
      // Store references
      sourceNodeRef.current = source as any; // Type assertion for compatibility
      gainNodeRef.current = gain;
      
      // Store audio element reference
      masteredAudioRef.current = audioElement;
      
      console.log('Audio context initialized for instant effects');
      
    } catch (error) {
      console.error('Failed to initialize audio for instant effects:', error);
    }
  };

  const ensurePreviewGraph = (audioEl: HTMLAudioElement, target: 'original' | 'mastered') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    // Configure element for Web Audio graph processing
    try {
      audioEl.crossOrigin = 'anonymous';
      (audioEl as any).playsInline = true;
      audioEl.preload = 'auto';
      // Keep element audible so MediaElementSource feeds the graph reliably
      audioEl.muted = false;
      audioEl.volume = 1;
    } catch {}
    const chain = target === 'original' ? originalChainRef.current : masteredChainRef.current;
    // If this element was already connected elsewhere, reuse its source
    const existing = (audioEl as any).__crys_source as MediaElementAudioSourceNode | undefined;
    if (existing && !chain.source) {
      chain.source = existing;
    }
    if (!chain.source) {
      // Create source only once per element lifetime
      const src = ctx.createMediaElementSource(audioEl);
      (audioEl as any).__crys_source = src;
      chain.source = src;
      chain.lowShelf = ctx.createBiquadFilter();
      chain.lowShelf.type = 'lowshelf';
      chain.lowMid = ctx.createBiquadFilter();
      chain.lowMid.type = 'peaking';
      chain.mid = ctx.createBiquadFilter();
      chain.mid.type = 'peaking';
      chain.highMid = ctx.createBiquadFilter();
      chain.highMid.type = 'peaking';
      chain.highShelf = ctx.createBiquadFilter();
      chain.highShelf.type = 'highshelf';
      chain.compressor = ctx.createDynamicsCompressor();
      chain.panner = ctx.createStereoPanner();

      chain.source
        .connect(chain.lowShelf)
        .connect(chain.lowMid)
        .connect(chain.mid)
        .connect(chain.highMid)
        .connect(chain.highShelf)
        .connect(chain.compressor)
        .connect(chain.panner)
        .connect(ctx.destination);
    } else {
      // If source exists but filters were not created (e.g., other chain had the source), create downstream and connect
      if (!chain.lowShelf || !chain.highShelf || !chain.compressor) {
        chain.lowShelf = ctx.createBiquadFilter();
        chain.lowShelf.type = 'lowshelf';
        chain.lowMid = ctx.createBiquadFilter();
        chain.lowMid.type = 'peaking';
        chain.mid = ctx.createBiquadFilter();
        chain.mid.type = 'peaking';
        chain.highMid = ctx.createBiquadFilter();
        chain.highMid.type = 'peaking';
        chain.highShelf = ctx.createBiquadFilter();
        chain.highShelf.type = 'highshelf';
        chain.compressor = ctx.createDynamicsCompressor();
        chain.panner = ctx.createStereoPanner();
        try { (chain.source as any).disconnect && (chain.source as any).disconnect(); } catch {}
        chain.source
          .connect(chain.lowShelf)
          .connect(chain.lowMid)
          .connect(chain.mid)
          .connect(chain.highMid)
          .connect(chain.highShelf)
          .connect(chain.compressor)
          .connect(chain.panner)
          .connect(ctx.destination);
      }
    }
  };

  const rampParam = (param: AudioParam, value: number, ctx: AudioContext, time = 0.08) => {
    try {
      const now = ctx.currentTime;
      param.cancelScheduledValues(now);
      param.linearRampToValueAtTime(value, now + time);
    } catch {}
  };

  const applyGenrePreviewSettings = async (genreName: string) => {
    try {
      // Fetch once per session and cache
      const lower = genreName.toLowerCase();
      // Strong, local presets to guarantee audible changes in production
      const LOCAL_FREE_PRESETS: Record<string, GenreInfo> = {
        'hip-hop': {
          eq_curve: {
            low_shelf: { freq: 80, gain: 9 },
            low_mid: { freq: 250, gain: 3 },
            mid: { freq: 1000, gain: -6 },
            high_mid: { freq: 3000, gain: -2 },
            high_shelf: { freq: 10000, gain: 4 }
          },
          compression: { threshold: -14, ratio: 10, attack: 0.003, release: 0.25 },
          stereo_width: 1
        } as any,
        'chill vibes': {
          eq_curve: {
            low_shelf: { freq: 80, gain: 9 },
            low_mid: { freq: 250, gain: 3 },
            mid: { freq: 1000, gain: -6 },
            high_mid: { freq: 3000, gain: -2 },
            high_shelf: { freq: 10000, gain: 4 }
          },
          compression: { threshold: -14, ratio: 10, attack: 0.003, release: 0.25 },
          stereo_width: 1
        } as any,
        'afrobeats': {
          eq_curve: {
            low_shelf: { freq: 100, gain: 3 },
            low_mid: { freq: 250, gain: 1 },
            mid: { freq: 2000, gain: 6 },
            high_mid: { freq: 4000, gain: 2 },
            high_shelf: { freq: 8000, gain: 5 }
          },
          compression: { threshold: -10, ratio: 5, attack: 0.01, release: 0.3 },
          stereo_width: 1
        } as any,
        'party bounce': {
          eq_curve: {
            low_shelf: { freq: 100, gain: 3 },
            low_mid: { freq: 250, gain: 1 },
            mid: { freq: 2000, gain: 6 },
            high_mid: { freq: 4000, gain: 2 },
            high_shelf: { freq: 8000, gain: 5 }
          },
          compression: { threshold: -10, ratio: 5, attack: 0.01, release: 0.3 },
          stereo_width: 1
        } as any,
      };

      let info = LOCAL_FREE_PRESETS[lower] || presetCacheRef.current[lower];
      if (!info) {
        try {
          const all = await pythonAudioService.getIndustryPresets();
          // cache
          presetCacheRef.current = Object.keys(all).reduce((acc, k) => {
            acc[k.toLowerCase()] = all[k];
            return acc;
          }, {} as Record<string, GenreInfo>);
          info = presetCacheRef.current[lower] || LOCAL_FREE_PRESETS[lower];
        } catch {
          info = LOCAL_FREE_PRESETS[lower];
        }
        if (!info) return; // strict: no fallback
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      // Ensure AudioContext is running (autoplay policies may suspend it)
      if (ctx.state !== 'running') {
        try { await ctx.resume(); } catch {}
      }
      const applyToChain = (chain: typeof originalChainRef.current) => {
        const { eq_curve, compression, stereo_width } = info as GenreInfo;
        if (chain.lowShelf) {
          rampParam(chain.lowShelf.frequency, eq_curve.low_shelf.freq || 120, ctx);
          rampParam(chain.lowShelf.gain, eq_curve.low_shelf.gain || 0, ctx);
        }
        if (chain.lowMid) {
          rampParam(chain.lowMid.frequency, eq_curve.low_mid.freq || 250, ctx);
          try { chain.lowMid.Q.value = 1; } catch {}
          rampParam(chain.lowMid.gain, eq_curve.low_mid.gain || 0, ctx);
        }
        if (chain.mid) {
          rampParam(chain.mid.frequency, eq_curve.mid.freq || 1000, ctx);
          try { chain.mid.Q.value = 1; } catch {}
          rampParam(chain.mid.gain, eq_curve.mid.gain || 0, ctx);
        }
        if (chain.highMid) {
          rampParam(chain.highMid.frequency, eq_curve.high_mid.freq || 3000, ctx);
          try { chain.highMid.Q.value = 1; } catch {}
          rampParam(chain.highMid.gain, eq_curve.high_mid.gain || 0, ctx);
        }
        if (chain.highShelf) {
          rampParam(chain.highShelf.frequency, eq_curve.high_shelf.freq || 8000, ctx);
          rampParam(chain.highShelf.gain, eq_curve.high_shelf.gain || 0, ctx);
        }
        if (chain.compressor) {
          try { chain.compressor.ratio.value = Math.max(1, Math.min(20, (info as GenreInfo).compression.ratio || 2)); } catch {}
          try { chain.compressor.threshold.value = Math.max(-100, Math.min(0, (info as GenreInfo).compression.threshold || -24)); } catch {}
          try { chain.compressor.attack.value = Math.max(0.001, Math.min(1, ((info as GenreInfo).compression.attack || 0.01))); } catch {}
          try { chain.compressor.release.value = Math.max(0.01, Math.min(2, ((info as GenreInfo).compression.release || 0.25))); } catch {}
        }
        if (chain.panner) {
          const pan = Math.max(-1, Math.min(1, (((info as GenreInfo).stereo_width || 1) - 1) * 0.5));
          rampParam(chain.panner.pan, pan, ctx);
        }
      };

      // Apply to both chains to ensure change is reflected regardless of current source
      if (originalAudioRef.current) {
        const el: any = originalAudioRef.current as any;
        if (!el.__crys_source) {
          ensurePreviewGraph(originalAudioRef.current, 'original');
        }
        applyToChain(originalChainRef.current);
      }
      if (masteredAudioRef.current) {
        const el: any = masteredAudioRef.current as any;
        if (!el.__crys_source) {
          ensurePreviewGraph(masteredAudioRef.current, 'mastered');
        }
        applyToChain(masteredChainRef.current);
      }
    } catch (e) {
      console.error('Failed to apply genre preview settings:', e);
    }
  };

  // Load tier information and available genres on component mount
  useEffect(() => {
    loadTierInformation().catch((e) => {
      console.error('Tier load failed:', e);
      setIsLoadingGenres(false);
      setError('Failed to load genres');
    });
  }, []);

  const loadTierInformation = async () => {
    try {
      setIsLoadingGenres(true);
      
      // Get tier information from Python service
      const tierData = await pythonAudioService.getTierInformation();
      const freeTierInfo = tierData.free;
      setTierInfo(freeTierInfo);

      // Get available genres for free tier
      const genreNames = await pythonAudioService.getAvailableGenresForTier('free');
      
      // Create genre objects for UI with playful display names
      const displayNameById: Record<string, string> = {
        'hip-hop': 'Chill Vibes',
        'afrobeats': 'Party Bounce',
      };
      const genres: Genre[] = genreNames.map((originalName, index) => {
        const id = originalName.toLowerCase().replace(/\s+/g, '_');
        return {
          id,
          name: displayNameById[id] || originalName,
          color: index === 0 ? 'bg-orange-500' : 'bg-red-500',
          description: index === 0 ? 'Bass-Driven & Punchy' : 'Rhythmic & Energetic'
        };
      });
      
      setAvailableGenres(genres);
      console.log('Loaded free tier genres:', genres);
      
    } catch (error) {
      console.error('Failed to load tier information:', error);
      setError('Failed to load tier information');
      
      // Fallback genres
      setAvailableGenres([
        { id: 'hip-hop', name: 'Chill Vibes', color: 'bg-orange-500', description: 'Bass-Driven & Punchy' },
        { id: 'amapiano', name: 'Party Bounce', color: 'bg-red-500', description: 'Rhythmic & Energetic' }
      ]);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  // File upload handler
  const handleFileUpload = (file: File) => {
    try {
      setError(null);
      
      // Validate file size (free tier limit)
      const maxSize = 100 * 1024 * 1024; // 100MB for free tier
      if (file.size > maxSize) {
        setError('File too large. Free tier supports files up to 100MB.');
        return;
      }

      // Validate file format
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
      const allowedExtensions = ['.mp3', '.wav', '.flac'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError('Unsupported file format. Please use MP3 or WAV files.');
        return;
      }

      const audioFile: AudioFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file)
      };

      setUploadedFile(audioFile);
      setActiveTab('processing');
      
      console.log('File uploaded successfully:', audioFile);

      // Initialize audio context and create audio element for instant effects
      initializeAudioForInstantEffects(audioFile.url);

      // Set default original stats (no analysis needed)
      setOriginalStats({
        loudness: -14.0, // Default LUFS
        peak: -0.2,
        dynamicRange: 12.5,
        frequencyBalance: 0.8,
        stereoWidth: 1.0,
      });
      
    } catch (error) {
      console.error('File upload failed:', error);
      setError('Failed to upload file');
    }
  };

  // Debounce timer ref for preview
  const previewDebounceRef = useRef<number | undefined>(undefined);

  // Genre selection handler with INSTANT Web Audio API effects
  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    console.log('Genre selected:', genre);

    // Only apply effects if we have an uploaded file and audio context
    if (!uploadedFile || !audioContextRef.current) return;

    // Avoid reconnecting MediaElementSource if already connected elsewhere
    if (originalAudioRef.current) {
      const el: any = originalAudioRef.current as any;
      if (!el.__crys_source) {
        ensurePreviewGraph(originalAudioRef.current, 'original');
      }
    }
    if (masteredAudioRef.current) {
      const el: any = masteredAudioRef.current as any;
      // If element already has a MediaElementSource, never create another
      const alreadyConnected = !!el.__crys_source;
      if (!alreadyConnected) {
        ensurePreviewGraph(masteredAudioRef.current, 'mastered');
      }
    }

    // Resume context for live browsers
    try { if (audioContextRef.current.state !== 'running') audioContextRef.current.resume(); } catch {}

    // Preserve playhead
    const tMastered = masteredAudioRef.current ? masteredAudioRef.current.currentTime : 0;
    const tOriginal = originalAudioRef.current ? originalAudioRef.current.currentTime : 0;

    // Apply graph-based 5-band EQ/compressor settings for reliable live changes
    applyGenrePreviewSettings(genre.name);

    // Nudge both chains' output by toggling play to force audible refresh
    try {
      if (masteredAudioRef.current) {
        masteredAudioRef.current.currentTime = tMastered;
        masteredAudioRef.current.play().catch(()=>{});
      }
      if (originalAudioRef.current) {
        originalAudioRef.current.currentTime = tOriginal;
        // Keep original paused if mastered is our preview source
      }
    } catch {}
  };

  // Play/pause handler for instant effects
  const handlePlayPauseInstant = () => {
    if (!masteredAudioRef.current) return;

    try {
      if (masteredAudioRef.current.paused) {
        masteredAudioRef.current.play();
        setIsPlayingMastered(true);
        console.log('Playing instant effects audio');
      } else {
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
        console.log('Paused instant effects audio');
      }
    } catch (error) {
      console.error('Play/pause failed:', error);
    }
  };

  // Apply instant genre effects using Web Audio API (use genre.id to avoid display-name drift)
  const applyInstantGenreEffects = (genre: Genre) => {
    if (!audioContextRef.current || !sourceNodeRef.current || !gainNodeRef.current) {
      console.log('Audio context not ready for instant effects');
      return;
    }

    try {
      const ctx = audioContextRef.current;
      // Ensure audio context is running on user gesture
      if (ctx.state !== 'running') {
        try { ctx.resume(); } catch {}
      }
      const source = sourceNodeRef.current;
      // Recreate gain node each switch to force graph refresh on some browsers
      try { if (gainNodeRef.current) { (gainNodeRef.current as any).disconnect && (gainNodeRef.current as any).disconnect(); } } catch {}
      const newGain = ctx.createGain();
      gainNodeRef.current = newGain;

      // Clear existing effects: disconnect every previously created node
      try {
        fxNodesRef.current.forEach((n) => { try { (n as any).disconnect && (n as any).disconnect(); } catch {} });
      } catch {}
      fxNodesRef.current = [];
      if (eqNodeRef.current) { try { eqNodeRef.current.disconnect(); } catch {} }
      if (compressorNodeRef.current) { try { compressorNodeRef.current.disconnect(); } catch {} }

      // Disconnect current chain endpoints to ensure a clean slate
      try { (source as any).disconnect && (source as any).disconnect(); } catch {}
      // gain already recreated above

      // Create genre-specific effects
      let currentNode = source;

      const idKey = (genre.id || genre.name || '').toLowerCase().replace(/\s+/g, '_');
      const isHipHop = ['hip-hop','hip_hop','chill_vibes','hiphop'].includes(idKey);
      const isAfrobeats = ['afrobeats','afro_beats','party_bounce','amapiano'].includes(idKey);

      if (isHipHop) {
        // HIP-HOP: Heavy bass boost, scooped mids, loud
        console.log('Applying HIP-HOP instant effects');
        
        // Bass boost (low shelf filter)
        const bassBoost = ctx.createBiquadFilter();
        bassBoost.type = 'lowshelf';
        bassBoost.frequency.setValueAtTime(80, ctx.currentTime);
        bassBoost.gain.setValueAtTime(10, ctx.currentTime); // stronger +10dB bass boost for audibility
        
        // Mid scoop (notch filter)
        const midScoop = ctx.createBiquadFilter();
        midScoop.type = 'notch';
        midScoop.frequency.setValueAtTime(1000, ctx.currentTime);
        midScoop.Q.setValueAtTime(1, ctx.currentTime);
        midScoop.gain.setValueAtTime(-8, ctx.currentTime); // deeper -8dB mid scoop
        
        // Compression for punch
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-12, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(14, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);
        
        // Connect chain: source -> bass boost -> mid scoop -> compressor -> gain -> destination
        currentNode.connect(bassBoost);
        bassBoost.connect(midScoop);
        midScoop.connect(compressor);
        compressor.connect(newGain);
        
        // Store references for cleanup
        eqNodeRef.current = bassBoost;
        compressorNodeRef.current = compressor;
        fxNodesRef.current = [bassBoost, midScoop, compressor];
        
      } else if (isAfrobeats) {
        // AFROBEATS: Mid boost, warmth, light compression
        console.log('Applying AFROBEATS instant effects');
        
        // Mid boost (peaking filter)
        const midBoost = ctx.createBiquadFilter();
        midBoost.type = 'peaking';
        midBoost.frequency.setValueAtTime(2000, ctx.currentTime);
        midBoost.Q.setValueAtTime(1, ctx.currentTime);
        midBoost.gain.setValueAtTime(7, ctx.currentTime); // +7dB mid boost
        
        // High shelf for warmth
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.setValueAtTime(8000, ctx.currentTime);
        highShelf.gain.setValueAtTime(5, ctx.currentTime); // +5dB high shelf
        
        // Light compression
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-10, ctx.currentTime);
        compressor.knee.setValueAtTime(40, ctx.currentTime);
        compressor.ratio.setValueAtTime(5, ctx.currentTime);
        compressor.attack.setValueAtTime(0.01, ctx.currentTime);
        compressor.release.setValueAtTime(0.3, ctx.currentTime);
        
        // Connect chain: source -> mid boost -> high shelf -> compressor -> gain -> destination
        currentNode.connect(midBoost);
        midBoost.connect(highShelf);
        highShelf.connect(compressor);
        compressor.connect(newGain);
        
        // Store references for cleanup
        eqNodeRef.current = midBoost;
        compressorNodeRef.current = compressor;
        fxNodesRef.current = [midBoost, highShelf, compressor];
        
      } else {
        // DEFAULT: Gentle enhancement
        console.log('Applying DEFAULT instant effects');
        
        // Gentle high shelf for brightness
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.setValueAtTime(10000, ctx.currentTime);
        highShelf.gain.setValueAtTime(3, ctx.currentTime); // +3dB high shelf
        
        // Light compression
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-6, ctx.currentTime);
        compressor.knee.setValueAtTime(40, ctx.currentTime);
        compressor.ratio.setValueAtTime(3, ctx.currentTime);
        compressor.attack.setValueAtTime(0.01, ctx.currentTime);
        compressor.release.setValueAtTime(0.3, ctx.currentTime);
        
        // Connect chain: source -> high shelf -> compressor -> gain -> destination
        currentNode.connect(highShelf);
        highShelf.connect(compressor);
        compressor.connect(newGain);
        
        // Store references for cleanup
        eqNodeRef.current = highShelf;
        compressorNodeRef.current = compressor;
        fxNodesRef.current = [highShelf, compressor];
      }
      
      // Final connection to destination
      newGain.connect(ctx.destination);
      // Nudge gain to ensure audible param update
      try {
        const g = newGain.gain.value || 1.0;
        newGain.gain.setValueAtTime(g * 0.9, ctx.currentTime);
        newGain.gain.linearRampToValueAtTime(g, ctx.currentTime + 0.05);
      } catch {}
      
      console.log(`Instant ${genre.name} effects applied successfully!`);
      // Ensure mastered preview is audible after rewire
      try {
        if (masteredAudioRef.current && masteredAudioRef.current.paused) {
          masteredAudioRef.current.play().catch(() => {});
        }
      } catch {}
      
    } catch (error) {
      console.error('Failed to apply instant genre effects:', error);
    }
  };

  // Process audio with Python service
  const handleProcessAudio = async () => {
    // Debug: Check what's missing
    console.log('Debug - handleProcessAudio called:');
    console.log('uploadedFile:', uploadedFile);
    console.log('selectedGenre:', selectedGenre);
    console.log('effectiveUser:', effectiveUser);
    
    if (!uploadedFile || !selectedGenre || !effectiveUser) {
      const missing = [];
      if (!uploadedFile) missing.push('file');
      if (!selectedGenre) missing.push('genre');
      if (!effectiveUser) missing.push('user');
      setError(`Missing: ${missing.join(', ')}`);
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      console.log('Starting FINAL processing with Python service...');
      console.log('Selected genre:', selectedGenre.name);
      
      // Simulate progress updates
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
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

      // Process audio with Python service for FINAL output (not preview)
      // Use backend-friendly genre id (not display name); no timeout
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'free',
        selectedGenre.id || selectedGenre.name,
        effectiveUser.id,
        downloadFormat
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProcessingProgress(100);

      console.log('Final processing completed:', result);

      // Set mastered audio URL and ML details (if provided)
      setMasteredAudioUrl(result.url);
      // @ts-ignore: backend may include ML fields
      const mlSummary = (result as any).ml_summary;
      // @ts-ignore
      const appliedParams = (result as any).applied_params;
      // Combine stats and ML details in a single update to avoid overwriting
      setMasteredStats({
        loudness: result.lufs,
        peak: -0.2,
        dynamicRange: 12.5,
        frequencyBalance: 0.8,
        stereoWidth: 1.2,
        // @ts-ignore: extend for ML fields
        mlSummary,
        // @ts-ignore
        appliedParams
      } as any);

      // Stop any playing audio when processing completes and moving to download tab
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      }
      if (masteredAudioRef.current) {
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
      }

      // Move to download tab
      setActiveTab('download');
      
    } catch (error: any) {
      console.error('Python processing failed:', error);
      setError(error.message || 'Failed to process audio');
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Audio playback handlers
  const toggleOriginalPlayback = () => {
    if (!uploadedFile) return;

    if (!originalAudioRef.current) {
      originalAudioRef.current = new Audio(uploadedFile.url);
      try { originalAudioRef.current.crossOrigin = 'anonymous'; } catch {}
      try { (originalAudioRef.current as any).playsInline = true; } catch {}
      try { originalAudioRef.current.preload = 'auto'; } catch {}
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
    }

    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      // Ensure preview graph is connected for real-time effects on original
      ensurePreviewGraph(originalAudioRef.current, 'original');
      if (selectedGenre) {
        applyGenrePreviewSettings(selectedGenre.name);
      }
      // Resume context before play
      try { audioContextRef.current && audioContextRef.current.resume(); } catch {}
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  const toggleMasteredPlayback = () => {
    if (!masteredAudioUrl) return;

    if (!masteredAudioRef.current) {
      masteredAudioRef.current = new Audio(masteredAudioUrl);
      masteredAudioRef.current.onended = () => setIsPlayingMastered(false);
    }

    // Ensure preview graph is connected for real-time effects
    ensurePreviewGraph(masteredAudioRef.current, 'mastered');
    if (selectedGenre) {
      applyGenrePreviewSettings(selectedGenre.name);
    }

    if (isPlayingMastered) {
      masteredAudioRef.current.pause();
      setIsPlayingMastered(false);
    } else {
      masteredAudioRef.current.play();
      setIsPlayingMastered(true);
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!masteredAudioUrl) {
      setError('No mastered audio available for download');
      return;
    }

    if (onDownloadAttempt) {
      const canDownload = onDownloadAttempt();
      if (!canDownload) return;
    }

    try {
      // Fetch via python proxy and save as blob to avoid navigation/popups
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const proxyBase = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio';
      const proxyUrl = `${proxyBase}/proxy-download?file_url=${encodeURIComponent(masteredAudioUrl)}`;
      const res = await fetch(proxyUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const base = (uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'audio');
      const ext = masteredAudioUrl.toLowerCase().endsWith('.wav') ? 'wav' : 'mp3';
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `mastered_${base}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      console.log('Download saved via blob');
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download mastered audio');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      {/* Header */}
      <div className="bg-crys-charcoal border-b border-crys-graphite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-crys-light-grey hover:text-crys-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-crys-white">Free Tier Studio</h1>
                <p className="text-crys-light-grey text-sm">Python-powered audio mastering</p>
              </div>
            </div>
            
            {tierInfo && (
              <div className="text-right">
                <div className="text-crys-gold text-sm font-medium">
                  {tierInfo.processing_quality.toUpperCase()} QUALITY
                </div>
                <div className="text-crys-light-grey text-xs">
                  {tierInfo.available_formats.join(', ').toUpperCase()} • {tierInfo.max_sample_rate/1000}kHz
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['upload', 'processing', 'download'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${activeTab === step 
                    ? 'bg-crys-gold text-crys-black' 
                    : index < ['upload', 'processing', 'download'].indexOf(activeTab)
                    ? 'bg-crys-gold/20 text-crys-gold'
                    : 'bg-crys-graphite text-crys-light-grey'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`
                  ml-2 text-sm font-medium
                  ${activeTab === step ? 'text-crys-gold' : 'text-crys-light-grey'}
                `}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 2 && (
                  <div className="w-8 h-0.5 bg-crys-graphite mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-8">
              <div className="text-center">
                <Upload className="w-16 h-16 text-crys-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-crys-white mb-2">Upload Your Audio</h2>
                <p className="text-crys-light-grey mb-6">
                  Upload your audio file to get started with Python-powered mastering
                </p>
                
                <div className="border-2 border-dashed border-crys-graphite rounded-lg p-8 hover:border-crys-gold/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/flac"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-crys-light-grey mb-4">
                      <p className="text-lg">Click to upload or drag and drop</p>
                      <p className="text-sm">MP3, WAV, FLAC up to 100MB</p>
                    </div>
                    <button className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-3 rounded-lg font-medium transition-colors">
                      Choose File
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && (
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            {uploadedFile && (
              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-crys-gold" />
                    </div>
                    <div>
                      <h3 className="text-crys-white font-medium">{uploadedFile.name}</h3>
                      <p className="text-crys-light-grey text-sm">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handlePlayPauseInstant}
                    className="flex items-center space-x-2 bg-crys-blue/20 hover:bg-crys-blue/30 text-crys-blue px-4 py-2 rounded-lg transition-colors"
                  >
                    {isPlayingMastered ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-sm">Instant Preview</span>
                  </button>
                </div>
              </div>
            )}

            {/* Genre Selection */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-crys-white mb-2">Select Genre</h3>
                <p className="text-crys-light-grey text-sm">
                  Choose from 2 available genres for free tier mastering
                </p>
              </div>

              {isLoadingGenres ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-crys-gold animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {availableGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className={`
                        cursor-pointer p-6 rounded-lg border-2 transition-all duration-200
                        ${selectedGenre?.id === genre.id
                          ? 'border-crys-gold bg-crys-gold/10'
                          : 'border-crys-graphite hover:border-crys-gold/50'
                        }
                      `}
                      onClick={() => handleGenreSelect(genre)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${genre.color} rounded-lg flex items-center justify-center`}>
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-crys-white font-medium">{genre.name}</h4>
                          <p className="text-crys-light-grey text-sm">{genre.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Instructions */}
              {selectedGenre && uploadedFile && (
                <div className="text-center mb-6">
                  <p className="text-crys-light-grey text-sm">
                    💡 <strong>Tip:</strong> Click "Instant Preview" above to play your audio, then switch between genres to hear instant effects!
                  </p>
                </div>
              )}

              {/* Process Button */}
              {selectedGenre && (
                <div className="text-center">
                  {/* Format selector */}
                  <div className="mb-4 flex items-center justify-center gap-3 text-sm">
                    <label className="text-crys-light-grey">Format:</label>
                    <select
                      value={downloadFormat}
                      onChange={(e) => setDownloadFormat(e.target.value as any)}
                      className="bg-crys-charcoal border border-crys-graphite rounded px-3 py-2 text-crys-white"
                    >
                      <option value="mp3">MP3 (320 kbps, 44.1 kHz)</option>
                      <option value="wav">WAV (24-bit, 44.1 kHz)</option>
                    </select>
                  </div>
                  <button
                    onClick={handleProcessAudio}
                    disabled={isProcessing}
                    className="bg-crys-gold hover:bg-crys-gold/90 disabled:bg-crys-gold/50 text-crys-black px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Final Processing...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
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
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <p className="text-crys-light-grey">
                          {Math.round(processingProgress)}% complete
                        </p>
                        <p className="text-crys-gold font-medium">
                          {processingSteps[processingStepIndex]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Download/Comparison Tab */}
        {activeTab === 'download' && masteredAudioUrl && (
          <ComparisonPlayer
            originalFile={uploadedFile}
            masteredAudioUrl={masteredAudioUrl}
            selectedGenre={selectedGenre}
            // @ts-ignore
            mlSummary={(masteredStats as any)?.mlSummary}
            // @ts-ignore
            appliedParams={(masteredStats as any)?.appliedParams}
            originalLufs={originalStats?.loudness}
            masteredLufs={(masteredStats as any)?.loudness}
            onBack={() => setActiveTab('processing')}
            onNewUpload={() => {
              setUploadedFile(null);
              setSelectedGenre(null);
              setMasteredAudioUrl(null);
              setActiveTab('upload');
            }}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
};

export default FreeTierDashboardPython;
