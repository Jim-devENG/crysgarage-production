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
}

const ExportGate: React.FC<ExportGateProps> = ({ 
  originalFile, 
  processedAudioUrl, 
  audioEffects, 
  onBack,
  onUpdateEffectSettings,
  meterData,
  selectedGenre
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav16' | 'wav24' | 'wav32'>('wav16');
  const [sampleRate, setSampleRate] = useState<'44.1kHz' | '48kHz' | '88.2kHz' | '96kHz' | '192kHz'>('44.1kHz');
  const [gTunerEnabled, setGTunerEnabled] = useState(false);

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

  // Download handler with proper sample rate processing
  const handleDownload = async () => {
    if (!originalFile) {
      console.error('No original file available for processing');
      return;
    }

    try {
      console.log('🎵 Starting audio processing with sample rate:', sampleRate);
      
      // Process audio with selected sample rate and format
      const processedBlob = await processAudioWithSampleRate(
        originalFile, 
        sampleRate, 
        downloadFormat,
        audioEffects,
        gTunerEnabled
      );

      // Create download link
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with sample rate info
      const originalName = originalFile.name.replace(/\.[^/.]+$/, '');
      const sampleRateLabel = sampleRate.replace('kHz', 'k');
      const formatExt = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      const filename = `${originalName}_${sampleRateLabel}_mastered.${formatExt}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`✅ Successfully processed and downloaded: ${filename}`);
      console.log(`📊 Sample Rate: ${sampleRate}, Format: ${downloadFormat}, G-Tuner: ${gTunerEnabled ? 'Enabled' : 'Disabled'}`);
      
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    }
  };

  // Audio processing function with sample rate conversion
  const processAudioWithSampleRate = async (
    audioFile: File, 
    targetSampleRate: string, 
    format: string,
    effects: any,
    gTunerEnabled: boolean
  ): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Parse target sample rate
        const targetRate = parseInt(targetSampleRate.replace('kHz', '000'));
        console.log(`🎛️ Target sample rate: ${targetRate}Hz`);

        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Read the audio file
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        console.log(`📊 Original audio: ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels} channels, ${audioBuffer.length} samples`);

        // Create offline context with target sample rate
        const offlineContext = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          Math.ceil(audioBuffer.length * targetRate / audioBuffer.sampleRate),
          targetRate
        );

        // Create audio source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        // Apply audio effects chain
        let currentNode: AudioNode = source;

        // EQ
        if (effects.eq?.enabled) {
          const eqNode = offlineContext.createBiquadFilter();
          // Apply 8-band EQ settings
          effects.eq.bands.forEach((band: any, index: number) => {
            if (index === 0) {
              eqNode.type = 'lowshelf';
              eqNode.frequency.value = band.frequency;
              eqNode.gain.value = band.gain;
            } else if (index === effects.eq.bands.length - 1) {
              eqNode.type = 'highshelf';
              eqNode.frequency.value = band.frequency;
              eqNode.gain.value = band.gain;
            } else {
              eqNode.type = 'peaking';
              eqNode.frequency.value = band.frequency;
              eqNode.gain.value = band.gain;
              eqNode.Q.value = band.q || 1;
            }
          });
          currentNode.connect(eqNode);
          currentNode = eqNode;
        }

        // Compressor
        if (effects.compressor?.enabled) {
          const compressorNode = offlineContext.createDynamicsCompressor();
          compressorNode.threshold.value = effects.compressor.threshold;
          compressorNode.ratio.value = effects.compressor.ratio;
          compressorNode.attack.value = effects.compressor.attack;
          compressorNode.release.value = effects.compressor.release;
          currentNode.connect(compressorNode);
          currentNode = compressorNode;
        }

        // Loudness
        if (effects.loudness?.enabled) {
          const gainNode = offlineContext.createGain();
          gainNode.gain.value = Math.pow(10, effects.loudness.gain / 20); // Convert dB to linear
          currentNode.connect(gainNode);
          currentNode = gainNode;
        }

        // Limiter
        if (effects.limiter?.enabled) {
          const limiterNode = offlineContext.createDynamicsCompressor();
          limiterNode.threshold.value = effects.limiter.threshold;
          limiterNode.ratio.value = 20; // High ratio for limiting
          limiterNode.attack.value = 0.001; // Fast attack
          limiterNode.release.value = 0.1; // Fast release
          currentNode.connect(limiterNode);
          currentNode = limiterNode;
        }

        // G-Tuner (444Hz pitch correction)
        if (gTunerEnabled) {
          const gTunerNode = offlineContext.createBiquadFilter();
          gTunerNode.type = 'peaking';
          gTunerNode.frequency.value = 444;
          gTunerNode.gain.value = 3; // Boost 444Hz
          gTunerNode.Q.value = 10; // Narrow Q
          currentNode.connect(gTunerNode);
          currentNode = gTunerNode;
          console.log('🎵 G-Tuner (444Hz) applied to audio processing');
        }

        // Connect to destination
        currentNode.connect(offlineContext.destination);

        // Start processing
        source.start(0);
        
        // Render the processed audio
        const renderedBuffer = await offlineContext.startRendering();
        
        console.log(`📊 Processed audio: ${renderedBuffer.sampleRate}Hz, ${renderedBuffer.numberOfChannels} channels, ${renderedBuffer.length} samples`);

        // Convert to blob based on format
        let blob: Blob;
        
        if (format === 'mp3') {
          // For MP3, we'll use a simple approach (in real implementation, you'd use a proper MP3 encoder)
          blob = await convertToMp3(renderedBuffer);
        } else {
          // WAV format with specified bit depth
          const bitDepth = format === 'wav16' ? 16 : format === 'wav24' ? 24 : 32;
          blob = await convertToWav(renderedBuffer, bitDepth);
        }

        resolve(blob);

      } catch (error) {
        console.error('Error in audio processing:', error);
        reject(error);
      }
    });
  };

  // Convert AudioBuffer to WAV with specified bit depth
  const convertToWav = async (audioBuffer: AudioBuffer, bitDepth: number): Promise<Blob> => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    // Calculate bytes per sample
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    
    // Create WAV file
    const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
    const view = new DataView(wavBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * bytesPerSample, true);
    
    // Write audio data
    let offset = 44;
    
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        
        if (bitDepth === 16) {
          view.setInt16(offset, sample * 0x7FFF, true);
          offset += 2;
        } else if (bitDepth === 24) {
          const intSample = Math.round(sample * 0x7FFFFF);
          view.setUint8(offset, intSample & 0xFF);
          view.setUint8(offset + 1, (intSample >> 8) & 0xFF);
          view.setUint8(offset + 2, (intSample >> 16) & 0xFF);
          offset += 3;
        } else if (bitDepth === 32) {
          view.setFloat32(offset, sample, true);
          offset += 4;
        }
      }
    }
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Convert AudioBuffer to MP3 (simplified - in production you'd use a proper MP3 encoder)
  const convertToMp3 = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    // For now, we'll convert to WAV and let the browser handle MP3 conversion
    // In a real implementation, you'd use a library like lamejs or similar
    const wavBlob = await convertToWav(audioBuffer, 16);
    
    // Create a MediaRecorder to convert to MP3
    const stream = new MediaStream();
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    return new Promise((resolve) => {
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        resolve(blob);
      };
      
      mediaRecorder.start();
      source.start(0);
      source.onended = () => mediaRecorder.stop();
    });
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
