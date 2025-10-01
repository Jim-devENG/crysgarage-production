import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

const BeforeAfterPage: React.FC<Props> = ({ onBack, onNext }) => {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const masteredAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Load saved files from localStorage
    try {
      const savedTarget = localStorage.getItem('matchering.target');
      const savedMastered = localStorage.getItem('matchering.mastered_url');
      
      if (savedTarget) {
        setOriginalUrl(savedTarget);
      }
      if (savedMastered) {
        setMasteredUrl(savedMastered);
      }
    } catch (err) {
      setError('Failed to load saved files');
    }
  }, []);

  const togglePlay = (audioRef: React.RefObject<HTMLAudioElement>, setIsPlaying: (playing: boolean) => void) => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };


  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-crys-gold mb-4">Before & After</h1>
          <p className="text-white/70 text-lg">Compare your original track with the mastered version</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg text-center">
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Original Track */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-white/60" />
              <h2 className="text-2xl font-semibold text-white/90">Original Target</h2>
            </div>
            
            {originalUrl ? (
              <div className="space-y-4">
                <audio
                  ref={originalAudioRef}
                  src={originalUrl}
                  className="w-full"
                  onEnded={() => setIsPlayingOriginal(false)}
                />
                
                <Button
                  onClick={() => togglePlay(originalAudioRef, setIsPlayingOriginal)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  {isPlayingOriginal ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlayingOriginal ? 'Pause' : 'Play'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No original file found
              </div>
            )}
          </div>

          {/* Mastered Track */}
          <div className="bg-black/40 border border-crys-gold/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-crys-gold" />
              <h2 className="text-2xl font-semibold text-crys-gold">Mastered Track</h2>
            </div>
            
            {masteredUrl ? (
              <div className="space-y-4">
                <audio
                  ref={masteredAudioRef}
                  src={masteredUrl}
                  className="w-full"
                  onEnded={() => setIsPlayingMastered(false)}
                />
                
                <Button
                  onClick={() => togglePlay(masteredAudioRef, setIsPlayingMastered)}
                  className="w-full bg-crys-gold hover:bg-crys-gold/90 text-black font-semibold"
                >
                  {isPlayingMastered ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlayingMastered ? 'Pause' : 'Play'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No mastered file found. Please go back and process your track.
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-white/20 text-white/80 hover:bg-white/10 px-8 py-3"
          >
            ← Back to Upload
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!masteredUrl}
            className="bg-crys-gold hover:bg-crys-gold/90 text-black font-semibold px-8 py-3 disabled:opacity-50"
          >
            Continue to Download →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterPage;


