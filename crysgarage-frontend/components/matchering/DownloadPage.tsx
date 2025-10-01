import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface Props {
  onBack: () => void;
}

const DownloadPage: React.FC<Props> = ({ onBack }) => {
  const [format, setFormat] = useState<'WAV16'|'WAV24'|'MP3'|'FLAC'>('WAV16');
  const [sr, setSr] = useState<44100|48000>(44100);
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const id = localStorage.getItem('matchering.file_id');
      setFileId(id);
    } catch {}
  }, []);

  const handleDownload = () => {
    console.log('Download clicked, format:', format, 'sample_rate:', sr);
    
    // Get the mastered URL from localStorage
    const masteredUrl = localStorage.getItem('matchering.mastered_url');
    
    if (!masteredUrl) {
      console.error('No mastered file URL found');
      return;
    }
    
    console.log('Using mastered URL for conversion:', masteredUrl);
    
    // Use proxy-download endpoint to convert and download with desired format/sample rate
    const apiBase = (typeof window !== 'undefined' && (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')))
      ? 'http://127.0.0.1:8002' : '';
    const timestamp = Date.now(); // Add timestamp to prevent caching
    const url = `${apiBase}/proxy-download?file_url=${encodeURIComponent(masteredUrl)}&format=${format}&sample_rate=${sr}&t=${timestamp}`;
    console.log('Download URL:', url);
    
    // Create a temporary link element for proper download
    const link = document.createElement('a');
    link.href = url;
    
    // Fix: Use proper file extensions based on format
    const getFileExtension = (format: string) => {
      switch (format) {
        case 'MP3': return 'mp3';
        case 'WAV16': 
        case 'WAV24': return 'wav';
        case 'FLAC': return 'flac';
        default: return 'wav';
      }
    };
    
    const extension = getFileExtension(format);
    const bitDepth = format === 'WAV16' ? '16bit' : format === 'WAV24' ? '24bit' : '';
    const sampleRate = sr === 48000 ? '48k' : '44k';
    
    link.download = `mastered_track_${bitDepth}_${sampleRate}.${extension}`;
    link.target = '_blank'; // Open in new tab to avoid caching issues
    
    // Add proper MIME type handling
    const getMimeType = (format: string) => {
      switch (format) {
        case 'MP3': return 'audio/mpeg';
        case 'WAV16': 
        case 'WAV24': return 'audio/wav';
        case 'FLAC': return 'audio/flac';
        default: return 'audio/wav';
      }
    };
    
    // Set the MIME type
    link.type = getMimeType(format);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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


