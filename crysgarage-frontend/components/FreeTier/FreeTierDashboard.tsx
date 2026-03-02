import React, { useState } from 'react';
import FreeTierUpload from './FreeTierUpload';
import FreeTierCompare from './FreeTierCompare';
import FreeTierDownload from './FreeTierDownload';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

type FreeTierStep = 'upload' | 'compare' | 'download';

const FreeTierDashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FreeTierStep>('upload');
  const [targetFile, setTargetFile] = useState<AudioFile | null>(null);
  const [referenceFile, setReferenceFile] = useState<AudioFile | null>(null);
  const [masteredUrl, setMasteredUrl] = useState<string | null>(null);

  const handleUploadNext = (target: AudioFile, reference: AudioFile) => {
    setTargetFile(target);
    setReferenceFile(reference);
    setCurrentStep('compare');
  };

  const handleCompareNext = (url: string) => {
    setMasteredUrl(url);
    setCurrentStep('download');
  };

  const handleCompareBack = () => {
    setCurrentStep('upload');
  };

  const handleDownloadBack = () => {
    setCurrentStep('compare');
  };

  const handleDownloadComplete = () => {
    // Reset to start new project
    setCurrentStep('upload');
    setTargetFile(null);
    setReferenceFile(null);
    setMasteredUrl(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return <FreeTierUpload onNext={handleUploadNext} />;
      
      case 'compare':
        if (!targetFile || !referenceFile) {
          setCurrentStep('upload');
          return null;
        }
        return (
          <FreeTierCompare
            targetFile={targetFile}
            referenceFile={referenceFile}
            onNext={handleCompareNext}
            onBack={handleCompareBack}
          />
        );
      
      case 'download':
        if (!masteredUrl) {
          setCurrentStep('compare');
          return null;
        }
        return (
          <FreeTierDownload
            masteredUrl={masteredUrl}
            onBack={handleDownloadBack}
            onComplete={handleDownloadComplete}
          />
        );
      
      default:
        return <FreeTierUpload onNext={handleUploadNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Engine Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-crys-gold/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-2 border-crys-gold/20 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-crys-gold/20 rounded-full animate-spin" style={{animationDuration: '25s'}}></div>
        <div className="absolute bottom-32 right-1/3 w-28 h-28 border-2 border-crys-gold/20 rounded-full animate-spin" style={{animationDuration: '18s', animationDirection: 'reverse'}}></div>
      </div>

      {/* Engine Gears Background */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-1/4 w-16 h-16 border-2 border-crys-gold/10 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-12 h-12 border-2 border-crys-gold/10 transform rotate-12 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-20 h-20 border-2 border-crys-gold/10 transform rotate-90 animate-pulse" style={{animationDelay: '2s'}}></div>
                  </div>
                  
      {/* Engine Progress Indicator */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-b border-crys-gold/20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center space-x-12">
            {[
              { 
                step: 'upload', 
                label: 'Fuel Input', 
                icon: '⚡',
                description: 'Load Audio Fuel'
              },
              { 
                step: 'compare', 
                label: 'Engine Process', 
                icon: '🔧',
                description: 'Mastering Engine'
              },
              { 
                step: 'download', 
                label: 'Output', 
                icon: '🚀',
                description: 'Download Result'
              }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="text-center">
                  <div
                    className={`flex flex-col items-center space-y-2 p-6 rounded-2xl transition-all duration-500 transform ${
                      currentStep === item.step
                        ? 'bg-gradient-to-br from-crys-gold to-yellow-600 text-black shadow-2xl shadow-crys-gold/50 scale-105'
                        : currentStep === 'compare' && item.step === 'upload'
                        ? 'bg-gradient-to-br from-crys-gold/30 to-yellow-600/30 text-crys-gold border-2 border-crys-gold/50'
                        : currentStep === 'download' && (item.step === 'upload' || item.step === 'compare')
                        ? 'bg-gradient-to-br from-crys-gold/30 to-yellow-600/30 text-crys-gold border-2 border-crys-gold/50'
                        : 'text-gray-400 border-2 border-gray-600/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold text-lg">{item.label}</div>
                    <div className="text-sm opacity-80">{item.description}</div>
                  </div>
                </div>
                {index < 2 && (
                  <div className="flex items-center mx-4">
                    <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
                      currentStep === 'compare' && item.step === 'upload'
                        ? 'bg-gradient-to-r from-crys-gold to-yellow-600'
                        : currentStep === 'download' && (item.step === 'upload' || item.step === 'compare')
                        ? 'bg-gradient-to-r from-crys-gold to-yellow-600'
                        : 'bg-gray-600/30'
                    }`} />
                    <div className="mx-2 text-crys-gold/50">→</div>
                  </div>
                )}
                  </div>
            ))}
                          </div>
                        </div>
                    </div>

      {/* Engine Status Bar */}
      <div className="relative z-10 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b border-crys-gold/10">
        <div className="max-w-6xl mx-auto px-6 py-3">
                  <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Engine Status: Online</span>
              </div>
                          <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-crys-gold rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Processing Power: Ready</span>
                    </div>
            </div>
            <div className="text-sm text-gray-400">
              Free Tier • Matchering Engine v2.0
            </div>
          </div>
                  </div>
                          </div>
                
      {/* Current Step Content */}
      <div className="relative z-10">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default FreeTierDashboard;