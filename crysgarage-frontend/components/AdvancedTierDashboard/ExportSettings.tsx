import React from 'react';
import { Download } from 'lucide-react';

interface ExportSettingsProps {
  downloadFormat: 'wav' | 'mp3';
  sampleRate: '44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz';
  bitDepth: '16bit' | '24bit' | '32bit';
  onFormatChange: (format: 'wav' | 'mp3') => void;
  onSampleRateChange: (rate: '44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz') => void;
  onBitDepthChange: (depth: '16bit' | '24bit' | '32bit') => void;
  totalCost: number;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({
  downloadFormat,
  sampleRate,
  bitDepth,
  onFormatChange,
  onSampleRateChange,
  onBitDepthChange,
  totalCost
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
      <h3 className="text-xl font-bold text-crys-gold mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2" />
        Export Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format Selection */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Format</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="mp3"
                checked={downloadFormat === 'mp3'}
                onChange={(e) => onFormatChange(e.target.value as 'wav' | 'mp3')}
                className="text-crys-gold"
              />
              <span>MP3 (320kbps) - Free</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="wav"
                checked={downloadFormat === 'wav'}
                onChange={(e) => onFormatChange(e.target.value as 'wav' | 'mp3')}
                className="text-crys-gold"
              />
              <span>WAV (16bit) - Free</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="wav"
                checked={downloadFormat === 'wav'}
                onChange={(e) => onFormatChange(e.target.value as 'wav' | 'mp3')}
                className="text-crys-gold"
              />
              <span>WAV (24bit) - Free</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="wav"
                checked={downloadFormat === 'wav'}
                onChange={(e) => onFormatChange(e.target.value as 'wav' | 'mp3')}
                className="text-crys-gold"
              />
              <span>WAV (32bit) - $2</span>
            </label>
          </div>
        </div>

        {/* Sample Rate Selection */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Sample Rate</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sampleRate"
                value="44.1kHz"
                checked={sampleRate === '44.1kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span>44.1kHz - Free</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sampleRate"
                value="48kHz"
                checked={sampleRate === '48kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span>48kHz - Free</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sampleRate"
                value="88.2kHz"
                checked={sampleRate === '88.2kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span>88.2kHz - $3</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sampleRate"
                value="96kHz"
                checked={sampleRate === '96kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span>96kHz - $5</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="sampleRate"
                value="192kHz"
                checked={sampleRate === '192kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span>192kHz - $10</span>
            </label>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Cost:</span>
          <span className="text-2xl font-bold text-crys-gold">${totalCost}</span>
        </div>
      </div>
    </div>
  );
};

export default ExportSettings;
