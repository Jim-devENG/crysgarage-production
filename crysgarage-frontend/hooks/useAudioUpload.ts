import { useState, useEffect, useCallback } from 'react';
import { audioAPI, AudioStatus } from '../services/api';

interface UseAudioUploadReturn {
  uploadFile: (file: File, genre?: string) => Promise<string>;
  status: AudioStatus | null;
  isLoading: boolean;
  error: string | null;
  downloadFile: (format: 'wav' | 'mp3' | 'flac') => Promise<void>;
  reset: () => void;
}

export const useAudioUpload = (): UseAudioUploadReturn => {
  const [audioId, setAudioId] = useState<string | null>(null);
  const [status, setStatus] = useState<AudioStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Upload file
  const uploadFile = useCallback(async (file: File, genre?: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await audioAPI.uploadFile(file, genre);
      setAudioId(response.audio_id);
      
      // Start polling for status
      startPolling(response.audio_id);
      
      return response.audio_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start polling for status
  const startPolling = useCallback((id: string) => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start new polling interval
    const interval = setInterval(async () => {
      try {
        const statusData = await audioAPI.getStatus(id);
        setStatus(statusData);

        // Stop polling if processing is complete
        if (statusData.status === 'done' || statusData.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (err) {
        console.error('Error polling status:', err);
        clearInterval(interval);
        setPollingInterval(null);
        setError('Failed to get processing status');
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  }, [pollingInterval]);

  // Download file
  const downloadFile = useCallback(async (format: 'wav' | 'mp3' | 'flac') => {
    if (!audioId) {
      throw new Error('No audio file to download');
    }

    try {
      const blob = await audioAPI.downloadFile(audioId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mastered_audio.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [audioId]);

  // Reset state
  const reset = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setAudioId(null);
    setStatus(null);
    setIsLoading(false);
    setError(null);
    setPollingInterval(null);
  }, [pollingInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    uploadFile,
    status,
    isLoading,
    error,
    downloadFile,
    reset,
  };
}; 