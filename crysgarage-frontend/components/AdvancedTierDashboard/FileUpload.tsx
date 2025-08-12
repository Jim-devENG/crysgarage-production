import React from 'react';
import { FileAudio, Upload, Zap } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  fileInfo: {name: string, size: number, type: string} | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  selectedFile, 
  fileInfo, 
  onFileUpload, 
  onContinue 
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
        <p className="text-gray-400">Drag and drop your audio file or click to browse</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
        <div className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center hover:border-crys-gold transition-colors">
          <input
            type="file"
            accept="audio/*"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Choose Audio File</h3>
            <p className="text-gray-400 mb-4">WAV, MP3, FLAC, or other audio formats</p>
            <div className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-block">
              Browse Files
            </div>
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
                onClick={onContinue}
                disabled={!selectedFile}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                  selectedFile 
                    ? 'bg-crys-gold text-black hover:bg-yellow-400' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Enter Studio</span>
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
