import React from 'react';
import { Upload, FileAudio, ArrowRight, CreditCard } from 'lucide-react';
import { FileInfo } from './types';
import { creditsAPI } from '../../services/api';

interface FileUploadStepProps {
  onFileUpload: (file: File) => void;
  selectedFile: File | null;
  fileInfo: FileInfo | null;
  onNext: () => void;
  userCredits?: number;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onFileUpload,
  selectedFile,
  fileInfo,
  onNext,
  userCredits = 0
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
        
        {/* Credit Display */}
        <div className="mt-4 inline-flex items-center gap-2 bg-crys-gold/10 border border-crys-gold/20 rounded-lg px-4 py-2">
          <CreditCard className="w-4 h-4 text-crys-gold" />
          <span className="text-sm text-crys-gold font-medium">
            Available Credits: <span className="text-crys-white">{userCredits}</span>
          </span>
        </div>
      </div>

      {/* Mastering Requirements */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-crys-gold/10 to-crys-gold/5 border border-crys-gold/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-crys-gold mb-4 flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" />
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
                <div className="flex items-center gap-2 text-xs">
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
