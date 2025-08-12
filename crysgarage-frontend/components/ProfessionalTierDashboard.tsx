
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, ArrowRight, ArrowLeft, Download, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Genre {
  name: string;
  description: string;
  color: string;
}

interface ProcessingSettings {
  sampleRate: '44.1kHz' | '48kHz';
  resolution: '16bit' | '32bit';
}

interface ProfessionalTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

const ProfessionalTierDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    sampleRate: '44.1kHz',
    resolution: '16bit'
  });
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>('wav');
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);

  // Pop genre preset with free tier processing details
  const POP_PRESET = {
    sampleRate: '44.1kHz' as const,
    resolution: '16bit' as const,
    // Free tier processing settings
    gain: 1.5, // Boost volume by 50%
    compression: {
      threshold: -20,
      knee: 10,
      ratio: 3,
      attack: 0.003,
      release: 0.25
    },
    eq: {
      low: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      high: 0,
      presence: 0,
      air: 0,
      sub: 0
    }
  };

  const applyPopPreset = () => {
    setProcessingSettings({
      sampleRate: POP_PRESET.sampleRate,
      resolution: POP_PRESET.resolution
    });
    console.log('Applied Pop preset:', POP_PRESET);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processAudioWithPopPreset = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Starting Pop preset audio processing...');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(URL.createObjectURL(selectedFile));
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log('Audio decoded, creating offline context...');
      
      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Create source from the audio buffer
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Apply Pop preset processing
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = POP_PRESET.gain; // 50% volume boost
      
      // Add compression with Pop preset settings
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = POP_PRESET.compression.threshold;
      compressor.knee.value = POP_PRESET.compression.knee;
      compressor.ratio.value = POP_PRESET.compression.ratio;
      compressor.attack.value = POP_PRESET.compression.attack;
      compressor.release.value = POP_PRESET.compression.release;
      
      // Connect the processing chain
      source.connect(compressor).connect(gainNode).connect(offlineContext.destination);
      
      console.log('Starting rendering with Pop preset...');
      source.start(0);
      
      // Render the processed audio
      const renderedBuffer = await offlineContext.startRendering();
      
      console.log('Rendering complete, converting to WAV...');
      // Convert to WAV and create URL
      const wavBlob = await audioBufferToWav(renderedBuffer);
      const masteredUrl = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(masteredUrl);
      
      console.log('Pop preset mastered audio created successfully:', masteredUrl);
      audioContext.close();
      
    } catch (error) {
      console.error('Error processing audio with Pop preset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleDownload = () => {
    if (processedAudioUrl) {
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      link.download = `mastered_${selectedFile?.name.replace(/\.[^\/.]+$/, '')}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold text-crys-gold mb-4">Professional Tier Dashboard</h1>
        <p className="text-gray-400">Step {currentStep} of 5</p>
        
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
              <p className="text-gray-400 text-lg">Select your audio file to begin professional mastering</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-crys-gold transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Drop your audio file here</h3>
                <p className="text-gray-400 mb-6">Supports WAV, MP3, FLAC, and other audio formats</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-8 space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <FileAudio className="w-8 h-8 text-crys-gold" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedFile.name}</h4>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={nextStep}
                        className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Select Genre</h2>
              <p className="text-gray-400 text-lg">Choose the genre that best matches your audio for optimal mastering</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="max-w-md mx-auto">
                  <button
                    onClick={() => {
                      setSelectedGenre({ name: 'Pop', description: 'Mainstream, radio-friendly', color: 'bg-pink-500' });
                      applyPopPreset();
                      // Move to the next step automatically once Pop is chosen
                      setCurrentStep(3);
                    }}
                    className="p-8 rounded-xl border-2 border-crys-gold bg-crys-gold/10 transition-all duration-300 text-center w-full"
                  >
                    <div className="w-16 h-16 bg-pink-500 rounded-lg mb-6 mx-auto"></div>
                    <h3 className="text-2xl font-semibold mb-3">Pop</h3>
                    <p className="text-gray-400 mb-4">Mainstream, radio-friendly mastering</p>
                    <div className="text-sm text-crys-gold">
                      <p>• 50% volume boost</p>
                      <p>• Professional compression</p>
                      <p>• Radio-ready loudness</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {selectedGenre && (
                <div className="mt-8 flex justify-center space-x-4">
                  <button
                    onClick={prevStep}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Processing Settings</h2>
              <p className="text-gray-400 text-lg">Configure your audio processing parameters</p>
              {selectedGenre && (
                <p className="text-sm text-crys-gold mt-2">
                  Preset applied for {selectedGenre.name}: {processingSettings.sampleRate}, {processingSettings.resolution}
                </p>
              )}
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Sample Rate</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(['44.1kHz', '48kHz'] as const).map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setProcessingSettings(prev => ({ ...prev, sampleRate: rate }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            processingSettings.sampleRate === rate
                              ? 'border-crys-gold bg-crys-gold/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold">{rate}</div>
                            <div className="text-sm text-gray-400">
                              {rate === '44.1kHz' ? 'CD Quality' : 'Professional Quality'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Resolution</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(['16bit', '32bit'] as const).map((resolution) => (
                        <button
                          key={resolution}
                          onClick={() => setProcessingSettings(prev => ({ ...prev, resolution }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            processingSettings.resolution === resolution
                              ? 'border-crys-gold bg-crys-gold/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold">{resolution}</div>
                            <div className="text-sm text-gray-400">
                              {resolution === '16bit' ? 'Standard Quality' : 'High Quality'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
                             <div className="mt-8 flex justify-center space-x-4">
                 <button
                   onClick={prevStep}
                   className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   <span>Back</span>
                 </button>
                 <button
                   onClick={async () => {
                     await processAudioWithPopPreset();
                     setCurrentStep(4);
                   }}
                   disabled={isProcessing}
                   className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                       <span>Processing...</span>
                     </>
                   ) : (
                     <>
                       <span>Process Audio</span>
                       <ArrowRight className="w-4 h-4" />
                     </>
                   )}
                 </button>
               </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Before & After Comparison</h2>
              <p className="text-gray-400 text-lg">Compare your original audio with the Pop preset mastered version</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Original Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">Original Audio</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">File</span>
                        <span className="text-sm font-medium">{selectedFile?.name}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Size</span>
                        <span className="text-sm font-medium">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    
                    <audio
                      ref={(el) => setOriginalAudioElement(el)}
                      controls
                      className="w-full"
                      src={selectedFile ? URL.createObjectURL(selectedFile) : undefined}
                      onPlay={() => {
                        setIsPlayingOriginal(true);
                        if (masteredAudioElement) masteredAudioElement.pause();
                        setIsPlayingMastered(false);
                      }}
                      onPause={() => setIsPlayingOriginal(false)}
                    />
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Original, unprocessed audio</p>
                    </div>
                  </div>
                </div>

                {/* Mastered Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center text-crys-gold">Pop Preset Mastered</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Processing</span>
                        <span className="text-sm font-medium text-crys-gold">Pop Preset Applied</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Gain</span>
                        <span className="text-sm font-medium text-crys-gold">+50%</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Compression</span>
                        <span className="text-sm font-medium text-crys-gold">Radio Ready</span>
                      </div>
                    </div>
                    
                    {processedAudioUrl ? (
                      <audio
                        ref={(el) => setMasteredAudioElement(el)}
                        controls
                        className="w-full"
                        src={processedAudioUrl}
                        onPlay={() => {
                          setIsPlayingMastered(true);
                          if (originalAudioElement) originalAudioElement.pause();
                          setIsPlayingOriginal(false);
                        }}
                        onPause={() => setIsPlayingMastered(false)}
                      />
                    ) : (
                      <div className="bg-gray-700 rounded-lg p-8 text-center">
                        <div className="w-8 h-8 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Processing audio...</p>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="text-sm text-crys-gold">Mastered with Pop preset</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={prevStep}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  disabled={!processedAudioUrl}
                  className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <span>Continue to Download</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Download Your Mastered Audio</h2>
              <p className="text-gray-400 text-lg">Choose your preferred format and download</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Download Format</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(['wav', 'mp3'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setDownloadFormat(format)}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            downloadFormat === format
                              ? 'border-crys-gold bg-crys-gold/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-semibold uppercase">{format}</div>
                            <div className="text-sm text-gray-400">
                              {format === 'wav' ? 'Lossless Quality' : 'Compressed Format'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    disabled={!processedAudioUrl}
                    className="w-full bg-crys-gold text-black py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Mastered Audio</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={prevStep}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTierDashboard;
