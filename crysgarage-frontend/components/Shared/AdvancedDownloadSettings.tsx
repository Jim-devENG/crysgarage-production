import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface AdvancedDownloadSettingsProps {
  onDownload: () => void;
  isDownloading: boolean;
  downloadFormat: string;
  onFormatChange: (format: string) => void;
  sampleRate: string;
  onSampleRateChange: (rate: string) => void;
  tier: 'free' | 'professional' | 'advanced';
}

const AdvancedDownloadSettings: React.FC<AdvancedDownloadSettingsProps> = ({
  onDownload,
  isDownloading,
  downloadFormat,
  onFormatChange,
  sampleRate,
  onSampleRateChange,
  tier
}) => {
  // Define available formats based on tier
  const getAvailableFormats = () => {
    switch (tier) {
      case 'free':
        return [
          { value: 'MP3', label: 'MP3', description: 'Compressed', price: '$0.00' },
          { value: 'WAV', label: 'WAV (24-bit)', description: 'Studio quality', price: '$0.00' }
        ];
      case 'professional':
        return [
          { value: 'MP3', label: 'MP3', description: 'Compressed', price: '$0.00' },
          { value: 'WAV', label: 'WAV (24-bit)', description: 'Studio quality', price: '$0.00' }
        ];
      case 'advanced':
        return [
          { value: 'MP3', label: 'MP3', description: 'Compressed', price: '$0.00' },
          { value: 'WAV', label: 'WAV (24-bit)', description: 'Studio quality', price: '$0.00' },
          { value: 'FLAC', label: 'FLAC', description: 'Lossless', price: '$1.00' },
          { value: 'AIFF', label: 'AIFF (24-bit)', description: 'Apple uncompressed', price: '$0.00' },
          { value: 'AAC', label: 'AAC (256kbps)', description: 'High quality AAC', price: '$0.00' },
          { value: 'OGG', label: 'OGG (q8)', description: 'Vorbis', price: '$0.00' }
        ];
      default:
        return [];
    }
  };

  // Define available sample rates based on tier
  const getAvailableSampleRates = () => {
    switch (tier) {
      case 'free':
        return [
          { value: '44.1kHz', label: '44.1 kHz', description: 'CD standard', price: '$0.00' }
        ];
      case 'professional':
        return [
          { value: '44.1kHz', label: '44.1 kHz', description: 'CD standard', price: '$0.00' },
          { value: '48kHz', label: '48 kHz', description: 'Professional', price: '$0.00' }
        ];
      case 'advanced':
        return [
          { value: '44.1kHz', label: '44.1 kHz', description: 'CD standard', price: '$0.00' },
          { value: '48kHz', label: '48 kHz', description: 'Professional', price: '$0.00' },
          { value: '88.2kHz', label: '88.2 kHz', description: 'High-res', price: '$0.00' },
          { value: '96kHz', label: '96 kHz', description: 'High-res', price: '$0.00' },
          { value: '192kHz', label: '192 kHz', description: 'Ultra high-res', price: '$0.00' }
        ];
      default:
        return [];
    }
  };

  const availableFormats = getAvailableFormats();
  const availableSampleRates = getAvailableSampleRates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Export Settings
        </h3>
        <p className="text-gray-400 text-sm">
          Choose your preferred format and quality settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sample Rate Selection */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Sample Rate</h4>
          <div className="space-y-2">
            {availableSampleRates.map((rate) => (
              <label
                key={rate.value}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value={rate.value}
                    checked={sampleRate === rate.value}
                    onChange={(e) => onSampleRateChange(e.target.value)}
                    className="text-crys-gold focus:ring-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm font-medium">{rate.label}</div>
                    <div className="text-xs text-gray-400">{rate.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{rate.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Download Format</h4>
          <div className="space-y-2">
            {availableFormats.map((format) => (
              <label
                key={format.value}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={downloadFormat === format.value}
                    onChange={(e) => onFormatChange(e.target.value)}
                    className="text-crys-gold focus:ring-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm font-medium">{format.label}</div>
                    <div className="text-xs text-gray-400">{format.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">{format.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center pt-4">
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="inline-flex items-center space-x-2 bg-crys-gold text-crys-dark px-8 py-3 rounded-lg font-semibold hover:bg-crys-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download {downloadFormat} @ {sampleRate}</span>
            </>
          )}
        </button>
      </div>

      {/* Format Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Files are processed server-side with FFmpeg for optimal quality
        </p>
      </div>
    </div>
  );
};

export default AdvancedDownloadSettings;
