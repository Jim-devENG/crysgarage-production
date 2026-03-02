import React, { useState, useEffect } from 'react';
import { FileAudio, Upload, Zap, Music, Headphones, Settings, Sparkles, CreditCard } from 'lucide-react';
import { creditsAPI } from '../../services/api';

interface FileUploadProps {
  selectedFile: File | null;
  fileInfo: {name: string, size: number, type: string} | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onContinue: () => void;
  userCredits?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  selectedFile, 
  fileInfo, 
  onFileUpload, 
  onContinue,
  userCredits = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Mastering Requirements */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-crys-gold/10 to-crys-gold/5 border border-crys-gold/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-crys-gold mb-4 flex items-center justify-center gap-2">
            <Settings className="w-5 h-5" />
            Mastering Requirements
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Headroom Requirements */}
            <div className="space-y-3">
              <h4 className="text-crys-gold font-medium text-sm">Headroom Requirements</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Minimum:</span>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">-8 dB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Maximum:</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">-4 dB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Best Result:</span>
                  <span className="px-2 py-1 bg-crys-gold/20 text-crys-gold rounded border border-crys-gold/30">-6 dB</span>
                </div>
              </div>
            </div>
            
            {/* Audio Preparation */}
            <div className="space-y-3">
              <h4 className="text-crys-gold font-medium text-sm">Audio Preparation</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Normalize audio</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Avoid clipping</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Maintain dynamics</span>
                </div>
              </div>
            </div>

            {/* Format Requirements */}
            <div className="space-y-3">
              <h4 className="text-crys-gold font-medium text-sm">Format Requirements</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>WAV/MP3/FLAC</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>44.1kHz+</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>16-bit+</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-crys-gold/10 rounded-lg border border-crys-gold/20">
            <p className="text-xs text-crys-gold text-center">
                              <span className="font-semibold">Pro Tip:</span> -6 dB headroom is the sweet spot for mastering. 
                This gives our Crys Garage Engine enough room to work with while maintaining your mix's dynamics and character.
            </p>
          </div>
        </div>
      </div>

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
        
        {/* Credit Display */}
        <div className="mt-4 inline-flex items-center gap-2 bg-crys-gold/10 border border-crys-gold/20 rounded-lg px-4 py-2">
          <CreditCard className="w-4 h-4 text-crys-gold" />
          <span className="text-sm text-crys-gold font-medium">
            Available Credits: <span className="text-crys-white">{userCredits}</span>
          </span>
        </div>
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
                  <h4 className="text-sm font-medium text-white">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {selectedFile 
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Select an audio file to continue'
                    }
                  </p>
                </div>
              </div>
              
              {selectedFile && (
                <button
                  onClick={onContinue}
                  className="bg-gradient-to-r from-crys-gold to-yellow-500 text-black px-6 py-2 rounded-lg font-bold hover:from-yellow-400 hover:to-crys-gold transition-all transform hover:scale-105 shadow-lg text-sm flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Continue to Studio
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
