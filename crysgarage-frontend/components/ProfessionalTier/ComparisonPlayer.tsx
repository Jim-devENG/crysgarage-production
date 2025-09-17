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

  const togglePlayOriginal = () => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
      } else {
        // Pause mastered audio if playing
        if (masteredAudioRef.current && isPlayingMastered) {
          masteredAudioRef.current.pause();
          setIsPlayingMastered(false);
        }
        originalAudioRef.current.play();
      }
      setIsPlayingOriginal(!isPlayingOriginal);
    }
  };

  const togglePlayMastered = () => {
    if (masteredAudioRef.current) {
      if (isPlayingMastered) {
        masteredAudioRef.current.pause();
      } else {
        // Pause original audio if playing
        if (originalAudioRef.current && isPlayingOriginal) {
          originalAudioRef.current.pause();
          setIsPlayingOriginal(false);
        }
        masteredAudioRef.current.play();
      }
      setIsPlayingMastered(!isPlayingMastered);
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
            AI Analysis & Applied Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ML Summary */}
            {mlSummary && (
              <div>
                <h4 className="font-semibold text-crys-gold mb-3">AI Analysis</h4>
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

      {/* Audio Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-crys-graphite rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-crys-gold" />
            Original Audio
          </h3>
          
          <div className="mb-4">
            <audio
              ref={originalAudioRef}
              src={originalFile?.url}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={togglePlayOriginal}
              className="p-3 bg-crys-gold text-crys-dark rounded-full hover:bg-crys-gold/90 transition-colors"
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
        <div className="bg-crys-graphite rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-crys-gold" />
            Mastered Audio
          </h3>
          
          <div className="mb-4">
            <audio
              ref={masteredAudioRef}
              src={masteredAudioUrl || undefined}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={togglePlayMastered}
              className="p-3 bg-crys-gold text-crys-dark rounded-full hover:bg-crys-gold/90 transition-colors"
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
