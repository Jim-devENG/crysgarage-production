import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import MasteringConfirmModal from '../MasteringConfirmModal';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface FreeTierCompareProps {
  targetFile: AudioFile;
  referenceFile: AudioFile;
  onNext: (masteredUrl: string) => void;
  onBack: () => void;
}

const FreeTierCompare: React.FC<FreeTierCompareProps> = ({ 
  targetFile, 
  referenceFile, 
  onNext, 
  onBack 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState('standby');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const masteredAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (masteredAudioRef.current && masteredUrl) {
      masteredAudioRef.current.src = masteredUrl;
      masteredAudioRef.current.load();
    }
  }, [masteredUrl]);

  const handleStartMastering = () => {
    console.log('🎵 FREE TIER: Showing confirmation modal');
    setShowConfirmModal(true);
  };

  const handleConfirmMastering = () => {
    setShowConfirmModal(false);
    startProcessing();
  };

  const handleCancelMastering = () => {
    setShowConfirmModal(false);
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setEngineStatus('starting');

    try {
      const formData = new FormData();
      // Required fields for master-matchering endpoint (now supports true matchering)
      formData.append('target', targetFile.file);         // Primary audio file to be mastered
      formData.append('reference', referenceFile.file);   // Reference audio file for matching
      formData.append('tier', 'free');                    // Processing tier
      formData.append('genre', 'Pop');                    // Audio genre for processing

      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setEngineStatus('finalizing');
            return prev;
          }
          
          if (prev < 20) setEngineStatus('initializing');
          else if (prev < 40) setEngineStatus('analyzing');
          else if (prev < 60) setEngineStatus('processing');
          else if (prev < 80) setEngineStatus('optimizing');
          else setEngineStatus('finalizing');
          
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch('/master-matchering', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        // CRITICAL: Extract and display actual error message from backend
        let errorMessage = `Processing failed: ${response.status}`;
        try {
          // Try to get response text first to see what we're dealing with
          const responseText = await response.clone().text();
          console.error('❌ Backend error response:', {
            status: response.status,
            statusText: response.statusText,
            body: responseText.substring(0, 500) // First 500 chars
          });
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            // FastAPI returns errors in different formats:
            // - Single error: { "detail": "message" }
            // - Multiple errors: { "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }
            if (errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                // Multiple validation errors - extract the first meaningful one
                const firstError = errorData.detail[0];
                errorMessage = firstError.msg || firstError.message || JSON.stringify(firstError);
              } else {
                // Single error message
                errorMessage = errorData.detail;
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = responseText.substring(0, 200); // Use first 200 chars of response
            }
          } catch (jsonError) {
            // Not JSON - use the text response
            errorMessage = responseText.substring(0, 200) || `${response.status} ${response.statusText || 'Error'}`;
          }
        } catch (parseError) {
          // If we can't read the response at all, use status
          console.error('❌ Failed to parse error response:', parseError);
          errorMessage = `${response.status} ${response.statusText || 'Error'}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      const masteredUrl = 
        result.file_url ||
        result.mastered_url ||
        result.masteredUrl ||
        result.processedUrl ||
        result.url;
      
      if (!masteredUrl) {
        console.error('❌ No mastered file URL found in response. Available keys:', Object.keys(result));
        throw new Error('No mastered file URL found in response. Please try again or contact support.');
      }
      
      const detectedField = Object.keys(result).find(k => result[k] === masteredUrl);
      console.log(`✅ Mastered file URL detected from field: "${detectedField}" = ${masteredUrl}`);

      const masteredFileUrl = masteredUrl.startsWith('http') 
        ? masteredUrl 
        : `${window.location.origin}${masteredUrl}`;

      setMasteredUrl(masteredFileUrl);
      setProcessingProgress(100);
      setEngineStatus('completed');
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      setEngineStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayPause = () => {
    if (masteredAudioRef.current) {
      if (isPlaying) {
        masteredAudioRef.current.pause();
      } else {
        masteredAudioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (masteredUrl) {
      onNext(masteredUrl);
    }
  };

  const getEngineStatusDisplay = () => {
    const statusMap: Record<string, { label: string; color: string }> = {
      standby: { label: 'Standby', color: 'text-gray-400' },
      starting: { label: 'Starting', color: 'text-blue-400' },
      initializing: { label: 'Initializing', color: 'text-yellow-400' },
      analyzing: { label: 'Analyzing', color: 'text-orange-400' },
      processing: { label: 'Processing', color: 'text-crys-gold' },
      optimizing: { label: 'Optimizing', color: 'text-green-400' },
      finalizing: { label: 'Finalizing', color: 'text-purple-400' },
      completed: { label: 'Completed', color: 'text-green-500' },
      error: { label: 'Error', color: 'text-red-400' }
    };
    return statusMap[engineStatus] || statusMap.standby;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const statusDisplay = getEngineStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-graphite text-white p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-crys-black" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold to-crys-gold-muted bg-clip-text text-transparent">
                Processing Engine
              </h1>
              <p className="text-crys-light-grey text-sm mt-1">Matchering Technology</p>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-8 border border-crys-gold/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {isProcessing && <Loader2 className="w-6 h-6 text-crys-gold animate-spin" />}
              {masteredUrl && <CheckCircle className="w-6 h-6 text-green-500" />}
              {error && <AlertCircle className="w-6 h-6 text-red-400" />}
              {!isProcessing && !masteredUrl && !error && <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
              <div>
                <h3 className="text-xl font-bold text-crys-white">Engine Status</h3>
                <p className={`text-sm font-semibold ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-crys-light-grey/70">Progress</div>
              <div className="text-2xl font-bold text-crys-gold">{Math.round(processingProgress)}%</div>
            </div>
          </div>

          {/* Progress Bar */}
          {(isProcessing || processingProgress > 0) && (
            <div className="mb-6">
              <div className="w-full bg-crys-graphite rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-crys-gold to-crys-gold-muted rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Files Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-crys-charcoal/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-crys-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-crys-light-grey/70">Target Track</p>
                  <p className="text-sm font-semibold text-crys-white truncate">{targetFile.name}</p>
                  <p className="text-xs text-crys-light-grey/50">{formatFileSize(targetFile.size)} MB</p>
                </div>
              </div>
            </div>
            
            <div className="bg-crys-charcoal/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-crys-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-crys-light-grey/70">Reference Track</p>
                  <p className="text-sm font-semibold text-crys-white truncate">{referenceFile.name}</p>
                  <p className="text-xs text-crys-light-grey/50">{formatFileSize(referenceFile.size)} MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="text-center">
          {/* Ready to Start */}
          {!isProcessing && !masteredUrl && !error && (
            <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-8 border border-crys-gold/20">
              <h3 className="text-2xl font-bold mb-4 text-crys-white">Ready to Process</h3>
              <p className="text-crys-light-grey/70 mb-8 max-w-2xl mx-auto">
                The Matchering engine will analyze your reference track and apply its characteristics to your target track
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="bg-crys-graphite hover:bg-crys-graphite/80 text-crys-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleStartMastering}
                  className="bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black px-10 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-crys-gold/20 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Processing
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-8 border border-crys-gold/20">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Loader2 className="w-8 h-8 text-crys-gold animate-spin" />
                <h3 className="text-2xl font-bold text-crys-gold">Processing...</h3>
              </div>
              <p className="text-crys-light-grey/70">
                Analyzing and matching audio characteristics
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
              <div className="flex items-center justify-center gap-4 mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-red-400">Processing Error</h3>
              </div>
              <p className="text-red-300/80 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="bg-crys-graphite hover:bg-crys-graphite/80 text-crys-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={startProcessing}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {masteredUrl && (
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30">
              <div className="flex items-center justify-center gap-4 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-2xl font-bold text-green-400">Processing Complete!</h3>
              </div>
              <p className="text-green-300/80 mb-6">Your track has been successfully mastered</p>
              
              {/* Preview Player */}
              <div className="bg-crys-charcoal/50 rounded-xl p-6 mb-6 max-w-md mx-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="w-14 h-14 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-crys-black" />
                    ) : (
                      <Play className="w-6 h-6 text-crys-black ml-0.5" />
                    )}
                  </button>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-crys-white">Mastered Audio</p>
                    <p className="text-sm text-crys-light-grey/70">Click to preview</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="bg-crys-graphite hover:bg-crys-graphite/80 text-crys-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Start Over
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black px-10 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-crys-gold/20 transition-all inline-flex items-center gap-2"
                >
                  Download
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={masteredAudioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Mastering Confirmation Modal */}
      <MasteringConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmMastering}
        onCancel={handleCancelMastering}
        tier="free"
      />
    </div>
  );
};

export default FreeTierCompare;
