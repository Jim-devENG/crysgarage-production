import React, { useState, useEffect } from 'react';
import { FileAudio, Upload, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Professional studio images for the slider
  const studioImages = [
    {
      url: '/image1.jpg',
      title: "Professional Studio Equipment",
      description: "High-end audio processing gear with premium preamps, compressors, and VU meters"
    },
    {
      url: '/image2.jpg',
      title: "Professional Mixing Console",
      description: "Multi-channel audio mixing console with premium faders and master controls"
    },
    {
      url: '/image3.jpg',
      title: "Advanced Audio Processing",
      description: "State-of-the-art digital audio workstations and processing units"
    },
    {
      url: '/image4.jpg',
      title: "Premium Studio Setup",
      description: "Professional-grade studio environment with cutting-edge technology"
    },
    {
      url: '/image5.jpg',
      title: "Mastering Studio Suite",
      description: "Complete mastering suite with industry-standard equipment and acoustics"
    }
  ];

  // Auto-advance image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % studioImages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [studioImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % studioImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + studioImages.length) % studioImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-crys-gold mb-4">Advanced Tier Studio</h2>
        <p className="text-gray-400 text-lg">Professional audio mastering with premium equipment</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - File Upload */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600 backdrop-blur-md">
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              selectedFile 
                ? 'border-green-500 bg-green-900/20' 
                : 'border-gray-500 hover:border-crys-gold'
            }`}>
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
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileAudio className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-green-400">File Uploaded Successfully!</h3>
                    <p className="text-gray-400 mb-4">Click "Enter Studio" to start mastering</p>
                    <div className="bg-gray-600 text-gray-400 px-6 py-2 rounded-lg font-semibold inline-block">
                      Change File
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Choose Audio File</h3>
                    <p className="text-gray-400 mb-4">WAV, MP3, FLAC, or other audio formats</p>
                    <div className="bg-crys-gold text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-block">
                      Browse Files
                    </div>
                  </>
                )}
              </label>
            </div>
            
            {/* File Info Section */}
            <div className="mt-6 bg-gray-800 rounded-xl p-6">
              {selectedFile && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">✅ File uploaded successfully!</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-6 h-6 text-crys-gold" />
                  <div>
                    <h4 className="font-semibold text-white">{selectedFile?.name || fileInfo?.name}</h4>
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
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
                    selectedFile 
                      ? 'bg-gradient-to-r from-crys-gold to-yellow-500 text-black hover:from-yellow-400 hover:to-crys-gold hover:scale-105 shadow-lg' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  } flex items-center justify-center space-x-2`}
                >
                  <span className="text-xl">Enter Studio</span>
                  <Zap className="w-6 h-6" />
                </button>
                {selectedFile && (
                  <p className="text-sm text-gray-400 mt-3">
                    Ready to start mastering your audio
                  </p>
                )}
                {!selectedFile && (
                  <p className="text-sm text-red-400 mt-3">
                    Please upload a file first
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Slider */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-600 backdrop-blur-md">
            {/* Image Container */}
            <div className="relative h-96 lg:h-[500px] overflow-hidden">
              <img
                src={studioImages[currentImageIndex].url}
                alt={studioImages[currentImageIndex].title}
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{studioImages[currentImageIndex].title}</h3>
                <p className="text-gray-300">{studioImages[currentImageIndex].description}</p>
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {studioImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-crys-gold' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Studio Features */}
          <div className="mt-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
            <h3 className="text-xl font-bold text-crys-gold mb-4">Studio Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                <span className="text-gray-300">Professional Equipment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                <span className="text-gray-300">Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                <span className="text-gray-300">Advanced Effects</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-crys-gold rounded-full"></div>
                <span className="text-gray-300">Premium Mastering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
