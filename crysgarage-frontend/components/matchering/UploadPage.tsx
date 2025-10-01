import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileDropCard } from '../FileDropCard';
// Removed lucide-react icons import

interface Props {
  onNext: () => void;
}

const UploadPage: React.FC<Props> = ({ onNext }) => {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const targetAudioRef = useRef<HTMLAudioElement>(null);
  const referenceAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem('matchering.target');
      const savedReference = localStorage.getItem('matchering.reference');
      if (savedTarget && savedReference) {
        // Files are stored as URLs, we'd need to convert back to File objects
        // For now, we'll just show that files exist
        console.log('Found saved files');
      }
    } catch {}
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

  const handleMaster = async () => {
    if (!targetFile || !referenceFile) {
      setError('Please select both Target and Reference files');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Save target file URL to localStorage for BeforeAfterPage
      const targetUrl = URL.createObjectURL(targetFile);
      localStorage.setItem('matchering.target', targetUrl);

      const formData = new FormData();
      formData.append('target', targetFile);
      formData.append('reference', referenceFile);
      formData.append('user_id', 'dev-user');

      const response = await fetch('http://127.0.0.1:8002/master-matchering', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setProgress(100);
      
      // Store results for next page
      try {
        localStorage.setItem('matchering.mastered_url', result.url || '');
        if (result.file_id) {
          localStorage.setItem('matchering.file_id', result.file_id);
        }
      } catch {}

      // Navigate to next page
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-crys-gold mb-4">Upload Your Files</h1>
          <p className="text-white/70 text-lg">Upload your Target and Reference tracks to get started</p>
        </div>

        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <FileDropCard
              label="Target (Your song)"
              file={targetFile}
              setFile={setTargetFile}
              audioRef={targetAudioRef}
              isPlaying={isPlayingTarget}
              onTogglePlay={() => togglePlay(targetAudioRef, setIsPlayingTarget)}
            />
            <FileDropCard
              label="Reference (Desired sound)"
              file={referenceFile}
              setFile={setReferenceFile}
              audioRef={referenceAudioRef}
              isPlaying={isPlayingReference}
              onTogglePlay={() => togglePlay(referenceAudioRef, setIsPlayingReference)}
            />
          </div>

          {/* Action Section */}
          <div className="text-center space-y-6">
            <Button
              onClick={handleMaster}
              disabled={loading || !targetFile || !referenceFile}
              className="px-12 py-4 rounded-lg bg-crys-gold text-black font-bold text-xl disabled:opacity-50 transition-all duration-200 hover:bg-crys-gold/90"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mr-3" />
                  Mastering…
                </>
              ) : (
                "Master My Track"
              )}
            </Button>

            {progress > 0 && (
              <div className="max-w-md mx-auto">
                <div className="h-4 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-crys-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-sm mt-2 text-white/60">Processing… {progress}%</div>
              </div>
            )}

            {error && (
              <div className="max-w-md mx-auto p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg">
                <div className="font-semibold">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;


