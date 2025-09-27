import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Play, Pause, Download, Activity, Music, ArrowLeft, CreditCard, DollarSign, Loader2, Settings, Zap, Volume2, VolumeX } from 'lucide-react';
import DownloadStep from './DownloadStep';
import ComparisonPlayerFixed from './ComparisonPlayerFixed';
import RealTimeAnalysisPanel from '../AdvancedTierDashboard/RealTimeAnalysisPanel';
import { creditsAPI } from '../../services/api';
import { pythonAudioService, TierInfo, GenreInfo } from '../../services/pythonAudioService';
import { useAuth } from '../../contexts/AuthenticationContext';
import { creditService } from '../../services/creditService';

// Types
interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
  processedSize?: number; // Processed file size in bytes
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

interface ProfessionalTierDashboardProps {
  onDownloadAttempt?: () => boolean;
}

const ProfessionalTierDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onDownloadAttempt }) => {
  const { user } = useAuth();
  
  // Debug: Log user on component mount
  useEffect(() => {
    console.log('ProfessionalTierDashboard - user from useAuth:', user);
  }, [user]);
  
  // Fallback user for dev mode
  const effectiveUser = user || {
    id: 'dev-user',
    name: 'Dev Mode User',
    email: 'dev@local.test',
    tier: 'professional',
    credits: Infinity
  };
  
  // States
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debug: Track uploadedFile state changes
  useEffect(() => {
    if (uploadedFile) {
      console.log('🎵 DEBUG: uploadedFile state updated:', {
        processedSize: uploadedFile.processedSize,
        originalSize: uploadedFile.size,
        hasProcessedSize: !!uploadedFile.processedSize
      });
    }
  }, [uploadedFile]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [originalStats, setOriginalStats] = useState<AudioStats | null>(null);
  const [masteredStats, setMasteredStats] = useState<AudioStats | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [masteredRemoteUrl, setMasteredRemoteUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalVolume, setOriginalVolume] = useState(1);
  const [originalMuted, setOriginalMuted] = useState(false);
  const [originalProgress, setOriginalProgress] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24'>('wav24');
  const [isApplyingEffects, setIsApplyingEffects] = useState(false);
  
  // LUFS and volume control states
  const [volumeEnabled, setVolumeEnabled] = useState<boolean>(true);
  const [selectedLufs, setSelectedLufs] = useState<-14 | -12 | -10 | -9 | -8>(-8);
  
  const processingSteps = useMemo(
    () => [
      'EQ Processing',
      'Compression',
      'Multiband Compression (Pro+)',
      'Stereo Widening (Pro+)',
      'Harmonic Exciter (Advanced+)',
      'Limiting',
      'Comprehensive Normalization ← ENHANCED',
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
  // Cached genre info to avoid network wait on every switch
  const [genreInfoMap, setGenreInfoMap] = useState<Record<string, any> | null>(null);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // WebAudio preview chain
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalChainRef = useRef<{
    source: MediaElementAudioSourceNode | null;
    outputGain: GainNode | null;
    lowShelf: BiquadFilterNode | null;
    midPeaking: BiquadFilterNode | null;
    highShelf: BiquadFilterNode | null;
    compressor: DynamicsCompressorNode | null;
    limiter: DynamicsCompressorNode | null;
    analyser: AnalyserNode | null;
  }>({ source: null, outputGain: null, lowShelf: null, midPeaking: null, highShelf: null, compressor: null, limiter: null, analyser: null });
  // Tracks the base preview gain computed from preset/level before applying the level multiplier
  const basePreviewGainRef = useRef<number>(1.0);

  // Vibrant African-inspired color scheme for genres
  const rainbowColors = [
    'bg-red-600',      // Vibrant Red (Afrobeats, Hip-life)
    'bg-orange-600',   // Rich Orange (Alté, Azonto)
    'bg-yellow-500',   // Golden Yellow (Naija Pop, Bongo Flava)
    'bg-green-600',    // Deep Green (Amapiano, Kwaito)
    'bg-blue-600',     // Electric Blue (Gqom, Shangaan Electro)
    'bg-indigo-600',   // Royal Indigo (Kuduro, Ndombolo)
    'bg-purple-600'    // Rich Purple (Gengetone, Shrap)
  ];

  // Static canvas waveform refs/state (stable, no scroll)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peaksRef = useRef<Float32Array | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context initialized for instant effects');
    }
  }, []);

  // Sync original element volume/mute
  useEffect(() => {
    if (!originalAudioRef.current) return;
    try { originalAudioRef.current.volume = originalMuted ? 0 : originalVolume; } catch {}
    try { originalAudioRef.current.muted = originalMuted; } catch {}
  }, [originalVolume, originalMuted]);

  // Track original progress/duration
  useEffect(() => {
    const audio = originalAudioRef.current;
    if (!audio) return;
    const onTime = () => setOriginalProgress(audio.currentTime);
    const onMeta = () => setOriginalDuration(audio.duration || 0);
    const onEnded = () => { setIsPlayingOriginal(false); setOriginalProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [uploadedFile]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOriginalPlayPause = () => {
    if (!originalAudioRef.current) return;
    // Ensure processing chain (incl. analyser) exists before playback toggles
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
      // Ensure the chain exists before play
      buildPreviewChain();
      // Slight nudge to retrigger playback capture
      try { originalAudioRef.current.currentTime = Math.max(0, originalAudioRef.current.currentTime - 0.001); } catch {}
      originalAudioRef.current.play().catch(()=>{});
      setIsPlayingOriginal(true);
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
  };

  // Build or rebuild preview chain
  const buildPreviewChain = () => {
    if (!audioContextRef.current || !originalAudioRef.current) return false;
    const ctx = audioContextRef.current;

    // Route audio exclusively through Web Audio graph so effects are audible on live
    try {
      originalAudioRef.current.crossOrigin = 'anonymous';
      (originalAudioRef.current as any).playsInline = true;
      originalAudioRef.current.preload = 'auto';
      // Keep element unmuted and with low volume so MediaElementSource is reliably fed,
      // but direct element output is minimally audible
      originalAudioRef.current.muted = false;
      originalAudioRef.current.volume = 0.4; // x2 louder direct path for reliable capture
    } catch {}

    // Reuse existing MediaElementSourceNode if already created for this element
    let { source } = originalChainRef.current;
    const el: any = originalAudioRef.current as any;
    const existing = el.__crys_source as MediaElementAudioSourceNode | undefined;
    if (!source) {
      if (existing) {
        source = existing;
      } else {
        // Create once per HTMLMediaElement lifetime; cannot create twice.
        source = ctx.createMediaElementSource(originalAudioRef.current);
        try { el.__crys_source = source; } catch {}
      }
    } else {
      try { (source as any).disconnect && (source as any).disconnect(); } catch {}
    }

    // (Re)create downstream nodes (EQ5 like Advanced)
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    const lowMidPeaking = ctx.createBiquadFilter();
    lowMidPeaking.type = 'peaking';
    const midPeaking = ctx.createBiquadFilter();
    midPeaking.type = 'peaking';
    const highMidPeaking = ctx.createBiquadFilter();
    highMidPeaking.type = 'peaking';
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    const compressor = ctx.createDynamicsCompressor();
    const limiter = ctx.createDynamicsCompressor();
    // Limiter-like settings
    limiter.threshold.value = -6;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.1;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    const outputGain = ctx.createGain();
    outputGain.gain.value = 1.0;

    // source -> EQ5 -> compressor -> limiter -> outputGain -> destination
    source.connect(lowShelf);
    lowShelf.connect(lowMidPeaking);
    lowMidPeaking.connect(midPeaking);
    midPeaking.connect(highMidPeaking);
    highMidPeaking.connect(highShelf);
    highShelf.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(analyser);
    analyser.connect(outputGain);
    outputGain.connect(ctx.destination);

    // Add a compensating gain for audibility (ensure non-zero)
    try { outputGain.gain.value = Math.max(2.0, outputGain.gain.value || 2.0); } catch {}

    originalChainRef.current = { source, outputGain, lowShelf, lowMidPeaking, midPeaking, highMidPeaking, highShelf, compressor, limiter, analyser } as any;
    return true;
  };

  // Ensure presets are audibly distinct in preview even if backend values are mild/flat
  const ensureAudiblePreset = (p: any, name: string) => {
    const preset = JSON.parse(JSON.stringify(p || {}));
    const eq = preset.eq_curve || {};
    const gains = [
      Math.abs(eq?.low_shelf?.gain ?? 0),
      Math.abs(eq?.low_mid?.gain ?? 0),
      Math.abs(eq?.mid?.gain ?? 0),
      Math.abs(eq?.high_mid?.gain ?? 0),
      Math.abs(eq?.high_shelf?.gain ?? 0),
    ];
    const sum = gains.reduce((a,b)=>a+b,0);
    // If nearly flat, synthesize genre-typical EQ for preview audibility
    if (sum < 1.0) {
      const n = (name || '').toLowerCase();
      if (n.includes('hip') && n.includes('hop')) {
        eq.low_shelf = { freq: 70, gain: 6 };
        eq.low_mid = { freq: 300, gain: -3 };
        eq.mid = { freq: 1000, gain: -2 };
        eq.high_mid = { freq: 4000, gain: 1 };
        eq.high_shelf = { freq: 9000, gain: 1 };
      } else if (n.includes('classical')) {
        eq.low_shelf = { freq: 100, gain: 0 };
        eq.low_mid = { freq: 300, gain: 0 };
        eq.mid = { freq: 1000, gain: 0 };
        eq.high_mid = { freq: 3500, gain: 2 };
        eq.high_shelf = { freq: 10000, gain: 3 };
      } else if (n.includes('dubstep') || n.includes('trap')) {
        eq.low_shelf = { freq: 60, gain: 8 };
        eq.low_mid = { freq: 200, gain: 2 };
        eq.mid = { freq: 1000, gain: 0 };
        eq.high_mid = { freq: 3500, gain: 1 };
        eq.high_shelf = { freq: 9000, gain: 1 };
      } else if (n.includes('jazz')) {
        eq.low_shelf = { freq: 90, gain: 1 };
        eq.low_mid = { freq: 300, gain: 1 };
        eq.mid = { freq: 1000, gain: 2 };
        eq.high_mid = { freq: 3500, gain: 1 };
        eq.high_shelf = { freq: 10000, gain: 2 };
      } else if (n.includes('afro') || n.includes('naija')) {
        eq.low_shelf = { freq: 90, gain: 3 };
        eq.low_mid = { freq: 300, gain: 1 };
        eq.mid = { freq: 1200, gain: 1 };
        eq.high_mid = { freq: 4000, gain: 2 };
        eq.high_shelf = { freq: 10000, gain: 2 };
      } else {
        eq.low_shelf = { freq: 100, gain: 2 };
        eq.mid = { freq: 1000, gain: 1 };
        eq.high_shelf = { freq: 10000, gain: 2 };
      }
      preset.eq_curve = eq;
    }
    // Make compression a bit stronger for audibility
    const c = preset.compression || {};
    c.threshold = (c.threshold ?? -16) - 2;
    c.ratio = Math.max(2.5, Math.min((c.ratio ?? 3) * 1.2, 8));
    c.attack = Math.max(0.001, c.attack ?? 0.003);
    c.release = c.release ?? 0.2;
    preset.compression = c;
    return preset;
  };

  // Initialize WaveSurfer to render waveform and enable seek on the original audio element
  // Decode uploaded file once and compute static peaks for drawing
  useEffect(() => {
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
        const samplesPerBucket = Math.max(1, Math.floor(audioBuffer.length / desiredBuckets));
        const peaks = new Float32Array(desiredBuckets);
        for (let i = 0; i < desiredBuckets; i++) {
          const start = i * samplesPerBucket;
          const end = Math.min(audioBuffer.length, start + samplesPerBucket);
          let sum = 0, count = 0;
          for (let s = start; s < end; s++) {
            const l = dataL[s] || 0;
            const r = dataR ? (dataR[s] || 0) : l;
            const v = (Math.abs(l) + Math.abs(r)) * 0.5;
            sum += v; count++;
          }
          peaks[i] = count ? sum / count : 0;
        }
        let peakMax = 0;
        for (let i = 0; i < peaks.length; i++) peakMax = Math.max(peakMax, peaks[i]);
        if (peakMax > 0) for (let i = 0; i < peaks.length; i++) peaks[i] = peaks[i] / peakMax;
        if (!cancelled) { peaksRef.current = peaks; drawWaveform(); }
        ctx.close();
      } catch {
        peaksRef.current = null; drawWaveform();
      }
    };
    compute();
    return () => { cancelled = true; };
  }, [uploadedFile]);

  // Draw static waveform to canvas, with progress overlay
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const peaks = peaksRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    const width = cssWidth * dpr;
    const height = cssHeight * dpr;
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1f1f23';
    ctx.fillRect(0, 0, width, height);
    const midY = height / 2;
    const maxBar = Math.max(1, height * 0.45);
    const total = peaks ? peaks.length : 0;
    const progressRatio = originalDuration > 0 ? originalProgress / originalDuration : 0;
    const playedX = Math.floor(progressRatio * width);
    const drawSegment = (startX: number, endX: number, color: string) => {
      ctx.fillStyle = color;
      if (!total) { ctx.fillRect(startX, midY - 2, Math.max(0, endX - startX), 4); return; }
      const columnWidth = Math.max(1, Math.floor(dpr * 2));
      for (let x = startX; x < endX; x += columnWidth) {
        const pIndex = Math.floor((x / width) * total);
        const amp = Math.min(1, peaks![Math.min(total - 1, Math.max(0, pIndex))]);
        const barH = Math.max(1, amp * maxBar);
        ctx.fillRect(x, midY - barH, columnWidth, barH * 2);
      }
    };
    drawSegment(0, playedX, '#d4af37');
    drawSegment(playedX, width, '#49494f');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playedX, 0, Math.max(1, Math.floor(dpr)), height);
  };

  // Redraw on progress/resize
  useEffect(() => { drawWaveform(); }, [originalProgress, originalDuration]);
  useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if (canvasRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => drawWaveform());
      ro.observe(canvasRef.current);
    }
    return () => { window.removeEventListener('resize', onResize); if (ro && canvasRef.current) { try { ro.unobserve(canvasRef.current); } catch {} } };
  }, []);

  // Apply instant genre effects for real-time preview
  const applyInstantGenreEffects = async (genre: Genre) => {
    if (!audioContextRef.current || !originalAudioRef.current) {
      console.log('Audio context or audio element not available');
      return;
    }

    try {
      setIsApplyingEffects(true);
      console.log(`Applying ${genre.name.toUpperCase()} instant effects`);
      
      // Resume audio context if suspended (required for user interaction)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Build chain (or rebuild if element was remounted)
      if (!originalChainRef.current.source) {
        buildPreviewChain();
        console.log('Audio chain created successfully');
      }

      // Apply genre-specific settings
      const { outputGain, lowShelf, lowMidPeaking, midPeaking, highMidPeaking, highShelf, compressor, limiter } = originalChainRef.current as any;
      
      // Get genre preset - try multiple keys (name/id/lowercase), then fallback
      let preset: any = undefined;
      if (genreInfoMap) {
        preset =
          genreInfoMap[genre.name] ||
          genreInfoMap[genre.id] ||
          genreInfoMap[(genre.name || '').toLowerCase()] ||
          genreInfoMap[(genre.id || '').toLowerCase()];
      }
      
      if (!preset) {
        // Try to get from Python service (async, may be slow)
        try {
          const genrePresets = await pythonAudioService.getIndustryPresets();
          preset =
            (genrePresets as any)[genre.name] ||
            (genrePresets as any)[genre.id] ||
            (genrePresets as any)[(genre.name || '').toLowerCase()] ||
            (genrePresets as any)[(genre.id || '').toLowerCase()];
          console.log(`Got ${genre.name} preset from Python service:`, preset);
        } catch (error) {
          console.log('Python service unavailable, using hardcoded preset');
        }
      }
      
      // Fallback to hardcoded presets for instant response
      if (!preset) {
        try {
          const { GENRE_PRESETS, normalizeKey } = await import('../../presets/genrePresets');
          const k = normalizeKey(genre.name || genre.id || '');
          const key = Object.keys(GENRE_PRESETS).find(x => normalizeKey(x) === k);
          if (key) preset = (GENRE_PRESETS as any)[key];
        } catch {}
        if (!preset) {
          const candidates = [
            genre.name,
            genre.id,
            (genre.name || '').replace(/-/g, ' '),
            (genre.id || '').replace(/-/g, ' '),
          ].filter(Boolean) as string[];
          for (const key of candidates) {
            const p = getHardcodedGenrePreset(key);
            if (p) { preset = p; break; }
          }
        }
        console.log(`Using hardcoded preset for ${genre.name}:`, preset);
      }
      
      if (preset) {
        // Ensure presets are audibly distinct in preview
        preset = ensureAudiblePreset(preset, genre.name);
        const currentTime = audioContextRef.current.currentTime;
        // More pronounced EQ: map preset shelves and mid, with a slight exaggeration for audibility
        // Extreme preview intensity for unmistakable differences on live
        const exaggerate = 2.8; // stronger for clearer differences
        // Map full EQ5 like Advanced
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

        // Compression: slightly stronger for audibility
        const thr = preset.compression.threshold - 4; // push harder
        const ratio = Math.min(preset.compression.ratio * 1.35, 10);
        compressor.threshold.setValueAtTime(thr, currentTime);
        compressor.knee.setValueAtTime(20, currentTime);
        compressor.ratio.setValueAtTime(ratio, currentTime);
        compressor.attack.setValueAtTime(Math.max(0.001, preset.compression.attack), currentTime);
        compressor.release.setValueAtTime(preset.compression.release, currentTime);

        // Output gain target relative to LUFS target; keep within safe range
        // Map loudness level to preview gain tilt (~-12/-10/-8 reference)
        // Compute base gain from chosen LUFS (or stay close to preset when disabled)
        // For instant preview, ignore global LUFS buttons to avoid masking tonal changes
        // Peg all genres at -8 LUFS for preview loudness targeting
        const chosenLufs = -8;
        let baseGain = Math.min(2.5, Math.max(0.6, Math.pow(10, (chosenLufs + 14) / 20)));
        // Blend in per-genre gain from merged presets (Advanced + Utils) when available
        let genreGain = 1.0;
        try {
          const { getGenrePreset } = await import('../ProfessionalDashboard/genres');
          const gp: any = getGenrePreset(genre.name);
          if (gp && typeof gp.gain === 'number') {
            // Map typical gain 1.0-2.5 into a 0.9-1.6 multiplier range
            const g = Math.max(0.5, Math.min(3.0, gp.gain));
            genreGain = Math.max(0.9, Math.min(1.6, 0.6 + g * 0.4));
          }
        } catch {}
        // Double the preview loudness, with a safety clamp
        const targetGain = Math.min(3.5, Math.max(0.5, baseGain * genreGain * 2));
        basePreviewGainRef.current = baseGain;
        try { outputGain.gain.cancelScheduledValues(currentTime); } catch {}
        // Quick nudge then settle to target for audible update
        const pre = Math.max(0.3, Math.min(3.0, targetGain * 0.9));
        try { outputGain.gain.setValueAtTime(pre, currentTime); } catch {}
        outputGain.gain.linearRampToValueAtTime(targetGain, currentTime + 0.08);
        
        // Live debug: confirm node values pushed to graph
        try {
          console.log(`Applied ${genre.name} effects:`, {
            lowShelf: { f: lowShelf.frequency.value, g: lowShelf.gain.value },
            lowMid: { f: (lowMidPeaking as any)?.frequency?.value, g: (lowMidPeaking as any)?.gain?.value },
            mid: { f: midPeaking.frequency.value, g: midPeaking.gain.value },
            highMid: { f: (highMidPeaking as any)?.frequency?.value, g: (highMidPeaking as any)?.gain?.value },
            highShelf: { f: highShelf.frequency.value, g: highShelf.gain.value },
            compressor: { thr: compressor.threshold.value, ratio: compressor.ratio.value },
            targetGain
          });
        } catch {}
      } else {
        console.warn(`No preset found for genre: ${genre.name}`);
      }
      
      console.log(`Instant ${genre.name} effects applied successfully!`);
    } catch (error) {
      console.error('Failed to apply instant genre effects:', error);
    } finally {
      setIsApplyingEffects(false);
    }
  };

  // Rebuild chain if audio element remounts or tab switches back
  useEffect(() => {
    if (activeTab === 'processing' && uploadedFile && originalAudioRef.current) {
      buildPreviewChain();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, originalAudioRef.current]);

  // Load tier information and available genres on component mount
  useEffect(() => {
    let cancelled = false;
    // Safety timeout: stop loading after 10s with fallback
    const timeoutId = setTimeout(async () => {
      if (!cancelled) {
        console.warn('Genre loading timed out (Professional). Falling back to Advanced list.');
        setIsLoadingGenres(false);
        try {
          const { getAllGenresForUI } = await import('../ProfessionalDashboard/genres');
          const genres: any[] = getAllGenresForUI();
          setAvailableGenres(genres);
        } catch {
          setAvailableGenres([]);
        }
      }
    }, 10000);

    loadTierInformation().finally(() => {
      if (!cancelled) clearTimeout(timeoutId);
    });

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, []);

  const loadTierInformation = async () => {
    try {
      setIsLoadingGenres(true);
      // Load genres immediately from local index to avoid UI wait
      try {
        const { getAllGenresForUI } = await import('../ProfessionalDashboard/genres');
        const genres: Genre[] = getAllGenresForUI();
        setAvailableGenres(genres);
        console.log('Loaded professional tier genres (local index):', genres);
      } catch (e) {
        console.warn('Local genre import failed:', e);
      }

      // Fetch tier information with timeout protection
      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> => {
        return new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('Tier fetch timeout')), ms);
          p.then((v) => { clearTimeout(t); resolve(v); }).catch((err) => { clearTimeout(t); reject(err); });
        });
      };
      const tierData = await withTimeout(pythonAudioService.getTierInformation(), 8000);
      const proTierInfo = (tierData as any).pro || (tierData as any).professional;
      if (proTierInfo) setTierInfo(proTierInfo);
      
    } catch (error) {
      console.error('Failed to load tier information:', error);
      setError('Failed to load tier information');
      try {
        const { getAllGenresForUI } = await import('../ProfessionalDashboard/genres');
        const genres: any[] = getAllGenresForUI();
        setAvailableGenres(genres);
      } catch {
        setAvailableGenres([]);
      }
    } finally {
      setIsLoadingGenres(false);
    }
  };

  const getGenreDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'Afrobeats': 'West African pop blend',
      'Alté': 'Nigerian alternative fusion',
      'Hip-life': 'Ghanaian highlife & hip hop',
      'Azonto': 'Ghanaian dance-driven upbeat',
      'Naija Pop': 'Nigerian mainstream urban',
      'Bongo Flava': 'Tanzanian Afro-pop',
      'Amapiano': 'South African house jazz',
      'Kwaito': 'South African township sound',
      'Gqom': 'Hard electronic from Durban',
      'Shangaan Electro': 'Fast Tsonga electronic',
      'Kuduro': 'Angolan energetic electronic',
      'Ndombolo': 'Congolese dance music',
      'Gengetone': 'Kenyan street-style rap',
      'Shrap': 'Kenyan trap with Sheng',
      'Singeli': 'Ultra-fast Tanzanian electronic',
      'Urban Benga': 'Modern Kenyan benga',
      'Raï N\'B': 'North African raï & R&B',
      'Raï-hop': 'Raï blended with hip hop',
      'Gnawa Fusion': 'Moroccan spiritual fusion',
      'Afrotrap': 'African rhythms & French trap',
      'Afro-Gospel': 'Gospel with Afro elements',
      'Urban Gospel': 'Contemporary gospel urban',
      'Kwela': 'South African jazzy street',
      'New Benga': 'Updated Kenyan benga',
      'Classical': 'Elegant & Timeless',
      'R&B': 'Smooth & Soulful',
      'Reggae': 'Laid-back & Groovy',
      'Country': 'Authentic & Storytelling',
      'Blues': 'Emotional & Raw',
      'Funk': 'Groovy & Danceable',
      'Soul': 'Passionate & Expressive',
      'Disco': 'Danceable & Glamorous',
      'House': 'Deep & Driving',
      'Techno': 'Industrial & Hypnotic',
      'Trance': 'Euphoric & Melodic',
      'Dubstep': 'Heavy & Aggressive',
      'Ambient': 'Atmospheric & Meditative',
      'Indie': 'Alternative & Creative',
      'Alternative': 'Edgy & Non-conformist',
      'Folk': 'Acoustic & Storytelling',
      'Acoustic': 'Natural & Intimate',
      'Latin': 'Rhythmic & Passionate',
      'World': 'Cultural & Diverse',
      'Experimental': 'Avant-garde & Innovative',
      'Cinematic': 'Epic & Dramatic',
      'Lo-Fi': 'Nostalgic & Relaxed',
      'Trap': 'Dark & Aggressive',
      'Future Bass': 'Melodic & Energetic'
    };
    return descriptions[name] || 'Professional Mastering';
  };

  // Hardcoded genre presets for instant preview (fallback when Python service is unavailable)
  const getHardcodedGenrePreset = (genreName: string) => {
    const presets: Record<string, any> = {
      // West African Genres
      'Afrobeats': {
        eq_curve: { low_shelf: { freq: 100, gain: 2.0 }, low_mid: { freq: 300, gain: -0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Alté': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.5 }, low_mid: { freq: 300, gain: -1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 12000, gain: 3.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Hip-life': {
        eq_curve: { low_shelf: { freq: 70, gain: 2.5 }, low_mid: { freq: 300, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Azonto': {
        eq_curve: { low_shelf: { freq: 100, gain: 2.0 }, low_mid: { freq: 300, gain: 0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 2.0 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Naija Pop': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.8 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Bongo Flava': {
        eq_curve: { low_shelf: { freq: 80, gain: 2.0 }, low_mid: { freq: 300, gain: 0.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      
      // South African Genres
      'Amapiano': {
        eq_curve: { low_shelf: { freq: 50, gain: 2.5 }, low_mid: { freq: 300, gain: -0.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Kwaito': {
        eq_curve: { low_shelf: { freq: 80, gain: 2.2 }, low_mid: { freq: 300, gain: 0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.8 }, high_shelf: { freq: 8000, gain: 0.8 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Gqom': {
        eq_curve: { low_shelf: { freq: 40, gain: 3.0 }, low_mid: { freq: 200, gain: -1.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Shangaan Electro': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 12000, gain: 2.5 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Kwela': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 2000, gain: 2.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      
      // Central/East African Genres
      'Kuduro': {
        eq_curve: { low_shelf: { freq: 80, gain: 2.5 }, low_mid: { freq: 300, gain: 0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Ndombolo': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Gengetone': {
        eq_curve: { low_shelf: { freq: 80, gain: 2.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      
      // International Genres
      'Pop': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.0 }, low_mid: { freq: 300, gain: 0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Hip Hop': {
        eq_curve: { low_shelf: { freq: 60, gain: 2.5 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.2, threshold: -17.0, attack: 0.003, release: 0.2 },
        target_lufs: -12.0
      },
      'R&B': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.8 } },
        compression: { ratio: 2.2, threshold: -17.0, attack: 0.003, release: 0.2 },
        target_lufs: -12.0
      },
      'Rock': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.5 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Electronic': {
        eq_curve: { low_shelf: { freq: 60, gain: 2.0 }, low_mid: { freq: 300, gain: -0.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 2.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Jazz': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.5 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.5 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Classical': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.0 }, high_shelf: { freq: 8000, gain: 0.0 } },
        compression: { ratio: 1.5, threshold: -20.0, attack: 0.05, release: 0.5 },
        target_lufs: -16.0
      },
      'Reggae': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.5 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Country': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.5 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.5 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Blues': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.0 }, low_mid: { freq: 300, gain: 0.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      
      // Additional Advanced Genres
      'Trap': {
        eq_curve: { low_shelf: { freq: 60, gain: 3.5 }, low_mid: { freq: 200, gain: 1.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.6 }, high_shelf: { freq: 8000, gain: 0.6 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Drill': {
        eq_curve: { low_shelf: { freq: 70, gain: 3.0 }, low_mid: { freq: 250, gain: 1.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.7 }, high_shelf: { freq: 8000, gain: 0.7 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Dubstep': {
        eq_curve: { low_shelf: { freq: 50, gain: 4.0 }, low_mid: { freq: 150, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.8 }, high_shelf: { freq: 8000, gain: 0.8 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Gospel': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 2.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Lofi Hip-Hop': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.8 }, low_mid: { freq: 300, gain: 1.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'House': {
        eq_curve: { low_shelf: { freq: 60, gain: 2.5 }, low_mid: { freq: 200, gain: 1.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Techno': {
        eq_curve: { low_shelf: { freq: 50, gain: 3.2 }, low_mid: { freq: 150, gain: 1.6 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.9 }, high_shelf: { freq: 8000, gain: 0.9 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Highlife': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 2.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Instrumentals': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 2.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Beats': {
        eq_curve: { low_shelf: { freq: 70, gain: 2.2 }, low_mid: { freq: 250, gain: 1.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Trance': {
        eq_curve: { low_shelf: { freq: 60, gain: 2.0 }, low_mid: { freq: 200, gain: 1.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.8 }, high_shelf: { freq: 8000, gain: 1.8 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Drum & Bass': {
        eq_curve: { low_shelf: { freq: 50, gain: 3.8 }, low_mid: { freq: 150, gain: 1.4 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Voice Over': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.8 }, low_mid: { freq: 300, gain: 2.8 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 2.2 }, high_shelf: { freq: 8000, gain: 2.2 } },
        compression: { ratio: 1.5, threshold: -20.0, attack: 0.05, release: 0.5 },
        target_lufs: -16.0
      },
      'Journalist': {
        eq_curve: { low_shelf: { freq: 80, gain: 0.6 }, low_mid: { freq: 300, gain: 3.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 2.5 }, high_shelf: { freq: 8000, gain: 2.5 } },
        compression: { ratio: 1.5, threshold: -20.0, attack: 0.05, release: 0.5 },
        target_lufs: -16.0
      },
      'Soul': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.2 }, low_mid: { freq: 300, gain: 2.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.8 }, high_shelf: { freq: 8000, gain: 1.8 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Content Creator': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 2.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'CrysGarage': {
        eq_curve: { low_shelf: { freq: 60, gain: 3.2 }, low_mid: { freq: 200, gain: 2.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      
      // Missing African Genres
      'Shrap': {
        eq_curve: { low_shelf: { freq: 50, gain: 3.8 }, low_mid: { freq: 150, gain: 1.4 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Singeli': {
        eq_curve: { low_shelf: { freq: 50, gain: 4.0 }, low_mid: { freq: 150, gain: 1.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.8 }, high_shelf: { freq: 8000, gain: 0.8 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Urban Benga': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 2.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'New Benga': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 2.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Raï N\'B': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.2 }, low_mid: { freq: 300, gain: 2.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.8 }, high_shelf: { freq: 8000, gain: 1.8 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Raï-hop': {
        eq_curve: { low_shelf: { freq: 60, gain: 3.0 }, low_mid: { freq: 200, gain: 1.5 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 0.8 }, high_shelf: { freq: 8000, gain: 0.8 } },
        compression: { ratio: 2.5, threshold: -16.0, attack: 0.002, release: 0.15 },
        target_lufs: -10.0
      },
      'Gnawa Fusion': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.8 }, low_mid: { freq: 300, gain: 2.2 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.2 }, high_shelf: { freq: 8000, gain: 1.2 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Afrotrap': {
        eq_curve: { low_shelf: { freq: 50, gain: 3.8 }, low_mid: { freq: 150, gain: 1.4 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 3.0, threshold: -14.0, attack: 0.001, release: 0.1 },
        target_lufs: -8.0
      },
      'Afro-Gospel': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 2.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.0 }, high_shelf: { freq: 8000, gain: 1.0 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      },
      'Urban Gospel': {
        eq_curve: { low_shelf: { freq: 80, gain: 1.5 }, low_mid: { freq: 300, gain: 2.0 }, mid: { freq: 1000, gain: 0.0 }, high_mid: { freq: 4000, gain: 1.5 }, high_shelf: { freq: 8000, gain: 1.5 } },
        compression: { ratio: 2.0, threshold: -18.0, attack: 0.01, release: 0.25 },
        target_lufs: -14.0
      }
    };
    
    // Return the preset or a default one
    return presets[genreName] || presets['Pop'];
  };

  // File upload handler
  const handleFileUpload = (file: File) => {
    const audioFile: AudioFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      file,
      url: URL.createObjectURL(file)
    };
    
    setUploadedFile(audioFile);
    setActiveTab('processing');
    setError(null);
    console.log('File uploaded successfully:', audioFile);
  };

  // Genre selection handler
  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);
    console.log('Genre selected:', genre);
    if (!uploadedFile || !originalAudioRef.current) {
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

  // Process audio with Python service
  const handleProcessAudio = async () => {
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

    // Check credits before processing
    try {
      const hasCredits = await creditService.hasEnoughCredits(effectiveUser.id, 1);
      if (!hasCredits) {
        setError('Insufficient credits. Please purchase credits to continue processing.');
        // Show credit exhaustion notification
        creditService.handleCreditExhaustion(() => {
          // Navigate to pricing page
          window.location.href = '/pricing';
        });
        return;
      }
    } catch (creditError) {
      console.error('Error checking credits:', creditError);
      setError('Unable to verify credits. Please try again.');
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

      // Convert format for backend (preserve discrete WAV depth options)
      const backendFormat: 'mp3' | 'wav' | 'wav16' | 'wav24' =
        downloadFormat === 'wav16' ? 'wav16' : downloadFormat === 'wav24' ? 'wav24' : downloadFormat;

      // Process audio with Python service for FINAL output (not preview)
      // Peg all genres at -8 LUFS for final processing as requested
      const levelLufs = -8;
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'pro',
        selectedGenre.name,
        effectiveUser.id,
        backendFormat,
        levelLufs
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

      // Keep remote URL for download, create a CORS-safe playable URL for the player
      setMasteredRemoteUrl(result.url);
      try {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const proxyBase = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio';
        const proxyUrl = `${proxyBase}/proxy-download?file_url=${encodeURIComponent(result.url)}`;
        const res = await fetch(proxyUrl, { method: 'GET' });
        if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        // Revoke previous object URL if any
        if (masteredAudioUrl && masteredAudioUrl.startsWith('blob:')) {
          try { URL.revokeObjectURL(masteredAudioUrl); } catch {}
        }
        setMasteredAudioUrl(objectUrl);
      } catch (e) {
        console.warn('Playable URL proxy failed, falling back to remote URL (may CORS fail):', e);
        setMasteredAudioUrl(result.url);
      }
      // @ts-ignore: backend may include ML fields
      const mlSummary = (result as any).ml_summary;
      // @ts-ignore
      const appliedParams = (result as any).applied_params;
      // Combine stats and ML details in a single update to avoid overwriting
      setMasteredStats({
        loudness: result.lufs || -8,
        // @ts-ignore: backend may include extra fields
        peak: (result as any)?.true_peak_dbfs ?? -1.5,
        // @ts-ignore
        dynamicRange: (result as any)?.dynamic_range ?? 8,
        // @ts-ignore
        frequencyBalance: (result as any)?.frequency_balance ?? 0.5,
        // @ts-ignore
        stereoWidth: (result as any)?.stereo_width ?? 1.0,
        // @ts-ignore
        mlSummary,
        // @ts-ignore
        appliedParams
      });

      // Stop any playing audio when processing completes and moving to download tab
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      }

      setActiveTab('download');
    } catch (error) {
      console.error('Python processing failed:', error);
      setError('Audio processing failed on server');
    } finally {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Download handler - using simple direct download
  const handleDownload = async () => {
    const urlForDownload = masteredRemoteUrl || masteredAudioUrl;
    if (!urlForDownload) return;

    try {
      console.log('🎵 Simple download starting');
      console.log('🎵 DEBUG: urlForDownload:', urlForDownload);
      
      // Use simple direct download like local server
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const baseUrl = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio';
      
      // 🎵 DEBUG: Check if it's a blob URL and handle it properly
      if (urlForDownload.startsWith('blob:')) {
        console.log('🎵 DEBUG: Blob URL detected, using server URL instead');
        // For blob URLs, we need to use the server URL from the processing response
        // This should be the masteredRemoteUrl from the processing result
        const serverUrl = masteredRemoteUrl; // This should be the server URL, not blob
        if (serverUrl && !serverUrl.startsWith('blob:')) {
          const fullFilename = serverUrl.split('/').pop() || 'unknown';
          const downloadUrl = `${baseUrl}/download/${fullFilename}`;
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
          return;
        } else {
          throw new Error('No valid server URL available for download');
        }
      }
      
      // Extract file ID from URL or use simple download URL from response
      let downloadUrl;
      if (urlForDownload.includes('simple_download_url')) {
        downloadUrl = `${baseUrl}${urlForDownload}`;
      } else {
        // Fallback: try to extract file ID from URL
        const fileId = urlForDownload.split('/').pop()?.split('.')[0] || 'unknown';
        // Use the full filename with extension for download
        const fullFilename = urlForDownload.split('/').pop() || 'unknown';
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
      setError('Download failed');
    }
  };

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context initialized for instant effects');
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-crys-dark text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* Back link */}
            <button
              onClick={() => {
                if (activeTab !== 'upload') {
                  setActiveTab('upload');
                } else if (window.history.length > 1) {
                  window.history.back();
                } else {
                  try { (window as any).location = '/'; } catch {}
                }
              }}
              className="flex items-center text-crys-light-grey hover:text-white transition-colors mr-2"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm">Back</span>
            </button>
            <div className="p-3 bg-crys-gold rounded-lg">
              <Zap className="w-8 h-8 text-crys-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-crys-gold">Professional Tier</h1>
              <p className="text-crys-light-grey">47+ Professional Genres • Advanced Mastering</p>
            </div>
          </div>
          
          {tierInfo && (
            <div className="text-right">
              <div className="text-sm text-crys-light-grey">Max File Size</div>
              <div className="text-lg font-semibold text-crys-gold">{tierInfo.max_file_size_mb}MB</div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-crys-graphite p-1 rounded-lg max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-crys-gold text-crys-dark font-semibold'
                : 'text-crys-light-grey hover:text-white'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Upload Audio
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            disabled={!uploadedFile}
            className={`flex-1 py-3 px-4 rounded-md transition-all ${
              activeTab === 'processing'
                ? 'bg-crys-gold text-crys-dark font-semibold'
                : uploadedFile
                ? 'text-crys-light-grey hover:text-white'
                : 'text-crys-graphite cursor-not-allowed'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Select Genre
          </button>
          <button
            onClick={() => setActiveTab('download')}
            disabled={!masteredAudioUrl}
            className={`flex-1 py-3 px-4 rounded-md transition-all ${
              activeTab === 'download'
                ? 'bg-crys-gold text-crys-dark font-semibold'
                : masteredAudioUrl
                ? 'text-crys-light-grey hover:text-white'
                : 'text-crys-graphite cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5 inline mr-2" />
            Download
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        <>
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-crys-graphite rounded-xl p-8 text-center">
                <Upload className="w-16 h-16 text-crys-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Upload Your Audio</h2>
                <p className="text-crys-light-grey mb-6">
                  Upload your audio file to start professional mastering with 47+ genre presets
                </p>
                
                <div className="border-2 border-dashed border-crys-gold/30 rounded-lg p-8 hover:border-crys-gold/60 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-crys-gold mb-2">
                      <Upload className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-crys-light-grey">
                      Supports WAV, MP3, FLAC, AIFF up to {tierInfo?.max_file_size_mb || 200}MB
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
                    <p className="text-crys-light-grey text-sm">{formatFileSize(uploadedFile.processedSize || uploadedFile.size)}</p>
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
                Select Genre (47+ Professional Options)
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
              {isLoadingGenres ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-crys-gold" />
                  <span className="ml-2">Loading genres...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-w-5xl mx-auto">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre)}
                      className={`p-3 rounded-lg text-left transition-all hover:scale-105 focus:outline-none ${
                        selectedGenre?.id === genre.id
                          ? 'ring-2 ring-crys-gold ring-offset-2 ring-offset-crys-graphite'
                          : ''
                      } ${genre.color} text-white`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="font-semibold text-sm">{genre.name}</span>
                      </div>
                      <p className="text-xs opacity-90">{genre.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Process Button - Centered Below Genres */}
            {selectedGenre && (
              <div className="text-center">
                <button
                  onClick={handleProcessAudio}
                  disabled={isProcessing}
                  className="bg-crys-gold text-crys-dark py-4 px-8 rounded-lg font-semibold hover:bg-crys-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Master Audio
                    </>
                  )}
                </button>
                
                {isProcessing && (
                  <div className="mt-6 max-w-2xl mx-auto">
                    <div className="w-full bg-crys-dark rounded-full h-3">
                      <div 
                        className="bg-crys-gold h-3 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
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
        )}

        {/* Download/Comparison Tab */}
        {activeTab === 'download' && masteredAudioUrl && (
          <div className="max-w-4xl mx-auto">
            <ComparisonPlayerFixed
              originalFile={uploadedFile}
              masteredAudioUrl={masteredAudioUrl}
              selectedGenre={selectedGenre}
              mlSummary={(masteredStats as any)?.mlSummary}
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
              downloadFormat={downloadFormat}
              onFormatChange={(f) => setDownloadFormat(f)}
              tier={effectiveUser.tier}
            />
          </div>
        )}
        
        {/* (single hidden audio declared above next to player) */}
        </>
      </div>

      
    </div>
  );
};

export default ProfessionalTierDashboard;
