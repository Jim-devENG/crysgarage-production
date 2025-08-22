import React, { useState, useEffect } from 'react';
import { FileAudio, Upload, Zap, Music, Headphones, Settings, Sparkles } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-full mb-4 shadow-lg">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold bg-clip-text text-transparent mb-2">
          Advanced Tier Studio
        </h2>
        <p className="text-gray-300 text-base max-w-xl mx-auto leading-relaxed">
          Experience professional audio mastering with cutting-edge technology and premium equipment
        </p>
      </div>
      
      {/* Main Upload Section */}
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-600 shadow-xl">
          {/* Upload Area */}
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-500 ${
            selectedFile 
              ? 'border-green-500/50 bg-green-900/20 shadow-green-500/20' 
              : isHovered
                ? 'border-crys-gold/50 bg-crys-gold/5 shadow-crys-gold/20'
                : 'border-gray-500/50 hover:border-crys-gold/30'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={onFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {selectedFile ? (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                    <FileAudio className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-green-400">File Uploaded Successfully!</h3>
                  <p className="text-gray-300 mb-4 text-sm">Your audio is ready for professional mastering</p>
                  <div className="bg-gray-600/50 text-gray-300 px-6 py-2 rounded-lg font-semibold inline-block hover:bg-gray-500/50 transition-colors text-sm">
                    Change File
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-12 h-12 mx-auto mb-4 transition-all duration-300 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}>
                    <Upload className="w-full h-full text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">Choose Your Audio File</h3>
                  <p className="text-gray-300 mb-4 text-sm">WAV, MP3, FLAC, or other audio formats</p>
                  <div className="bg-gradient-to-r from-crys-gold to-yellow-500 text-black px-6 py-2 rounded-lg font-bold hover:from-yellow-400 hover:to-crys-gold transition-all transform hover:scale-105 shadow-lg text-sm">
                    Browse Files
                  </div>
                </>
              )}
            </label>
          </div>
          
          {/* File Info Section */}
          <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            {selectedFile && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg animate-fade-in">
                <p className="text-green-400 text-xs font-medium flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  File uploaded successfully!
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileAudio className="w-4 h-4 text-crys-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {selectedFile?.name || fileInfo?.name || 'No file selected'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {selectedFile 
                      ? (selectedFile.size / 1024 / 1024).toFixed(2) 
                      : fileInfo 
                        ? (fileInfo.size / 1024 / 1024).toFixed(2) 
                        : '0'
                    } MB
                  </p>
                  {!selectedFile && fileInfo && (
                    <p className="text-xs text-yellow-400 mt-1 flex items-center">
                      <span className="w-1 h-1 bg-yellow-400 rounded-full mr-1"></span>
                      File needs to be re-uploaded to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enter Studio Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  console.log('Enter Studio button clicked!');
                  console.log('selectedFile:', selectedFile);
                  console.log('fileInfo:', fileInfo);
                  onContinue();
                }}
                disabled={!selectedFile}
                className={`w-full py-3 px-6 rounded-lg font-bold text-base transition-all transform ${
                  selectedFile 
                    ? 'bg-gradient-to-r from-crys-gold to-yellow-500 text-black hover:from-yellow-400 hover:to-crys-gold hover:scale-105 shadow-xl hover:shadow-crys-gold/25' 
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                } flex items-center justify-center space-x-2`}
              >
                <span>Enter Studio</span>
                <Zap className="w-5 h-5" />
              </button>
              {selectedFile && (
                <p className="text-xs text-gray-400 mt-3 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Ready to start mastering your audio
                </p>
              )}
              {!selectedFile && (
                <p className="text-xs text-red-400 mt-3 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  Please upload a file first
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-3">
              <Music className="w-4 h-4 text-crys-gold" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Professional Equipment</h3>
            <p className="text-gray-400 text-xs">Industry-standard mastering tools and premium audio processing</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-3">
              <Headphones className="w-4 h-4 text-crys-gold" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Real-time Processing</h3>
            <p className="text-gray-400 text-xs">Live audio analysis and instant feedback on your mastering</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-3">
              <Settings className="w-4 h-4 text-crys-gold" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Advanced Effects</h3>
            <p className="text-gray-400 text-xs">Sophisticated audio effects and professional mastering techniques</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
