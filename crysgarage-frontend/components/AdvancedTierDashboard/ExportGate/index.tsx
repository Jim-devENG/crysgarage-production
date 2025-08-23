import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Settings, Cpu } from 'lucide-react';

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
  meterData?: any;
  selectedGenre?: string;
  getProcessedAudioUrl?: () => Promise<string | null>;
}

const ExportGate: React.FC<ExportGateProps> = ({ 
  originalFile, 
  processedAudioUrl, 
  audioEffects, 
  onBack,
  onUpdateEffectSettings,
  meterData,
  selectedGenre,
  getProcessedAudioUrl
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24' | 'wav32'>('wav16');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [gTunerEnabled, setGTunerEnabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize G-Tuner state from audioEffects
  useEffect(() => {
    if (audioEffects?.gTuner) {
      setGTunerEnabled(audioEffects.gTuner.enabled || false);
    }
  }, [audioEffects]);

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
    if (gTunerEnabled) cost += 3;
    
    return cost;
  };

  const totalCost = calculateTotalCost();

  // G-Tuner toggle handler - actually applies the effect
  const handleGTunerToggle = (enabled: boolean) => {
    setGTunerEnabled(enabled);
    
    // Update the audio effects system with G-Tuner settings
    if (onUpdateEffectSettings) {
      onUpdateEffectSettings('gTuner', {
        enabled: enabled,
        frequency: 444 // Fixed 444Hz reference frequency
      });
    }
    
    console.log(`🎵 G-Tuner ${enabled ? 'ENABLED' : 'DISABLED'} - applying 444Hz frequency correction`);
    
    // Show visual feedback
    if (enabled) {
      console.log('✅ 444Hz pitch correction is now ACTIVE and applied to audio');
    } else {
      console.log('❌ 444Hz pitch correction DISABLED - audio returned to original pitch');
    }
  };

  // Download handler that captures the actual processed audio
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    setIsDownloading(true);
    
    try {
      console.log('🎵 Advanced download starting - capturing processed audio...');
      
      // Get the processed audio URL from the mastering player
      // This will capture the audio with all effects applied
      if (!getProcessedAudioUrl) {
        console.error('getProcessedAudioUrl function not available');
        alert('Error: Audio processing function not available. Please try again.');
        return;
      }
      
      const processedAudioUrl = await getProcessedAudioUrl();
      
      if (!processedAudioUrl) {
        console.error('Failed to get processed audio URL');
        alert('Error: Could not capture processed audio. Please try again.');
        return;
      }

      // Fetch the processed audio blob
      const response = await fetch(processedAudioUrl);
      const processedAudioBlob = await response.blob();
      
      // Create download link with processed audio
      const url = URL.createObjectURL(processedAudioBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with format info
      const originalName = originalFile.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const formatExt = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      const bitDepth = downloadFormat === 'wav16' ? '16bit' : downloadFormat === 'wav24' ? '24bit' : '32bit';
      const sampleRateLabel = sampleRate.replace('kHz', 'k');
      
      const filename = downloadFormat === 'mp3' 
        ? `${nameWithoutExt}_garage_mastered_320kbps_${sampleRateLabel}.${formatExt}`
        : `${nameWithoutExt}_garage_mastered_${bitDepth}_${sampleRateLabel}.${formatExt}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(processedAudioUrl);
      
      console.log(`✅ Successfully downloaded processed audio: ${filename}`);
      console.log(`📊 Format: ${downloadFormat}, Sample Rate: ${sampleRate}, G-Tuner: ${gTunerEnabled ? 'Enabled' : 'Disabled'}`);
      
      // Show success message
      alert(`Successfully downloaded mastered audio: ${filename}`);
      
    } catch (error) {
      console.error('❌ Error downloading processed audio:', error);
      alert('Error downloading processed audio. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-crys-gold to-yellow-500 p-1.5 rounded-lg">
              <Download className="w-4 h-4 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-white">Export Gate</h2>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">Total Cost</div>
          <div className="text-xl font-bold text-crys-gold">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* File Information */}
      {originalFile && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            File Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Name:</span>
                <span className="text-white font-medium">{originalFile.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Size:</span>
                <span className="text-white font-medium">
                  {(originalFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Type:</span>
                <span className="text-white font-medium">{originalFile.type || 'Audio'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Genre Preset:</span>
                <span className="text-crys-gold font-medium">{selectedGenre || 'None'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Processing:</span>
                <span className="text-green-400 font-medium">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Effects Applied:</span>
                <span className="text-purple-400 font-medium">
                  {Object.values(audioEffects).filter((effect: any) => effect.enabled).length} Effects
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Settings */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
        <h3 className="text-md font-semibold text-white mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Export Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample Rate Selection */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Sample Rate</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="44.1kHz"
                    checked={sampleRate === '44.1kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">44.1 kHz</div>
                    <div className="text-xs text-gray-400">CD standard</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="48kHz"
                    checked={sampleRate === '48kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">48 kHz</div>
                    <div className="text-xs text-gray-400">Professional</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="88.2kHz"
                    checked={sampleRate === '88.2kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">88.2 kHz</div>
                    <div className="text-xs text-gray-400">High resolution</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$3.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="96kHz"
                    checked={sampleRate === '96kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">96 kHz</div>
                    <div className="text-xs text-gray-400">Ultra high</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$5.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sampleRate"
                    value="192kHz"
                    checked={sampleRate === '192kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">192 kHz</div>
                    <div className="text-xs text-gray-400">Maximum</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$10.00</div>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Download Format</h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="mp3"
                    checked={downloadFormat === 'mp3'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">MP3</div>
                    <div className="text-xs text-gray-400">Compressed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="wav16"
                    checked={downloadFormat === 'wav16'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">WAV 16-bit</div>
                    <div className="text-xs text-gray-400">CD quality</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="wav24"
                    checked={downloadFormat === 'wav24'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">WAV 24-bit</div>
                    <div className="text-xs text-gray-400">Studio quality</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="wav32"
                    checked={downloadFormat === 'wav32'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">WAV 32-bit</div>
                    <div className="text-xs text-gray-400">Maximum quality</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$2.00</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* G-Tuner Section */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
            <Cpu className="w-3 h-3 mr-1.5 text-crys-gold" />
            G-Tuner (444Hz Reference)
          </h4>
          <div className="bg-gray-900 rounded p-3 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm mb-0.5">Pitch Correction</div>
                <div className="text-xs text-gray-400">
                  {gTunerEnabled 
                    ? 'Mastered audio tuned to 444Hz' 
                    : 'Apply 444Hz pitch correction'
                  }
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Cost</div>
                  <div className="text-sm font-bold text-crys-gold">$3.00</div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gTunerEnabled}
                    onChange={(e) => handleGTunerToggle(e.target.checked)}
                    className="w-4 h-4 text-crys-gold bg-gray-700 border-gray-600 rounded focus:ring-crys-gold focus:ring-1"
                  />
                  <span className="ml-1.5 text-white text-sm">Enable</span>
                </label>
              </div>
            </div>
            {gTunerEnabled && (
              <div className="mt-2 bg-gradient-to-r from-yellow-800 to-yellow-900 rounded p-2 border border-yellow-600">
                <div className="text-center">
                  <div className="text-yellow-200 text-sm font-bold mb-0.5">444 Hz</div>
                  <div className="text-yellow-300 text-xs">Reference Frequency Applied</div>
                  <div className="text-yellow-400 text-xs mt-0.5">✓ ACTIVE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={!originalFile || isDownloading}
          className={`bg-crys-gold text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 mx-auto ${
            originalFile && !isDownloading
              ? 'hover:bg-yellow-400'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Mastered Audio</span>
            </>
          )}
        </button>
        {gTunerEnabled && (
          <div className="mt-2 text-xs text-crys-gold">
            ✓ G-Tuner (444Hz) applied to final export
          </div>
        )}
        {originalFile && (
          <div className="mt-2 text-xs text-gray-400">
            Format: {downloadFormat === 'mp3' ? 'MP3 320kbps' : downloadFormat === 'wav16' ? 'WAV 16-bit' : downloadFormat === 'wav24' ? 'WAV 24-bit' : 'WAV 32-bit'} • Sample Rate: {sampleRate}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportGate;
