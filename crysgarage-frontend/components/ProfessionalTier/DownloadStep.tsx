import React from 'react';
import { Download, FileAudio, Settings, CheckCircle } from 'lucide-react';

interface DownloadStepProps {
  onDownload: () => void;
  downloadFormat: 'mp3' | 'wav16' | 'wav24';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24') => void;
  isDownloading?: boolean;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  onDownload,
  downloadFormat,
  onFormatChange,
  isDownloading = false
}) => {
  const formatOptions = [
    {
      value: 'wav24' as const,
      label: 'WAV 24-bit',
      description: 'Professional Quality • 24-bit • 44.1 kHz',
      icon: '🎵',
      recommended: true
    },
    {
      value: 'wav16' as const,
      label: 'WAV 16-bit',
      description: 'CD Quality • 16-bit • 44.1 kHz',
      icon: '💿',
      recommended: false
    },
    {
      value: 'mp3' as const,
      label: 'MP3 320 kbps',
      description: 'High Quality • 320 kbps • 44.1 kHz',
      icon: '🎧',
      recommended: false
    }
  ];

  return (
    <div className="bg-crys-graphite rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <Download className="w-5 h-5 mr-2 text-crys-gold" />
        Download Options
      </h3>

      {/* Format Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2 text-crys-gold" />
          Choose Format
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFormatChange(option.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                downloadFormat === option.value
                  ? 'border-crys-gold bg-crys-gold/10'
                  : 'border-crys-dark hover:border-crys-graphite'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{option.icon}</span>
                  <span className="font-semibold">{option.label}</span>
                </div>
                {option.recommended && (
                  <div className="flex items-center text-xs text-crys-gold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Recommended
                  </div>
                )}
              </div>
              <p className="text-sm text-crys-light-grey">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-crys-light-grey">
          <p>Selected: <span className="text-crys-gold font-semibold">
            {formatOptions.find(f => f.value === downloadFormat)?.label}
          </span></p>
        </div>
        
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="bg-crys-gold text-crys-dark py-3 px-8 rounded-lg font-semibold hover:bg-crys-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-crys-dark border-t-transparent rounded-full animate-spin mr-2" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download Mastered Audio
            </>
          )}
        </button>
      </div>

      {/* Format Info */}
      <div className="mt-6 p-4 bg-crys-dark rounded-lg">
        <h5 className="font-semibold text-crys-gold mb-2">Format Details:</h5>
        <div className="text-sm text-crys-light-grey space-y-1">
          {downloadFormat === 'wav24' && (
            <>
              <p>• 24-bit depth for maximum dynamic range</p>
              <p>• 44.1 kHz sample rate (CD quality)</p>
              <p>• Lossless compression</p>
              <p>• Best for professional use and archiving</p>
            </>
          )}
          {downloadFormat === 'wav16' && (
            <>
              <p>• 16-bit depth (CD standard)</p>
              <p>• 44.1 kHz sample rate</p>
              <p>• Lossless compression</p>
              <p>• Compatible with all audio software</p>
            </>
          )}
          {downloadFormat === 'mp3' && (
            <>
              <p>• 320 kbps bitrate (highest quality)</p>
              <p>• 44.1 kHz sample rate</p>
              <p>• Lossy compression</p>
              <p>• Small file size, universal compatibility</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadStep;
