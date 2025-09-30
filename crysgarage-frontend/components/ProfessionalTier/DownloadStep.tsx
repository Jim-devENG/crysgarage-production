import React, { useState } from 'react';
import { Download, FileAudio, Settings, CheckCircle } from 'lucide-react';
import AdvancedDownloadSettings from '../Shared/AdvancedDownloadSettings';
import createAdvancedDownloadHandler from '../Shared/AdvancedDownloadHandler';

interface DownloadStepProps {
  onDownload: () => void;
  downloadFormat: 'mp3' | 'wav16' | 'wav24';
  onFormatChange: (format: 'mp3' | 'wav16' | 'wav24') => void;
  isDownloading?: boolean;
  originalFile?: File | null;
  processedAudioUrl?: string | null;
  genre?: string;
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  onDownload,
  downloadFormat,
  onFormatChange,
  isDownloading = false,
  originalFile,
  processedAudioUrl,
  genre
}) => {
  const [sampleRate, setSampleRate] = useState('44.1kHz');
  const advancedDownloadHandler = createAdvancedDownloadHandler();

  // Convert professional tier format to advanced format
  const getAdvancedFormat = () => {
    switch (downloadFormat) {
      case 'wav24': return 'WAV';
      case 'wav16': return 'WAV';
      case 'mp3': return 'MP3';
      default: return 'WAV';
    }
  };

  const handleAdvancedDownload = async () => {
    if (!originalFile || !processedAudioUrl) {
      // Fallback to original download method
      await onDownload();
      return;
    }

    try {
      await advancedDownloadHandler({
        originalFile,
        processedAudioUrl,
        downloadFormat: getAdvancedFormat(),
        sampleRate,
        genre
      });
    } catch (error) {
      console.error('Advanced download failed:', error);
      // Fallback to original download method
      await onDownload();
    }
  };

  return (
    <div className="bg-crys-graphite rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <Download className="w-5 h-5 mr-2 text-crys-gold" />
        Download Options
      </h3>

      {/* Advanced Download Settings */}
      <AdvancedDownloadSettings
        onDownload={handleAdvancedDownload}
        isDownloading={isDownloading}
        downloadFormat={getAdvancedFormat()}
        onFormatChange={(format) => {
          // Convert advanced format back to professional format
          switch (format) {
            case 'WAV': onFormatChange('wav24'); break;
            case 'MP3': onFormatChange('mp3'); break;
            case 'FLAC': onFormatChange('wav24'); break; // Map FLAC to WAV24
            case 'AIFF': onFormatChange('wav24'); break; // Map AIFF to WAV24
            default: onFormatChange('wav24');
          }
        }}
        sampleRate={sampleRate}
        onSampleRateChange={setSampleRate}
        tier="professional"
      />
    </div>
  );
};

export default DownloadStep;
