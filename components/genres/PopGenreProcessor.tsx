import React from 'react';

interface PopGenreProcessorProps {
  audioBuffer: AudioBuffer;
  onProcessed: (processedBuffer: AudioBuffer) => void;
  onError: (error: string) => void;
}

const PopGenreProcessor: React.FC<PopGenreProcessorProps> = ({ 
  audioBuffer, 
  onProcessed, 
  onError 
}) => {
  
  const processPopGenre = async (): Promise<AudioBuffer> => {
    try {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create processing chain - Exact Free Tier Pop settings
      const gainNode = offlineContext.createGain();
      const compressor = offlineContext.createDynamicsCompressor();

      // Pop - Exact Copy from Free Tier Dashboard
      gainNode.gain.value = 1.5; // Boost volume by 50% (exact Free Tier)
      
      // Exact compression settings from Free Tier
      compressor.threshold.value = -20;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      compressor.knee.value = 10;

      // Connect the processing chain - Simple Free Tier style
      source.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      source.start(0);
      return await offlineContext.startRendering();
      
    } catch (error) {
      console.error('Error processing Pop genre:', error);
      throw new Error('Failed to process Pop genre');
    }
  };

  // Auto-process when component mounts
  React.useEffect(() => {
    processPopGenre()
      .then(onProcessed)
      .catch(onError);
  }, [audioBuffer]);

  return null; // This component doesn't render anything
};

export default PopGenreProcessor; 