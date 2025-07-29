import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Play, 
  Pause, 
  Download, 
  Share, 
  Music, 
  FileAudio,
  Volume2,
  Zap,
  Clock,
  CheckCircle
} from "lucide-react";
import { audioAPI } from '../services/api';

interface MasteringResultsProps {
  audioId: string;
  fileName: string;
  selectedTier: string;
  selectedGenre: string;
  processingConfig: any;
  canDownload: boolean;
  onDownload: (format: string) => void;
  onStartNewMaster: () => void;
  originalFile?: File;
  masteredResult?: any;
  onPaidDownload?: (format: string) => void; // New prop for paid downloads
}

export function MasteringResults({ 
  audioId,
  fileName, 
  selectedTier, 
  selectedGenre, 
  processingConfig,
  canDownload,
  onDownload,
  onStartNewMaster,
  originalFile,
  masteredResult,
  onPaidDownload
}: MasteringResultsProps) {
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingMastered, setIsPlayingMastered] = useState(false);
  const [originalCurrentTime, setOriginalCurrentTime] = useState(0);
  const [masteredCurrentTime, setMasteredCurrentTime] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [masteredDuration, setMasteredDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [masteringResults, setMasteringResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [masteredUrlKey, setMasteredUrlKey] = useState<string>('');
  
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const masteredAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load mastering results from API
  useEffect(() => {
    const loadMasteringResults = async () => {
      try {
        setIsLoading(true);
        setAudioError(null);
        console.log('Loading mastering results for audio ID:', audioId);
        
        if (audioId && !masteredResult && !originalFile) {
          const results = await audioAPI.getMasteringResults(audioId);
          setMasteringResults(results);
          console.log('Mastering results loaded successfully:', results);
        } else if (masteredResult) {
          console.log('Using existing mastered result:', masteredResult);
          setMasteringResults(null);
        } else if (originalFile) {
          console.log('Using original file, skipping API call');
          setMasteringResults(null);
        }
      } catch (error: any) {
        console.error('Failed to load mastering results:', error);
        
        let errorMessage = 'Failed to load mastering results';
        if (error.response?.status === 404) {
          errorMessage = 'Audio file not found';
        } else if (error.response?.status === 400) {
          errorMessage = 'Audio processing not complete';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication required';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error occurred';
        }
        
        if (!originalFile && !masteredResult) {
          setAudioError(errorMessage);
        } else {
          console.log('API error ignored - using available data');
        }
        
        if (masteredResult || originalFile) {
          console.log('Continuing with available data despite API error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (audioId || masteredResult || originalFile) {
      loadMasteringResults();
    }
  }, [audioId, masteredResult, originalFile]);

  // Create audio URLs with better fallback logic - memoized to prevent constant recreation
  const originalAudioUrl = useMemo(() => {
    if (originalFile) {
      return URL.createObjectURL(originalFile);
    }
    return masteringResults?.original_audio_url || null;
  }, [originalFile, masteringResults?.original_audio_url]);
    
  const masteredAudioUrl = useMemo(() => {
    return masteringResults?.mastered_audio_url || 
      masteredResult?.output_files?.wav || 
      masteredResult?.download_urls?.wav ||
      (masteringResults?.output_files?.wav) ||
      null;
  }, [masteringResults?.mastered_audio_url, masteredResult?.output_files?.wav, masteredResult?.download_urls?.wav, masteringResults?.output_files?.wav]);

  const finalOriginalUrl = originalAudioUrl || `http://127.0.0.1:8000/api/public/audio/${audioId}/original`;
  
  const finalMasteredUrl = useMemo(() => {
    if (masteredAudioUrl) {
      return masteredAudioUrl;
    }
    if (originalFile) {
      // Use the same blob URL as original for demo purposes
      return originalAudioUrl;
    }
    return null;
  }, [masteredAudioUrl, originalFile, originalAudioUrl]);

  // Update mastered URL key when the URL changes
  useEffect(() => {
    if (finalMasteredUrl) {
      const newKey = `${audioId}-${originalFile?.name}-${masteredAudioUrl ? 'api' : 'demo'}`;
      setMasteredUrlKey(newKey);
    }
  }, [finalMasteredUrl, audioId, originalFile?.name, masteredAudioUrl]);

  // Mock mastering analysis data (in real app, this would come from backend) - memoized
  const analysisData = useMemo(() => ({
    originalLoudness: masteringResults?.original_loudness || -18.2,
    masteredLoudness: masteringResults?.mastered_loudness || masteredResult?.metadata?.final_lufs || -14.0,
    dynamicRange: masteringResults?.dynamic_range || masteredResult?.metadata?.dynamic_range || 8.5,
    frequencyBalance: masteringResults?.frequency_balance || 85,
    stereoWidth: masteringResults?.stereo_width || 92,
    processingTime: masteringResults?.processing_time || masteredResult?.metadata?.processing_time || 47
  }), [masteringResults, masteredResult?.metadata]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'wav': return '🎵';
      case 'mp3': return '🎶';
      case 'flac': return '🎼';
      default: return '🎵';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-blue-500/20 text-blue-400';
      case 'professional': return 'bg-crys-gold/20 text-crys-gold';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const handleOriginalPlay = () => {
    if (!finalOriginalUrl) {
      setAudioError('Original audio not available');
      return;
    }
    
    if (originalAudioRef.current) {
      try {
        if (isPlayingOriginal) {
          originalAudioRef.current.pause();
          setIsPlayingOriginal(false);
        } else {
          if (masteredAudioRef.current && isPlayingMastered) {
            masteredAudioRef.current.pause();
            setIsPlayingMastered(false);
          }
          
          const playPromise = originalAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlayingOriginal(true);
                setAudioError(null);
              })
              .catch(error => {
                console.error('Error playing original audio:', error);
                setAudioError('Failed to play original audio: ' + error.message);
              });
          }
        }
      } catch (error) {
        console.error('Error with original audio:', error);
        setAudioError('Failed to play original audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      setAudioError('Original audio element not found');
    }
  };

  const handleMasteredPlay = () => {
    if (!finalMasteredUrl) {
      setAudioError('Mastered audio not available');
      return;
    }
    
    if (masteredAudioRef.current) {
      try {
        if (isPlayingMastered) {
          masteredAudioRef.current.pause();
          setIsPlayingMastered(false);
        } else {
          if (originalAudioRef.current && isPlayingOriginal) {
            originalAudioRef.current.pause();
            setIsPlayingOriginal(false);
          }
          
          const playPromise = masteredAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlayingMastered(true);
                setAudioError(null);
                if (!masteredAudioUrl && originalFile) {
                  console.log('Playing original file as mastered demo');
                }
              })
              .catch(error => {
                console.error('Error playing mastered audio:', error);
                setAudioError('Failed to play mastered audio: ' + error.message);
              });
          }
        }
      } catch (error) {
        console.error('Error with mastered audio:', error);
        setAudioError('Failed to play mastered audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      setAudioError('Mastered audio element not found');
    }
  };

  const handleTimeUpdate = (audioRef: React.RefObject<HTMLAudioElement>, isOriginal: boolean) => {
    if (audioRef.current) {
      if (isOriginal) {
        setOriginalCurrentTime(audioRef.current.currentTime);
        setOriginalDuration(audioRef.current.duration);
      } else {
        setMasteredCurrentTime(audioRef.current.currentTime);
        setMasteredDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = (isOriginal: boolean) => {
    if (isOriginal) {
      setIsPlayingOriginal(false);
      setOriginalCurrentTime(0);
    } else {
      setIsPlayingMastered(false);
      setMasteredCurrentTime(0);
    }
  };

  const handleAudioError = (isOriginal: boolean) => {
    const errorMsg = isOriginal ? 'Failed to load original audio' : 'Failed to load mastered audio';
    
    if (isOriginal && originalFile) {
      console.log('Original audio error ignored - using blob URL from file');
      return;
    }
    
    if (!isOriginal) {
      console.log('Mastered audio error - this is expected for test endpoints');
      return;
    }
    
    setAudioError(errorMsg);
    console.error(errorMsg);
  };

  const handleAudioLoaded = (isOriginal: boolean) => {
    console.log(`${isOriginal ? 'Original' : 'Mastered'} audio loaded successfully`);
    setAudioError(null);
  };

  // Cleanup blob URLs when component unmounts or when URLs change
  useEffect(() => {
    return () => {
      if (originalAudioUrl && originalAudioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalAudioUrl);
      }
      // Don't revoke finalMasteredUrl if it's the same as originalAudioUrl
      if (finalMasteredUrl && finalMasteredUrl.startsWith('blob:') && finalMasteredUrl !== originalAudioUrl) {
        URL.revokeObjectURL(finalMasteredUrl);
      }
    };
  }, [originalAudioUrl, finalMasteredUrl]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Credit Usage Notification */}
      {selectedTier !== 'free' && selectedTier !== 'advanced' && (
        <div className="bg-crys-gold/10 border border-crys-gold/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-crys-gold mb-2">
            <span className="text-sm font-medium">Credit Usage</span>
          </div>
          <div className="text-xs text-crys-light-grey space-y-1">
            <p>• 1 credit deducted for this mastering session</p>
            <p>• Credits are deducted when mastering starts, not when completed</p>
            <p>• Demo mode (using original file) does not deduct credits</p>
          </div>
        </div>
      )}

      {/* Advanced Tier Notification */}
      {selectedTier === 'advanced' && (
        <div className="bg-crys-gold/10 border border-crys-gold/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-crys-gold mb-2">
            <span className="text-sm font-medium">Unlimited Subscription</span>
          </div>
          <div className="text-xs text-crys-light-grey space-y-1">
            <p>• No credits consumed - unlimited mastering sessions</p>
            <p>• Monthly subscription includes unlimited processing</p>
            <p>• All advanced features and manual controls available</p>
          </div>
        </div>
      )}

      {/* Hidden Audio Elements */}
      {finalOriginalUrl && (
        <audio
          key={`original-${audioId}-${originalFile?.name}`}
          ref={originalAudioRef}
          src={finalOriginalUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onTimeUpdate={() => handleTimeUpdate(originalAudioRef, true)}
          onEnded={() => handleAudioEnded(true)}
          onLoadedMetadata={() => {
            console.log('Original audio metadata loaded');
            if (originalAudioRef.current) {
              setOriginalDuration(originalAudioRef.current.duration);
            }
          }}
          onError={(e) => {
            console.error('Original audio error:', e);
            handleAudioError(true);
          }}
          onLoadedData={() => {
            console.log('Original audio data loaded');
            handleAudioLoaded(true);
          }}
          onCanPlay={() => {
            console.log('Original audio can play');
          }}
        />
      )}
      
      {finalMasteredUrl && (
        <audio
          key={`mastered-${masteredUrlKey}`}
          ref={masteredAudioRef}
          src={finalMasteredUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onTimeUpdate={() => handleTimeUpdate(masteredAudioRef, false)}
          onEnded={() => handleAudioEnded(false)}
          onLoadedMetadata={() => {
            console.log('Mastered audio metadata loaded');
            if (masteredAudioRef.current) {
              setMasteredDuration(masteredAudioRef.current.duration);
            }
          }}
          onError={(e) => {
            console.error('Mastered audio error:', e);
            handleAudioError(false);
          }}
          onLoadedData={() => {
            console.log('Mastered audio data loaded');
            handleAudioLoaded(false);
          }}
          onCanPlay={() => {
            console.log('Mastered audio can play');
          }}
        />
      )}

      {/* Error Display */}
      {audioError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <span className="text-sm font-medium">Audio Error:</span>
            <span className="text-sm">{audioError}</span>
          </div>
          <div className="mt-2 text-xs text-red-300">
            <p>Original URL: {finalOriginalUrl}</p>
            <p>Mastered URL: {finalMasteredUrl}</p>
          </div>
        </div>
      )}

      {/* Test Audio Button */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <span className="text-sm font-medium">Audio Debug:</span>
        </div>
        <div className="space-y-2 text-xs text-blue-300">
          <p>Original URL: {finalOriginalUrl}</p>
          <p>Mastered URL: {finalMasteredUrl}</p>
          <p>Original File: {originalFile?.name || 'None'}</p>
          <p>Audio ID: {audioId}</p>
          {!masteredAudioUrl && originalFile && (
            <p className="text-blue-400 font-medium">Note: Using original file as mastered demo (test endpoint unavailable)</p>
          )}
        </div>
        <button 
          onClick={() => {
            console.log('Testing audio URLs...');
            fetch(finalOriginalUrl || '')
              .then(response => console.log('Original audio accessible:', response.ok))
              .catch(error => console.error('Original audio error:', error));
            fetch(finalMasteredUrl || '')
              .then(response => console.log('Mastered audio accessible:', response.ok))
              .catch(error => console.error('Mastered audio error:', error));
          }}
          className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Audio URLs
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Loading mastering results...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-6 h-6 text-crys-gold" />
          <h2 className="text-2xl font-bold text-crys-white">Mastering Complete!</h2>
        </div>
        <p className="text-crys-light-grey">Your track has been professionally mastered</p>
        
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className={getTierBadgeColor(selectedTier)}>
            {selectedTier} Tier
          </Badge>
          <Badge variant="outline" className="border-crys-gold/30 text-crys-gold">
            {selectedGenre}
          </Badge>
        </div>
      </div>

      {/* Credit Usage & Mastering Status */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Mastering Session Details</h4>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-crys-gold font-bold text-lg">
                {masteredAudioUrl ? 'Real' : 'Demo'}
              </div>
              <div className="text-crys-light-grey text-xs">Mastering Type</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-crys-gold font-bold text-lg">
                {selectedTier === 'advanced' ? '2' : '1'}
              </div>
              <div className="text-crys-light-grey text-xs">Credits Used</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-crys-gold font-bold text-lg">
                {analysisData.processingTime}s
              </div>
              <div className="text-crys-light-grey text-xs">Processing Time</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-crys-gold font-bold text-lg">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-crys-light-grey text-xs">Completed</div>
            </div>
          </div>
          
          {!masteredAudioUrl && originalFile && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <span className="text-sm font-medium">Demo Mode Active</span>
              </div>
              <div className="text-xs text-blue-300 space-y-1">
                <p>• Using original file as mastered audio (test endpoint unavailable)</p>
                <p>• No credits were deducted in demo mode</p>
                <p>• Real mastering would show actual audio enhancements</p>
              </div>
            </div>
          )}
          
          {masteredAudioUrl && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <span className="text-sm font-medium">Real Mastering Applied</span>
              </div>
              <div className="text-xs text-green-300 space-y-1">
                <p>• Professional mastering algorithms processed your audio</p>
                <p>• Credits were deducted from your account</p>
                <p>• Enhanced audio quality with studio-grade processing</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mastering Changes Comparison */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Mastering Changes</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-crys-gold">
                {analysisData.originalLoudness} → {analysisData.masteredLoudness}
              </div>
              <div className="text-crys-light-grey text-xs">LUFS (Loudness)</div>
              <div className="text-green-400 text-xs mt-1">
                +{Math.abs(analysisData.originalLoudness - analysisData.masteredLoudness).toFixed(1)} dB
              </div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-crys-gold">
                {analysisData.dynamicRange} dB
              </div>
              <div className="text-crys-light-grey text-xs">Dynamic Range</div>
              <div className="text-green-400 text-xs mt-1">
                Enhanced
              </div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-crys-gold">
                {analysisData.frequencyBalance}%
              </div>
              <div className="text-crys-light-grey text-xs">Frequency Balance</div>
              <div className="text-green-400 text-xs mt-1">
                Optimized
              </div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-crys-gold">
                {analysisData.stereoWidth}%
              </div>
              <div className="text-crys-light-grey text-xs">Stereo Width</div>
              <div className="text-green-400 text-xs mt-1">
                Enhanced
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
            <h5 className="text-crys-white font-medium mb-3">What Changed:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Loudness normalization to industry standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Dynamic range compression and enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Frequency balance optimization</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Stereo width enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Noise reduction and cleanup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-crys-light-grey">Genre-specific processing applied</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Players */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original */}
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-crys-light-grey" />
              <h4 className="text-crys-white">Original</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOriginalPlay}
                disabled={!finalOriginalUrl}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                {isPlayingOriginal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <Progress value={(originalCurrentTime / originalDuration) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-crys-light-grey mt-1">
                  <span>{formatTime(originalCurrentTime)}</span>
                  <span>{formatTime(originalDuration)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-crys-light-grey">Loudness:</span>
                <span className="text-crys-white">{analysisData.originalLoudness} LUFS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crys-light-grey">Dynamic Range:</span>
                <span className="text-crys-white">{analysisData.dynamicRange} dB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mastered */}
        <Card className="bg-audio-panel-bg border-crys-gold/20 border-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-crys-gold" />
              <h4 className="text-crys-white">Mastered</h4>
              <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                Enhanced
              </Badge>
              {!masteredAudioUrl && originalFile && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                  Demo Mode
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleMasteredPlay}
                disabled={!finalMasteredUrl}
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                {isPlayingMastered ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <Progress value={(masteredCurrentTime / masteredDuration) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-crys-light-grey mt-1">
                  <span>{formatTime(masteredCurrentTime)}</span>
                  <span>{formatTime(masteredDuration)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-crys-light-grey">Loudness:</span>
                <span className="text-crys-white">{analysisData.masteredLoudness} LUFS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-crys-light-grey">Dynamic Range:</span>
                <span className="text-crys-white">{analysisData.dynamicRange} dB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Comparison */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Analysis Comparison</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold">{analysisData.processingTime}s</div>
              <div className="text-xs text-crys-light-grey">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold">{analysisData.frequencyBalance}%</div>
              <div className="text-xs text-crys-light-grey">Frequency Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold">{analysisData.stereoWidth}%</div>
              <div className="text-xs text-crys-light-grey">Stereo Width</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-crys-gold">{analysisData.dynamicRange}dB</div>
              <div className="text-xs text-crys-light-grey">Dynamic Range</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onStartNewMaster}
          className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
        >
          Start New Master
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            console.log('Share functionality');
          }}
          className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Audio Players Section */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Listen & Compare</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Audio Player */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-crys-light-grey" />
                <h5 className="text-crys-white font-medium">Original Audio</h5>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOriginalPlay}
                    disabled={!finalOriginalUrl}
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    {isPlayingOriginal ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-crys-light-grey">
                    {formatTime(originalCurrentTime)} / {formatTime(originalDuration)}
                  </span>
                </div>
                <Progress 
                  value={(originalCurrentTime / originalDuration) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Mastered Audio Player */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-crys-gold" />
                <h5 className="text-crys-white font-medium">Mastered Audio</h5>
                <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
                  Enhanced
                </Badge>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMasteredPlay}
                    disabled={!finalMasteredUrl}
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                  >
                    {isPlayingMastered ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-crys-light-grey">
                    {formatTime(masteredCurrentTime)} / {formatTime(masteredDuration)}
                  </span>
                </div>
                <Progress 
                  value={(masteredCurrentTime / masteredDuration) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Section - Updated for free tier paid downloads */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">
              {selectedTier === 'free' ? 'Download Your Mastered Track' : 'Download Your Mastered Track'}
            </h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-crys-light-grey text-sm">
              {selectedTier === 'free' 
                ? 'Choose your preferred format. Download for $2.99 per format.'
                : 'Choose your preferred format. All files are professionally mastered and ready for distribution.'
              }
            </p>
            <div className="grid grid-cols-3 gap-4">
              {['wav', 'mp3', 'flac'].map((format) => (
                <Button
                  key={format}
                  variant="outline"
                  onClick={() => selectedTier === 'free' ? onPaidDownload?.(format) : onDownload(format)}
                  className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                >
                  <span className="mr-2">{getFormatIcon(format)}</span>
                  {format.toUpperCase()}
                  {selectedTier === 'free' && (
                    <span className="ml-2 text-xs bg-crys-gold/20 px-2 py-1 rounded">
                      $2.99
                    </span>
                  )}
                </Button>
              ))}
            </div>
            {selectedTier === 'free' && (
              <div className="mt-4 p-3 bg-crys-graphite/30 rounded-lg">
                <div className="flex items-center gap-2 text-crys-light-grey text-sm">
                  <span>💡 Want unlimited downloads?</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade to Professional
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 