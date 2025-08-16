import React, { useState, useRef, useEffect } from 'react';
import { Download, ArrowLeft, Play, Pause, Volume2, Settings, Cpu } from 'lucide-react';

interface ExportGateProps {
  originalFile: File | null;
  processedAudioUrl: string | null;
  audioEffects: any;
  onBack: () => void;
  onUpdateEffectSettings?: (effectType: string, settings: any) => void;
}

const ExportGate: React.FC<ExportGateProps> = ({ 
  originalFile, 
  processedAudioUrl, 
  audioEffects, 
  onBack,
  onUpdateEffectSettings
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24' | 'wav32'>('wav16');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [gTunerEnabled, setGTunerEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create URL for audio playback (use processedAudioUrl as the mastered audio)
  const audioUrl = processedAudioUrl || (originalFile ? URL.createObjectURL(originalFile) : null);

  // Initialize G-Tuner state from audioEffects
  useEffect(() => {
    if (audioEffects?.gTuner) {
      setGTunerEnabled(audioEffects.gTuner.enabled || false);
    }
  }, [audioEffects]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrl && !processedAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, processedAudioUrl]);

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

  // Audio playback handler
  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing mastered audio:', error);
    }
  };

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioReady(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Download handler
  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
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
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
      )}

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

      {/* Audio Player */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                 <div className="flex items-center justify-between mb-3">
           <h3 className="text-md font-semibold text-white flex items-center">
             <Volume2 className="w-4 h-4 mr-2" />
             Mastered Audio
           </h3>
          <div className="text-xs text-gray-400">
            {gTunerEnabled ? '6 Effects Active' : '5 Effects Active'}
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">File: {originalFile?.name}</span>
            <button
              onClick={handlePlayPause}
              disabled={!audioReady}
              className={`p-1.5 rounded transition-colors ${
                audioReady 
                  ? 'bg-crys-gold hover:bg-yellow-400' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-gray-900" />
              ) : (
                <Play className="w-3 h-3 text-gray-900" />
              )}
            </button>
          </div>
          <div className="w-full bg-gray-800 rounded h-1.5">
            <div className="bg-crys-gold h-1.5 rounded" style={{ width: `${getProgressPercentage(currentTime, duration)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

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
          className="bg-crys-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          <span>Download Mastered Audio</span>
        </button>
        {gTunerEnabled && (
          <div className="mt-2 text-xs text-crys-gold">
            ✓ G-Tuner (444Hz) applied to final export
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportGate;
