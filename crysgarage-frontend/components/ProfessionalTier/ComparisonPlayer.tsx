import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, ArrowLeft, RotateCcw, Activity, Zap, BarChart3 } from 'lucide-react';
import DownloadStep from './DownloadStep';

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
  mlSummary?: any;
  appliedParams?: any;
  originalLufs?: number;
  masteredLufs?: number;
  onBack: () => void;
  onNewUpload: () => void;
  onDownload: () => void;
  downloadFormat: 'mp3' | 'wav16' | 'wav24';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24') => void;
  tier: string;
}

const ComparisonPlayer: React.FC<ComparisonPlayerProps> = ({
  originalFile,
  masteredAudioUrl,
  selectedGenre,
  mlSummary,
  appliedParams,
  originalLufs,
  masteredLufs,
  onBack,
  onNewUpload,
  onDownload,
  downloadFormat,
  onFormatChange,
  tier
}) => {
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [currentTimeOriginal, setCurrentTimeOriginal] = useState(0);
  const [currentTimeMastered, setCurrentTimeMastered] = useState(0);
  const [durationOriginal, setDurationOriginal] = useState(0);
  const [durationMastered, setDurationMastered] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // A/B switching state
  const [activeSource, setActiveSource] = useState<'original' | 'mastered'>('original');
  const isSwitchSeekingRef = useRef<boolean>(false);

  // Preload and prime mastered audio on mount
  useEffect(() => {
    // Force both elements audible (avoid hidden mute propagation)
    if (originalAudioRef.current) {
      try { originalAudioRef.current.muted = false; } catch {}
      try { originalAudioRef.current.volume = 1; } catch {}
    }
    if (masteredAudioRef.current) {
      try { masteredAudioRef.current.muted = false; } catch {}
      try { masteredAudioRef.current.volume = 1; } catch {}
    }

    if (masteredAudioUrl && masteredAudioRef.current) {
      const audio = masteredAudioRef.current;
      // Preload the audio
      audio.preload = 'auto';
      audio.load();
      
      // Prime the audio element with a brief play/pause to ensure it's ready
      const primeAudio = async () => {
        try {
          audio.currentTime = 0;
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        } catch (error) {
          // Ignore autoplay errors, the element is still primed
        }
      };
      
      if (audio.readyState >= 2) {
        primeAudio();
      } else {
        audio.addEventListener('canplay', primeAudio, { once: true });
      }
    }
  }, [masteredAudioUrl]);

  // Attempt resilient playback start on target element
  const ensurePlay = async (el: HTMLAudioElement | null) => {
    if (!el) return;
    try { 
      await el.play(); 
      return; 
    } catch {}
    
    const onCanPlay = async () => {
      el.removeEventListener('canplay', onCanPlay);
      try { 
        await el.play(); 
      } catch {}
    };
    el.addEventListener('canplay', onCanPlay, { once: true });
  };

  // Switch A/B while maintaining playhead and play state (resilient, avoids stopping)
  const handleSwitchSource = (next: 'original' | 'mastered') => {
    if (next === activeSource) return;
    
    const fromRef = activeSource === 'original' ? originalAudioRef.current : masteredAudioRef.current;
    const toRef = next === 'original' ? originalAudioRef.current : masteredAudioRef.current;
    
    if (!toRef) {
      setActiveSource(next);
      return;
    }
    
    const wasPlaying = activeSource === 'original' ? isPlayingOriginal : isPlayingMastered;
    const currentTime = fromRef ? fromRef.currentTime : 0;

    const startTarget = async () => {
      isSwitchSeekingRef.current = true;
      const seekTo = Math.max(0, Math.min(currentTime, toRef.duration || currentTime));
      
      // Proactively begin playback to avoid "stopped" perception while seeking
      if (wasPlaying) {
        await ensurePlay(toRef);
      }
      
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
        try {
          await toRef.play();
        } catch {}
        // Only pause the previous source after the target is playing to avoid gaps
        try { if (fromRef) fromRef.pause(); } catch {}
        if (next === 'original') { 
          setIsPlayingOriginal(true); 
          setIsPlayingMastered(false); 
        } else { 
          setIsPlayingMastered(true); 
          setIsPlayingOriginal(false); 
        }
      } else {
        if (next === 'original') { 
          setIsPlayingOriginal(false); 
          setIsPlayingMastered(false); 
        } else { 
          setIsPlayingMastered(false); 
          setIsPlayingOriginal(false); 
        }
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

  // Audio event handlers
  useEffect(() => {
    const originalAudio = originalAudioRef.current;
    const masteredAudio = masteredAudioRef.current;

    if (originalAudio) {
      const handleTimeUpdate = () => setCurrentTimeOriginal(originalAudio.currentTime);
      const handleLoadedMetadata = () => setDurationOriginal(originalAudio.duration);
      const handleEnded = () => setIsPlayingOriginal(false);

      originalAudio.addEventListener('timeupdate', handleTimeUpdate);
      originalAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      originalAudio.addEventListener('ended', handleEnded);

      return () => {
        originalAudio.removeEventListener('timeupdate', handleTimeUpdate);
        originalAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        originalAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  useEffect(() => {
    const masteredAudio = masteredAudioRef.current;

    if (masteredAudio) {
      const handleTimeUpdate = () => setCurrentTimeMastered(masteredAudio.currentTime);
      const handleLoadedMetadata = () => setDurationMastered(masteredAudio.duration);
      const handleEnded = () => setIsPlayingMastered(false);

      masteredAudio.addEventListener('timeupdate', handleTimeUpdate);
      masteredAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
      masteredAudio.addEventListener('ended', handleEnded);

      return () => {
        masteredAudio.removeEventListener('timeupdate', handleTimeUpdate);
        masteredAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        masteredAudio.removeEventListener('ended', handleEnded);
      };
    }
  }, [masteredAudioUrl]);

  // Central transport: play/pause active source
  const handlePlayPause = () => {
    const audio = activeSource === 'original' ? originalAudioRef.current : masteredAudioRef.current;
    if (!audio) return;
    
    if (activeSource === 'original' ? isPlayingOriginal : isPlayingMastered) {
      audio.pause();
      if (activeSource === 'original') setIsPlayingOriginal(false); 
      else setIsPlayingMastered(false);
    } else {
      // ensure inactive is paused
      const inactiveAudio = activeSource === 'original' ? masteredAudioRef.current : originalAudioRef.current;
      if (inactiveAudio) {
        try { inactiveAudio.pause(); } catch {}
      }
      audio.play();
      if (activeSource === 'original') setIsPlayingOriginal(true); 
      else setIsPlayingMastered(true);
    }
  };

  const togglePlayOriginal = () => {
    handleSwitchSource('original');
    if (!isPlayingOriginal) {
      handlePlayPause();
    }
  };

  const togglePlayMastered = () => {
    handleSwitchSource('mastered');
    if (!isPlayingMastered) {
      handlePlayPause();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 bg-crys-graphite rounded-lg hover:bg-crys-graphite/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-crys-gold">Mastering Results</h2>
            <p className="text-crys-light-grey">
              {selectedGenre?.name} • {tier === 'professional' ? 'Professional' : 'Free'} Tier
            </p>
          </div>
        </div>
        
        <button
          onClick={onNewUpload}
          className="flex items-center px-4 py-2 bg-crys-graphite rounded-lg hover:bg-crys-graphite/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Upload
        </button>
      </div>

      {/* Audio Analysis & ML Summary */}
      {(mlSummary || appliedParams) && (
        <div className="bg-crys-graphite rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-crys-gold" />
            Crysgarage Mastering Engine Analysis & Applied Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ML Summary */}
            {mlSummary && (
              <div>
                <h4 className="font-semibold text-crys-gold mb-3">Crysgarage Mastering Engine Analysis</h4>
                <div className="space-y-2 text-sm">
                  {mlSummary.confidence && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Confidence:</span>
                      <span className="text-crys-gold">{Math.round(mlSummary.confidence * 100)}%</span>
                    </div>
                  )}
                  {mlSummary.predicted_genre && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Predicted Genre:</span>
                      <span className="text-crys-gold">{mlSummary.predicted_genre}</span>
                    </div>
                  )}
                  {mlSummary.complexity && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Complexity:</span>
                      <span className="text-crys-gold">{mlSummary.complexity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Applied Parameters */}
            {appliedParams && (
              <div>
                <h4 className="font-semibold text-crys-gold mb-3">Applied Settings</h4>
                <div className="space-y-2 text-sm">
                  {appliedParams.resolved_genre && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Genre:</span>
                      <span className="text-crys-gold">{appliedParams.resolved_genre}</span>
                    </div>
                  )}
                  {appliedParams.target_lufs && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Target LUFS:</span>
                      <span className="text-crys-gold">{appliedParams.target_lufs}</span>
                    </div>
                  )}
                  {appliedParams.compression_ratio && (
                    <div className="flex justify-between">
                      <span className="text-crys-light-grey">Compression:</span>
                      <span className="text-crys-gold">{appliedParams.compression_ratio}:1</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* A/B Switch Controls */}
      <div className="bg-crys-graphite rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex bg-crys-dark rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSource === 'original' 
                  ? 'bg-crys-gold text-crys-dark' 
                  : 'text-crys-light-grey hover:bg-crys-graphite'
              }`}
              onClick={() => handleSwitchSource('original')}
              disabled={!originalFile}
            >
              Original
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeSource === 'mastered' 
                  ? 'bg-crys-gold text-crys-dark' 
                  : 'text-crys-light-grey hover:bg-crys-graphite'
              }`}
              onClick={() => handleSwitchSource('mastered')}
              disabled={!masteredAudioUrl}
            >
              Mastered
            </button>
          </div>
          
          <button
            onClick={handlePlayPause}
            className={`rounded-full p-4 transition-colors ${
              activeSource === 'original' 
                ? 'bg-crys-gold text-crys-dark hover:bg-crys-gold/90' 
                : 'bg-crys-gold text-crys-dark hover:bg-crys-gold/90'
            }`}
            disabled={(activeSource === 'original' && !originalFile) || (activeSource === 'mastered' && !masteredAudioUrl)}
          >
            {(activeSource === 'original' ? isPlayingOriginal : isPlayingMastered) ? 
              <Pause className="w-6 h-6" /> : 
              <Play className="w-6 h-6" />
            }
          </button>
        </div>
        
        {/* Unified Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-crys-dark rounded-full h-2">
            <div
              className="bg-crys-gold h-2 rounded-full transition-all duration-100"
              style={{ 
                width: `${(() => {
                  const currentTime = activeSource === 'original' ? currentTimeOriginal : currentTimeMastered;
                  const duration = activeSource === 'original' ? durationOriginal : durationMastered;
                  return duration ? (currentTime / duration) * 100 : 0;
                })()}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-crys-light-grey">
            <span>{formatTime(activeSource === 'original' ? currentTimeOriginal : currentTimeMastered)}</span>
            <span>{formatTime(activeSource === 'original' ? durationOriginal : durationMastered)}</span>
          </div>
        </div>
      </div>

      {/* Audio Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className={`bg-crys-graphite rounded-xl p-6 border-2 transition-colors ${
          activeSource === 'original' ? 'border-crys-gold' : 'border-transparent'
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-crys-gold" />
            Original Audio
            {activeSource === 'original' && <span className="ml-2 text-sm text-crys-gold">(Active)</span>}
          </h3>
          
          <div className="mb-4">
            <audio
              ref={originalAudioRef}
              src={originalFile?.url}
              className="w-full"
              preload="auto"
              playsInline
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleSwitchSource('original')}
              className={`p-3 rounded-full transition-colors ${
                activeSource === 'original' 
                  ? 'bg-crys-gold text-crys-dark hover:bg-crys-gold/90' 
                  : 'bg-crys-graphite text-crys-light-grey hover:bg-crys-graphite/80'
              }`}
            >
              {isPlayingOriginal ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <div className="text-sm text-crys-light-grey">
              {formatTime(currentTimeOriginal)} / {formatTime(durationOriginal)}
            </div>
          </div>

          {/* Original Audio Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-crys-light-grey">LUFS:</span>
              <span className="text-white">{originalLufs?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-crys-light-grey">File Size:</span>
              <span className="text-white">{originalFile ? (originalFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Mastered Audio */}
        <div className={`bg-crys-graphite rounded-xl p-6 border-2 transition-colors ${
          activeSource === 'mastered' ? 'border-crys-gold' : 'border-transparent'
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-crys-gold" />
            Mastered Audio
            {activeSource === 'mastered' && <span className="ml-2 text-sm text-crys-gold">(Active)</span>}
          </h3>
          
          <div className="mb-4">
            <audio
              ref={masteredAudioRef}
              src={masteredAudioUrl || undefined}
              className="w-full"
              preload="auto"
              playsInline
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleSwitchSource('mastered')}
              className={`p-3 rounded-full transition-colors ${
                activeSource === 'mastered' 
                  ? 'bg-crys-gold text-crys-dark hover:bg-crys-gold/90' 
                  : 'bg-crys-graphite text-crys-light-grey hover:bg-crys-graphite/80'
              }`}
            >
              {isPlayingMastered ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <div className="text-sm text-crys-light-grey">
              {formatTime(currentTimeMastered)} / {formatTime(durationMastered)}
            </div>
          </div>

          {/* Mastered Audio Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-crys-light-grey">LUFS:</span>
              <span className="text-crys-gold font-semibold">{masteredLufs?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-crys-light-grey">Genre:</span>
              <span className="text-crys-gold">{selectedGenre?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <DownloadStep
        onDownload={handleDownload}
        downloadFormat={downloadFormat}
        onFormatChange={onFormatChange}
        isDownloading={isDownloading}
      />
    </div>
  );
};

export default ComparisonPlayer;
