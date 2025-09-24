import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Settings } from 'lucide-react';

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
  meterData?: any;
  selectedGenre?: string;
  getProcessedAudioUrl?: never;
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
  const [downloadFormat, setDownloadFormat] = useState<'WAV' | 'MP3' | 'FLAC' | 'AIFF' | 'AAC' | 'OGG'>('WAV');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [isDownloading, setIsDownloading] = useState(false);
  // Removed client recording/progress modal; server handles conversion
  const [startTime, setStartTime] = useState<number | null>(null);

  // Credits flow removed for Advanced download


  // Pricing removed from Advanced download UI

  // Progress tracking function
  const updateProgress = (_progress: number, _stage: string) => {};

  // Enhanced progress tracking for real-time processing
  const updateRealTimeProgress = (_p: number, _s: string) => {};


  // Download handler that captures the actual processed audio
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    setIsDownloading(true);
    setStartTime(Date.now());
    
    try {
      console.log('🎵 Advanced download starting — backend FFmpeg proxy');
      
      // Prefer server-processed URL (from /master-advanced) and let FFmpeg proxy convert it
      let audioToDownload: File | Blob = originalFile;
      let audioUrl = URL.createObjectURL(originalFile);
      
      if (processedAudioUrl) {
        const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:8002'
          : 'https://crysgarage.studio';
        const srNum = Math.round(parseFloat(sampleRate.replace('kHz', '')) * 1000);
        const sourceUrl = processedAudioUrl.startsWith('/files') ? `${base}${processedAudioUrl}` : processedAudioUrl;
        const proxyUrl = `${base}/proxy-download?file_url=${encodeURIComponent(sourceUrl)}&format=${downloadFormat}&sample_rate=${srNum}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Proxy conversion failed: ${response.status}`);
        }
        const convertedBlob = await response.blob();
        audioToDownload = convertedBlob;
        audioUrl = URL.createObjectURL(convertedBlob);
      } else {
        throw new Error('No processed audio URL available. Please process the audio first.');
      }
      
      // Create download link with processed audio
      const link = document.createElement('a');
      link.href = audioUrl;
      
      // Generate filename with format info
      const originalName = originalFile.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const formatExt =
        downloadFormat === 'MP3' ? 'mp3' :
        downloadFormat === 'FLAC' ? 'flac' :
        downloadFormat === 'AIFF' ? 'aiff' :
        downloadFormat === 'AAC' ? 'aac' :
        downloadFormat === 'OGG' ? 'ogg' :
        'wav';
      const bitDepth = downloadFormat === 'WAV' ? '24bit' : '';
      const sampleRateLabel = sampleRate.replace('kHz', 'k');
      
      const filename =
        downloadFormat === 'MP3'
          ? `${nameWithoutExt}_garage_mastered_320kbps_${sampleRateLabel}.${formatExt}`
          : downloadFormat === 'AAC'
            ? `${nameWithoutExt}_garage_mastered_256kbps_${sampleRateLabel}.${formatExt}`
            : downloadFormat === 'WAV' || downloadFormat === 'AIFF'
              ? `${nameWithoutExt}_garage_mastered_${bitDepth}_${sampleRateLabel}.${formatExt}`
              : `${nameWithoutExt}_garage_mastered_${sampleRateLabel}.${formatExt}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(audioUrl);
      
      console.log(`✅ Downloaded: ${filename} (${downloadFormat} @ ${sampleRate})`);
      
      // Success - no alert needed, user can see the download in their browser
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      // Provide more specific error messages
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Removed visualizer/modal

  return (
    <>
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
                    <div className="text-xs text-gray-400">High-res</div>
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
                    value="96kHz"
                    checked={sampleRate === '96kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">96 kHz</div>
                    <div className="text-xs text-gray-400">High-res</div>
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
                    value="192kHz"
                    checked={sampleRate === '192kHz'}
                    onChange={(e) => setSampleRate(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">192 kHz</div>
                    <div className="text-xs text-gray-400">Ultra high-res</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
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
                    value="MP3"
                    checked={downloadFormat === 'MP3'}
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
                    value="WAV"
                    checked={downloadFormat === 'WAV'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">WAV (24-bit)</div>
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
                    value="FLAC"
                    checked={downloadFormat === 'FLAC'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">FLAC</div>
                    <div className="text-xs text-gray-400">Lossless</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$1.00</div>
                </div>
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value="AIFF"
                    checked={downloadFormat === 'AIFF'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">AIFF (24-bit)</div>
                    <div className="text-xs text-gray-400">Apple uncompressed</div>
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
                    value="AAC"
                    checked={downloadFormat === 'AAC'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">AAC (256kbps)</div>
                    <div className="text-xs text-gray-400">High quality AAC</div>
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
                    value="OGG"
                    checked={downloadFormat === 'OGG'}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="text-crys-gold"
                  />
                  <div>
                    <div className="text-white text-sm">OGG (q8)</div>
                    <div className="text-xs text-gray-400">Vorbis</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">$0.00</div>
                </div>
              </label>

              {/* WAV 32-bit removed for Advanced: WAV is fixed to 24-bit in backend */}

            </div>
          </div>
        </div>

        {/* Pitch correction removed for Advanced export */}
      </div>

      {/* Credit Display removed for Advanced */}

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
              <span>Processing & Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Mastered Audio</span>
            </>
          )}
        </button>
        
        {/* Processing warning removed */}
        {originalFile && (
          <div className="mt-2 text-xs text-gray-400">
            Format: {downloadFormat === 'MP3' ? 'MP3 320kbps' : downloadFormat === 'FLAC' ? 'FLAC' : 'WAV 24-bit'} • Sample Rate: {sampleRate}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ExportGate;
