import React from 'react';

interface HipHopRapProcessorProps {
  audioBuffer: AudioBuffer;
  onProcessed: (processedBuffer: AudioBuffer) => void;
  onError: (error: string) => void;
}

const HipHopRapProcessor: React.FC<HipHopRapProcessorProps> = ({ 
  audioBuffer, 
  onProcessed, 
  onError 
}) => {
  
  const processHipHopRapGenre = async (): Promise<AudioBuffer> => {
    try {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create processing chain - Industry Standard Hip Hop/Rap settings
      const gainNode = offlineContext.createGain();
      const compressor = offlineContext.createDynamicsCompressor();
      
      // Create EQ bands for Hip Hop/Rap
      const lowShelf60 = offlineContext.createBiquadFilter();
      const lowShelf120 = offlineContext.createBiquadFilter();
      const peaking400 = offlineContext.createBiquadFilter();
      const peaking1000 = offlineContext.createBiquadFilter();
      const peaking3200 = offlineContext.createBiquadFilter();
      const highShelf10000 = offlineContext.createBiquadFilter();

      // Hip Hop/Rap - Industry Standard Settings
      gainNode.gain.value = 2.0; // Boost volume by 100% for loud, punchy sound
      
      // EQ Settings for Hip Hop/Rap
      // Bass boost for heavy, punchy low end
      lowShelf60.type = 'lowshelf';
      lowShelf60.frequency.value = 60;
      lowShelf60.gain.value = 3.5; // Strong bass boost
      
      lowShelf120.type = 'lowshelf';
      lowShelf120.frequency.value = 120;
      lowShelf120.gain.value = 2.0; // Additional low-mid boost
      
      // Mid-range control for vocals and instruments
      peaking400.type = 'peaking';
      peaking400.frequency.value = 400;
      peaking400.Q.value = 0.7;
      peaking400.gain.value = -2.0; // Cut muddiness
      
      peaking1000.type = 'peaking';
      peaking1000.frequency.value = 1000;
      peaking1000.Q.value = 0.7;
      peaking1000.gain.value = 1.0; // Boost presence
      
      // High-end for clarity and air
      peaking3200.type = 'peaking';
      peaking3200.frequency.value = 3200;
      peaking3200.Q.value = 0.7;
      peaking3200.gain.value = 1.5; // Boost clarity
      
      highShelf10000.type = 'highshelf';
      highShelf10000.frequency.value = 10000;
      highShelf10000.gain.value = 2.0; // Add air and sparkle
      
      // Compression settings for Hip Hop/Rap
      compressor.threshold.value = -15; // Lower threshold for more aggressive compression
      compressor.ratio.value = 4.5; // Higher ratio for punchy, controlled sound
      compressor.attack.value = 0.005; // Slightly slower attack to preserve transients
      compressor.release.value = 0.25; // Standard release
      compressor.knee.value = 6; // Harder knee for more aggressive compression

      // Connect the processing chain for Hip Hop/Rap
      source.connect(lowShelf60);
      lowShelf60.connect(lowShelf120);
      lowShelf120.connect(peaking400);
      peaking400.connect(peaking1000);
      peaking1000.connect(peaking3200);
      peaking3200.connect(highShelf10000);
      highShelf10000.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      source.start(0);
      return await offlineContext.startRendering();
      
    } catch (error) {
      console.error('Error processing Hip Hop/Rap genre:', error);
      throw new Error('Failed to process Hip Hop/Rap genre');
    }
  };

  // Auto-process when component mounts
  React.useEffect(() => {
    processHipHopRapGenre()
      .then(onProcessed)
      .catch(onError);
  }, [audioBuffer]);

  return null; // This component doesn't render anything
};

export default HipHopRapProcessor; 