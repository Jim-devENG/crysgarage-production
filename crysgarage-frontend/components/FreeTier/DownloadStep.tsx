import React, { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';

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
}

const DownloadStep: React.FC<DownloadStepProps> = ({
  uploadedFile,
  selectedGenre,
  onBack,
  onNewUpload,
  onDownload
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('');

  const handleDownload = async () => {
    if (!uploadedFile || !selectedGenre) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStage('Initializing...');
    
    try {
      await onDownload();
      setDownloadProgress(100);
      setDownloadStage('Download complete!');
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStage('Download failed');
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStage('');
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Download Your Mastered Audio</h1>
        <p className="text-gray-400">Export your processed audio with the selected genre preset</p>
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

      {/* Download Options */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Download Options
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Format</h4>
              <p className="text-sm text-gray-400">WAV 24-bit (Professional Quality)</p>
            </div>
            <div className="text-amber-400 font-semibold">Free</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Sample Rate</h4>
              <p className="text-sm text-gray-400">44.1 kHz (CD Quality)</p>
            </div>
            <div className="text-amber-400 font-semibold">Free</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Genre Preset</h4>
              <p className="text-sm text-gray-400">{selectedGenre?.name || 'None'} - {selectedGenre?.description || 'No preset applied'}</p>
            </div>
            <div className="text-amber-400 font-semibold">Free</div>
          </div>
        </div>
      </div>

             {/* Download Button */}
       <div className="text-center space-y-4">
         <button
           onClick={handleDownload}
           disabled={!selectedGenre || !uploadedFile || isDownloading}
           className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-lg font-semibold transition-colors flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden"
         >
           <Download className="w-6 h-6" />
           {isDownloading ? 'Recording Processed Audio...' : 'Download Mastered Audio'}
           
           {/* Progress bar */}
           {isDownloading && (
             <div className="absolute bottom-0 left-0 h-1 bg-amber-300 transition-all duration-300" 
                  style={{ width: `${downloadProgress}%` }} />
           )}
         </button>
         
         {isDownloading && (
           <div className="text-center">
             <p className="text-sm text-amber-400 font-medium">{downloadStage}</p>
             {downloadProgress > 0 && downloadProgress < 100 && (
               <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                 <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${downloadProgress}%` }} />
               </div>
             )}
           </div>
         )}
         
         <p className="text-sm text-gray-400">
           Your audio will be processed with the {selectedGenre?.name} preset and downloaded as a WAV file
         </p>
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
