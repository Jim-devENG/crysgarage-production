import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface CustomAudioPlayerProps {
  src: string;
  title: string;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  onAudioElementReady?: (audioElement: HTMLAudioElement) => void;
}

const CustomAudioPlayer = forwardRef<HTMLDivElement, CustomAudioPlayerProps>(({
  src,
  title,
  onPlay,
  onPause,
  className = '',
  onAudioElementReady
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Notify parent component when audio element is ready
    onAudioElementReady?.(audio);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [onPlay, onPause, onAudioElementReady]);

  // Update audio element when src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && src) {
      audio.src = src;
      audio.load();
      // Notify parent component when audio element is ready
      onAudioElementReady?.(audio);
    }
  }, [src, onAudioElementReady]);

  const togglePlay = () => {
    if (audioRef.current) {
      // Check if audio has a valid source
      if (!audioRef.current.src || audioRef.current.src === '') {
        console.error('Audio element has no source');
        return;
      }

      // Ensure audio is loaded before playing
      if (audioRef.current.readyState < 2) { // HAVE_CURRENT_DATA
        console.log('Audio not ready, loading...');
        audioRef.current.load();
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio play started successfully');
            })
            .catch((error) => {
              console.error('Error playing audio:', error);
            });
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={ref} className={`bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Title */}
      <div className="text-center mb-3">
        <h4 className="text-sm font-medium text-gray-200 truncate">{title}</h4>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-400 w-8">{formatTime(currentTime)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(currentTime / (duration || 1)) * 100}%, #4b5563 ${(currentTime / (duration || 1)) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Skip Backward */}
          <button
            onClick={skipBackward}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
          >
            <SkipBack className="w-4 h-4 text-gray-300" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-crys-gold hover:bg-yellow-400 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-300" />
            )}
          </button>
          <div className="w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
        }
             `}</style>
     </div>
   );
 });
 
 export default CustomAudioPlayer;
