import React, { useState } from 'react';
import { Download, ArrowLeft, Play, Pause, Volume2, Settings, DollarSign } from 'lucide-react';

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
}

const ExportGate: React.FC<ExportGateProps> = ({ 
  originalFile, 
  processedAudioUrl, 
  audioEffects, 
  onBack 
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24' | 'wav32'>('wav16');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [gSurroundEnabled, setGSurroundEnabled] = useState(false);
  const [gTunerEnabled, setGTunerEnabled] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingProcessed, setIsPlayingProcessed] = useState(false);

  // Calculate total cost
  const calculateTotalCost = () => {
    let cost = 0;
    
    // Format costs
    if (downloadFormat === 'wav32') cost += 2;
    
    // Sample rate costs
    if (sampleRate === '88.2kHz') cost += 3;
    if (sampleRate === '96kHz') cost += 5;
    if (sampleRate === '192kHz') cost += 10;
    
    // Feature costs
    if (gSurroundEnabled) cost += 5;
    if (gTunerEnabled) cost += 3;
    
    return cost;
  };

  const totalCost = calculateTotalCost();

  const handleDownload = () => {
    // Implementation for actual download
    console.log('Downloading with settings:', {
      format: downloadFormat,
      sampleRate,
      gSurround: gSurroundEnabled,
      gTuner: gTunerEnabled,
      totalCost
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-2 rounded-lg">
              <Download className="w-5 h-5 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-white">Export Gate</h2>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Cost</div>
          <div className="text-2xl font-bold text-crys-gold">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Before & After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Original Audio
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">File</span>
                <span className="text-sm text-white">{originalFile?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Size</span>
                <span className="text-sm text-white">
                  {originalFile ? (originalFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Audio Preview</span>
                <button
                  onClick={() => setIsPlayingOriginal(!isPlayingOriginal)}
                  className="p-2 bg-crys-gold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  {isPlayingOriginal ? (
                    <Pause className="w-4 h-4 text-gray-900" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              </div>
              <div className="w-full bg-gray-800 rounded-lg h-2">
                <div className="bg-crys-gold h-2 rounded-lg" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0:00</span>
                <span>3:45</span>
              </div>
            </div>
          </div>
        </div>

        {/* Processed Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Processed Audio
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Effects Applied</span>
                <span className="text-sm text-crys-gold">5 Active</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Processing</span>
                <span className="text-sm text-green-400">Complete</span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Audio Preview</span>
                <button
                  onClick={() => setIsPlayingProcessed(!isPlayingProcessed)}
                  className="p-2 bg-crys-gold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  {isPlayingProcessed ? (
                    <Pause className="w-4 h-4 text-gray-900" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              </div>
              <div className="w-full bg-gray-800 rounded-lg h-2">
                <div className="bg-crys-gold h-2 rounded-lg" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0:00</span>
                <span>3:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Settings */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Export Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Format Selection */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Format</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="format"
                    value="mp3"
                    checked={downloadFormat === 'mp3'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">MP3 (320kbps)</span>
                </div>
                <span className="text-green-400 text-sm">Free</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="format"
                    value="wav16"
                    checked={downloadFormat === 'wav16'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">WAV (16bit)</span>
                </div>
                <span className="text-green-400 text-sm">Free</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="format"
                    value="wav24"
                    checked={downloadFormat === 'wav24'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">WAV (24bit)</span>
                </div>
                <span className="text-green-400 text-sm">Free</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="format"
                    value="wav32"
                    checked={downloadFormat === 'wav32'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">WAV (32bit)</span>
                </div>
                <span className="text-crys-gold text-sm">$2</span>
              </label>
            </div>
          </div>

          {/* Sample Rate Selection */}
          <div>
            <h4 className="text-md font-semibold text-white mb-4">Sample Rate</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="44.1kHz"
                    checked={sampleRate === '44.1kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">44.1kHz</span>
                </div>
                <span className="text-green-400 text-sm">Free</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="48kHz"
                    checked={sampleRate === '48kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">48kHz</span>
                </div>
                <span className="text-green-400 text-sm">Free</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="88.2kHz"
                    checked={sampleRate === '88.2kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">88.2kHz</span>
                </div>
                <span className="text-crys-gold text-sm">$3</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="96kHz"
                    checked={sampleRate === '96kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">96kHz</span>
                </div>
                <span className="text-crys-gold text-sm">$5</span>
              </label>
              
              <label className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="192kHz"
                    checked={sampleRate === '192kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <span className="text-white">192kHz</span>
                </div>
                <span className="text-crys-gold text-sm">$10</span>
              </label>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-white mb-4">Premium Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={gSurroundEnabled}
                  onChange={(e) => setGSurroundEnabled(e.target.checked)}
                  className="text-crys-gold"
                />
                <div>
                  <span className="text-white font-medium">G-Surround</span>
                  <div className="text-sm text-gray-400">Create surround sound</div>
                </div>
              </div>
              <span className="text-crys-gold text-sm">$5</span>
            </label>
            
            <label className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={gTunerEnabled}
                  onChange={(e) => setGTunerEnabled(e.target.checked)}
                  className="text-crys-gold"
                />
                <div>
                  <span className="text-white font-medium">G-Tuner</span>
                  <div className="text-sm text-gray-400">444Hz tuning (per use)</div>
                </div>
              </div>
              <span className="text-crys-gold text-sm">$3</span>
            </label>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="bg-crys-gold text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          <span>Download Mastered Audio</span>
          {totalCost > 0 && (
            <span className="bg-gray-900 text-crys-gold px-3 py-1 rounded-full text-sm">
              ${totalCost.toFixed(2)}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportGate;
