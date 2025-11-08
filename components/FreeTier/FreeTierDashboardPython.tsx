import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Play, Pause, Download, ArrowLeft, Music, Settings, CheckCircle, Loader2 } from 'lucide-react';
import { pythonAudioService } from '../../services/pythonAudioService';
import { useApp } from '../../contexts/AppContext';
import { creditService } from '../../services/creditService';
import DownloadStep from './DownloadStep';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
  processedSize?: number;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

const FreeTierDashboardPython: React.FC = () => {
  const { user: effectiveUser } = useApp();
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'processing' | 'download'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  
  // Format selection for free tier (2 formats only)
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav24'>('wav24');
  const [downloadSampleRate, setDownloadSampleRate] = useState<number>(44100);

  // Free tier genres (2 genres only)
  const freeTierGenres: Genre[] = [
    {
      id: 'pop',
      name: 'Pop',
      color: '#FF6B6B',
      description: 'Bright, punchy sound with emphasis on vocals and modern production'
    },
    {
      id: 'rock',
      name: 'Rock',
      color: '#4ECDC4',
      description: 'Aggressive, powerful sound with heavy guitars and driving rhythm'
    }
  ];

  const processingSteps = useMemo(
    () => [
      { id: 'upload', label: 'Upload', icon: Upload, completed: !!uploadedFile },
      { id: 'processing', label: 'Processing', icon: Settings, completed: !!masteredAudioUrl },
      { id: 'download', label: 'Download', icon: Download, completed: false }
    ],
    [uploadedFile, masteredAudioUrl]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const audioFile: AudioFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file)
      };
      setUploadedFile(audioFile);
      setActiveTab('processing');
    }
  };

  const handleProcessAudio = async () => {
    if (!uploadedFile || !selectedGenre) return;

    // Check credits before processing
    try {
      const hasCredits = await creditService.hasEnoughCredits(effectiveUser.id.toString(), 1);
      if (!hasCredits) {
        alert('Insufficient credits. Please purchase credits to continue processing.');
        // Show credit exhaustion notification
        creditService.handleCreditExhaustion(() => {
          // Navigate to pricing page
          window.location.href = '/pricing';
        });
        return;
      }
    } catch (creditError) {
      console.error('Error checking credits:', creditError);
      alert('Unable to verify credits. Please try again.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    try {
      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Convert format for backend (preserve discrete WAV depth options)
      const backendFormat: 'mp3' | 'wav' | 'wav24' =
        downloadFormat === 'wav24' ? 'wav24' : downloadFormat;

      // Process audio with Python service for FINAL output (not preview)
      // Use backend-friendly genre id (not display name); no timeout
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'free',
        selectedGenre.id || selectedGenre.name,
        effectiveUser.id.toString(),
        backendFormat,
        downloadSampleRate
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setProcessingProgress(100);

      console.log('Final processing completed:', result);

      // Update uploadedFile with processed file size
      console.log('🎵 DEBUG: Processing result:', result);
      console.log('🎵 DEBUG: Processed file size bytes:', result.processed_file_size_bytes);
      if (uploadedFile && result.processed_file_size_bytes) {
        console.log('🎵 DEBUG: Updating uploadedFile with processed size:', result.processed_file_size_bytes);
        const updatedFile = {
          ...uploadedFile,
          processedSize: result.processed_file_size_bytes
        };
        console.log('🎵 DEBUG: Updated file object:', updatedFile);
        setUploadedFile(updatedFile);
        
        // Force a re-render by updating a dummy state
        setProcessingProgress(prev => prev + 0.001);
      }

      setMasteredAudioUrl(result.url);
      setActiveTab('download');
    } catch (error) {
      console.error('Processing failed:', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleDownload = async () => {
    if (!masteredAudioUrl) return;
    
    try {
      console.log('🎵 Simple download starting');
      console.log('🎵 DEBUG: masteredAudioUrl:', masteredAudioUrl);
      
      // Use simple direct download like local server
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const baseUrl = isLocal ? 'http://localhost:8002' : 'https://crysgarage.studio';
      
      // Extract file ID from URL or use simple download URL from response
      let downloadUrl;
      if (masteredAudioUrl.includes('simple_download_url')) {
        downloadUrl = `${baseUrl}${masteredAudioUrl}`;
      } else {
        // Fallback: try to extract file ID from URL
        const fileId = masteredAudioUrl.split('/').pop()?.split('.')[0] || 'unknown';
        // Use the full filename with extension for download
        const fullFilename = masteredAudioUrl.split('/').pop() || 'unknown';
        downloadUrl = `${baseUrl}/download/${fullFilename}`;
      }
      
      console.log('🎵 Download URL:', downloadUrl);
      
      const res = await fetch(downloadUrl, { method: 'GET' });
      if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
      
      // 🎵 DEBUG: Log response headers and content length
      console.log('🎵 DEBUG: Response headers:', Object.fromEntries(res.headers.entries()));
      console.log('🎵 DEBUG: Content-Length header:', res.headers.get('content-length'));
      console.log('🎵 DEBUG: Content-Type header:', res.headers.get('content-type'));
      
      const blob = await res.blob();
      console.log('🎵 DEBUG: Download blob size:', blob.size, 'bytes');
      console.log('🎵 DEBUG: Blob type:', blob.type);
      
      if (blob.size < 1024) {
        console.error('🎵 DEBUG: Blob too small:', blob.size);
        throw new Error(`Downloaded file too small (${blob.size} bytes)`);
      }
      
      const objectUrl = URL.createObjectURL(blob);
      const baseName = (uploadedFile?.name?.replace(/\.[^/.]+$/, '') || 'audio');
      const ext = downloadFormat === 'mp3' ? 'mp3' : 'wav';
      
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${baseName}_garage_${selectedGenre?.name?.toLowerCase().replace(/\s+/g, '_')}_mastered_24bit_48k.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      
      console.log('🎵 Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crys-gold mb-4">Free Tier Audio Mastering</h1>
          <p className="text-crys-light-grey text-lg">Professional quality mastering with 2 genres and 2 formats</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeTab === step.id;
              const isCompleted = step.completed;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isActive ? 'bg-crys-gold text-crys-black' : 
                    isCompleted ? 'bg-crys-graphite text-crys-gold' : 
                    'bg-crys-charcoal text-crys-light-grey'
                  }`}>
                    <Icon size={20} />
                    <span className="font-medium">{step.label}</span>
                    {isCompleted && <CheckCircle size={16} />}
                  </div>
                  {index < processingSteps.length - 1 && (
                    <div className="w-8 h-0.5 bg-crys-graphite"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-crys-charcoal rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-crys-gold mb-4" />
              <h2 className="text-2xl font-bold mb-4">Upload Your Audio</h2>
              <p className="text-crys-light-grey mb-6">
                Upload your audio file to get started with professional mastering
              </p>
              
              <div className="border-2 border-dashed border-crys-graphite rounded-lg p-8 hover:border-crys-gold transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-crys-gold mb-2">
                    <Upload size={32} className="mx-auto" />
                  </div>
                  <p className="text-crys-white font-medium">Click to upload or drag and drop</p>
                  <p className="text-crys-light-grey text-sm mt-2">
                    Supports MP3, WAV, FLAC, and other audio formats
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && uploadedFile && (
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            <div className="bg-crys-charcoal rounded-lg p-6 mb-6">
              <h3 className="text-crys-white font-medium mb-4">Uploaded File</h3>
              <div className="flex items-center space-x-4">
                <Music size={24} className="text-crys-gold" />
                <div>
                  <p className="text-crys-white font-medium">{uploadedFile.name}</p>
                  <p className="text-crys-light-grey text-sm">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Genre Selection */}
            <div className="bg-crys-charcoal rounded-lg p-6 mb-6">
              <h3 className="text-crys-white font-medium mb-4">Select Genre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freeTierGenres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre)}
                    className={`p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedGenre?.id === genre.id
                        ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                        : 'border-crys-graphite bg-crys-charcoal text-crys-light-grey hover:border-crys-gold/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: genre.color }}
                      ></div>
                      <h4 className="font-medium">{genre.name}</h4>
                    </div>
                    <p className="text-sm opacity-75">{genre.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            {selectedGenre && (
              <div className="bg-crys-charcoal rounded-lg p-6 mb-6">
                <h3 className="text-crys-white font-medium mb-4">Download Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setDownloadFormat('mp3')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      downloadFormat === 'mp3'
                        ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                        : 'border-crys-graphite bg-crys-charcoal text-crys-light-grey hover:border-crys-gold/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium">MP3</div>
                      <div className="text-sm opacity-75">320 kbps • ~6MB</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setDownloadFormat('wav24')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      downloadFormat === 'wav24'
                        ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                        : 'border-crys-graphite bg-crys-charcoal text-crys-light-grey hover:border-crys-gold/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-medium">WAV 24-bit</div>
                      <div className="text-sm opacity-75">Studio Quality • ~40MB</div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-crys-light-grey text-sm">
                    Selected: <span className="text-crys-gold font-medium">{downloadFormat.toUpperCase()}</span> • 
                    Sample Rate: <span className="text-crys-gold font-medium">{downloadSampleRate/1000}kHz</span>
                  </p>
                </div>
              </div>
            )}

            {/* Process Button */}
            {selectedGenre && (
              <div className="text-center">
                <button
                  onClick={handleProcessAudio}
                  disabled={isProcessing}
                  className="bg-crys-gold hover:bg-crys-gold/90 disabled:bg-crys-gold/50 text-crys-black px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing... {processingProgress.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <Settings size={20} />
                      <span>Process Audio</span>
                    </>
                  )}
                </button>
                
                {isProcessing && (
                  <div className="mt-4">
                    <div className="w-full bg-crys-graphite rounded-full h-2">
                      <div 
                        className="bg-crys-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Download Tab */}
        {activeTab === 'download' && masteredAudioUrl && (
          <DownloadStep
            uploadedFile={uploadedFile}
            selectedGenre={selectedGenre}
            onBack={() => setActiveTab('processing')}
            onNewUpload={() => {
              setUploadedFile(null);
              setSelectedGenre(null);
              setMasteredAudioUrl(null);
              setActiveTab('upload');
            }}
            onDownload={handleDownload}
            masteredAudioUrl={masteredAudioUrl}
            downloadFormat={downloadFormat}
            onFormatChange={(f: 'mp3' | 'wav24') => setDownloadFormat(f)}
            tier="free"
          />
        )}
      </div>
    </div>
  );
};

export default FreeTierDashboardPython;
