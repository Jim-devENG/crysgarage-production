import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

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
  onDownload: () => Promise<void>;
  // Optional ML info
  mlSummary?: Array<{ area: string; action: string; reason?: string }>;
  appliedParams?: Record<string, any>;
  originalLufs?: number;
  masteredLufs?: number;
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
  masteredLufs
}) => {
  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const masteredAudioRef = useRef<HTMLAudioElement>(null);
  
  // Playback states
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalVolume, setOriginalVolume] = useState(1);
  const [masteredVolume, setMasteredVolume] = useState(1);
  const [originalMuted, setOriginalMuted] = useState(false);
  const [masteredMuted, setMasteredMuted] = useState(false);
  
  // Progress states
  const [originalProgress, setOriginalProgress] = useState(0);
  const [masteredProgress, setMasteredProgress] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [masteredDuration, setMasteredDuration] = useState(0);
  
  // Download state
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync element properties that are not valid JSX attributes
  useEffect(() => {
    if (originalAudioRef.current) {
      try { originalAudioRef.current.volume = originalMuted ? 0 : originalVolume; } catch {}
      try { originalAudioRef.current.muted = originalMuted; } catch {}
    }
  }, [originalVolume, originalMuted]);

  useEffect(() => {
    if (masteredAudioRef.current) {
      try { masteredAudioRef.current.volume = masteredMuted ? 0 : masteredVolume; } catch {}
      try { masteredAudioRef.current.muted = masteredMuted; } catch {}
    }
  }, [masteredVolume, masteredMuted]);

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

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
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
        <p className="text-gray-400">Compare your original audio with the AI-mastered version</p>
        {selectedGenre && (
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-500/30 rounded-lg px-4 py-2">
            <span className="text-sm text-amber-400 font-medium">
              Genre: <span className="text-white">{selectedGenre.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Audio Players - Force side-by-side layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
              preload="metadata"
            />
          )}

          {/* Playback Controls */}
          <div className="space-y-4">
            {/* Play/Pause Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleOriginalPlayPause}
                disabled={!originalFile}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-full transition-colors"
              >
                {isPlayingOriginal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${originalDuration ? (originalProgress / originalDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatTime(originalProgress)}</span>
                <span>{formatTime(originalDuration)}</span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOriginalMuted(!originalMuted)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {originalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={originalMuted ? 0 : originalVolume}
                onChange={(e) => {
                  setOriginalVolume(parseFloat(e.target.value));
                  setOriginalMuted(false);
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-8">
                {Math.round((originalMuted ? 0 : originalVolume) * 100)}%
              </span>
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
              AI Enhanced
            </div>
          </div>

          {/* Audio Element */}
          {masteredAudioUrl && (
            <audio
              ref={masteredAudioRef}
              src={masteredAudioUrl}
              preload="metadata"
            />
          )}

          {/* Playback Controls */}
          <div className="space-y-4">
            {/* Play/Pause Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleMasteredPlayPause}
                disabled={!masteredAudioUrl}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-4 rounded-full transition-colors"
              >
                {isPlayingMastered ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
            </div>

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

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMasteredMuted(!masteredMuted)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {masteredMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={masteredMuted ? 0 : masteredVolume}
                onChange={(e) => {
                  setMasteredVolume(parseFloat(e.target.value));
                  setMasteredMuted(false);
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-8">
                {Math.round((masteredMuted ? 0 : masteredVolume) * 100)}%
              </span>
            </div>
          </div>

          {/* File Info */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-sm text-gray-400 space-y-1">
              <div>Genre: {selectedGenre?.name || 'None'}</div>
              <div>Processing: AI Mastered</div>
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
      <div className="bg-gradient-to-r from-blue-500/10 to-amber-500/10 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Comparison Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-400">Original Audio</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Raw, unprocessed sound</li>
              <li>• Natural dynamics</li>
              <li>• Original frequency response</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-amber-400">Mastered Audio</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• AI-enhanced with {selectedGenre?.name} preset</li>
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

      {/* Download Section */}
      <div className="text-center space-y-4">
        <button
          onClick={handleDownload}
          disabled={!masteredAudioUrl || isDownloading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-3 mx-auto text-lg"
        >
          <Play className="w-6 h-6" />
          {isDownloading ? 'Preparing Download...' : 'Download Mastered Audio - $2.99'}
        </button>
        
        <p className="text-sm text-gray-400">
          Download your AI-mastered audio with the {selectedGenre?.name} preset applied
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
