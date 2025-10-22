import React, { useState, useRef, useEffect } from 'react';
import { Download, ArrowLeft, Play, Pause, Volume2, Settings, DollarSign, Cpu } from 'lucide-react';

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
  const [originalCurrentTime, setOriginalCurrentTime] = useState(0);
  const [processedCurrentTime, setProcessedCurrentTime] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [processedDuration, setProcessedDuration] = useState(0);
  const [originalAudioReady, setOriginalAudioReady] = useState(false);
  const [processedAudioReady, setProcessedAudioReady] = useState(false);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const processedAudioRef = useRef<HTMLAudioElement>(null);

  // Create URLs for audio playback
  const originalAudioUrl = originalFile ? URL.createObjectURL(originalFile) : null;
  
  console.log('ExportGate - Original file:', originalFile);
  console.log('ExportGate - Original audio URL:', originalAudioUrl);
  console.log('ExportGate - Processed audio URL:', processedAudioUrl);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalAudioUrl) {
        URL.revokeObjectURL(originalAudioUrl);
      }
    };
  }, [originalAudioUrl]);

  // Stop other audio when one starts playing
  const stopOtherAudio = (isOriginal: boolean) => {
    if (isOriginal) {
      if (processedAudioRef.current && !processedAudioRef.current.paused) {
        processedAudioRef.current.pause();
        setIsPlayingProcessed(false);
      }
    } else {
      if (originalAudioRef.current && !originalAudioRef.current.paused) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      }
    }
  };

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

  // Audio playback handlers
  const handleOriginalPlayPause = async () => {
    console.log('Original play/pause clicked');
    console.log('Original audio ref:', originalAudioRef.current);
    console.log('Original audio URL:', originalAudioUrl);
    console.log('Original audio ready:', originalAudioReady);
    
    if (!originalAudioRef.current || !originalAudioUrl) {
      console.error('Original audio not available');
      return;
    }

    try {
      if (isPlayingOriginal) {
        console.log('Pausing original audio');
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      } else {
        console.log('Playing original audio');
        stopOtherAudio(true);
        await originalAudioRef.current.play();
        setIsPlayingOriginal(true);
      }
    } catch (error) {
      console.error('Error playing original audio:', error);
    }
  };

  const handleProcessedPlayPause = async () => {
    console.log('Processed play/pause clicked');
    console.log('Processed audio ref:', processedAudioRef.current);
    console.log('Processed audio URL:', processedAudioUrl);
    console.log('Processed audio ready:', processedAudioReady);
    
    if (!processedAudioRef.current || !processedAudioUrl) {
      console.error('Processed audio not available');
      return;
    }

    try {
      if (isPlayingProcessed) {
        console.log('Pausing processed audio');
        processedAudioRef.current.pause();
        setIsPlayingProcessed(false);
      } else {
        console.log('Playing processed audio');
        stopOtherAudio(false);
        await processedAudioRef.current.play();
        setIsPlayingProcessed(true);
      }
    } catch (error) {
      console.error('Error playing processed audio:', error);
    }
  };

  // Audio event handlers
  const handleOriginalTimeUpdate = () => {
    if (originalAudioRef.current) {
      setOriginalCurrentTime(originalAudioRef.current.currentTime);
    }
  };

  const handleProcessedTimeUpdate = () => {
    if (processedAudioRef.current) {
      setProcessedCurrentTime(processedAudioRef.current.currentTime);
    }
  };

  const handleOriginalLoadedMetadata = () => {
    if (originalAudioRef.current) {
      setOriginalDuration(originalAudioRef.current.duration);
      setOriginalAudioReady(true);
      console.log('Original audio metadata loaded');
    }
  };

  const handleProcessedLoadedMetadata = () => {
    if (processedAudioRef.current) {
      setProcessedDuration(processedAudioRef.current.duration);
      setProcessedAudioReady(true);
      console.log('Processed audio metadata loaded');
    }
  };

  const handleOriginalEnded = () => {
    setIsPlayingOriginal(false);
    setOriginalCurrentTime(0);
  };

  const handleProcessedEnded = () => {
    setIsPlayingProcessed(false);
    setProcessedCurrentTime(0);
  };

  const handleOriginalError = (error: any) => {
    console.error('Original audio error:', error);
    setOriginalAudioReady(false);
  };

  const handleProcessedError = (error: any) => {
    console.error('Processed audio error:', error);
    setProcessedAudioReady(false);
  };

  // Download handler
  const handleDownload = () => {
    console.log('Download clicked with settings:', {
      format: downloadFormat,
      sampleRate,
      gSurroundEnabled,
      gTunerEnabled,
      totalCost
    });

    // Create a download link for the processed audio
    if (processedAudioUrl) {
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      link.download = `mastered_audio.${downloadFormat === 'mp3' ? 'mp3' : 'wav'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (current: number, duration: number) => {
    return duration > 0 ? (current / duration) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Hidden audio elements */}
      {originalAudioUrl && (
        <audio
          ref={originalAudioRef}
          src={originalAudioUrl}
          onTimeUpdate={handleOriginalTimeUpdate}
          onLoadedMetadata={handleOriginalLoadedMetadata}
          onEnded={handleOriginalEnded}
          onError={handleOriginalError}
          onLoadStart={() => console.log('Original audio load started')}
          onCanPlay={() => console.log('Original audio can play')}
          onCanPlayThrough={() => console.log('Original audio can play through')}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      {processedAudioUrl && (
        <audio
          ref={processedAudioRef}
          src={processedAudioUrl}
          onTimeUpdate={handleProcessedTimeUpdate}
          onLoadedMetadata={handleProcessedLoadedMetadata}
          onEnded={handleProcessedEnded}
          onError={handleProcessedError}
          onLoadStart={() => console.log('Processed audio load started')}
          onCanPlay={() => console.log('Processed audio can play')}
          onCanPlayThrough={() => console.log('Processed audio can play through')}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}

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

      {/* G-Tuner Section - Prominent Display */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-crys-gold" />
          G-Tuner (444Hz Reference)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* G-Tuner Control */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Pitch Correction</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={gTunerEnabled}
                  onChange={(e) => setGTunerEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-sm">Enable</span>
              </label>
            </div>
            
            {gTunerEnabled && (
              <div className="bg-gradient-to-r from-yellow-800 to-yellow-900 rounded-lg p-4 border border-yellow-600">
                <div className="text-center">
                  <div className="text-yellow-200 text-2xl font-bold mb-2">444 Hz</div>
                  <div className="text-yellow-300 text-sm mb-1">Reference Frequency</div>
                  <div className="text-yellow-400 text-xs">Auto-Applied on Export</div>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-400">
              Automatically corrects pitch to 444Hz reference frequency for optimal tuning
            </div>
          </div>

          {/* Preview with G-Tuner */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Preview with G-Tuner</h4>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Audio Preview</span>
              <button
                onClick={handleProcessedPlayPause}
                disabled={!processedAudioReady}
                className={`p-2 rounded-lg transition-colors ${
                  processedAudioReady 
                    ? 'bg-crys-gold hover:bg-yellow-400' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPlayingProcessed ? (
                  <Pause className="w-4 h-4 text-gray-900" />
                ) : (
                  <Play className="w-4 h-4 text-gray-900" />
                )}
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded-lg h-2">
              <div className="bg-crys-gold h-2 rounded-lg" style={{ width: `${getProgressPercentage(processedCurrentTime, processedDuration)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(processedCurrentTime)}</span>
              <span>{formatTime(processedDuration)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {gTunerEnabled ? 'G-Tuner applied to preview' : 'G-Tuner will be applied on export'}
            </div>
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
            {!originalAudioReady && originalAudioUrl && (
              <span className="ml-2 text-xs text-yellow-400">Loading...</span>
            )}
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm ${originalAudioReady ? 'text-green-400' : 'text-yellow-400'}`}>
                  {originalAudioReady ? 'Ready' : 'Loading...'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Audio Preview</span>
                <button
                  onClick={handleOriginalPlayPause}
                  disabled={!originalAudioReady}
                  className={`p-2 rounded-lg transition-colors ${
                    originalAudioReady 
                      ? 'bg-crys-gold hover:bg-yellow-400' 
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isPlayingOriginal ? (
                    <Pause className="w-4 h-4 text-gray-900" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              </div>
              <div className="w-full bg-gray-800 rounded-lg h-2">
                <div className="bg-crys-gold h-2 rounded-lg" style={{ width: `${getProgressPercentage(originalCurrentTime, originalDuration)}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(originalCurrentTime)}</span>
                <span>{formatTime(originalDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Processed Audio */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Processed Audio
            {!processedAudioReady && processedAudioUrl && (
              <span className="ml-2 text-xs text-yellow-400">Loading...</span>
            )}
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm ${processedAudioReady ? 'text-green-400' : 'text-yellow-400'}`}>
                  {processedAudioReady ? 'Ready' : 'Loading...'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Audio Preview</span>
                <button
                  onClick={handleProcessedPlayPause}
                  disabled={!processedAudioReady}
                  className={`p-2 rounded-lg transition-colors ${
                    processedAudioReady 
                      ? 'bg-crys-gold hover:bg-yellow-400' 
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isPlayingProcessed ? (
                    <Pause className="w-4 h-4 text-gray-900" />
                  ) : (
                    <Play className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              </div>
              <div className="w-full bg-gray-800 rounded-lg h-2">
                <div className="bg-crys-gold h-2 rounded-lg" style={{ width: `${getProgressPercentage(processedCurrentTime, processedDuration)}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(processedCurrentTime)}</span>
                <span>{formatTime(processedDuration)}</span>
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
                  <div>
                    <div className="text-white font-medium">MP3</div>
                    <div className="text-sm text-gray-400">Compressed, smaller file</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$0.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">WAV 16-bit</div>
                    <div className="text-sm text-gray-400">CD quality, uncompressed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$0.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">WAV 24-bit</div>
                    <div className="text-sm text-gray-400">Studio quality, high dynamic range</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$0.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">WAV 32-bit</div>
                    <div className="text-sm text-gray-400">Maximum quality, floating point</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$2.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">44.1 kHz</div>
                    <div className="text-sm text-gray-400">CD standard</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$0.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">48 kHz</div>
                    <div className="text-sm text-gray-400">Professional standard</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$0.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">88.2 kHz</div>
                    <div className="text-sm text-gray-400">High resolution</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$3.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">96 kHz</div>
                    <div className="text-sm text-gray-400">Ultra high resolution</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$5.00</div>
                </div>
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
                  <div>
                    <div className="text-white font-medium">192 kHz</div>
                    <div className="text-sm text-gray-400">Maximum resolution</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">$10.00</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-white mb-4">Additional Features</h4>
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
                  <div className="text-white font-medium">G-Surround</div>
                  <div className="text-sm text-gray-400">5.1 surround sound encoding</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">$5.00</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          <span>Download Mastered Audio</span>
        </button>
        {gTunerEnabled && (
          <div className="mt-2 text-sm text-crys-gold">
            ✓ G-Tuner (444Hz) will be applied to final export
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportGate;
