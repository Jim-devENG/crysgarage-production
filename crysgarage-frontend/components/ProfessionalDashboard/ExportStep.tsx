import React, { useState } from 'react';
import { ArrowLeft, Download, RotateCcw } from 'lucide-react';

interface ExportStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  processedAudioUrl: string | null;
  onBack: () => void;
  onRestart: () => void;
}

const ExportStep: React.FC<ExportStepProps> = ({
  selectedFile,
  selectedGenre,
  processedAudioUrl,
  onBack,
  onRestart
}) => {
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('wav');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!processedAudioUrl) return;

    setIsDownloading(true);
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      
      // Generate filename
      const originalName = selectedFile?.name || 'audio';
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const genreName = selectedGenre?.name || 'mastered';
      const filename = `${nameWithoutExt}_${genreName}_mastered.${downloadFormat}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-crys-gold">Export Your Mastered Audio</h2>
            <p className="text-gray-400">Download your professionally mastered track</p>
          </div>
        </div>
      </div>

      {/* Processing Summary */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Processing Summary</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Original File</h4>
            <p className="text-sm text-gray-400">{selectedFile?.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-2">Applied Genre</h4>
            <p className="text-sm text-crys-gold">{selectedGenre?.name}</p>
            <p className="text-xs text-gray-500">Professional mastering preset</p>
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Download Options</h3>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-3">Select Format</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDownloadFormat('wav')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  downloadFormat === 'wav'
                    ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                    : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">WAV</div>
                  <div className="text-xs">Lossless Quality</div>
                </div>
              </button>
              <button
                onClick={() => setDownloadFormat('mp3')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  downloadFormat === 'mp3'
                    ? 'border-crys-gold bg-crys-gold/20 text-crys-gold'
                    : 'border-gray-600 bg-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">MP3</div>
                  <div className="text-xs">Compressed</div>
                </div>
              </button>
            </div>
          </div>

          {/* Download Button */}
          <div className="bg-gray-700 rounded-lg p-4">
            <button
              onClick={handleDownload}
              disabled={!processedAudioUrl || isDownloading}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                processedAudioUrl && !isDownloading
                  ? 'bg-crys-gold hover:bg-yellow-400 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download {downloadFormat.toUpperCase()}</span>
                </>
              )}
            </button>
            
            {processedAudioUrl && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Your mastered audio is ready for download
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onRestart}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Session</span>
        </button>
        
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Back to Processing
        </button>
      </div>
    </div>
  );
};

export default ExportStep;
