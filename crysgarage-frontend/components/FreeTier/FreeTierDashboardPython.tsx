import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Download, Activity, Music, ArrowLeft, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import DownloadStep from './DownloadStep';
import { creditsAPI } from '../../services/api';
import { pythonAudioService, TierInfo, GenreInfo } from '../../services/pythonAudioService';
import { useAuth } from '../../contexts/AuthenticationContext';

// Types
interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface AudioStats {
  loudness: number;
  peak: number;
  dynamicRange: number;
  frequencyBalance: number;
  stereoWidth: number;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

type TabType = 'upload' | 'processing' | 'download';

interface FreeTierDashboardProps {
  onDownloadAttempt?: () => boolean;
}

const FreeTierDashboardPython: React.FC<FreeTierDashboardProps> = ({ onDownloadAttempt }) => {
  const { user } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [originalStats, setOriginalStats] = useState<AudioStats | null>(null);
  const [masteredStats, setMasteredStats] = useState<AudioStats | null>(null);
  const [masteredAudioUrl, setMasteredAudioUrl] = useState<string | null>(null);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // Audio refs
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load tier information and available genres on component mount
  useEffect(() => {
    loadTierInformation();
  }, []);

  const loadTierInformation = async () => {
    try {
      setIsLoadingGenres(true);
      
      // Get tier information from Python service
      const tierData = await pythonAudioService.getTierInformation();
      const freeTierInfo = tierData.free;
      setTierInfo(freeTierInfo);

      // Get available genres for free tier
      const genreNames = await pythonAudioService.getAvailableGenresForTier('free');
      
      // Create genre objects for UI
      const genres: Genre[] = genreNames.map((name, index) => ({
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        color: index === 0 ? 'bg-orange-500' : 'bg-red-500',
        description: index === 0 ? 'Bass-Driven & Punchy' : 'Rhythmic & Energetic'
      }));
      
      setAvailableGenres(genres);
      console.log('Loaded free tier genres:', genres);
      
    } catch (error) {
      console.error('Failed to load tier information:', error);
      setError('Failed to load tier information');
      
      // Fallback genres
      setAvailableGenres([
        { id: 'hip-hop', name: 'Hip-Hop', color: 'bg-orange-500', description: 'Bass-Driven & Punchy' },
        { id: 'afrobeats', name: 'Afrobeats', color: 'bg-red-500', description: 'Rhythmic & Energetic' }
      ]);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  // File upload handler
  const handleFileUpload = (file: File) => {
    try {
      setError(null);
      
      // Validate file size (free tier limit)
      const maxSize = 50 * 1024 * 1024; // 50MB for free tier
      if (file.size > maxSize) {
        setError('File too large. Free tier supports files up to 50MB.');
        return;
      }

      // Validate file format
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
      const allowedExtensions = ['.mp3', '.wav', '.flac'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError('Unsupported file format. Please use MP3 or WAV files.');
        return;
      }

      const audioFile: AudioFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        file,
        url: URL.createObjectURL(file)
      };

      setUploadedFile(audioFile);
      setActiveTab('processing');
      
      console.log('File uploaded successfully:', audioFile);
      
    } catch (error) {
      console.error('File upload failed:', error);
      setError('Failed to upload file');
    }
  };

  // Genre selection handler
  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    console.log('Genre selected:', genre);
  };

  // Process audio with Python service
  const handleProcessAudio = async () => {
    if (!uploadedFile || !selectedGenre || !user) {
      setError('Missing file, genre, or user information');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setError(null);

      console.log('Starting Python audio processing...');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Process audio with Python service
      const result = await pythonAudioService.uploadAndProcessAudio(
        uploadedFile.file,
        'free',
        selectedGenre.name,
        user.id
      );

      clearInterval(progressInterval);
      setProcessingProgress(100);

      console.log('Python processing completed:', result);

      // Set mastered audio URL
      setMasteredAudioUrl(result.url);

      // Generate mock stats for display
      setMasteredStats({
        loudness: result.lufs,
        peak: -0.2,
        dynamicRange: 12.5,
        frequencyBalance: 0.8,
        stereoWidth: 1.2
      });

      // Move to download tab
      setActiveTab('download');
      
    } catch (error: any) {
      console.error('Python processing failed:', error);
      setError(error.message || 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  // Audio playback handlers
  const toggleOriginalPlayback = () => {
    if (!uploadedFile) return;

    if (!originalAudioRef.current) {
      originalAudioRef.current = new Audio(uploadedFile.url);
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
    }

    if (isPlayingOriginal) {
      originalAudioRef.current.pause();
      setIsPlayingOriginal(false);
    } else {
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  const toggleMasteredPlayback = () => {
    if (!masteredAudioUrl) return;

    if (!masteredAudioRef.current) {
      masteredAudioRef.current = new Audio(masteredAudioUrl);
      masteredAudioRef.current.onended = () => setIsPlayingMastered(false);
    }

    if (isPlayingMastered) {
      masteredAudioRef.current.pause();
      setIsPlayingMastered(false);
    } else {
      masteredAudioRef.current.play();
      setIsPlayingMastered(true);
    }
  };

  // Download handler
  const handleDownload = async () => {
    if (!masteredAudioUrl) {
      setError('No mastered audio available for download');
      return;
    }

    // Check if user can download (authentication and credits)
    if (onDownloadAttempt) {
      const canDownload = onDownloadAttempt();
      if (!canDownload) {
        return;
      }
    }

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = masteredAudioUrl;
      link.download = `mastered_${uploadedFile?.name || 'audio'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Download started successfully');
      
    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download mastered audio');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-crys-black text-crys-white">
      {/* Header */}
      <div className="bg-crys-charcoal border-b border-crys-graphite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-crys-light-grey hover:text-crys-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-crys-white">Free Tier Studio</h1>
                <p className="text-crys-light-grey text-sm">Python-powered audio mastering</p>
              </div>
            </div>
            
            {tierInfo && (
              <div className="text-right">
                <div className="text-crys-gold text-sm font-medium">
                  {tierInfo.processing_quality.toUpperCase()} QUALITY
                </div>
                <div className="text-crys-light-grey text-xs">
                  {tierInfo.available_formats.join(', ').toUpperCase()} • {tierInfo.max_sample_rate/1000}kHz
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['upload', 'processing', 'download'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${activeTab === step 
                    ? 'bg-crys-gold text-crys-black' 
                    : index < ['upload', 'processing', 'download'].indexOf(activeTab)
                    ? 'bg-crys-gold/20 text-crys-gold'
                    : 'bg-crys-graphite text-crys-light-grey'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`
                  ml-2 text-sm font-medium
                  ${activeTab === step ? 'text-crys-gold' : 'text-crys-light-grey'}
                `}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 2 && (
                  <div className="w-8 h-0.5 bg-crys-graphite mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-8">
              <div className="text-center">
                <Upload className="w-16 h-16 text-crys-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-crys-white mb-2">Upload Your Audio</h2>
                <p className="text-crys-light-grey mb-6">
                  Upload your audio file to get started with Python-powered mastering
                </p>
                
                <div className="border-2 border-dashed border-crys-graphite rounded-lg p-8 hover:border-crys-gold/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/flac"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-crys-light-grey mb-4">
                      <p className="text-lg">Click to upload or drag and drop</p>
                      <p className="text-sm">MP3, WAV, FLAC up to 50MB</p>
                    </div>
                    <button className="bg-crys-gold hover:bg-crys-gold/90 text-crys-black px-6 py-3 rounded-lg font-medium transition-colors">
                      Choose File
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && (
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            {uploadedFile && (
              <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-crys-gold" />
                    </div>
                    <div>
                      <h3 className="text-crys-white font-medium">{uploadedFile.name}</h3>
                      <p className="text-crys-light-grey text-sm">{formatFileSize(uploadedFile.size)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleOriginalPlayback}
                    className="flex items-center space-x-2 bg-crys-gold/20 hover:bg-crys-gold/30 text-crys-gold px-4 py-2 rounded-lg transition-colors"
                  >
                    {isPlayingOriginal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-sm">Preview</span>
                  </button>
                </div>
              </div>
            )}

            {/* Genre Selection */}
            <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-crys-white mb-2">Select Genre</h3>
                <p className="text-crys-light-grey text-sm">
                  Choose from 2 available genres for free tier mastering
                </p>
              </div>

              {isLoadingGenres ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-crys-gold animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {availableGenres.map((genre) => (
                    <div
                      key={genre.id}
                      className={`
                        cursor-pointer p-6 rounded-lg border-2 transition-all duration-200
                        ${selectedGenre?.id === genre.id
                          ? 'border-crys-gold bg-crys-gold/10'
                          : 'border-crys-graphite hover:border-crys-gold/50'
                        }
                      `}
                      onClick={() => handleGenreSelect(genre)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${genre.color} rounded-lg flex items-center justify-center`}>
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-crys-white font-medium">{genre.name}</h4>
                          <p className="text-crys-light-grey text-sm">{genre.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing with Python...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
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
                        />
                      </div>
                      <p className="text-crys-light-grey text-sm mt-2">
                        {Math.round(processingProgress)}% complete
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
          />
        )}
      </div>
    </div>
  );
};

export default FreeTierDashboardPython;
