import { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Upload, FileAudio, X, Play, Pause } from "lucide-react";
import { useApp } from '../contexts/AppContext';

interface UploadInterfaceProps {
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean; // New prop for external loading state
}

export function UploadInterface({ onFileUpload, disabled = false, isLoading = false }: UploadInterfaceProps) {
  const { uploadFile } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external loading state if provided, otherwise use internal state
  const isUploadingState = isLoading || false;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|flac|aac|ogg)$/i)
    );

    if (audioFile) {
      handleFileUpload(audioFile);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadError(null);
      setUploadedFile(file);
      setUploadProgress(0);
      setIsUploading(true);
      
      console.log('Starting file upload to backend:', file.name);
      
      // Use the context's uploadFile function which handles authentication
      const audioId = await uploadFile(file);
      
      console.log('File uploaded successfully, audio_id:', audioId);
      
      setUploadProgress(100);
      
      // Call the parent handler with the uploaded file
      onFileUpload?.(file);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsPlaying(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploadedFile) {
    return (
      <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-crys-white text-lg">Uploaded Audio</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-crys-gold hover:bg-crys-gold/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-crys-graphite/50 rounded-lg">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <FileAudio className="w-6 h-6 text-crys-gold" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-crys-white truncate">{uploadedFile.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                {uploadedFile.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
              </Badge>
              <span className="text-crys-light-grey text-sm">
                {formatFileSize(uploadedFile.size)}
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>

        {isUploadingState && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-crys-light-grey">Uploading...</span>
              <span className="text-crys-gold">{uploadProgress}%</span>
            </div>
            <Progress 
              value={uploadProgress} 
              className="h-2 bg-crys-graphite" 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`
        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
        ${disabled 
          ? 'border-crys-graphite/50 bg-crys-graphite/20 opacity-50 cursor-not-allowed' 
          : dragOver 
            ? 'border-crys-gold bg-crys-gold/5' 
            : 'border-crys-graphite hover:border-crys-gold/50 hover:bg-crys-gold/5'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.aac,.ogg"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Upload className="w-8 h-8 text-crys-gold" />
      </div>
      
      <h3 className="text-crys-white text-xl mb-2">
        {disabled ? 'Upload Disabled' : 'Upload Your Audio'}
      </h3>
      <p className="text-crys-light-grey mb-6">
        {disabled 
          ? 'Please upgrade your tier or purchase more credits to upload files'
          : 'Drag and drop your audio file here, or click to browse'
        }
      </p>
      
      {uploadError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{uploadError}</p>
        </div>
      )}
      
      <Button 
        onClick={handleFileSelect}
        disabled={disabled}
        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploadingState ? 'Uploading...' : 'Select Audio File'}
      </Button>
      
      <div className="mt-6 pt-6 border-t border-crys-graphite">
        <p className="text-crys-light-grey text-sm">
          Supported formats: MP3, WAV, FLAC, AAC, OGG
        </p>
        <p className="text-crys-light-grey text-sm">
          Max file size: 100MB
        </p>
      </div>
    </div>
  );
}