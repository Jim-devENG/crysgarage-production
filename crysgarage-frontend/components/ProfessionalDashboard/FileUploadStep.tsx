import React from 'react';
import { Upload, FileAudio, ArrowRight } from 'lucide-react';
import { FileInfo } from './types';

interface FileUploadStepProps {
  onFileUpload: (file: File) => void;
  selectedFile: File | null;
  fileInfo: FileInfo | null;
  onNext: () => void;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onFileUpload,
  selectedFile,
  fileInfo,
  onNext
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-crys-gold mb-2">Upload Your Audio</h2>
        <p className="text-gray-400">Select your audio file to begin professional mastering</p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-crys-gold transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Drop your audio file here</h3>
          <p className="text-gray-400 mb-4">Supports WAV, MP3, FLAC, and other audio formats</p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
          >
            Choose File
          </label>
        </div>
        
        {(selectedFile || fileInfo) && (
          <div className="mt-6 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileAudio className="w-6 h-6 text-crys-gold" />
                <div>
                  <h4 className="font-semibold">{selectedFile?.name || fileInfo?.name}</h4>
                  <p className="text-sm text-gray-400">
                    {selectedFile 
                      ? (selectedFile.size / 1024 / 1024).toFixed(2) 
                      : fileInfo 
                        ? (fileInfo.size / 1024 / 1024).toFixed(2) 
                        : '0'
                    } MB
                  </p>
                  {!selectedFile && fileInfo && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ⚠️ File needs to be re-uploaded to continue
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onNext}
                disabled={!selectedFile}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                  selectedFile 
                    ? 'bg-crys-gold text-black hover:bg-yellow-400' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadStep;
