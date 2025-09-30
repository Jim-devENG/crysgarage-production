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
    if (!fileId) return;
    const apiBase = (typeof window !== 'undefined' && (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')))
      ? 'http://127.0.0.1:8002' : '';
    const url = `${apiBase}/proxy-download?file_id=${encodeURIComponent(fileId)}&format=${format}&sample_rate=${sr}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-crys-gold mb-6">Download</h1>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="text-white/80 mb-2 block">Output Format</Label>
              <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full text-sm bg-white/10 border border-white/10 rounded-md px-3 py-2">
                <option value="WAV16">WAV (16-bit)</option>
                <option value="WAV24">WAV (24-bit)</option>
                <option value="MP3">MP3 (320 kbps)</option>
                <option value="FLAC">FLAC (lossless)</option>
              </select>
            </div>
            <div>
              <Label className="text-white/80 mb-2 block">Sample Rate</Label>
              <select value={sr} onChange={(e) => setSr(Number(e.target.value) as any)} className="w-full text-sm bg-white/10 border border-white/10 rounded-md px-3 py-2">
                <option value={44100}>44.1 kHz</option>
                <option value={48000}>48 kHz</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onBack} className="border-white/20 text-white/80">Back</Button>
            <Button disabled={!fileId} onClick={handleDownload} className="bg-crys-gold text-black font-semibold disabled:opacity-50">Download Master</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;


