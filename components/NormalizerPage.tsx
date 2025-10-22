import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { 
  Upload, 
  Download, 
  Zap, 
  Music, 
  Settings, 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface NormalizerPageProps {
  onBack: () => void;
}

export function NormalizerPage({ onBack }: NormalizerPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [targetLevel, setTargetLevel] = useState(-3.0);
  const [normalizeType, setNormalizeType] = useState('peak');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Stop any currently playing audio
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      setFile(selectedFile);
      setError(null);
      setProcessedFile(null);
      
      // Create audio URL for preview
      const url = URL.createObjectURL(selectedFile);
      setAudioUrl(url);
    }
  };

  const handleNormalize = async () => {
    if (!file) return;
    
    // Stop any currently playing audio
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just create a download URL (replace with actual processed file)
      const processedUrl = URL.createObjectURL(file);
      setProcessedFile(processedUrl);
    } catch (err) {
      setError('Failed to normalize audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFile) {
      const link = document.createElement('a');
      link.href = processedFile;
      link.download = `normalized_${file?.name || 'audio'}`;
      link.click();
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const reset = () => {
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setIsPlaying(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-crys-black">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-crys-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-crys-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-crys-white mb-4">
            🎵 Free Crys Garage Engine Normalizer
          </h1>
          <p className="text-xl text-crys-light-grey max-w-2xl mx-auto">
            Normalize your audio levels for professional results. Perfect for preparing tracks before mastering.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <Card className="bg-crys-graphite/30 border border-crys-gold/20 mb-8">
            <CardHeader>
              <h2 className="text-2xl font-bold text-crys-white flex items-center gap-3">
                <Upload className="w-6 h-6 text-crys-gold" />
                Upload Audio File
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* File Upload */}
                <div 
                  className="border-2 border-dashed border-crys-gold/30 rounded-lg p-8 text-center hover:border-crys-gold/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Music className="w-12 h-12 text-crys-gold mx-auto mb-4" />
                  <p className="text-crys-white text-lg mb-2">
                    {file ? file.name : 'Click to upload audio file'}
                  </p>
                  <p className="text-crys-light-grey text-sm">
                    Supports MP3, WAV, FLAC, M4A (Max 200MB)
                  </p>
                </div>

                {/* Settings */}
                {file && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-crys-white font-medium mb-2">
                        Target Level (dB)
                      </label>
                      <select
                        value={targetLevel}
                        onChange={(e) => setTargetLevel(Number(e.target.value))}
                        className="w-full p-3 bg-crys-graphite border border-crys-gold/20 rounded-lg text-crys-white focus:border-crys-gold focus:outline-none"
                      >
                        <option value={-3.0}>-3.0 dB (Conservative)</option>
                        <option value={-6.0}>-6.0 dB (Recommended)</option>
                        <option value={-9.0}>-9.0 dB (Maximum Headroom)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-crys-white font-medium mb-2">
                        Normalization Type
                      </label>
                      <select
                        value={normalizeType}
                        onChange={(e) => setNormalizeType(e.target.value)}
                        className="w-full p-3 bg-crys-graphite border border-crys-gold/20 rounded-lg text-crys-white focus:border-crys-gold focus:outline-none"
                      >
                        <option value="peak">Peak Normalization</option>
                        <option value="rms">RMS Normalization</option>
                        <option value="lufs">LUFS Normalization</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Audio Preview */}
                {audioUrl && (
                  <div className="bg-crys-graphite/20 rounded-lg p-4">
                    <h3 className="text-crys-white font-medium mb-3">Audio Preview</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={togglePlayback}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="text-crys-light-grey text-sm">
                        {file?.name}
                      </span>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleNormalize}
                    disabled={!file || isProcessing}
                    className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-bold px-8 py-3 flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Normalize Audio
                      </>
                    )}
                  </Button>
                  
                  {file && (
                    <Button
                      onClick={reset}
                      variant="outline"
                      className="border-crys-gold/20 text-crys-gold hover:bg-crys-gold/10"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {processedFile && (
            <Card className="bg-crys-gold/10 border border-crys-gold/30">
              <CardHeader>
                <h2 className="text-2xl font-bold text-crys-white flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-crys-gold" />
                  Normalization Complete
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-crys-graphite/20 rounded-lg p-4">
                    <h3 className="text-crys-white font-medium mb-2">Processing Details</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-crys-light-grey">Original file:</span>
                        <span className="text-crys-white ml-2">{file?.name}</span>
                      </div>
                      <div>
                        <span className="text-crys-light-grey">Target level:</span>
                        <span className="text-crys-white ml-2">{targetLevel} dB</span>
                      </div>
                      <div>
                        <span className="text-crys-light-grey">Normalization:</span>
                        <span className="text-crys-white ml-2 capitalize">{normalizeType}</span>
                      </div>
                      <div>
                        <span className="text-crys-light-grey">Status:</span>
                        <span className="text-crys-gold ml-2">✓ Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleDownload}
                      className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black font-bold px-8 py-3 flex-1"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Normalized Audio
                    </Button>
                    
                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="border-crys-gold/20 text-crys-gold hover:bg-crys-gold/10"
                    >
                      Back to Studio
                    </Button>
                  </div>

                  <div className="bg-crys-gold/5 border border-crys-gold/20 rounded-lg p-4">
                    <h4 className="text-crys-gold font-medium mb-2">🎯 Ready for Mastering?</h4>
                    <p className="text-crys-light-grey text-sm mb-3">
                      Your audio is now properly normalized and ready for professional mastering. 
                      Choose from our mastering tiers to get studio-quality results.
                    </p>
                    <Button
                      onClick={onBack}
                      className="bg-crys-gold/20 hover:bg-crys-gold/30 text-crys-gold border border-crys-gold/30"
                    >
                      View Mastering Options
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
