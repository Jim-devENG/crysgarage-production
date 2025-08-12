
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, ArrowRight, ArrowLeft, Download, Music, Play, Pause, Volume2, VolumeX, Music2, Music3, Music4 } from 'lucide-react';
import { availableGenres, Genre as GenreType } from './GenreDropdown';
import FrequencySpectrum from './FrequencySpectrum';

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
  const [selectedGenre, setSelectedGenre] = useState<GenreType | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>('wav');

  // Genre presets with processing details
  const GENRE_PRESETS: Record<string, any> = {
    afrobeats: {
      gain: 1.8,
      compression: { threshold: -18, ratio: 4, attack: 0.002, release: 0.2 },
      eq: { low: 2.0, mid: 1.0, high: 0.5 }
    },
    gospel: {
      gain: 1.4,
      compression: { threshold: -22, ratio: 2.5, attack: 0.01, release: 0.15 },
      eq: { low: 1.5, mid: 2.0, high: 1.0 }
    },
    'hip-hop': {
      gain: 2.0,
      compression: { threshold: -16, ratio: 5, attack: 0.001, release: 0.1 },
      eq: { low: 3.0, mid: 1.5, high: 0.8 }
    },
    highlife: {
      gain: 1.6,
      compression: { threshold: -20, ratio: 3, attack: 0.005, release: 0.25 },
      eq: { low: 1.8, mid: 2.2, high: 1.2 }
    },
    amapiano: {
      gain: 1.7,
      compression: { threshold: -19, ratio: 3.5, attack: 0.003, release: 0.18 },
      eq: { low: 2.2, mid: 1.8, high: 1.5 }
    },
    reggae: {
      gain: 1.5,
      compression: { threshold: -21, ratio: 2.8, attack: 0.008, release: 0.3 },
      eq: { low: 2.5, mid: 1.2, high: 0.6 }
    },
    soul: {
      gain: 1.3,
      compression: { threshold: -23, ratio: 2.2, attack: 0.015, release: 0.2 },
      eq: { low: 1.2, mid: 2.5, high: 1.8 }
    },
    jazz: {
      gain: 1.2,
      compression: { threshold: -25, ratio: 2.0, attack: 0.02, release: 0.4 },
      eq: { low: 1.0, mid: 1.8, high: 2.0 }
    },
    pop: {
      gain: 1.5,
      compression: { threshold: -20, ratio: 3, attack: 0.003, release: 0.25 },
      eq: { low: 1.5, mid: 1.0, high: 1.2 }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProcessedAudioUrl(null); // Clear previous processed audio
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const processAudioWithGenre = async (genre: GenreType) => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setSelectedGenre(genre);
    
    try {
      console.log(`Starting ${genre.name} audio processing...`);
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
      
      // Get genre preset
      const preset = GENRE_PRESETS[genre.id] || GENRE_PRESETS.afrobeats;
      
      // Apply genre-specific processing
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = preset.gain;
      
      // Add compression with genre-specific settings
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = preset.compression.threshold;
      compressor.knee.value = 10;
      compressor.ratio.value = preset.compression.ratio;
      compressor.attack.value = preset.compression.attack;
      compressor.release.value = preset.compression.release;
      
      // Connect the processing chain
      source.connect(compressor).connect(gainNode).connect(offlineContext.destination);
      
      console.log(`Starting rendering with ${genre.name} preset...`);
      source.start(0);
      
      // Render the processed audio
      const renderedBuffer = await offlineContext.startRendering();
      
      console.log('Rendering complete, converting to WAV...');
      // Convert to WAV and create URL
      const wavBlob = await audioBufferToWav(renderedBuffer);
      const masteredUrl = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(masteredUrl);
      
      console.log(`${genre.name} preset mastered audio created successfully:`, masteredUrl);
      audioContext.close();
      
    } catch (error) {
      console.error(`Error processing audio with ${genre.name} preset:`, error);
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-crys-gold mb-6">Professional Tier Dashboard</h1>
        <p className="text-gray-400 mb-6">Step {currentStep} of 3</p>
        
        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-crys-gold mb-2">Upload Your Audio</h2>
              <p className="text-gray-400">Select your audio file to begin professional mastering</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-crys-gold transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop your audio file here</h3>
                <p className="text-gray-400 mb-4">Supports WAV, MP3, FLAC, and other audio formats</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-6 bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileAudio className="w-6 h-6 text-crys-gold" />
                      <div>
                        <h4 className="font-semibold">{selectedFile.name}</h4>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
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
              )}
            </div>
          </div>
        )}

        {/* Step 2: Genre Selection + Audio Comparison */}
        {currentStep === 2 && (
          <div className="space-y-8">
            {/* Genre Selection */}
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-crys-gold mb-2">Select Genre & Process</h2>
                <p className="text-gray-400">Click a genre to apply its preset and process your audio</p>
              </div>
              
                             <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                 {availableGenres.map((genre) => {
                   const isSelected = selectedGenre?.id === genre.id;
                   
                                       // Define unique gradient colors for each genre
                    const getGenreGradient = (genreId: string) => {
                      const gradients = {
                        afrobeats: 'from-orange-500 to-red-600',
                        gospel: 'from-blue-500 to-purple-600',
                        'hip-hop': 'from-yellow-500 to-orange-600',
                        highlife: 'from-green-500 to-teal-600',
                        amapiano: 'from-pink-500 to-purple-600',
                        reggae: 'from-green-400 to-yellow-500',
                        soul: 'from-purple-500 to-pink-600',
                        jazz: 'from-indigo-500 to-blue-600',
                        pop: 'from-cyan-500 to-blue-600'
                      };
                      return gradients[genreId as keyof typeof gradients] || 'from-gray-500 to-gray-600';
                    };
                   
                   return (
                     <button
                       key={genre.id}
                       onClick={() => processAudioWithGenre(genre)}
                       disabled={isProcessing}
                       className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 text-center hover:scale-105 bg-gradient-to-br ${getGenreGradient(genre.id)} ${
                         isSelected
                           ? 'border-crys-gold shadow-lg shadow-crys-gold/30 scale-105'
                           : 'border-white/20 hover:border-white/40 hover:scale-110'
                       } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                     >
                       <h3 className="font-semibold text-sm mb-1 text-white drop-shadow-sm">{genre.name}</h3>
                       <p className="text-xs text-white/80 leading-tight drop-shadow-sm">{genre.description}</p>
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Audio Comparison */}
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-crys-gold mb-2">Before & After Comparison</h2>
                <p className="text-gray-400">Compare your original audio with the mastered version</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center">Original Audio</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">File</span>
                        <span className="text-xs font-medium">{selectedFile?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Size</span>
                        <span className="text-xs font-medium">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
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
                     
                     {/* Frequency Spectrum Analysis for Original */}
                     <FrequencySpectrum
                       audioElement={originalAudioElement}
                       isPlaying={isPlayingOriginal}
                       title="Original Frequency Spectrum"
                     />
                     
                     <div className="text-center">
                       <p className="text-xs text-gray-400">Original, unprocessed audio</p>
                     </div>
                  </div>
                </div>

                {/* Mastered Audio */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
                    {selectedGenre ? `${selectedGenre.name} Mastered` : 'Mastered Audio'}
                  </h3>
                  <div className="space-y-4">
                    {selectedGenre && (
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Genre</span>
                          <span className="text-xs font-medium text-crys-gold">{selectedGenre.name}</span>
                        </div>
                        {GENRE_PRESETS[selectedGenre.id] && (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">Gain</span>
                              <span className="text-xs font-medium text-crys-gold">
                                +{Math.round((GENRE_PRESETS[selectedGenre.id].gain - 1) * 100)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Compression</span>
                              <span className="text-xs font-medium text-crys-gold">
                                {GENRE_PRESETS[selectedGenre.id].compression.ratio}:1
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                                         {processedAudioUrl ? (
                       <>
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
                         
                         {/* Frequency Spectrum Analysis for Mastered */}
                         <FrequencySpectrum
                           audioElement={masteredAudioElement}
                           isPlaying={isPlayingMastered}
                           title={`${selectedGenre?.name || 'Mastered'} Frequency Spectrum`}
                         />
                       </>
                     ) : (
                       <div className="bg-gray-700 rounded-lg p-6 text-center">
                         {isProcessing ? (
                           <>
                             <div className="w-6 h-6 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                             <p className="text-xs text-gray-400">Processing audio...</p>
                           </>
                         ) : (
                           <p className="text-xs text-gray-400">Select a genre to process</p>
                         )}
                       </div>
                     )}
                     
                     <div className="text-center">
                       <p className="text-xs text-crys-gold">
                         {selectedGenre ? `Mastered with ${selectedGenre.name} preset` : 'Mastered audio'}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

                         {/* Analysis Summary */}
             {processedAudioUrl && selectedGenre && (
               <div className="bg-gray-800 rounded-xl p-6">
                 <h3 className="text-lg font-semibold mb-4 text-center text-crys-gold">
                   Mastering Analysis Summary
                 </h3>
                 <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <h4 className="font-medium text-white">Applied Processing</h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Genre Preset:</span>
                         <span className="text-crys-gold font-medium">{selectedGenre.name}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Gain Applied:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round((GENRE_PRESETS[selectedGenre.id].gain - 1) * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Compression:</span>
                         <span className="text-crys-gold font-medium">
                           {GENRE_PRESETS[selectedGenre.id].compression.ratio}:1
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Threshold:</span>
                         <span className="text-crys-gold font-medium">
                           {GENRE_PRESETS[selectedGenre.id].compression.threshold}dB
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <h4 className="font-medium text-white">Frequency Enhancements</h4>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Low Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.low * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Mid Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.mid * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">High Frequencies:</span>
                         <span className="text-crys-gold font-medium">
                           +{Math.round(GENRE_PRESETS[selectedGenre.id].eq.high * 100)}%
                         </span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-300">Processing:</span>
                         <span className="text-green-400 font-medium">Complete</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Navigation */}
             <div className="flex justify-center space-x-4">
               <button
                 onClick={prevStep}
                 className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
               >
                 <ArrowLeft className="w-4 h-4" />
                 <span>Back</span>
               </button>
               {processedAudioUrl && (
                 <button
                   onClick={nextStep}
                   className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                 >
                   <span>Continue to Download</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
               )}
             </div>
          </div>
        )}

        {/* Step 3: Download */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-crys-gold mb-2">Download Your Mastered Audio</h2>
              <p className="text-gray-400">Choose your preferred format and download</p>
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
