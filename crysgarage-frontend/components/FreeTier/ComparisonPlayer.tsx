import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface ComparisonPlayerProps {
  originalFile: AudioFile | null;
  masteredAudioUrl: string | null;
  selectedGenre: Genre | null;
  onBack: () => void;
  onNewUpload: () => void;
  onDownload: (format?: string, sampleRate?: number) => Promise<void>;
  // Optional ML info
  mlSummary?: Array<{ area: string; action: string; reason?: string }>;
  appliedParams?: Record<string, any>;
  originalLufs?: number;
  masteredLufs?: number;
  recommendedAttenuationDb?: number;
  // Professional tier options
  showFormatOptions?: boolean;
}

const ComparisonPlayer: React.FC<ComparisonPlayerProps> = ({
  originalFile,
  masteredAudioUrl,
  selectedGenre,
  onBack,
  onNewUpload,
  onDownload,
  mlSummary = [],
  appliedParams,
  originalLufs,
  masteredLufs,
  recommendedAttenuationDb,
  showFormatOptions = false
}) => {
  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const masteredAudioRef = useRef<HTMLAudioElement>(null);
  
  // Playback states
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalMuted, setOriginalMuted] = useState(false);
  const [masteredMuted, setMasteredMuted] = useState(false);
  
  // Progress states
  const [originalProgress, setOriginalProgress] = useState(0);
  const [masteredProgress, setMasteredProgress] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [masteredDuration, setMasteredDuration] = useState(0);
  
  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Format and sample rate options (for professional tier)
  const [selectedFormat, setSelectedFormat] = useState('WAV');
  const [selectedSampleRate, setSelectedSampleRate] = useState(44100);


  // Level matching: apply base gain to mastered playback so A/B is fair
  const [masteredBaseGain, setMasteredBaseGain] = useState(1);

  // Single-transport A/B switching
  const [activeSource, setActiveSource] = useState<'original' | 'mastered'>('original');
  const isPlaying = activeSource === 'original' ? isPlayingOriginal : isPlayingMastered;

  const activeRef = activeSource === 'original' ? originalAudioRef : masteredAudioRef;
  const inactiveRef = activeSource === 'original' ? masteredAudioRef : originalAudioRef;

  const activeProgress = activeSource === 'original' ? originalProgress : masteredProgress;
  const activeDuration = activeSource === 'original' ? originalDuration : masteredDuration;

  // Looping around highest peak (24s window)
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isSwitchSeekingRef = useRef<boolean>(false);
  // Disable peak-looping per request: always play from the beginning
  const enablePeakLoop = false;

  // Analyze original audio buffer to find highest peak and compute loop window
  useEffect(() => {
    if (!enablePeakLoop) { setLoopStart(null); setLoopEnd(null); return; }
    let cancelled = false;
    const analyze = async () => {
      try {
        if (!originalFile?.url) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const resp = await fetch(originalFile.url);
        const buf = await resp.arrayBuffer();
        const audioBuffer = await audioCtxRef.current.decodeAudioData(buf);
        let maxVal = 0;
        let maxIndex = 0;
        const length = audioBuffer.length;
        const channels = audioBuffer.numberOfChannels;
        for (let ch = 0; ch < channels; ch++) {
          const data = audioBuffer.getChannelData(ch);
          for (let i = 0; i < length; i++) {
            const v = Math.abs(data[i]);
            if (v > maxVal) {
              maxVal = v;
              maxIndex = i;
            }
          }
        }
        const sr = audioBuffer.sampleRate;
        const peakTime = maxIndex / sr;
        const duration = audioBuffer.duration;
        const start = Math.max(0, peakTime - 12);
        const end = Math.min(duration, start + 24);
        if (!cancelled) {
          setLoopStart(start);
          setLoopEnd(end);
        }
      } catch {}
    };
    analyze();
    return () => { cancelled = true; };
  }, [originalFile?.url]);

  // Enforce loop on timeupdate for both elements
  useEffect(() => {
    const applyLoopHandler = (el: HTMLAudioElement | null) => {
      if (!el) return () => {};
      const onTime = () => {
        if (isSwitchSeekingRef.current) return;
        if (enablePeakLoop && loopStart != null && loopEnd != null) {
          if (el.currentTime < loopStart && !el.paused) {
            try { el.currentTime = loopStart; } catch {}
          } else if (el.currentTime >= loopEnd && !el.paused) {
            try { el.currentTime = loopStart; el.play(); } catch {}
          }
        }
      };
      el.addEventListener('timeupdate', onTime);
      return () => { el.removeEventListener('timeupdate', onTime); };
    };
    const off1 = applyLoopHandler(originalAudioRef.current);
    const off2 = applyLoopHandler(masteredAudioRef.current);
    return () => { off1 && off1(); off2 && off2(); };
  }, [loopStart, loopEnd, originalAudioRef.current, masteredAudioRef.current]);

  useEffect(() => {
    // Prefer backend recommendation; else derive from LUFS if available
    let attenuationDb = 0;
    if (typeof recommendedAttenuationDb === 'number') {
      attenuationDb = Math.max(0, recommendedAttenuationDb);
    } else if (typeof masteredLufs === 'number' && typeof originalLufs === 'number') {
      attenuationDb = Math.max(0, masteredLufs - originalLufs);
    } else {
      attenuationDb = 0;
    }
    const gain = Math.pow(10, -attenuationDb / 20);
    setMasteredBaseGain(gain);
  }, [recommendedAttenuationDb, originalLufs, masteredLufs]);

  // Sync element properties that are not valid JSX attributes
  useEffect(() => {
    if (originalAudioRef.current) {
      try { originalAudioRef.current.volume = originalMuted ? 0 : 1; } catch {}
      try { originalAudioRef.current.muted = originalMuted; } catch {}
    }
  }, [originalMuted]);

  useEffect(() => {
    if (masteredAudioRef.current) {
      try { masteredAudioRef.current.volume = (masteredMuted ? 0 : 1) * masteredBaseGain; } catch {}
      try { masteredAudioRef.current.muted = masteredMuted; } catch {}
    }
  }, [masteredMuted, masteredBaseGain]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Handle original audio play/pause
  const handleOriginalPlayPause = () => {
    if (!originalAudioRef.current) return;
    
    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      // Pause mastered if playing
      if (isPlayingMastered && masteredAudioRef.current) {
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
      }
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  // Handle mastered audio play/pause
  const handleMasteredPlayPause = () => {
    if (!masteredAudioRef.current) return;
    
    if (isPlayingMastered) {
      masteredAudioRef.current.pause();
      setIsPlayingMastered(false);
    } else {
      // Pause original if playing
      if (isPlayingOriginal && originalAudioRef.current) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      }
      masteredAudioRef.current.play();
      setIsPlayingMastered(true);
    }
  };

  // Central transport: play/pause active
  const handlePlayPause = () => {
    const audio = activeRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      if (activeSource === 'original') setIsPlayingOriginal(false); else setIsPlayingMastered(false);
    } else {
      // ensure inactive is paused
      if (inactiveRef.current) {
        try { inactiveRef.current.pause(); } catch {}
      }
      audio.play();
      if (activeSource === 'original') setIsPlayingOriginal(true); else setIsPlayingMastered(true);
    }
  };

  // Switch A/B while maintaining playhead and play state
  const handleSwitchSource = (next: 'original' | 'mastered') => {
    if (next === activeSource) return;
    const fromRef = activeRef.current;
    const toRef = inactiveRef.current;
    if (!toRef) {
      setActiveSource(next);
      return;
    }
    const wasPlaying = isPlaying;
    const currentTime = fromRef ? fromRef.currentTime : 0;
    try { if (fromRef) fromRef.pause(); } catch {}

    const startTarget = async () => {
      isSwitchSeekingRef.current = true;
      const seekTo = Math.max(0, Math.min(currentTime, toRef.duration || currentTime));
      try {
        if ('fastSeek' in toRef && typeof (toRef as any).fastSeek === 'function') {
          (toRef as any).fastSeek(seekTo);
        } else {
          toRef.currentTime = seekTo;
        }
      } catch {}

      // Wait for 'seeked' to ensure position is applied before play
      await new Promise<void>((resolve) => {
        let settled = false;
        const onSeeked = () => {
          if (settled) return;
          settled = true;
          toRef.removeEventListener('seeked', onSeeked);
          resolve();
        };
        toRef.addEventListener('seeked', onSeeked, { once: true });
        // Fallback timeout in case 'seeked' fires too early or not at all
        setTimeout(() => {
          if (settled) return;
          settled = true;
          toRef.removeEventListener('seeked', onSeeked);
          resolve();
        }, 150);
      });

      setActiveSource(next);
      if (wasPlaying) {
        try { await toRef.play(); } catch {}
        if (next === 'original') { setIsPlayingOriginal(true); setIsPlayingMastered(false); }
        else { setIsPlayingMastered(true); setIsPlayingOriginal(false); }
      } else {
        if (next === 'original') { setIsPlayingOriginal(false); setIsPlayingMastered(false); }
        else { setIsPlayingMastered(false); setIsPlayingOriginal(false); }
      }
      // Slight delay to avoid loop enforcement during seek/play race
      setTimeout(() => { isSwitchSeekingRef.current = false; }, 150);
    };

    // If metadata not loaded yet, wait until we can safely seek
    if (toRef.readyState >= 2) { // HAVE_CURRENT_DATA or more
      startTarget();
    } else {
      const onCanPlay = () => {
        toRef.removeEventListener('canplay', onCanPlay);
        startTarget();
      };
      toRef.addEventListener('canplay', onCanPlay, { once: true });
    }
  };

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (showFormatOptions) {
        await onDownload(selectedFormat, selectedSampleRate);
      } else {
        await onDownload();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Update progress for original audio
  useEffect(() => {
    const audio = originalAudioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setOriginalProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setOriginalDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlayingOriginal(false);
      setOriginalProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update progress for mastered audio
  useEffect(() => {
    const audio = masteredAudioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setMasteredProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setMasteredDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlayingMastered(false);
      setMasteredProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [masteredAudioUrl]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Audio Comparison</h1>
        <p className="text-gray-400">Compare your original audio with the Crysgarage Mastering Engine version</p>
        {selectedGenre && (
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-500/30 rounded-lg px-4 py-2">
            <span className="text-sm text-amber-400 font-medium">
              Genre: <span className="text-white">{selectedGenre.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Unified Transport + A/B Switch */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex bg-gray-700 rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${activeSource==='original' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              onClick={() => handleSwitchSource('original')}
              disabled={!originalFile}
            >Original</button>
            <button
              className={`px-4 py-2 text-sm ${activeSource==='mastered' ? 'bg-amber-500 text-black' : 'text-gray-300 hover:bg-gray-600'}`}
              onClick={() => handleSwitchSource('mastered')}
              disabled={!masteredAudioUrl}
            >Mastered</button>
          </div>
          <button
            onClick={handlePlayPause}
            className={`rounded-full p-4 ${activeSource==='original' ? 'bg-gray-900 text-white' : 'bg-amber-500 text-black'}`}
            disabled={(activeSource==='original' && !originalFile) || (activeSource==='mastered' && !masteredAudioUrl)}
          >{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}</button>
        </div>
        {/* Unified Progress */}
        <div className="space-y-2">
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className={`${activeSource==='original' ? 'bg-gray-900' : 'bg-amber-500'} h-2 rounded-full transition-all duration-100`}
              style={{ width: `${activeDuration ? (activeProgress / activeDuration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(activeProgress)}</span>
            <span>{formatTime(activeDuration)}</span>
          </div>
        </div>
      </div>

      {/* Audio Players - keep for metadata and volume; hide per-player transports */}
      <div className="grid grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              Original Audio
            </h3>
            <div className="text-sm text-gray-400">
              {originalFile ? formatFileSize(originalFile.size) : 'N/A'}
            </div>
          </div>

          {/* Audio Element */}
          {originalFile && (
            <audio
              ref={originalAudioRef}
              src={originalFile.url}
              preload="auto"
            />
          )}

          {/* Playback Controls (hidden; controlled by unified transport) */}
          <div className="space-y-4 hidden">

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gray-900 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${originalDuration ? (originalProgress / originalDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(originalProgress)}</span>
                <span>{formatTime(originalDuration)}</span>
              </div>
            </div>

          </div>

          {/* File Info */}
          {originalFile && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="text-sm text-gray-400 space-y-1">
                <div>File: {originalFile.name}</div>
                <div>Size: {formatFileSize(originalFile.size)}</div>
                <div>Status: Unprocessed</div>
              </div>
              {/* Original analysis */}
              <div className="mt-3 text-xs text-gray-400">
                <div>Estimated LUFS: {typeof originalLufs === 'number' ? Math.round(originalLufs) : '—'}</div>
                <div>Limiter: Not applied in preview</div>
                <div>Notes: Instant preview (EQ/Comp only)</div>
              </div>
            </div>
          )}
        </div>

        {/* Mastered Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              Mastered Audio
            </h3>
            <div className="text-sm text-amber-400 font-medium">
              Crysgarage Mastering Engine
            </div>
          </div>

          {/* Audio Element */}
          {masteredAudioUrl && (
            <audio
              ref={masteredAudioRef}
              src={masteredAudioUrl}
              preload="auto"
            />
          )}

          {/* Playback Controls (hidden; controlled by unified transport) */}
          <div className="space-y-4 hidden">

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${masteredDuration ? (masteredProgress / masteredDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(masteredProgress)}</span>
                <span>{formatTime(masteredDuration)}</span>
              </div>
            </div>

          </div>

          {/* File Info */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 space-y-1">
              <div>Genre: {selectedGenre?.name || 'None'}</div>
              <div>Processing: Crysgarage Mastering Engine</div>
              <div>Status: Ready for Download</div>
            </div>
            {/* Mastered analysis */}
            <div className="mt-3 text-xs text-gray-400">
              <div>Achieved LUFS: {typeof masteredLufs === 'number' ? Math.round(masteredLufs) : ((appliedParams as any)?.target_lufs ?? '—')}</div>
              <div>Target LUFS: {(appliedParams as any)?.target_lufs ?? '—'}</div>
              <div>Limiter: Brickwall applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Tips */}
      <div className="bg-gradient-to-r from-gray-800/50 to-amber-500/10 border border-amber-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Comparison Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-300">Original Audio</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Raw, unprocessed sound</li>
              <li>• Natural dynamics</li>
              <li>• Original frequency response</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-amber-400">Mastered Audio</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Mastered by Crysgarage Mastering Engine with {selectedGenre?.name} preset</li>
              <li>• Optimized loudness and clarity</li>
              <li>• Professional-grade processing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* What ML changed */}
      {(mlSummary?.length || appliedParams) && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">What ML changed</h3>
          {mlSummary?.length ? (
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {mlSummary.map((item, idx) => (
                <li key={idx}>
                  <span className="text-white">{item.area}:</span> {item.action}
                  {item.reason ? <span className="text-gray-400"> — {item.reason}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {appliedParams ? (
            <div className="mt-3 text-xs text-gray-400">
              <div>Target LUFS: {appliedParams.target_lufs ?? '—'}</div>
              <div>Format: {appliedParams.target_format ?? '—'}</div>
              <div>Sample rate: {appliedParams.target_sample_rate ?? '—'}</div>
            </div>
          ) : null}
        </div>
      )}

      {/* Format and Sample Rate Options (Professional Tier) */}
      {showFormatOptions && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-amber-500/20 space-y-4">
          <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Download Options
          </h3>
          
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {['WAV', 'MP3'].map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFormat === format
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-amber-500/20'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sample Rate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sample Rate</label>
            <div className="grid grid-cols-2 gap-2">
              {[44100, 48000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSelectedSampleRate(rate)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedSampleRate === rate
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-amber-500/20'
                  }`}
                >
                  {rate / 1000}kHz
                </button>
              ))}
            </div>
          </div>
          
          {/* Selected Options Display */}
          <div className="text-center text-sm text-amber-400 font-medium">
            Selected: {selectedFormat} • {selectedSampleRate / 1000}kHz
          </div>
        </div>
      )}

      {/* Download Section */}
      <div className="text-center space-y-4">
        <button
          onClick={handleDownload}
          disabled={!masteredAudioUrl || isDownloading}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 mx-auto text-lg shadow-lg hover:shadow-amber-500/25"
        >
          <Play className="w-6 h-6" />
          {isDownloading 
            ? 'Preparing Download...' 
            : showFormatOptions 
              ? `Download ${selectedFormat} (${selectedSampleRate / 1000}kHz)` 
              : 'Download Mastered Audio - $2.99'
          }
        </button>
        
        <p className="text-sm text-amber-400">
          Download your mastered audio (Crysgarage Mastering Engine) with the {selectedGenre?.name} preset applied
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Back to Processing
        </button>
        
        <button
          onClick={onNewUpload}
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          Start New Master
        </button>
      </div>
    </div>
  );
};

export default ComparisonPlayer;
