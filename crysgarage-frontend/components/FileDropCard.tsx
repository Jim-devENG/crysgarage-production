import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Upload } from 'lucide-react';

interface FileDropCardProps {
  label: string;
  file: File | null;
  setFile: (file: File | null) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const FileDropCard: React.FC<FileDropCardProps> = ({
  label,
  file,
  setFile,
  audioRef,
  isPlaying,
  onTogglePlay
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white/80">{label}</label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-crys-gold bg-crys-gold/10'
            : 'border-white/20 hover:border-white/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file ? (
          <div className="space-y-3">
            <div className="text-white/90 font-medium">{file.name}</div>
            <div className="text-white/60 text-sm">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
            
            <audio
              ref={audioRef}
              src={URL.createObjectURL(file)}
              className="w-full"
              onEnded={() => onTogglePlay()}
            />
            
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="border-white/20 text-white/80 hover:bg-white/10"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-white/40" />
            <div className="text-white/60">
              Drop audio file here or click to browse
            </div>
            <div className="text-white/40 text-sm">
              Supports MP3, WAV, FLAC, M4A
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

