import React, { useState } from 'react';
import { Download, ArrowLeft, CreditCard, DollarSign } from 'lucide-react';
import AdvancedDownloadSettings from '../Shared/AdvancedDownloadSettings';
import createAdvancedDownloadHandler from '../Shared/AdvancedDownloadHandler';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface Genre {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface DownloadStepProps {
  uploadedFile: AudioFile | null;
  selectedGenre: Genre | null;
  onBack: () => void;
  onNewUpload: () => void;
  onDownload: () => Promise<void>;
  masteredAudioUrl?: string | null;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  uploadedFile,
  selectedGenre,
  onBack,
  onNewUpload,
  onDownload,
  masteredAudioUrl
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('MP3');
  const [sampleRate, setSampleRate] = useState('44.1kHz');
  
  const advancedDownloadHandler = createAdvancedDownloadHandler();

  const handleDownload = async () => {
    if (!uploadedFile || !selectedGenre) return;
    
    setIsDownloading(true);
    
    try {
      // Use advanced download handler if we have a processed audio URL
      if (masteredAudioUrl) {
        await advancedDownloadHandler({
          originalFile: uploadedFile.file,
          processedAudioUrl: masteredAudioUrl,
          downloadFormat,
          sampleRate,
          genre: selectedGenre.name
        });
      } else {
        // Fallback to original download method
        await onDownload();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Download Your Mastered Audio</h1>
        <p className="text-gray-400">Export your processed audio with the selected genre preset</p>
        
        {/* Pricing Information */}
        <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-500/30 rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">
            Download Cost: <span className="text-white">$2.99 per download</span>
          </span>
        </div>
      </div>

      {/* File Information */}
      {uploadedFile && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            File Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Name:</span>
                <span className="text-white font-medium">{uploadedFile.file.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">File Size:</span>
                <span className="text-white font-medium">
                  {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Selected Genre:</span>
                <span className="text-white font-medium">{selectedGenre?.name || 'None'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Processing:</span>
                <span className="text-amber-400 font-medium">Real-time</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Quality:</span>
                <span className="text-white font-medium">Professional</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Format:</span>
                <span className="text-white font-medium">WAV 24-bit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Download Settings */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <AdvancedDownloadSettings
          onDownload={handleDownload}
          isDownloading={isDownloading}
          downloadFormat={downloadFormat}
          onFormatChange={setDownloadFormat}
          sampleRate={sampleRate}
          onSampleRateChange={setSampleRate}
          tier="free"
        />
      </div>

      {/* Credit Purchase Information */}
      <div className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border border-amber-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Download Credits Required
        </h3>
        <div className="text-center space-y-3">
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">Mastering is FREE!</span> But to download your mastered audio, you need credits.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
              <span className="text-gray-300">$2.99 = 1 Download</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
              <span className="text-gray-300">Pay-per-download model</span>
            </div>
          </div>
          <p className="text-xs text-amber-300">
            Each mastered audio download costs $2.99.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Processing
        </button>
        
        <button
          onClick={onNewUpload}
          className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          Start New Master
        </button>
      </div>
    </div>
  );
};

export default DownloadStep;
