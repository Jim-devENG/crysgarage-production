import React, { useState } from 'react';
import { ArrowLeft, Download, RotateCcw, Play, Pause } from 'lucide-react';
import { GENRE_PRESETS } from './utils/genrePresets';
import StyledAudioPlayer from '../StyledAudioPlayer';
import FrequencySpectrum from '../FrequencySpectrum';

interface ExportStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  processedAudioUrl: string | null;
  onBack: () => void;
  onRestart: () => void;
}

const ExportStep: React.FC<ExportStepProps> = ({
  selectedFile,
  selectedGenre,
  processedAudioUrl,
  onBack,
  onRestart
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('wav');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalAudioElement, setOriginalAudioElement] = useState<HTMLAudioElement | null>(null);
  const [masteredAudioElement, setMasteredAudioElement] = useState<HTMLAudioElement | null>(null);

  // Helper functions to get genre preset values
  const getGenreGain = (genreId: string) => {
    const preset = GENRE_PRESETS[genreId];
    return preset ? Math.round((preset.gain - 1) * 20) : 0; // Convert to dB
  };

  const getGenreCompression = (genreId: string) => {
    const preset = GENRE_PRESETS[genreId];
    return preset ? `${preset.compression.ratio}:1` : '2:1';
  };

  const getGenreTarget = (genreId: string) => {
    const preset = GENRE_PRESETS[genreId];
    return preset ? preset.targetLufs : -9.0;
  };

  const getGenrePeak = (genreId: string) => {
    const preset = GENRE_PRESETS[genreId];
    return preset ? preset.truePeak : -0.3;
  };

  const processAudioWithGenre = async (audioFile: File, genre: any): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create audio context for offline processing
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Read the audio file
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create offline context for processing
        const offlineContext = new OfflineAudioContext(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        
        // Create audio source
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Create processing nodes
        const gainNode = offlineContext.createGain();
        const compressorNode = offlineContext.createDynamicsCompressor();
        
        // Get genre preset
        const preset = genre && GENRE_PRESETS[genre.id] ? GENRE_PRESETS[genre.id] : {
          gain: 1.0,
          compression: { threshold: -24, ratio: 2, attack: 0.01, release: 0.25 },
          eq: { low: 1.0, mid: 1.0, high: 1.0 },
          truePeak: -0.3,
          targetLufs: -9.0
        };
        
        // Apply genre preset
        gainNode.gain.value = preset.gain;
        compressorNode.threshold.value = preset.compression.threshold;
        compressorNode.ratio.value = preset.compression.ratio;
        compressorNode.attack.value = preset.compression.attack;
        compressorNode.release.value = preset.compression.release;
        compressorNode.knee.value = 10;
        
        // Connect the processing chain
        source.connect(compressorNode);
        compressorNode.connect(gainNode);
        gainNode.connect(offlineContext.destination);
        
        // Start processing
        source.start(0);
        
        // Render the processed audio
        const renderedBuffer = await offlineContext.startRendering();
        
        // Convert to blob
        const numberOfChannels = renderedBuffer.numberOfChannels;
        const length = renderedBuffer.length;
        const sampleRate = renderedBuffer.sampleRate;
        
        // Create WAV file
        const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(wavBuffer);
        
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
        
        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, renderedBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
          }
        }
        
        // Create blob
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(blob);
        
      } catch (error) {
        console.error('Error processing audio:', error);
        reject(error);
      }
    });
  };

  const handleDownload = async () => {
    if (!selectedFile || !selectedGenre) return;

    setIsDownloading(true);
    
    try {
      console.log('Processing audio for download...');
      
      // Process the audio with the selected genre
      const processedBlob = await processAudioWithGenre(selectedFile, selectedGenre);
      
      // Create download link
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const originalName = selectedFile.name;
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const genreName = selectedGenre.name;
      const filename = `${nameWithoutExt}_${genreName}_mastered.${downloadFormat}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      console.log(`Successfully processed and downloaded: ${filename}`);
      
      // Show success message
      alert(`Successfully processed and downloaded: ${filename}`);
    } catch (error) {
      console.error('Error processing/downloading file:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOriginalPlay = () => {
    setIsPlayingOriginal(true);
    setIsPlayingMastered(false);
  };

  const handleOriginalPause = () => {
    setIsPlayingOriginal(false);
  };

  const handleMasteredPlay = () => {
    setIsPlayingMastered(true);
    setIsPlayingOriginal(false);
  };

  const handleMasteredPause = () => {
    setIsPlayingMastered(false);
  };

  return (
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

      {/* Before/After Comparison */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 text-center">Before & After Comparison</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Original Audio */}
          <div className="space-y-4">
            <h4 className="text-center font-medium">Original Audio</h4>
            <StyledAudioPlayer
              src={selectedFile ? URL.createObjectURL(selectedFile) : ''}
              title="Original Audio"
              onPlay={handleOriginalPlay}
              onPause={handleOriginalPause}
              className="w-full"
              onAudioElementReady={(audioElement) => {
                setOriginalAudioElement(audioElement);
              }}
            />
            <FrequencySpectrum
              audioElement={originalAudioElement}
              isPlaying={isPlayingOriginal}
              title="Original Frequency Spectrum"
              targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
            />
            <div className="text-center">
              <p className="text-xs text-gray-400">Unprocessed, raw audio</p>
            </div>
          </div>

          {/* Mastered Audio */}
          <div className="space-y-4">
            <h4 className="text-center font-medium text-crys-gold">
              {selectedGenre ? `${selectedGenre.name} Mastered` : 'Mastered Audio'}
            </h4>
            <StyledAudioPlayer
              src={processedAudioUrl || ''}
              title="Mastered Audio"
              onPlay={handleMasteredPlay}
              onPause={handleMasteredPause}
              className="w-full"
              onAudioElementReady={(audioElement) => {
                setMasteredAudioElement(audioElement);
              }}
            />
            <FrequencySpectrum
              audioElement={masteredAudioElement}
              isPlaying={isPlayingMastered}
              title="Mastered Frequency Spectrum"
              targetLufs={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.targetLufs : undefined}
              targetTruePeak={selectedGenre ? GENRE_PRESETS[selectedGenre.id]?.truePeak : undefined}
            />
            <div className="text-center">
              <p className="text-xs text-crys-gold">Professionally mastered with {selectedGenre?.name} effects</p>
            </div>
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
        
        {/* Applied Changes */}
        {selectedGenre && (
          <div className="mt-4 bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-crys-gold">Applied Changes</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-crys-gold">+{getGenreGain(selectedGenre.id)}dB</div>
                <div className="text-xs text-gray-400">Gain Boost</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-crys-gold">{getGenreCompression(selectedGenre.id)}</div>
                <div className="text-xs text-gray-400">Compression</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-crys-gold">{getGenreTarget(selectedGenre.id)} LUFS</div>
                <div className="text-xs text-gray-400">Target Loudness</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-crys-gold">{getGenrePeak(selectedGenre.id)} dB</div>
                <div className="text-xs text-gray-400">True Peak</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Options */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Download Options</h3>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-3">Select Format</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDownloadFormat('wav')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  downloadFormat === 'wav'
                    ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                    : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">WAV</div>
                  <div className="text-xs">Lossless Quality</div>
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
                  <div className="font-semibold">MP3</div>
                  <div className="text-xs">Compressed</div>
                </div>
              </button>
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
                  <span>Downloading {downloadFormat.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download {downloadFormat.toUpperCase()}</span>
                </>
              )}
            </button>
            
            {selectedGenre && (
              <div className="mt-3 text-center space-y-1">
                <p className="text-xs text-gray-400">
                  Your audio will be processed with {selectedGenre.name} mastering
                </p>
                <p className="text-xs text-crys-gold">
                  Format: {downloadFormat.toUpperCase()} • Quality: {downloadFormat === 'wav' ? 'Lossless' : 'Compressed'}
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
  );
};

export default ExportStep;
