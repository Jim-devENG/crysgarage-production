import React, { useState, useRef } from 'react';
import { Upload, Music, Play, Pause, Trash2, Sparkles } from 'lucide-react';

interface AudioFile {
  id: string;
  name: string;
  size: number;
  file: File;
  url: string;
}

interface FreeTierUploadProps {
  onNext: (targetFile: AudioFile, referenceFile: AudioFile) => void;
}

const FreeTierUpload: React.FC<FreeTierUploadProps> = ({ onNext }) => {
  const [targetFile, setTargetFile] = useState<AudioFile | null>(null);
  const [referenceFile, setReferenceFile] = useState<AudioFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const targetInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const targetAudioRef = useRef<HTMLAudioElement>(null);
  const referenceAudioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (file: File, type: 'target' | 'reference') => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    const audioFile: AudioFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      file,
      url: URL.createObjectURL(file)
    };

    if (type === 'target') {
      setTargetFile(audioFile);
    } else {
      setReferenceFile(audioFile);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'target' | 'reference') => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'target' | 'reference') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const handlePlayPause = (type: 'target' | 'reference') => {
    const audioRef = type === 'target' ? targetAudioRef : referenceAudioRef;
    const isPlaying = type === 'target' ? isPlayingTarget : isPlayingReference;
    const setIsPlaying = type === 'target' ? setIsPlayingTarget : setIsPlayingReference;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canProceed = targetFile && referenceFile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-crys-black via-crys-charcoal to-crys-graphite text-white p-6 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-crys-gold/30 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-crys-gold/20 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-crys-gold to-crys-gold-muted rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-crys-black" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-crys-gold via-crys-gold to-crys-gold-muted bg-clip-text text-transparent">
                Free Tier Mastering
              </h1>
              <p className="text-crys-light-grey text-sm mt-1">Powered by Matchering Engine</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20 max-w-3xl mx-auto">
            <p className="text-base text-crys-light-grey leading-relaxed">
              Upload your <span className="text-crys-gold font-semibold">target track</span> and a <span className="text-crys-gold font-semibold">reference track</span> to automatically match loudness and tonal characteristics
            </p>
          </div>
        </div>

        {/* Upload Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Target Track */}
          <div className="group bg-gradient-to-br from-crys-graphite/80 to-crys-charcoal/80 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 border border-crys-gold/10 rounded-full animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-crys-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-crys-white">Target Track</h2>
                  <p className="text-sm text-crys-light-grey/70">Your mix to be mastered</p>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-crys-gold bg-crys-gold/10 scale-[1.02]' 
                    : targetFile
                      ? 'border-crys-gold/50 bg-crys-gold/5'
                      : 'border-crys-graphite hover:border-crys-gold/50'
                }`}
                onDrop={(e) => handleDrop(e, 'target')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {targetFile ? (
                  <div className="space-y-4">
                    <div className="bg-crys-charcoal/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-crys-gold truncate">{targetFile.name}</p>
                          <p className="text-sm text-crys-light-grey/70">{formatFileSize(targetFile.size)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handlePlayPause('target')}
                            className="w-10 h-10 bg-crys-gold/20 hover:bg-crys-gold/30 rounded-lg flex items-center justify-center transition-colors"
                            title={isPlayingTarget ? 'Pause' : 'Play'}
                          >
                            {isPlayingTarget ? (
                              <Pause className="w-5 h-5 text-crys-gold" />
                            ) : (
                              <Play className="w-5 h-5 text-crys-gold ml-0.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setTargetFile(null)}
                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-crys-gold/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-crys-white">Drop your audio file</h3>
                    <p className="text-sm text-crys-light-grey/70 mb-4">or click to browse</p>
                    <button
                      onClick={() => targetInputRef.current?.click()}
                      className="bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-crys-gold/20 transition-all"
                    >
                      Select File
                    </button>
                  </div>
                )}
                
                <input
                  ref={targetInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileInput(e, 'target')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Reference Track */}
          <div className="group bg-gradient-to-br from-crys-graphite/80 to-crys-charcoal/80 backdrop-blur-sm rounded-2xl p-6 border border-crys-gold/20 hover:border-crys-gold/40 transition-all duration-300 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 border border-crys-gold/10 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-crys-gold/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-crys-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-crys-white">Reference Track</h2>
                  <p className="text-sm text-crys-light-grey/70">Professional reference</p>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-crys-gold bg-crys-gold/10 scale-[1.02]' 
                    : referenceFile
                      ? 'border-crys-gold/50 bg-crys-gold/5'
                      : 'border-crys-graphite hover:border-crys-gold/50'
                }`}
                onDrop={(e) => handleDrop(e, 'reference')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {referenceFile ? (
                  <div className="space-y-4">
                    <div className="bg-crys-charcoal/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-crys-gold truncate">{referenceFile.name}</p>
                          <p className="text-sm text-crys-light-grey/70">{formatFileSize(referenceFile.size)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handlePlayPause('reference')}
                            className="w-10 h-10 bg-crys-gold/20 hover:bg-crys-gold/30 rounded-lg flex items-center justify-center transition-colors"
                            title={isPlayingReference ? 'Pause' : 'Play'}
                          >
                            {isPlayingReference ? (
                              <Pause className="w-5 h-5 text-crys-gold" />
                            ) : (
                              <Play className="w-5 h-5 text-crys-gold ml-0.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setReferenceFile(null)}
                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-crys-gold/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-crys-white">Drop reference track</h3>
                    <p className="text-sm text-crys-light-grey/70 mb-4">or click to browse</p>
                    <button
                      onClick={() => referenceInputRef.current?.click()}
                      className="bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-crys-gold/20 transition-all"
                    >
                      Select File
                    </button>
                  </div>
                )}
                
                <input
                  ref={referenceInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileInput(e, 'reference')}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-br from-crys-graphite/60 to-crys-charcoal/60 backdrop-blur-sm rounded-2xl p-8 border border-crys-gold/20 text-center">
          {canProceed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">Ready to process</span>
              </div>
              <p className="text-crys-light-grey/70 mb-6">Both tracks loaded successfully</p>
              <button
                onClick={() => onNext(targetFile!, referenceFile!)}
                className="bg-gradient-to-r from-crys-gold to-crys-gold-muted text-crys-black px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-crys-gold/30 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Start Mastering
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400 font-semibold">Waiting for files</span>
              </div>
              <p className="text-crys-light-grey/50">Upload both tracks to begin mastering</p>
              <button
                disabled
                className="bg-crys-graphite text-crys-light-grey/40 px-10 py-4 rounded-xl font-bold text-lg cursor-not-allowed inline-flex items-center gap-3"
              >
                <Music className="w-5 h-5" />
                Start Mastering
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Audio Elements */}
      {targetFile && (
        <audio
          ref={targetAudioRef}
          src={targetFile.url}
          onEnded={() => setIsPlayingTarget(false)}
          className="hidden"
        />
      )}
      {referenceFile && (
        <audio
          ref={referenceAudioRef}
          src={referenceFile.url}
          onEnded={() => setIsPlayingReference(false)}
          className="hidden"
        />
      )}
    </div>
  );
};

export default FreeTierUpload;
