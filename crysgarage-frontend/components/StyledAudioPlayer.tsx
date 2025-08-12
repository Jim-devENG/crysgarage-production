import React, { forwardRef } from 'react';

interface StyledAudioPlayerProps {
  src: string;
  title: string;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  onAudioElementReady?: (audioElement: HTMLAudioElement) => void;
}

const StyledAudioPlayer = forwardRef<HTMLDivElement, StyledAudioPlayerProps>(({
  src,
  title,
  onPlay,
  onPause,
  className = '',
  onAudioElementReady
}, ref) => {
  const handleAudioRef = (audioElement: HTMLAudioElement | null) => {
    if (audioElement) {
      onAudioElementReady?.(audioElement);
    }
  };

  return (
    <div ref={ref} className={`styled-audio-player ${className}`}>
      {/* Title */}
      <div className="text-center mb-3">
        <h4 className="text-sm font-medium text-gray-200 truncate">{title}</h4>
      </div>

      {/* Styled Audio Element */}
      <div className="audio-container">
        <audio
          ref={handleAudioRef}
          src={src}
          preload="metadata"
          controls
          controlsList="nodownload"
          onPlay={onPlay}
          onPause={onPause}
          className="styled-audio"
        />
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .styled-audio-player {
          background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid #4b5563;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .audio-container {
          position: relative;
          width: 100%;
        }

        .styled-audio {
          width: 100%;
          height: 60px;
          border-radius: 8px;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border: 1px solid #4b5563;
          outline: none;
          transition: all 0.3s ease;
        }

        .styled-audio:hover {
          border-color: #fbbf24;
          box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
        }

        .styled-audio:focus {
          border-color: #fbbf24;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
        }

        /* Custom audio controls styling */
        .styled-audio::-webkit-media-controls-panel {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          border-radius: 8px;
          padding: 8px;
        }

        .styled-audio::-webkit-media-controls-play-button {
          background-color: #fbbf24;
          border-radius: 50%;
          border: none;
          color: #000;
          transition: all 0.3s ease;
        }

        .styled-audio::-webkit-media-controls-play-button:hover {
          background-color: #f59e0b;
          transform: scale(1.1);
        }

        .styled-audio::-webkit-media-controls-current-time-display,
        .styled-audio::-webkit-media-controls-time-remaining-display {
          color: #fbbf24;
          font-weight: 600;
          font-size: 12px;
        }

        .styled-audio::-webkit-media-controls-timeline {
          background: #4b5563;
          border-radius: 4px;
          height: 6px;
        }

        .styled-audio::-webkit-media-controls-timeline::-webkit-slider-thumb {
          background: #fbbf24;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .styled-audio::-webkit-media-controls-timeline::-webkit-slider-thumb:hover {
          background: #f59e0b;
          transform: scale(1.2);
        }

        .styled-audio::-webkit-media-controls-volume-slider {
          background: #4b5563;
          border-radius: 4px;
          height: 6px;
        }

        .styled-audio::-webkit-media-controls-volume-slider::-webkit-slider-thumb {
          background: #fbbf24;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .styled-audio::-webkit-media-controls-volume-slider::-webkit-slider-thumb:hover {
          background: #f59e0b;
          transform: scale(1.1);
        }

        .styled-audio::-webkit-media-controls-mute-button {
          background-color: #6b7280;
          border-radius: 4px;
          border: none;
          color: #fff;
          transition: all 0.3s ease;
        }

        .styled-audio::-webkit-media-controls-mute-button:hover {
          background-color: #fbbf24;
          color: #000;
        }

        /* Firefox specific styles */
        .styled-audio::-moz-range-track {
          background: #4b5563;
          border-radius: 4px;
          height: 6px;
          border: none;
        }

        .styled-audio::-moz-range-thumb {
          background: #fbbf24;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .styled-audio::-moz-range-thumb:hover {
          background: #f59e0b;
          transform: scale(1.2);
        }

        /* Progress bar styling */
        .styled-audio::-webkit-media-controls-timeline::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #fbbf24 0%, #fbbf24 50%, #4b5563 50%, #4b5563 100%);
          border-radius: 4px;
          height: 6px;
        }

        /* Volume control styling */
        .styled-audio::-webkit-media-controls-volume-slider::-webkit-slider-runnable-track {
          background: linear-gradient(to right, #fbbf24 0%, #fbbf24 70%, #4b5563 70%, #4b5563 100%);
          border-radius: 4px;
          height: 6px;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .styled-audio {
            height: 50px;
          }
          
          .styled-audio::-webkit-media-controls-current-time-display,
          .styled-audio::-webkit-media-controls-time-remaining-display {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
});

export default StyledAudioPlayer;
