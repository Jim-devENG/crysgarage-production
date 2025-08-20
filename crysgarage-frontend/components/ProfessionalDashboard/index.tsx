import React, { useState, useEffect } from 'react';
import { ProfessionalTierDashboardProps } from './types';
import FileUploadStep from './FileUploadStep';
import AudioProcessingStep from './AudioProcessingStep';
import ExportStep from './ExportStep';
import { loadStateFromStorage, saveStateToStorage } from './utils/storageUtils';

const ProfessionalDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);

  // Load state from session storage on mount
  useEffect(() => {
    const savedState = loadStateFromStorage();
    if (savedState) {
      // If there is no file, always start at step 1
      const startStep = savedState.selectedFile ? (savedState.currentStep || 1) : 1;
      setCurrentStep(startStep);
      setSelectedFile(savedState.selectedFile || null);
      setSelectedGenre(savedState.selectedGenre || null);
      setIsProcessing(savedState.isProcessing || false);
      setProcessedAudioUrl(savedState.processedAudioUrl || null);
    }
  }, []);

  // Save state to session storage whenever it changes
  useEffect(() => {
    saveStateToStorage({
      currentStep,
      selectedFile,
      selectedGenre,
      isProcessing,
      processedAudioUrl
    });
  }, [currentStep, selectedFile, selectedGenre, isProcessing, processedAudioUrl]);

  const clearState = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setSelectedGenre(null);
    setIsProcessing(false);
    setProcessedAudioUrl(null);
    sessionStorage.removeItem('professionalDashboardState');
  };

  const nextStep = () => {
    // Prevent advancing to processing if no file is selected
    if (currentStep === 1 && !selectedFile) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    if (onFileUpload) {
      onFileUpload(file);
    }
    setCurrentStep(2);
  };

  const handleGenreSelect = (genre: any) => {
    setSelectedGenre(genre);
  };

  const handleProcessingComplete = (audioUrl: string) => {
    setProcessedAudioUrl(audioUrl);
    setIsProcessing(false);
  };

  const handleNextToDownload = () => {
    // Generate a processed audio URL if not already available
    if (!processedAudioUrl && selectedFile && selectedGenre) {
      const audioUrl = URL.createObjectURL(selectedFile);
      setProcessedAudioUrl(audioUrl);
    }
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadStep
            onFileUpload={handleFileUpload}
            selectedFile={selectedFile}
            fileInfo={null}
            onNext={nextStep}
          />
        );
      case 2:
        // If somehow at step 2 without a file, bounce back to step 1
        if (!selectedFile) {
          setCurrentStep(1);
          return (
            <FileUploadStep
              onFileUpload={handleFileUpload}
              selectedFile={selectedFile}
              fileInfo={null}
              onNext={nextStep}
            />
          );
        }
        return (
          <AudioProcessingStep
            selectedFile={selectedFile}
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            onProcessingComplete={handleProcessingComplete}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            onBack={prevStep}
            onNext={handleNextToDownload}
          />
        );
      case 3:
        return (
          <ExportStep
            selectedFile={selectedFile}
            selectedGenre={selectedGenre}
            processedAudioUrl={processedAudioUrl}
            onBack={prevStep}
            onRestart={clearState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crys-gold mb-2">Professional Tier</h1>
          <p className="text-gray-400">Advanced audio mastering with real-time processing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-crys-gold text-black' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-crys-gold' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-16">
            <span className={`text-sm ${currentStep >= 1 ? 'text-crys-gold' : 'text-gray-500'}`}>
              Upload Audio
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-crys-gold' : 'text-gray-500'}`}>
              Process & Master
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-crys-gold' : 'text-gray-500'}`}>
              Export
            </span>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="max-w-6xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
