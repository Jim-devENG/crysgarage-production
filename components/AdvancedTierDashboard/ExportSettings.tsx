import React from 'react';
import { Download, Settings, DollarSign } from 'lucide-react';

interface ExportSettingsProps {
  downloadFormat: 'mp3' | 'wav16' | 'wav24' | 'wav32';
  sampleRate: '44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24' | 'wav32') => void;
  onSampleRateChange: (rate: '44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz') => void;
  totalCost: number;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({
  downloadFormat,
  sampleRate,
  onFormatChange,
  onSampleRateChange,
  totalCost
}) => {
  return (
    <div className="space-y-3">
      {/* Export Settings Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-2">Export Gate</h3>
        <p className="text-sm text-gray-400">Professional audio export settings</p>
      </div>

      {/* Format Selection - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Download className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">EXPORT FORMAT</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="mp3"
                checked={downloadFormat === 'mp3'}
                onChange={(e) => onFormatChange(e.target.value as 'mp3' | 'wav16' | 'wav24' | 'wav32')}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">MP3 (320kbps)</span>
              <span className="text-[8px] text-green-400 ml-auto">FREE</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="wav16"
                checked={downloadFormat === 'wav16'}
                onChange={(e) => onFormatChange(e.target.value as 'mp3' | 'wav16' | 'wav24' | 'wav32')}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">WAV (16bit)</span>
              <span className="text-[8px] text-green-400 ml-auto">FREE</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="wav24"
                checked={downloadFormat === 'wav24'}
                onChange={(e) => onFormatChange(e.target.value as 'mp3' | 'wav16' | 'wav24' | 'wav32')}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">WAV (24bit)</span>
              <span className="text-[8px] text-green-400 ml-auto">FREE</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="format"
                value="wav32"
                checked={downloadFormat === 'wav32'}
                onChange={(e) => onFormatChange(e.target.value as 'mp3' | 'wav16' | 'wav24' | 'wav32')}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">WAV (32bit)</span>
              <span className="text-[8px] text-crys-gold ml-auto">$2</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE EXPORT FORMAT v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Rate Selection - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <Settings className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">SAMPLE RATE</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="sampleRate"
                value="44.1kHz"
                checked={sampleRate === '44.1kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">44.1kHz</span>
              <span className="text-[8px] text-green-400 ml-auto">FREE</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="sampleRate"
                value="48kHz"
                checked={sampleRate === '48kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">48kHz</span>
              <span className="text-[8px] text-green-400 ml-auto">FREE</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="sampleRate"
                value="88.2kHz"
                checked={sampleRate === '88.2kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">88.2kHz</span>
              <span className="text-[8px] text-crys-gold ml-auto">$3</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="sampleRate"
                value="96kHz"
                checked={sampleRate === '96kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">96kHz</span>
              <span className="text-[8px] text-crys-gold ml-auto">$5</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="sampleRate"
                value="192kHz"
                checked={sampleRate === '192kHz'}
                onChange={(e) => onSampleRateChange(e.target.value as any)}
                className="text-crys-gold"
              />
              <span className="text-xs text-white">192kHz</span>
              <span className="text-[8px] text-crys-gold ml-auto">$10</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE SAMPLE RATE v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary - Compact Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              <div className="flex items-center space-x-1">
                <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-0.5 rounded">
                  <DollarSign className="w-2.5 h-2.5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CRYS GARAGE STUDIO</h3>
                  <p className="text-[8px] text-gray-400">COST SUMMARY</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full border border-gray-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-white">Total Cost:</span>
            <span className="text-xl font-bold text-crys-gold">${totalCost}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-1.5 border-t border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
            <div className="text-[6px] text-gray-500">CRYS GARAGE COST SUMMARY v1.0.0</div>
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSettings;
