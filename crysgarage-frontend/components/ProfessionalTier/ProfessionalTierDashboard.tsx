import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Download, Activity, Music, ArrowLeft, CreditCard, DollarSign, Loader2, Settings, Zap, Volume2, VolumeX } from 'lucide-react';
import DownloadStep from './DownloadStep';
import FreeComparisonPlayer from '../FreeTier/ComparisonPlayer';
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
  const [processingProgress, setProcessingProgress] = useState(0);
  const [originalStats, setOriginalStats] = useState<AudioStats | null>(null);
  const [masteredStats, setMasteredStats] = useState<AudioStats | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
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
  // Volume control: enable/disable and discrete LUFS selection for preview/mastering
  const [volumeEnabled, setVolumeEnabled] = useState<boolean>(true);
  const [selectedLufs, setSelectedLufs] = useState<-14 | -12 | -10 | -9 | -8>(-8);
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
  }>({ source: null, outputGain: null, lowShelf: null, midPeaking: null, highShelf: null, compressor: null, limiter: null });
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

  // Build or rebuild preview chain
  const buildPreviewChain = () => {
    if (!audioContextRef.current || !originalAudioRef.current) return false;
    const ctx = audioContextRef.current;

    // Reuse existing MediaElementSourceNode if it was already created for this element.
    let { source } = originalChainRef.current;
    if (!source) {
      // Create once per HTMLMediaElement lifetime; cannot create twice.
      source = ctx.createMediaElementSource(originalAudioRef.current);
    } else {
      try { (source as any).disconnect && (source as any).disconnect(); } catch {}
    }

    // (Re)create downstream nodes
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    const midPeaking = ctx.createBiquadFilter();
    midPeaking.type = 'peaking';
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
    const outputGain = ctx.createGain();
    outputGain.gain.value = 1.0;

    // source -> EQ3 -> compressor -> limiter -> outputGain -> destination
    source.connect(lowShelf);
    lowShelf.connect(midPeaking);
    midPeaking.connect(highShelf);
    highShelf.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(outputGain);
    outputGain.connect(ctx.destination);

    originalChainRef.current = { source, outputGain, lowShelf, midPeaking, highShelf, compressor, limiter };
    return true;
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
      const { outputGain, lowShelf, midPeaking, highShelf, compressor, limiter } = originalChainRef.current;
      
      // Get genre preset (prefer cached map for instant response)
      let preset: any = genreInfoMap ? genreInfoMap[genre.name] : undefined;
      if (!preset) {
        try {
          const genreInfo = await pythonAudioService.getGenreInformation();
          preset = genreInfo[genre.name];
        } catch {}
      }
      
      if (preset) {
        const currentTime = audioContextRef.current.currentTime;
        // More pronounced EQ: map preset shelves and mid, with a slight exaggeration for audibility
        const exaggerate = 1.2;
        lowShelf.frequency.setValueAtTime(preset.eq_curve.low_shelf.freq, currentTime);
        lowShelf.gain.setValueAtTime(preset.eq_curve.low_shelf.gain * exaggerate, currentTime);
        highShelf.frequency.setValueAtTime(preset.eq_curve.high_shelf.freq, currentTime);
        highShelf.gain.setValueAtTime(preset.eq_curve.high_shelf.gain * exaggerate, currentTime);
        midPeaking.frequency.setValueAtTime(preset.eq_curve.mid.freq, currentTime);
        midPeaking.Q.setValueAtTime(1.0, currentTime);
        midPeaking.gain.setValueAtTime(preset.eq_curve.mid.gain * exaggerate, currentTime);

        // Compression: slightly stronger for audibility
        const thr = preset.compression.threshold - 3; // push a bit harder
        const ratio = Math.min(preset.compression.ratio * 1.2, 8);
        compressor.threshold.setValueAtTime(thr, currentTime);
        compressor.knee.setValueAtTime(20, currentTime);
        compressor.ratio.setValueAtTime(ratio, currentTime);
        compressor.attack.setValueAtTime(Math.max(0.001, preset.compression.attack), currentTime);
        compressor.release.setValueAtTime(preset.compression.release, currentTime);

        // Output gain target relative to LUFS target; keep within safe range
        // Map loudness level to preview gain tilt (~-12/-10/-8 reference)
        // Compute base gain from chosen LUFS (or stay close to preset when disabled)
        const chosenLufs = volumeEnabled ? selectedLufs : preset.target_lufs;
        let baseGain = Math.min(2.0, Math.max(0.4, Math.pow(10, (chosenLufs + 14) / 20)));
        const targetGain = Math.min(2.2, Math.max(0.3, baseGain));
        basePreviewGainRef.current = baseGain;
        try { outputGain.gain.cancelScheduledValues(currentTime); } catch {}
        outputGain.gain.setTargetAtTime(targetGain, currentTime, 0.01);
        
        console.log(`Applied ${genre.name} effects:`, {
          eqFreq: preset.eq_curve.mid.freq,
          eqGain: preset.eq_curve.mid.gain,
          compressionRatio: ratio,
          targetGain: targetGain
        });
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
    loadTierInformation();
  }, []);

  const loadTierInformation = async () => {
    try {
      setIsLoadingGenres(true);
      
      // Get tier information from Python service
      const tierData = await pythonAudioService.getTierInformation();
      const proTierInfo = tierData.pro || tierData.professional;
      setTierInfo(proTierInfo);

      // Import all professional genres (48 total: 24 African + 24 Advanced)
      const { getAllGenresForUI } = await import('../ProfessionalDashboard/genres');
      const genres: Genre[] = getAllGenresForUI();
      
      setAvailableGenres(genres);
      console.log('Loaded professional tier genres:', genres);
      
    } catch (error) {
      console.error('Failed to load tier information:', error);
      setError('Failed to load tier information');
      
      // Fallback genres with rainbow colors
      setAvailableGenres([
        { id: 'hip-hop', name: 'Hip-Hop', color: 'bg-red-500', description: 'Bass-Driven & Punchy' },
        { id: 'afrobeats', name: 'Afrobeats', color: 'bg-orange-500', description: 'Rhythmic & Energetic' }
      ]);
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
    
    // Apply instant effects for preview
    if (uploadedFile && originalAudioRef.current) {
      console.log('Applying instant effects for genre:', genre.name);
      await applyInstantGenreEffects(genre);
    } else {
      console.log('No uploaded file or audio element available for preview');
    }
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

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      console.log('Starting FINAL processing with Python service...');
      console.log('Selected genre:', selectedGenre.name);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Convert format for backend (preserve discrete WAV depth options)
      const backendFormat: 'mp3' | 'wav' | 'wav16' | 'wav24' =
        downloadFormat === 'wav16' ? 'wav16' : downloadFormat === 'wav24' ? 'wav24' : downloadFormat;

      // Process audio with Python service for FINAL output (not preview)
      const levelLufs = volumeEnabled ? selectedLufs : -8;
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'pro',
        selectedGenre.name,
        effectiveUser.id,
        backendFormat,
        levelLufs
      );

      clearInterval(progressInterval);
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

      setActiveTab('download');
    } catch (error) {
      console.error('Python processing failed:', error);
      setError('Audio processing failed on server');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!masteredAudioUrl) return;
    
    try {
      // Use Python proxy to bypass CORS regardless of storage origin
      const base = (pythonAudioService as any).baseURL || '';
      const proxyUrl = `${base || ''}/proxy-download?file_url=${encodeURIComponent(masteredAudioUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uploadedFile?.name.replace(/\.[^/.]+$/, '')}_mastered_${selectedGenre?.name.toLowerCase()}.${downloadFormat === 'mp3' ? 'mp3' : 'wav'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed');
    }
  };


  return (
    <div className="min-h-screen bg-crys-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
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
        <div className="flex space-x-1 mb-8 bg-crys-graphite p-1 rounded-lg">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Audio Player */}
            <div className="bg-crys-graphite rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Music className="w-5 h-5 mr-2 text-crys-gold" />
                Original Audio
              </h3>
              
              <div className="mb-4">
                <audio
                  ref={originalAudioRef}
                  src={uploadedFile.url}
                  preload="metadata"
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleOriginalPlayPause}
                      className="bg-crys-gold text-crys-dark p-4 rounded-full hover:bg-crys-gold/90 transition-colors"
                    >
                      {isPlayingOriginal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-crys-dark rounded-full h-2">
                      <div
                        className="bg-crys-gold h-2 rounded-full transition-all duration-100"
                        style={{ width: `${originalDuration ? (originalProgress / originalDuration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-crys-light-grey">
                      <span>{formatTime(originalProgress)}</span>
                      <span>{formatTime(originalDuration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOriginalMuted(!originalMuted)}
                      className="text-crys-light-grey hover:text-white transition-colors"
                    >
                      {originalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={originalMuted ? 0 : originalVolume}
                      onChange={(e) => { setOriginalVolume(parseFloat(e.target.value)); setOriginalMuted(false); }}
                      className="flex-1"
                    />
                    <span className="text-sm text-crys-light-grey w-10 text-right">{Math.round((originalMuted ? 0 : originalVolume) * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-crys-light-grey">
                <p><strong>File:</strong> {uploadedFile.name}</p>
                <p><strong>Size:</strong> {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {/* Genre Selection */}
            <div className="bg-crys-graphite rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-crys-gold" />
                Select Genre (24+ Professional Options)
                {isApplyingEffects && (
                  <div className="ml-2 flex items-center text-sm text-crys-gold">
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Applying effects...
                  </div>
                )}
              </h3>
              
              {/* Instructions + Volume on/off + discrete LUFS */}
              <div className="mb-4 p-3 bg-crys-dark rounded-lg flex items-center justify-between gap-4">
                <p className="text-sm text-crys-light-grey m-0">
                  💡 <strong>Real-time Preview:</strong> Click any genre to hear instant effects. Make sure your audio is playing.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-crys-light-grey">Volume</span>
                    <div
                      onClick={() => { setVolumeEnabled(!volumeEnabled); selectedGenre && applyInstantGenreEffects(selectedGenre); }}
                      className={`w-10 h-5 rounded-full ${volumeEnabled ? 'bg-crys-gold' : 'bg-crys-graphite'} relative`}
                    >
                      <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all ${volumeEnabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </label>
                  <div className="flex items-center gap-1">
                    {([-14,-12,-10,-9,-8] as const).map(lufs => (
                      <button
                        key={lufs}
                        onClick={() => { setSelectedLufs(lufs); selectedGenre && applyInstantGenreEffects(selectedGenre); }}
                        disabled={!volumeEnabled || !selectedGenre}
                        className={`px-2 py-1 rounded ${selectedLufs===lufs && volumeEnabled ? 'bg-crys-gold text-crys-dark' : 'text-crys-light-grey hover:text-white'}`}
                      >{lufs}</button>
                    ))}
                    <span className="text-xs text-crys-gold ml-2">{selectedLufs} LUFS</span>
                  </div>
                </div>
              </div>

              {/* Genre Grid - All genres displayed without scrolling */}
              {isLoadingGenres ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-crys-gold" />
                  <span className="ml-2">Loading genres...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
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

              {/* Process Button */}
              {selectedGenre && (
                <div className="mt-6">
                  <button
                    onClick={handleProcessAudio}
                    disabled={isProcessing}
                    className="w-full bg-crys-gold text-crys-dark py-3 px-6 rounded-lg font-semibold hover:bg-crys-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                    <div className="mt-4">
                      <div className="w-full bg-crys-dark rounded-full h-2">
                        <div 
                          className="bg-crys-gold h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                      <p className="text-crys-light-grey text-sm mt-2">
                        {Math.round(processingProgress)}% complete
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Download/Comparison Tab */}
        {activeTab === 'download' && masteredAudioUrl && (
          <FreeComparisonPlayer
            originalFile={uploadedFile}
            masteredAudioUrl={masteredAudioUrl}
            selectedGenre={selectedGenre}
            // optional ML
            mlSummary={(masteredStats as any)?.mlSummary}
            appliedParams={(masteredStats as any)?.appliedParams}
            originalLufs={originalStats?.loudness}
            masteredLufs={(masteredStats as any)?.loudness}
            recommendedAttenuationDb={(masteredStats as any)?.recommended_playback_attenuation_db}
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

export default ProfessionalTierDashboard;
