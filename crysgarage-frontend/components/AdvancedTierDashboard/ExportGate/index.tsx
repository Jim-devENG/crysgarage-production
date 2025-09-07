import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Settings, Cpu, Loader2, CreditCard } from 'lucide-react';
import RealTimeProcessingVisualizer from '../RealTimeProcessingVisualizer';
import { creditsAPI } from '../../../services/api';

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
  meterData?: any;
  selectedGenre?: string;
  getProcessedAudioUrl?: (
    onProgress?: (progress: number, stage: string) => void,
    sampleRate?: number,
    format?: 'mp3' | 'wav16' | 'wav24' | 'wav32'
  ) => Promise<string | null>;
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
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz'>('44.1kHz');
  const [gTunerEnabled, setGTunerEnabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  // Helper: update local user credits and broadcast change
  const adjustLocalCredits = (delta: number, absolute?: number) => {
    try {
      const raw = localStorage.getItem('crysgarage_user');
      if (!raw) return;
      const user = JSON.parse(raw);
      if (typeof absolute === 'number') {
        user.credits = absolute;
      } else {
        user.credits = Math.max(0, (user.credits || 0) + delta);
      }
      localStorage.setItem('crysgarage_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('credits:updated', { detail: { credits: user.credits } }));
      console.log('🔄 Local credits updated (advanced):', user.credits);
    } catch (e) {
      console.warn('Failed to adjust local credits (advanced):', e);
    }
  };

  // Initialize G-Tuner state from audioEffects
  useEffect(() => {
    if (audioEffects?.gTuner) {
      setGTunerEnabled(audioEffects.gTuner.enabled || false);
    }
  }, [audioEffects]);

  // Calculate total cost
  const calculateTotalCost = () => {
    let cost = 0;
    
    // Format costs - higher bit depths cost more
    if (downloadFormat === 'wav24') cost += 1;
    if (downloadFormat === 'wav32') cost += 2;
    
    // Feature costs
    if (gTunerEnabled) cost += 3;
    
    return cost;
  };

  const totalCost = calculateTotalCost();

  // Progress tracking function
  const updateProgress = (progress: number, stage: string) => {
    setDownloadProgress(progress);
    setDownloadStage(stage);
    
    // Calculate time remaining
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const estimatedTotal = elapsed / (progress / 100);
      const remaining = estimatedTotal - elapsed;
      
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }
  };

  // Enhanced progress tracking for real-time processing
  const updateRealTimeProgress = (progress: number, stage: string, chunks?: number, size?: number) => {
    setDownloadProgress(progress);
    setDownloadStage(stage);
    
    if (chunks !== undefined) setChunkCount(chunks);
    if (size !== undefined) setTotalSize(size);
    
    // Calculate time remaining
    if (startTime) {
      const elapsed = Date.now() - startTime;
      const estimatedTotal = elapsed / (progress / 100);
      const remaining = estimatedTotal - elapsed;
      
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }
  };

  // G-Tuner toggle handler - actually applies the effect
  const handleGTunerToggle = (enabled: boolean) => {
    setGTunerEnabled(enabled);
    
    // Update the audio effects system with G-Tuner settings
    if (onUpdateEffectSettings) {
      onUpdateEffectSettings('gTuner', {
        enabled: enabled,
        frequency: 444, // 444Hz = +16 cents above standard 440Hz
        cents: 16 // +16 cents tuning
      });
    }
    
    console.log(`🎵 G-Tuner ${enabled ? 'ENABLED' : 'DISABLED'} - applying +16 cents pitch correction`);
    
    // Show visual feedback
    if (enabled) {
      console.log('✅ +16 cents pitch correction is now ACTIVE and applied to audio');
    } else {
      console.log('❌ +16 cents pitch correction DISABLED - audio returned to original pitch');
    }
  };

  // Download handler that captures the actual processed audio
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    setIsDownloading(true);
    setStartTime(Date.now());
    setDownloadProgress(0);
    setDownloadStage('Initializing...');
    setTimeRemaining('');
    setChunkCount(0);
    setTotalSize(0);
    
    try {
      console.log('🎵 Advanced download starting - deducting credit...');
      updateProgress(5, 'Deducting credit...');
      
      // Deduct credit for download
      try {
        const audioId = originalFile.name + '_' + Date.now(); // Generate unique ID
        const creditResult = await creditsAPI.deductCreditForDownload(audioId);
        console.log('✅ Credit deducted successfully:', creditResult);
        console.log(`💰 Remaining credits: ${creditResult.remaining_credits}`);
        if (typeof creditResult.remaining_credits === 'number') {
          adjustLocalCredits(0, creditResult.remaining_credits);
        } else {
          adjustLocalCredits(-1);
        }
      } catch (creditError: any) {
        console.error('❌ Credit deduction failed:', creditError);
        if (creditError.message?.includes('Insufficient credits')) {
          alert('Insufficient credits. Please purchase more credits to download.');
          return;
        }
        // Graceful fallback: deduct locally so UI stays consistent
        adjustLocalCredits(-1);
        console.warn('⚠️ Credit API unavailable - deducted locally for Advanced Tier.');
      }

      console.log('🎵 Advanced download starting - capturing processed audio...');
      updateProgress(10, 'Initializing audio processing...');
      
      // Get the processed audio URL from the mastering player
      let audioToDownload: File | Blob = originalFile;
      let audioUrl = URL.createObjectURL(originalFile);
      
      if (getProcessedAudioUrl) {
        try {
          updateProgress(15, 'Applying audio effects...');
          console.log('🎵 Getting processed audio with effects applied...');
          
          // Convert sample rate string to number
          const targetSampleRate = parseInt(sampleRate.replace('kHz', '')) * 1000;
          
          // Use enhanced real-time progress tracking with format conversion
          const processedAudioUrl = await getProcessedAudioUrl(
            (progress, stage) => {
              updateRealTimeProgress(progress, stage);
            },
            targetSampleRate,
            downloadFormat
          );
          
          if (processedAudioUrl) {
            const formatName = downloadFormat === 'mp3' ? 'MP3 320kbps' : 
                              downloadFormat === 'wav16' ? 'WAV 16-bit' :
                              downloadFormat === 'wav24' ? 'WAV 24-bit' : 'WAV 32-bit';
            updateProgress(60, `Converting to ${formatName} format...`);
            console.log('🎵 Got processed audio URL:', processedAudioUrl);
            
            // Fetch the processed audio blob
            const response = await fetch(processedAudioUrl);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch processed audio: ${response.status}`);
            }
            
            audioToDownload = await response.blob();
            audioUrl = URL.createObjectURL(audioToDownload);
            console.log('✅ Using processed audio with effects for download');
            console.log('Processed blob size:', audioToDownload.size, 'bytes');
            console.log('Original file size:', originalFile.size, 'bytes');
          } else {
            throw new Error('No processed audio available - processing failed');
          }
        } catch (error) {
          throw new Error(`Audio processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        throw new Error('Audio processing system not available');
      }
      
      updateProgress(80, 'Preparing download...');
      
      // Create download link with processed audio
      const link = document.createElement('a');
      link.href = audioUrl;
      
      // Generate filename with format info
      const originalName = originalFile.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const formatExt = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      const bitDepth = downloadFormat === 'wav16' ? '16bit' : 
                      downloadFormat === 'wav24' ? '24bit' : 
                      downloadFormat === 'wav32' ? '32bit' : '16bit';
      const sampleRateLabel = sampleRate.replace('kHz', 'k');
      
      const filename = downloadFormat === 'mp3' 
        ? `${nameWithoutExt}_garage_mastered_320kbps_${sampleRateLabel}.${formatExt}`
        : `${nameWithoutExt}_garage_mastered_${bitDepth}_${sampleRateLabel}.${formatExt}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(audioUrl);
      
      updateProgress(100, 'Download complete!');
      
      console.log(`✅ Successfully downloaded mastered audio: ${filename}`);
      console.log(`📊 Format: ${downloadFormat}, Sample Rate: ${sampleRate}, G-Tuner: ${gTunerEnabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🎵 Actual processing: ${parseInt(sampleRate.replace('kHz', '')) * 1000}Hz, ${downloadFormat} format with all effects applied`);
      
      // Success - no alert needed, user can see the download in their browser
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          alert('Download timed out. The audio file might be too large or the processing is taking too long. Please try again with a shorter audio file.');
        } else if (error.message.includes('AbortError')) {
          alert('Download was cancelled due to timeout. Please try again.');
        } else {
          alert(`Download failed: ${error.message}. Please try again.`);
        }
      } else {
        alert('An unexpected error occurred during download. Please try again.');
      }
    } finally {
      setIsDownloading(false);
      setChunkCount(0);
      setTotalSize(0);
    }
  };

  // Real-Time Processing Visualizer Component
  const RealTimeVisualizer = () => {
    if (!isDownloading) return null;

    return (
      <RealTimeProcessingVisualizer
        isProcessing={isDownloading}
        progress={downloadProgress}
        stage={downloadStage}
        timeRemaining={timeRemaining}
        audioEffects={audioEffects}
        chunkCount={chunkCount}
        totalSize={totalSize}
      />
    );
  };

  return (
    <>
      <RealTimeVisualizer />
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
                  <div className="text-white text-sm">$1.00</div>
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
            G-Tuner (+16 Tuning)
          </h4>
          <div className="bg-gray-900 rounded p-3 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm mb-0.5">Pitch Correction</div>
                <div className="text-xs text-gray-400">
                  {gTunerEnabled 
                    ? 'Mastered audio tuned to +16 cents' 
                    : 'Apply +16 cents pitch correction'
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
                  <div className="text-yellow-200 text-sm font-bold mb-0.5">+16 Cents</div>
                  <div className="text-yellow-300 text-xs">Pitch Correction Applied</div>
                  <div className="text-yellow-400 text-xs mt-0.5">✓ ACTIVE</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Display */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-crys-gold/10 border border-crys-gold/20 rounded-lg px-4 py-2">
          <CreditCard className="w-4 h-4 text-crys-gold" />
          <span className="text-sm text-crys-gold font-medium">
            Download Cost: <span className="text-crys-white">1 Credit</span>
          </span>
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
              <span>Processing & Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Mastered Audio</span>
            </>
          )}
        </button>
        
        {/* Processing time warning */}
        {!isDownloading && originalFile && (
          <div className="mt-3 text-xs text-gray-400 max-w-md mx-auto">
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-2">
              <div className="text-yellow-300 font-medium mb-1">⚠️ Processing Time</div>
              <div className="text-yellow-200">
                Large files may take 30-60 seconds to process. Please be patient and don't close the browser.
              </div>
            </div>
          </div>
        )}
        {gTunerEnabled && (
          <div className="mt-2 text-xs text-crys-gold">
            ✓ G-Tuner (+16 cents) applied to final export
          </div>
        )}
        {originalFile && (
          <div className="mt-2 text-xs text-gray-400">
            Format: {downloadFormat === 'mp3' ? 'MP3 320kbps' : 
                    downloadFormat === 'wav16' ? 'WAV 16-bit' :
                    downloadFormat === 'wav24' ? 'WAV 24-bit' : 'WAV 32-bit'} • Sample Rate: {sampleRate}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ExportGate;
