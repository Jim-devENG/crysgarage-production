import React, { useState, useEffect } from 'react';
import { ProfessionalTierDashboardProps } from './types';
import FileUploadStep from './FileUploadStep';
import GenreSelectionStep from './GenreSelectionStep';
import ExportStep from './ExportStep';
import { loadStateFromStorage, saveStateToStorage } from './utils/storageUtils';

const ProfessionalDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  // Load state from sessionStorage on component mount
  const [currentStep, setCurrentStep] = useState(loadStateFromStorage().currentStep);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, type: string} | null>(loadStateFromStorage().fileInfo);
  const [selectedGenre, setSelectedGenre] = useState<any>(loadStateFromStorage().selectedGenre);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(loadStateFromStorage().processedAudioUrl);
  const [isProcessing, setIsProcessing] = useState(loadStateFromStorage().isProcessing);
  const [downloadFormat, setDownloadFormat] = useState<'wav' | 'mp3'>(loadStateFromStorage().downloadFormat);

  // Save state whenever relevant state changes
  useEffect(() => {
    saveStateToStorage({
      currentStep,
      selectedGenre,
      processedAudioUrl,
      isProcessing,
      downloadFormat,
      fileInfo
    });
  }, [currentStep, selectedGenre, processedAudioUrl, isProcessing, downloadFormat, fileInfo]);

  const clearState = () => {
    sessionStorage.removeItem('professionalTierState');
    setCurrentStep(1);
    setSelectedFile(null);
    setFileInfo(null);
    setSelectedGenre(null);
    setProcessedAudioUrl(null);
    setIsProcessing(false);
    setDownloadFormat('wav');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Clear previous state when starting a new session
    clearState();
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type
    });
    setCurrentStep(2);
    if (onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-crys-gold">Professional Tier Dashboard</h1>
            <p className="text-gray-400">Step {currentStep} of 3</p>
          </div>
          {currentStep > 1 && (
            <button
              onClick={clearState}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Start New Session
            </button>
          )}
        </div>

        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <FileUploadStep 
            onFileUpload={handleFileUpload}
            selectedFile={selectedFile}
            fileInfo={fileInfo}
            onNext={nextStep}
          />
        )}

        {/* Step 2: Genre Selection + Audio Comparison */}
        {currentStep === 2 && (
          <GenreSelectionStep
            selectedFile={selectedFile}
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            processedAudioUrl={processedAudioUrl}
            setProcessedAudioUrl={setProcessedAudioUrl}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {/* Step 3: Export Gate */}
        {currentStep === 3 && (
          <ExportStep
            selectedFile={selectedFile}
            selectedGenre={selectedGenre}
            processedAudioUrl={processedAudioUrl}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            downloadFormat={downloadFormat}
            setDownloadFormat={setDownloadFormat}
            onPrev={prevStep}
            onNewSession={() => setCurrentStep(1)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
