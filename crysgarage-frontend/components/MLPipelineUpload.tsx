import React, { useState, useRef } from 'react';
import { useMLPipeline } from '../hooks/useMLPipeline';
import { mlPipelineService } from '../services/mlPipelineAPI';
import { useAuth } from '../contexts/AuthenticationContext';

interface MLPipelineUploadProps {
  onProcessingComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

const MLPipelineUpload: React.FC<MLPipelineUploadProps> = ({
  onProcessingComplete,
  onError,
}) => {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTier, setSelectedTier] = useState<'free' | 'professional' | 'advanced' | 'one_on_one'>('free');
  const [selectedGenre, setSelectedGenre] = useState<'hip_hop' | 'afrobeats' | 'gospel' | 'highlife' | 'r_b' | 'general'>('hip_hop');
  const [recommendations, setRecommendations] = useState<any>(null);

  const {
    isProcessing,
    isUploading,
    currentStep,
    progress,
    error,
    uploadResult,
    processResult,
    processAudioFile,
    reset,
    getRecommendations,
  } = useMLPipeline();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Get recommendations for the selected tier and genre
      getRecommendations(selectedTier, selectedGenre)
        .then(setRecommendations)
        .catch(console.error);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      getRecommendations(selectedTier, selectedGenre)
        .then(setRecommendations)
        .catch(console.error);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    // Check authentication first
    if (!isAuthenticated) {
      if (onError) {
        onError('Please log in to process audio files');
      }
      return;
    }

    // Check tier access for non-free tiers
    if (selectedTier !== 'free' && user?.tier !== selectedTier) {
      if (onError) {
        onError(`You need ${selectedTier} tier access to use this feature. Please upgrade your account.`);
      }
      return;
    }

    // Check credits for non-free tiers
    if (selectedTier !== 'free' && user?.credits && user.credits <= 0) {
      if (onError) {
        onError('Insufficient credits. Please purchase more credits to continue.');
      }
      return;
    }

    try {
      await processAudioFile(selectedFile, selectedTier, selectedGenre);
      if (processResult && onProcessingComplete) {
        onProcessingComplete(processResult);
      }
    } catch (error: any) {
      if (onError) {
        onError(error.message);
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setRecommendations(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case 'uploading':
        return 'Uploading audio file...';
      case 'processing':
        return 'Processing with ML pipeline...';
      case 'completed':
        return 'Processing completed!';
      case 'error':
        return 'Processing failed';
      default:
        return 'Ready to process';
    }
  };

  const getAvailableFormats = () => {
    return mlPipelineService.getAvailableFormats(selectedTier);
  };

  const getEstimatedTime = () => {
    return mlPipelineService.getEstimatedProcessingTime(selectedTier);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-crys-charcoal rounded-lg border border-crys-graphite">
      <h2 className="text-2xl font-bold text-crys-white mb-6">ML Pipeline Audio Processing</h2>
      
      {/* User Info */}
      {isAuthenticated && user && (
        <div className="mb-6 p-4 bg-crys-graphite rounded-lg border border-crys-gold">
          <h3 className="text-lg font-semibold text-crys-white mb-2">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-crys-gold">Current Tier</div>
              <div className="text-crys-light-grey capitalize">{user.tier || 'Free'}</div>
            </div>
            <div>
              <div className="font-medium text-crys-gold">Credits</div>
              <div className="text-crys-light-grey">{user.credits || 0}</div>
            </div>
            <div>
              <div className="font-medium text-crys-gold">Email</div>
              <div className="text-crys-light-grey">{user.email}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
          selectedFile
            ? 'border-crys-gold bg-crys-graphite'
            : 'border-crys-graphite hover:border-crys-gold'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-crys-gold font-semibold">✓ File Selected</div>
            <div className="text-crys-white">{selectedFile.name}</div>
            <div className="text-sm text-crys-light-grey">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-crys-light-grey">
              <svg className="mx-auto h-12 w-12 text-crys-gold" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-crys-white">Drop your audio file here</p>
              <p className="text-sm text-crys-light-grey">or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-crys-gold text-crys-black rounded-lg hover:bg-crys-gold-muted transition-colors font-semibold"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Configuration */}
      {selectedFile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tier Selection */}
          <div>
            <label className="block text-sm font-medium text-crys-white mb-2">
              Processing Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="w-full p-3 border border-crys-graphite rounded-lg focus:ring-2 focus:ring-crys-gold focus:border-transparent bg-crys-charcoal text-crys-white"
              disabled={isProcessing}
            >
              <option value="free" className="bg-crys-charcoal text-crys-white">Free - Basic Processing</option>
              <option value="professional" className="bg-crys-charcoal text-crys-white">Professional - Enhanced Processing</option>
              <option value="advanced" className="bg-crys-charcoal text-crys-white">Advanced - Premium Processing</option>
              <option value="one_on_one" className="bg-crys-charcoal text-crys-white">One-on-One - Expert Processing</option>
            </select>
            <div className="mt-2 text-sm text-crys-light-grey">
              <div>Formats: {getAvailableFormats().join(', ')}</div>
              <div>Est. Time: {getEstimatedTime()}</div>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-sm font-medium text-crys-white mb-2">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as any)}
              className="w-full p-3 border border-crys-graphite rounded-lg focus:ring-2 focus:ring-crys-gold focus:border-transparent bg-crys-charcoal text-crys-white"
              disabled={isProcessing}
            >
              <option value="hip_hop" className="bg-crys-charcoal text-crys-white">Hip Hop</option>
              <option value="afrobeats" className="bg-crys-charcoal text-crys-white">Afrobeats</option>
              <option value="gospel" className="bg-crys-charcoal text-crys-white">Gospel</option>
              <option value="highlife" className="bg-crys-charcoal text-crys-white">Highlife</option>
              <option value="r_b" className="bg-crys-charcoal text-crys-white">R&B</option>
              <option value="general" className="bg-crys-charcoal text-crys-white">General</option>
            </select>
          </div>
        </div>
      )}

      {/* ML Recommendations Preview */}
      {recommendations && (
        <div className="mb-6 p-4 bg-crys-graphite rounded-lg border border-crys-gold">
          <h3 className="text-lg font-semibold text-crys-white mb-3">ML Recommendations Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-crys-gold">EQ Settings</div>
              <div className="text-crys-light-grey">
                Low: {recommendations.eq.low}x<br/>
                Mid: {recommendations.eq.mid}x<br/>
                High: {recommendations.eq.high}x
              </div>
            </div>
            <div>
              <div className="font-medium text-crys-gold">Compression</div>
              <div className="text-crys-light-grey">
                Ratio: {recommendations.compression.ratio}:1<br/>
                Threshold: {recommendations.compression.threshold}dB
              </div>
            </div>
            <div>
              <div className="font-medium text-crys-gold">Genre</div>
              <div className="text-crys-light-grey capitalize">{recommendations.genre}</div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-crys-graphite rounded-lg border border-crys-gold">
          <div className="flex items-center justify-between mb-2">
            <span className="text-crys-white font-medium">{getStepText()}</span>
            <span className="text-crys-gold text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-crys-charcoal rounded-full h-2">
            <div
              className="bg-crys-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-crys-graphite border border-red-500 rounded-lg">
          <div className="text-red-400 font-medium">Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      )}

      {/* Results */}
      {processResult && (
        <div className="mb-6 p-4 bg-crys-graphite border border-crys-gold rounded-lg">
          <h3 className="text-lg font-semibold text-crys-white mb-3">Processing Complete!</h3>
          <div className="space-y-2 text-sm">
            <div><strong className="text-crys-gold">Audio ID:</strong> <span className="text-crys-light-grey">{processResult.audio_id}</span></div>
            <div><strong className="text-crys-gold">Processing Time:</strong> <span className="text-crys-light-grey">{processResult.processing_time}</span></div>
            <div><strong className="text-crys-gold">Available Formats:</strong> <span className="text-crys-light-grey">{Object.keys(processResult.download_urls).join(', ')}</span></div>
          </div>
          
          {/* Audio Player */}
          <div className="mt-4 p-4 bg-crys-charcoal rounded-lg border border-crys-graphite">
            <h4 className="text-crys-gold font-medium mb-3">🎵 Audio Preview</h4>
            <audio 
              controls 
              className="w-full h-10 bg-crys-charcoal text-crys-white"
              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
            >
              <source src={processResult.download_urls.wav} type="audio/wav" />
              <source src={processResult.download_urls.mp3} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-crys-light-grey mt-2">
              Preview the mastered audio before downloading
            </p>
          </div>
          
          <div className="mt-4 space-x-2">
            {Object.entries(processResult.download_urls).map(([format, url]) => (
              <a
                key={format}
                href={url}
                download
                className="inline-block px-3 py-1 bg-crys-gold text-crys-black text-sm rounded hover:bg-crys-gold-muted transition-colors font-semibold"
              >
                Download {format.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {selectedFile && !isProcessing && (
          <button
            onClick={handleProcess}
            className="px-6 py-3 bg-crys-gold text-crys-black rounded-lg hover:bg-crys-gold-muted transition-colors font-semibold"
          >
            Start ML Processing
          </button>
        )}
        
        {(selectedFile || isProcessing || processResult) && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-crys-graphite text-crys-white rounded-lg hover:bg-crys-charcoal transition-colors font-medium border border-crys-gold"
            disabled={isProcessing}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MLPipelineUpload;
