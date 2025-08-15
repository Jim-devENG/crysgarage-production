import React from 'react';
import { ArrowLeft, Download } from 'lucide-react';

interface ExportStepProps {
  selectedFile: File | null;
  selectedGenre: any;
  processedAudioUrl: string | null;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  downloadFormat: 'wav' | 'mp3';
  setDownloadFormat: (format: 'wav' | 'mp3') => void;
  onPrev: () => void;
  onNewSession: () => void;
}

const ExportStep: React.FC<ExportStepProps> = ({
  selectedFile,
  selectedGenre,
  processedAudioUrl,
  isProcessing,
  setIsProcessing,
  downloadFormat,
  setDownloadFormat,
  onPrev,
  onNewSession
}) => {
  const handleDownload = async () => {
    if (!selectedFile || !selectedGenre) return;
    
    try {
      setIsProcessing(true);
      
      // For now, just create a simple download of the original file
      // This will be replaced with actual processing later
      const link = document.createElement('a');
      link.href = URL.createObjectURL(selectedFile);
      link.download = `mastered_${selectedFile.name.replace(/\.[^\/.]+$/, '')}.${downloadFormat}`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-crys-gold mb-2">Export Gate</h2>
        <p className="text-gray-400">Choose your preferred format and export your mastered audio</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Download Format</h3>
              <div className="grid grid-cols-2 gap-4">
                {(['wav', 'mp3'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setDownloadFormat(format)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      downloadFormat === format
                        ? 'border-crys-gold bg-crys-gold/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold uppercase">{format}</div>
                      <div className="text-sm text-gray-400">
                        {format === 'wav' ? 'Lossless Quality' : 'Compressed Format'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={!selectedGenre || isProcessing}
              className="w-full bg-crys-gold text-black py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing for Download...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Export Mastered Audio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onPrev}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={onNewSession}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          Process Another File
        </button>
      </div>
    </div>
  );
};

export default ExportStep;
