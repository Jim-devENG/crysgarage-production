
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, ArrowRight, ArrowLeft, Download, Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Genre {
  name: string;
  description: string;
  color: string;
}

interface ProcessingSettings {
  sampleRate: '44.1kHz' | '48kHz';
  resolution: '16bit' | '32bit';
}

interface ProfessionalTierDashboardProps {
  onFileUpload?: (file: File) => void;
  credits?: number;
}

const ProfessionalTierDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    sampleRate: '44.1kHz',
    resolution: '16bit'
  });
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>('wav');
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDownload = () => {
    if (processedAudioUrl) {
      const link = document.createElement('a');
      link.href = processedAudioUrl;
      link.download = `mastered_${selectedFile?.name.replace(/\.[^\/.]+$/, '')}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold text-crys-gold mb-4">Professional Tier Dashboard</h1>
        <p className="text-gray-400">Step {currentStep} of 5</p>
        
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Upload Your Audio</h2>
              <p className="text-gray-400 text-lg">Select your audio file to begin professional mastering</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-crys-gold transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Drop your audio file here</h3>
                <p className="text-gray-400 mb-6">Supports WAV, MP3, FLAC, and other audio formats</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="bg-crys-gold text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-8 space-y-6">
                  <div className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center space-x-4">
                      <FileAudio className="w-8 h-8 text-crys-gold" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{selectedFile.name}</h4>
                        <p className="text-sm text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={nextStep}
                        className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-crys-gold mb-4">Download Your Mastered Audio</h2>
              <p className="text-gray-400 text-lg">Choose your preferred format and download</p>
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
                    disabled={!processedAudioUrl}
                    className="w-full bg-crys-gold text-black py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Mastered Audio</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Process Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalTierDashboard;
