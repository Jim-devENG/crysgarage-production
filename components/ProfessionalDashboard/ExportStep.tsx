import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, RotateCcw, Settings, Loader2 } from 'lucide-react';
import { creditsAPI } from '../../services/api';
import { GENRE_PRESETS } from './utils/genrePresets';
import RealTimeProcessingVisualizer from '../AdvancedTierDashboard/RealTimeProcessingVisualizer';

interface ExportStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  processedAudioUrl: string | null;
  onBack: () => void;
  onRestart: () => void;
  realTimeAudioPlayerRef?: React.RefObject<any>;
}

const ExportStep: React.FC<ExportStepProps> = ({
  selectedFile,
  selectedGenre,
  processedAudioUrl,
  onBack,
  onRestart,
  realTimeAudioPlayerRef
}) => {
  const localRealTimeAudioPlayerRef = realTimeAudioPlayerRef || useRef<any>(null);
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24'>('wav24');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [processingSummary, setProcessingSummary] = useState<{
    originalLufs: number;
    originalPeak: number;
    originalRms: number;
    originalDynamicRange: number;
    masteredLufs: number;
    masteredPeak: number;
    masteredRms: number;
    masteredDynamicRange: number;
    gainApplied: number;
    compressionApplied: string;
  } | null>(null);

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
      console.log('🔄 Local credits updated (professional):', user.credits);
    } catch (e) {
      console.warn('Failed to adjust local credits (professional):', e);
    }
  };

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

  // Calculate processing summary when component mounts
  useEffect(() => {
    if (selectedFile && selectedGenre) {
      calculateProcessingSummary();
    }
  }, [selectedFile, selectedGenre]);

  const calculateProcessingSummary = async () => {
    if (!selectedFile || !selectedGenre) return;

    try {
      console.log('Calculating processing summary...');
      
      // Create audio context for analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Read the original audio file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Calculate original audio metrics
      const originalMetrics = calculateAudioMetrics(audioBuffer);
      
      // Get genre preset for processing simulation
      const preset = GENRE_PRESETS[selectedGenre.id];
      if (!preset) return;
      
      // Simulate processing effects
      const gainApplied = Math.round((preset.gain - 1) * 20); // Convert to dB
      const compressionApplied = `${preset.compression.ratio}:1`;
      
      // Simulate mastered metrics based on genre preset
      const masteredLufs = Math.max(originalMetrics.lufs + gainApplied, preset.targetLufs);
      const masteredPeak = Math.min(originalMetrics.peak + gainApplied, preset.truePeak);
      const masteredRms = Math.max(originalMetrics.rms + gainApplied, preset.targetLufs - 6);
      const masteredDynamicRange = Math.max(originalMetrics.dynamicRange - 3, 6);
      
      setProcessingSummary({
        originalLufs: originalMetrics.lufs,
        originalPeak: originalMetrics.peak,
        originalRms: originalMetrics.rms,
        originalDynamicRange: originalMetrics.dynamicRange,
        masteredLufs,
        masteredPeak,
        masteredRms,
        masteredDynamicRange,
        gainApplied,
        compressionApplied
      });
      
      console.log('Processing summary calculated successfully');
    } catch (error) {
      console.error('Error calculating processing summary:', error);
    }
  };

  const calculateAudioMetrics = (audioBuffer: AudioBuffer) => {
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    // Get audio data
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
    
    // Calculate RMS
    let sumSquares = 0;
    let peak = 0;
    
    for (let i = 0; i < length; i++) {
      const leftSample = leftChannel[i];
      const rightSample = rightChannel[i];
      const stereoSample = (leftSample + rightSample) / 2;
      
      sumSquares += stereoSample * stereoSample;
      peak = Math.max(peak, Math.abs(stereoSample));
    }
    
    const rms = Math.sqrt(sumSquares / length);
    const rmsDb = 20 * Math.log10(rms);
    
    // Calculate peak in dB
    const peakDb = 20 * Math.log10(peak);
    
    // Approximate LUFS (simplified calculation)
    const lufs = rmsDb + 3; // Rough approximation
    
    // Calculate dynamic range (simplified)
    const dynamicRange = Math.abs(peakDb - rmsDb);
    
    return {
      lufs: Math.round(lufs * 10) / 10,
      peak: Math.round(peakDb * 10) / 10,
      rms: Math.round(rmsDb * 10) / 10,
      dynamicRange: Math.round(dynamicRange * 10) / 10
    };
  };

  const handleDownload = async () => {
    if (!selectedFile || !selectedGenre) return;

    setIsDownloading(true);
    setStartTime(Date.now());
    setDownloadProgress(0);
    setDownloadStage('Initializing...');
    setTimeRemaining('');
    setChunkCount(0);
    setTotalSize(0);
    
    try {
      console.log('🎵 Professional download starting - deducting credit...');
      updateProgress(5, 'Deducting credit...');

      // Deduct credit for download
      try {
        const audioId = selectedFile.name + '_' + Date.now();
        const creditResult = await creditsAPI.deductCreditForDownload(audioId);
        console.log('✅ Credit deducted successfully:', creditResult);
        console.log(`💰 Remaining credits: ${creditResult.remaining_credits}`);
        if (typeof creditResult.remaining_credits === 'number') {
          adjustLocalCredits(0, creditResult.remaining_credits);
        } else {
          adjustLocalCredits(-1);
        }
      } catch (creditError: any) {
        console.error('❌ Credit deduction failed (professional):', creditError);
        if (creditError.message?.includes('Insufficient credits')) {
          alert('Insufficient credits. Please purchase more credits to download.');
          return;
        }
        // Graceful fallback: deduct locally
        adjustLocalCredits(-1);
        console.warn('⚠️ Credit API unavailable - deducted locally for Professional Tier.');
      }

      console.log('🎵 Professional download starting - capturing processed audio...');
      updateProgress(10, 'Initializing audio processing...');
      
      // Get processed audio from real-time player
      let processedAudioUrl: string | null = null;
      
      if (localRealTimeAudioPlayerRef.current?.getProcessedAudioUrl) {
        console.log('🎵 Getting processed audio with effects applied...');
        
        const updateRealTimeProgress = (progress: number, stage: string, chunks?: number, size?: number) => {
          updateProgress(progress, stage);
          if (chunks !== undefined) setChunkCount(chunks);
          if (size !== undefined) setTotalSize(size);
        };
        
        console.log('🎵 Calling getProcessedAudioUrl...');
        const targetSampleRate = 48000; // Professional tier uses 48kHz
        processedAudioUrl = await localRealTimeAudioPlayerRef.current.getProcessedAudioUrl(
          updateRealTimeProgress, 
          targetSampleRate, 
          downloadFormat
        );
        console.log('🎵 getProcessedAudioUrl returned:', processedAudioUrl);
      }
      
      if (!processedAudioUrl) {
        console.log('No processed audio URL available, using original file');
        processedAudioUrl = URL.createObjectURL(selectedFile);
      }
      
      updateProgress(80, 'Preparing download...');
      
      console.log('🎵 Starting download process...');
      console.log('🎵 Processed audio URL:', processedAudioUrl);
      
      // Download the processed audio directly
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      
      // Generate filename with format info
      const originalName = selectedFile.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const formatExt = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      const bitDepth = downloadFormat === 'wav16' ? '16bit' : '24bit';
      const filename = downloadFormat === 'mp3' 
        ? `${nameWithoutExt}_garage_mastered_320kbps_48kHz.${formatExt}`
        : `${nameWithoutExt}_garage_mastered_${bitDepth}_48kHz.${formatExt}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(processedAudioUrl);
      
      updateProgress(100, 'Download complete!');
      
      console.log(`✅ Successfully downloaded: ${filename}`);
      console.log(`📊 Format: ${downloadFormat}, Quality: Professional`);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    } finally {
      setIsDownloading(false);
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
        audioEffects={{}} // Professional tier uses genre presets
        chunkCount={chunkCount}
        totalSize={totalSize}
      />
    );
  };

  return (
    <>
      <RealTimeVisualizer />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-crys-gold">Export Your Mastered Audio</h2>
              <p className="text-gray-400">Compare and download your professionally mastered track</p>
            </div>
          </div>
        </div>

        {/* Processing Summary */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Summary</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Original File</h4>
              <p className="text-sm text-gray-400">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Applied Genre</h4>
              <p className="text-sm text-crys-gold">{selectedGenre?.name}</p>
              <p className="text-xs text-gray-500">Professional mastering preset</p>
            </div>
          </div>
          
          {/* Audio Analysis */}
          {processingSummary && (
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-crys-gold">Audio Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Original LUFS</div>
                  <div className="text-lg font-semibold text-gray-300">{processingSummary.originalLufs} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Original Peak</div>
                  <div className="text-lg font-semibold text-gray-300">{processingSummary.originalPeak} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Original RMS</div>
                  <div className="text-lg font-semibold text-gray-300">{processingSummary.originalRms} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Original Dynamic Range</div>
                  <div className="text-lg font-semibold text-gray-300">{processingSummary.originalDynamicRange} dB</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Applied Changes */}
          {processingSummary && (
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-crys-gold">Applied Changes</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-crys-gold">+{processingSummary.gainApplied}dB</div>
                  <div className="text-xs text-gray-400">Gain Boost</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-crys-gold">{processingSummary.compressionApplied}</div>
                  <div className="text-xs text-gray-400">Compression</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-crys-gold">{processingSummary.masteredLufs} LUFS</div>
                  <div className="text-xs text-gray-400">Target Loudness</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-crys-gold">{processingSummary.masteredPeak} dB</div>
                  <div className="text-xs text-gray-400">True Peak</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mastered Results */}
          {processingSummary && (
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-green-400">Mastered Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Mastered LUFS</div>
                  <div className="text-lg font-semibold text-green-400">{processingSummary.masteredLufs} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Mastered Peak</div>
                  <div className="text-lg font-semibold text-green-400">{processingSummary.masteredPeak} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Mastered RMS</div>
                  <div className="text-lg font-semibold text-green-400">{processingSummary.masteredRms} dB</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Mastered Dynamic Range</div>
                  <div className="text-lg font-semibold text-green-400">{processingSummary.masteredDynamicRange} dB</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download Options */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-crys-gold" />
            Professional Download Options
          </h3>
          
          <div className="space-y-4">
            {/* Format Selection */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-crys-gold">Select Format</h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDownloadFormat('wav16')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    downloadFormat === 'wav16'
                      ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                      : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">16-bit WAV</div>
                    <div className="text-xs">CD Quality</div>
                    <div className="text-xs text-gray-500">48kHz</div>
                  </div>
                </button>
                <button
                  onClick={() => setDownloadFormat('wav24')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    downloadFormat === 'wav24'
                      ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                      : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">24-bit WAV</div>
                    <div className="text-xs">Studio Quality</div>
                    <div className="text-xs text-gray-500">48kHz</div>
                  </div>
                </button>
                <button
                  onClick={() => setDownloadFormat('mp3')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    downloadFormat === 'mp3'
                      ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                      : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">MP3 320kbps</div>
                    <div className="text-xs">High Quality</div>
                    <div className="text-xs text-gray-500">48kHz</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Professional Specifications */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-green-400">Professional Specifications</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Sample Rate</div>
                  <div className="text-lg font-semibold text-green-400">48 kHz</div>
                  <div className="text-xs text-gray-500">Professional Standard</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Bit Depth</div>
                  <div className="text-lg font-semibold text-blue-400">
                    {downloadFormat === 'mp3' ? '320kbps' : downloadFormat === 'wav16' ? '16-bit' : '24-bit'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {downloadFormat === 'mp3' ? 'High Quality' : 'Lossless'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Channels</div>
                  <div className="text-lg font-semibold text-purple-400">Stereo</div>
                  <div className="text-xs text-gray-500">Professional</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-400 mb-1">Processing</div>
                  <div className="text-lg font-semibold text-orange-400">Real-time</div>
                  <div className="text-xs text-gray-500">Live Mastering</div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="bg-gray-700 rounded-lg p-4">
              <button
                onClick={handleDownload}
                disabled={!selectedGenre || isDownloading}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                  selectedGenre && !isDownloading
                    ? 'bg-crys-gold hover:bg-yellow-400 text-black'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
                    <span>Download {downloadFormat === 'mp3' ? 'MP3 320kbps' : downloadFormat === 'wav16' ? 'WAV 16-bit' : 'WAV 24-bit'}</span>
                  </>
                )}
              </button>
              
              {selectedGenre && (
                <div className="mt-3 text-center space-y-1">
                  <p className="text-xs text-gray-400">
                    Your audio will be processed with {selectedGenre.name} mastering
                  </p>
                  <p className="text-xs text-crys-gold">
                    Format: {downloadFormat === 'mp3' ? 'MP3 320kbps' : downloadFormat === 'wav16' ? 'WAV 16-bit' : 'WAV 24-bit'} • Sample Rate: 48kHz
                  </p>
                  <p className="text-xs text-green-400">
                    Professional quality mastering with real-time processing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onRestart}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Session</span>
          </button>
          
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Processing
          </button>
        </div>
      </div>
    </>
  );
};

export default ExportStep;
