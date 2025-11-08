import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, ArrowLeft, Music } from 'lucide-react';

interface BeforeAfterComparisonProps {
  originalFile: File | null;
  masteredFile: File | null;
  masteredAudioUrl?: string | null;
  onDownload: () => void;
  onStartNewMaster: () => void;
  onBack?: () => void;
}

const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  originalFile,
  masteredFile,
  masteredAudioUrl,
  onDownload,
  onStartNewMaster,
  onBack
}) => {
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log('🎵 BeforeAfterComparison: Setting up audio players');
    console.log('🎵 Original file:', originalFile);
    console.log('🎵 Mastered file:', masteredFile);
    console.log('🎵 Mastered audio URL:', masteredAudioUrl);
    
    // Setup original audio
    if (originalFile) {
      const audio = new Audio(URL.createObjectURL(originalFile));
      originalAudioRef.current = audio;
      console.log('🎵 Original audio player created');
    }

    // Setup mastered audio
    if (masteredFile) {
      const audio = new Audio(URL.createObjectURL(masteredFile));
      masteredAudioRef.current = audio;
      console.log('🎵 Mastered audio player created from file');
    } else if (masteredAudioUrl) {
      const audio = new Audio(masteredAudioUrl);
      masteredAudioRef.current = audio;
      console.log('🎵 Mastered audio player created from URL');
    }

    return () => {
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
      }
      if (masteredAudioRef.current) {
        masteredAudioRef.current.pause();
      }
    };
  }, [originalFile, masteredFile, masteredAudioUrl]);

  const togglePlayOriginal = () => {
    if (!originalAudioRef.current) return;
    
    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      if (masteredAudioRef.current && isPlayingMastered) {
        masteredAudioRef.current.pause();
        setIsPlayingMastered(false);
      }
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  const togglePlayMastered = () => {
    console.log('🎵 Toggle mastered play clicked');
    console.log('🎵 Mastered audio ref:', masteredAudioRef.current);
    
    if (!masteredAudioRef.current) {
      console.log('🎵 No mastered audio ref available');
      return;
    }
    
    if (isPlayingMastered) {
      console.log('🎵 Pausing mastered audio');
      masteredAudioRef.current.pause();
      setIsPlayingMastered(false);
    } else {
      console.log('🎵 Playing mastered audio');
      if (originalAudioRef.current && isPlayingOriginal) {
        originalAudioRef.current.pause();
        setIsPlayingOriginal(false);
      }
      
      masteredAudioRef.current.play().then(() => {
        console.log('🎵 Mastered audio started playing successfully');
        setIsPlayingMastered(true);
      }).catch((error) => {
        console.error('🎵 Error playing mastered audio:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="border border-gray-600 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Before & After</h1>
              <p className="text-gray-400">Compare your original audio with the mastered version</p>
            </div>
          </div>
        </div>

        {/* Audio Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Original Audio */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-gray-300">Original</h3>
              
              <div className="w-32 h-32 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-16 h-16 text-gray-400" />
              </div>

              <div className="text-center mb-8">
                <p className="text-gray-400 text-sm">
                  {originalFile ? originalFile.name : 'No file selected'}
                </p>
              </div>

              <button
                onClick={togglePlayOriginal}
                disabled={!originalFile}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isPlayingOriginal
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                } ${!originalFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlayingOriginal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>
          </div>

          {/* Mastered Audio */}
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-6 text-amber-400">Mastered (Hip-Hop Preset)</h3>
              
              <div className="w-32 h-32 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-16 h-16 text-amber-400" />
              </div>

              <div className="text-center mb-8">
                <p className="text-gray-400 text-sm">
                  {masteredFile ? masteredFile.name :
                   masteredAudioUrl ? `${originalFile?.name?.replace(/\.[^/.]+$/, '')}_Crysgarage_HipHop.wav` :
                   'Processing...'}
                </p>
              </div>

              <button
                onClick={togglePlayMastered}
                disabled={!masteredFile && !masteredAudioUrl}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isPlayingMastered
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-black'
                } ${(!masteredFile && !masteredAudioUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlayingMastered ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Audio Analysis */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-white">Audio Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">+3dB</div>
              <div className="text-sm text-gray-400">Bass Boost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">4:1</div>
              <div className="text-sm text-gray-400">Compression</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">+20%</div>
              <div className="text-sm text-gray-400">Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">Hip-Hop</div>
              <div className="text-sm text-gray-400">Preset</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onDownload}
            disabled={!masteredFile && !masteredAudioUrl}
            className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Download Mastered Audio
          </button>
          
          <button
            onClick={onStartNewMaster}
            className="border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start New Master
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterComparison;