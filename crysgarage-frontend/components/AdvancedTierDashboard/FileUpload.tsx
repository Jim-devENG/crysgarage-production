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
    <div className="max-w-4xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-crys-gold to-yellow-500 rounded-full mb-6 shadow-2xl">
          <Sparkles className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-crys-gold via-yellow-400 to-crys-gold bg-clip-text text-transparent mb-4">
          Advanced Tier Studio
        </h2>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
          Experience professional audio mastering with cutting-edge technology and premium equipment
        </p>
      </div>
      
      {/* Main Upload Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-700/50 to-gray-800/50 rounded-2xl p-8 border border-gray-600/30 backdrop-blur-xl shadow-2xl">
          {/* Upload Area */}
          <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-500 ${
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
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                    <FileAudio className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-green-400">File Uploaded Successfully!</h3>
                  <p className="text-gray-300 mb-6 text-lg">Your audio is ready for professional mastering</p>
                  <div className="bg-gray-600/50 text-gray-300 px-8 py-3 rounded-lg font-semibold inline-block hover:bg-gray-500/50 transition-colors">
                    Change File
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-20 h-20 mx-auto mb-6 transition-all duration-300 ${
                    isHovered ? 'scale-110' : 'scale-100'
                  }`}>
                    <Upload className="w-full h-full text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">Choose Your Audio File</h3>
                  <p className="text-gray-300 mb-6 text-lg">WAV, MP3, FLAC, or other audio formats</p>
                  <div className="bg-gradient-to-r from-crys-gold to-yellow-500 text-black px-8 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-crys-gold transition-all transform hover:scale-105 shadow-lg">
                    Browse Files
                  </div>
                </>
              )}
            </label>
          </div>
          
          {/* File Info Section */}
          <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-600/30">
            {selectedFile && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg animate-fade-in">
                <p className="text-green-400 text-sm font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  File uploaded successfully!
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileAudio className="w-6 h-6 text-crys-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-lg">
                    {selectedFile?.name || fileInfo?.name || 'No file selected'}
                  </h4>
                  <p className="text-sm text-gray-400">
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
                className={`w-full py-5 px-8 rounded-xl font-bold text-xl transition-all transform ${
                  selectedFile 
                    ? 'bg-gradient-to-r from-crys-gold to-yellow-500 text-black hover:from-yellow-400 hover:to-crys-gold hover:scale-105 shadow-2xl hover:shadow-crys-gold/25' 
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                } flex items-center justify-center space-x-3`}
              >
                <span>Enter Studio</span>
                <Zap className="w-7 h-7" />
              </button>
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-4 flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Ready to start mastering your audio
                </p>
              )}
              {!selectedFile && (
                <p className="text-sm text-red-400 mt-4 flex items-center justify-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  Please upload a file first
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-4">
              <Music className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Professional Equipment</h3>
            <p className="text-gray-400 text-sm">Industry-standard mastering tools and premium audio processing</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-4">
              <Headphones className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Processing</h3>
            <p className="text-gray-400 text-sm">Live audio analysis and instant feedback on your mastering</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-crys-gold/30 transition-all duration-300">
            <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-crys-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Effects</h3>
            <p className="text-gray-400 text-sm">Sophisticated audio effects and professional mastering techniques</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
