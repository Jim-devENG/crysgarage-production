import React from 'react';

interface GenreProcessorProps {
  audioBuffer: AudioBuffer;
  onProcessed: (processedBuffer: AudioBuffer) => void;
  onError: (error: string) => void;
  genreName: string;
}

const GenreProcessorTemplate: React.FC<GenreProcessorProps> = ({ 
  audioBuffer, 
  onProcessed, 
  onError,
  genreName 
}) => {
  
  const processGenre = async (): Promise<AudioBuffer> => {
    try {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create processing chain
      const gainNode = offlineContext.createGain();
      const compressor = offlineContext.createDynamicsCompressor();

      // Genre-specific settings go here
      // Example for a new genre:
      // gainNode.gain.value = 2.0;
      // compressor.threshold.value = -15;
      // compressor.ratio.value = 4;
      // compressor.attack.value = 0.005;
      // compressor.release.value = 0.25;
      // compressor.knee.value = 8;

      // Connect the processing chain
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      source.start(0);
      return await offlineContext.startRendering();
      
    } catch (error) {
      console.error(`Error processing ${genreName} genre:`, error);
      throw new Error(`Failed to process ${genreName} genre`);
    }
  };

  // Auto-process when component mounts
  React.useEffect(() => {
    processGenre()
      .then(onProcessed)
      .catch(onError);
  }, [audioBuffer]);

  return null; // This component doesn't render anything
};

export default GenreProcessorTemplate; 