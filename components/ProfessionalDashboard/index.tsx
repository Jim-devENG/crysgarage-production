import React, { useState, useEffect, useRef } from 'react';
import { ProfessionalTierDashboardProps } from './types';
import FileUploadStep from './FileUploadStep';
import AudioProcessingStep from './AudioProcessingStep';
import ExportStep from './ExportStep';
import RealTimeAudioPlayer, { RealTimeAudioPlayerRef } from './components/RealTimeAudioPlayer';
import { loadStateFromStorage, saveStateToStorage, idbLoad, idbSave, idbDelete } from './utils/storageUtils';

const ProfessionalDashboard: React.FC<ProfessionalTierDashboardProps> = ({ onFileUpload, credits = 0 }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const hasRestored = useRef(false);
  const realTimeAudioPlayerRef = useRef<RealTimeAudioPlayerRef>(null);

  // Load state from session storage + IndexedDB on mount (only once)
  useEffect(() => {
    if (hasRestored.current) return; // Prevent multiple restorations
    
    const init = async () => {
      if (isRestoring) return; // Prevent concurrent restoration
      
      setIsRestoring(true);
      hasRestored.current = true;
      
      try {
        const savedState = loadStateFromStorage();
        if (savedState) {
          const hasMeta = !!savedState.selectedFileMeta && !!savedState.selectedFileKey;
          
          // Set basic state first
          setSelectedGenre(savedState.selectedGenre || null);
          setIsProcessing(false); // Always reset processing state
          setProcessedAudioUrl(savedState.processedAudioUrl || null);

          // Try to restore File from IndexedDB
          if (hasMeta) {
            try {
              const blob = await idbLoad(savedState.selectedFileKey as string);
              if (blob) {
                const file = new File([blob], savedState.selectedFileMeta!.name, {
                  type: savedState.selectedFileMeta!.type || blob.type || 'audio/wav',
                  lastModified: savedState.selectedFileMeta!.lastModified || Date.now()
                });
                setSelectedFile(file);
                
                // Set step after file is restored
                const startStep = Math.max(1, Math.min(savedState.currentStep || 1, 3));
                setCurrentStep(startStep);
              } else {
                // If blob missing, force back to step 1
                setSelectedFile(null);
                setCurrentStep(1);
              }
            } catch (e) {
              console.error('Failed to restore file from IndexedDB:', e);
              setSelectedFile(null);
              setCurrentStep(1);
            }
          } else {
            // No file metadata, start at step 1
            setSelectedFile(null);
            setCurrentStep(1);
          }
        }
      } catch (error) {
        console.error('Error during state restoration:', error);
        // Fallback to clean state
        setCurrentStep(1);
        setSelectedFile(null);
        setSelectedGenre(null);
        setIsProcessing(false);
        setProcessedAudioUrl(null);
      } finally {
        setIsRestoring(false);
      }
    };
    
    init();
  }, []);

  // Initialize audio context when reaching step 3 for export
  useEffect(() => {
    if (currentStep === 3 && selectedFile && realTimeAudioPlayerRef.current) {
      console.log('🎵 Initializing audio context for professional export processing...');
      // Small delay to ensure component is mounted
      setTimeout(() => {
        realTimeAudioPlayerRef.current?.manualInitializeAudioContext();
      }, 100);
    }
  }, [currentStep, selectedFile]);

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Save state before page unload
      if (selectedFile || selectedGenre) {
        saveStateToStorage({
          currentStep,
          selectedFile,
          selectedGenre,
          isProcessing: false, // Always save as not processing
          processedAudioUrl
        });
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      // Handle back/forward navigation
      console.log('Browser navigation detected, ensuring state is preserved');
      // The state will be restored on the next mount if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep, selectedFile, selectedGenre, processedAudioUrl]);

  // Save state to session storage whenever it changes (but not during restoration)
  useEffect(() => {
    if (isRestoring) return;
    
    saveStateToStorage({
      currentStep,
      selectedFile,
      selectedGenre,
      isProcessing,
      processedAudioUrl
    });
  }, [currentStep, selectedFile, selectedGenre, isProcessing, processedAudioUrl, isRestoring]);

  // Persist uploaded file in IndexedDB (but not during restoration)
  useEffect(() => {
    if (isRestoring) return;
    
    const persist = async () => {
      if (selectedFile) {
        try {
          await idbSave('selectedFile', selectedFile);
        } catch (e) {
          console.error('Failed to save file to IndexedDB:', e);
        }
      }
    };
    persist();
  }, [selectedFile, isRestoring]);

  const clearState = async () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setSelectedGenre(null);
    setIsProcessing(false);
    setProcessedAudioUrl(null);
    hasRestored.current = false; // Allow restoration again
    
    try {
      sessionStorage.removeItem('professionalDashboardState');
      await idbDelete('selectedFile');
    } catch (e) {
      console.warn('Failed to clear state:', e);
    }
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

  // Show loading state during restoration
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-crys-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-crys-gold">Restoring your session...</p>
        </div>
      </div>
    );
  }

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
            onNext={nextStep}
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
            realTimeAudioPlayerRef={realTimeAudioPlayerRef}
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
        
        {/* Hidden RealTimeAudioPlayer for export processing */}
        {selectedFile && (
          <div style={{ display: 'none' }}>
            <RealTimeAudioPlayer
              ref={realTimeAudioPlayerRef}
              audioFile={selectedFile}
              selectedGenre={selectedGenre}
              onGenreChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
