import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { DEV_MODE, logDevAction } from '../../utils/devMode';

interface Props {
  onBack: () => void;
  onRequirePayment: () => void;
}

const DownloadPage: React.FC<Props> = ({ onBack, onRequirePayment }) => {
  const [format, setFormat] = useState<'WAV16'|'WAV24'|'MP3'|'FLAC'>('WAV16');
  const [sr, setSr] = useState<44100|48000>(44100);
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem('matchering.file_id');
      setFileId(id);
    } catch {}
  }, []);

  const handleDownload = async () => {
    // In Dev Mode, bypass payment and download directly
    if (DEV_MODE) {
      logDevAction('Download bypassed - allowing direct download in dev mode');
      
      try {
        const masteredUrl = localStorage.getItem('matchering.mastered_url');
        if (!masteredUrl) {
          alert('No mastered file found. Please process your track first.');
          return;
        }
        
        // Direct download without payment
        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8002' : 'https://crysgarage.studio';
        const downloadUrl = `${baseUrl}${masteredUrl}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `mastered_${format}_${sr}.${format === 'MP3' ? 'mp3' : format === 'FLAC' ? 'flac' : 'wav'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Dev mode download completed');
        return;
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
        return;
      }
    }
    
    // For Free tier: trigger payment gateway first ($5)
    onRequirePayment();
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-crys-gold mb-6">Download</h1>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          {!localStorage.getItem('matchering.mastered_url') && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-lg">
              <div className="font-semibold">Error: No mastered file found</div>
              <div className="text-sm">Please go back and process your track first.</div>
            </div>
          )}
          <div className="space-y-8">
            <div>
              <Label className="text-white/80 mb-4 block text-lg font-semibold">Output Format</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant={format === 'WAV16' ? 'default' : 'outline'}
                  onClick={() => setFormat('WAV16')}
                  className={`${
                    format === 'WAV16' 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  WAV 16-bit
                </Button>
                <Button
                  variant={format === 'WAV24' ? 'default' : 'outline'}
                  onClick={() => setFormat('WAV24')}
                  className={`${
                    format === 'WAV24' 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  WAV 24-bit
                </Button>
                <Button
                  variant={format === 'MP3' ? 'default' : 'outline'}
                  onClick={() => setFormat('MP3')}
                  className={`${
                    format === 'MP3' 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  MP3 320k
                </Button>
                <Button
                  variant={format === 'FLAC' ? 'default' : 'outline'}
                  onClick={() => setFormat('FLAC')}
                  className={`${
                    format === 'FLAC' 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  FLAC
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-white/80 mb-4 block text-lg font-semibold">Sample Rate</Label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <Button
                  variant={sr === 44100 ? 'default' : 'outline'}
                  onClick={() => setSr(44100)}
                  className={`${
                    sr === 44100 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  44.1 kHz
                </Button>
                <Button
                  variant={sr === 48000 ? 'default' : 'outline'}
                  onClick={() => setSr(48000)}
                  className={`${
                    sr === 48000 
                      ? 'bg-crys-gold text-black font-semibold' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  48 kHz
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onBack} className="border-white/20 text-white/80">Back</Button>
            <Button disabled={!localStorage.getItem('matchering.mastered_url')} onClick={handleDownload} className="bg-crys-gold text-black font-semibold disabled:opacity-50">Download Master</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;


