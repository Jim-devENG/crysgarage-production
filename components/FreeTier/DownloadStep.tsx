import React, { useState } from 'react';
import { Download, FileAudio, Settings, CheckCircle } from 'lucide-react';
import AdvancedDownloadSettings from '../Shared/AdvancedDownloadSettings';
import createAdvancedDownloadHandler from '../Shared/AdvancedDownloadHandler';

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

interface DownloadStepProps {
  uploadedFile: AudioFile | null;
  selectedGenre: Genre | null;
  onBack: () => void;
  onNewUpload: () => void;
  onDownload: () => Promise<void>;
  masteredAudioUrl?: string | null;
  downloadFormat?: string;
  onFormatChange?: (format: string) => void;
  tier?: string;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  uploadedFile,
  selectedGenre,
  onBack,
  onNewUpload,
  onDownload,
  masteredAudioUrl,
  downloadFormat: propDownloadFormat,
  onFormatChange,
  tier
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(propDownloadFormat || 'MP3');
  const [sampleRate, setSampleRate] = useState('44.1kHz');
  
  // Update local state when prop changes
  React.useEffect(() => {
    if (propDownloadFormat) {
      setDownloadFormat(propDownloadFormat);
    }
  }, [propDownloadFormat]);
  
  // Handle format change
  const handleFormatChange = (format: string) => {
    setDownloadFormat(format);
    if (onFormatChange) {
      onFormatChange(format);
    }
  };
  
  const advancedDownloadHandler = createAdvancedDownloadHandler();

  const handleDownload = async () => {
    if (!uploadedFile || !selectedGenre) return;
    
    setIsDownloading(true);
    
    try {
      // Use advanced download handler if we have a processed audio URL
      if (masteredAudioUrl) {
        // Convert free tier format to AdvancedDownloadHandler format
        const mappedFormat = downloadFormat === 'wav24' ? 'WAV' : 'MP3';
        
        await advancedDownloadHandler({
          originalFile: uploadedFile.file,
          processedAudioUrl: masteredAudioUrl,
          downloadFormat: mappedFormat,
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
          <CheckCircle className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-medium">Free Tier - No Cost</span>
        </div>
      </div>

      {/* File Information */}
      {uploadedFile && (
        <div className="bg-crys-charcoal rounded-lg p-6">
          <h3 className="text-crys-white font-medium mb-4">Processed File</h3>
          <div className="flex items-center space-x-4">
            <FileAudio size={24} className="text-crys-gold" />
            <div className="flex-1">
              <p className="text-crys-white font-medium">{uploadedFile.name}</p>
              <div className="flex items-center space-x-4 text-sm text-crys-light-grey">
                <span>Original: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                {uploadedFile.processedSize && (
                  <span>Processed: {(uploadedFile.processedSize / (1024 * 1024)).toFixed(2)} MB</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Genre Information */}
      {selectedGenre && (
        <div className="bg-crys-charcoal rounded-lg p-6">
          <h3 className="text-crys-white font-medium mb-4">Applied Genre</h3>
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: selectedGenre.color }}
            ></div>
            <div>
              <p className="text-crys-white font-medium">{selectedGenre.name}</p>
              <p className="text-crys-light-grey text-sm">{selectedGenre.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Download Settings */}
      <AdvancedDownloadSettings
        onDownload={handleDownload}
        isDownloading={isDownloading}
        downloadFormat={downloadFormat}
        onFormatChange={handleFormatChange}
        sampleRate={sampleRate}
        onSampleRateChange={setSampleRate}
        tier="free"
      />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-crys-graphite hover:bg-crys-graphite/80 text-crys-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Settings size={20} />
          <span>Back to Processing</span>
        </button>
        
        <button
          onClick={onNewUpload}
          className="px-6 py-3 bg-crys-charcoal hover:bg-crys-charcoal/80 text-crys-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Upload New File</span>
        </button>
      </div>
    </div>
  );
};

export default DownloadStep;
