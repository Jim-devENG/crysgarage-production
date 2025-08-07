import React from 'react';

interface HipHopDeluxeProcessorProps {
  audioBuffer: AudioBuffer;
  onProcessed: (processedBuffer: AudioBuffer) => void;
  onError: (error: string) => void;
  audioAnalysis?: {
    dominantFrequencies: number[];
    dynamicRange: number;
    bassContent: number;
    midContent: number;
    trebleContent: number;
    rhythmComplexity: number;
    vocalPresence: number;
  } | null;
}

const HipHopDeluxeProcessor: React.FC<HipHopDeluxeProcessorProps> = ({ 
  audioBuffer, 
  onProcessed, 
  onError,
  audioAnalysis 
}) => {
  
  const getIntelligentAdjustments = () => {
    if (!audioAnalysis) {
      return {
        bassBoost: 3.5,
        lowMidBoost: 2.0,
        midCut: -2.0,
        presenceBoost: 1.0,
        clarityBoost: 1.5,
        airBoost: 2.0,
        gainBoost: 2.0,
        compressionThreshold: -15,
        compressionRatio: 4.5,
        compressionAttack: 0.005,
        compressionRelease: 0.25,
        compressionKnee: 6
      };
    }

    // Intelligent adjustments based on audio analysis
    const adjustments = {
      // Bass adjustments based on existing bass content
      bassBoost: Math.max(2.5, Math.min(5.0, 3.5 + (150 - audioAnalysis.bassContent) / 50)),
      lowMidBoost: Math.max(1.5, Math.min(3.0, 2.0 + (120 - audioAnalysis.bassContent) / 60)),
      
      // Mid-range adjustments based on vocal presence
      midCut: audioAnalysis.vocalPresence > 120 ? -1.5 : -2.5, // Less cut if vocals are strong
      presenceBoost: Math.max(0.5, Math.min(2.0, 1.0 + audioAnalysis.vocalPresence / 100)),
      
      // High-end adjustments based on treble content
      clarityBoost: Math.max(1.0, Math.min(2.5, 1.5 + (140 - audioAnalysis.trebleContent) / 40)),
      airBoost: Math.max(1.5, Math.min(3.0, 2.0 + (130 - audioAnalysis.trebleContent) / 50)),
      
      // Gain adjustments based on dynamic range
      gainBoost: Math.max(1.8, Math.min(2.5, 2.0 + (audioAnalysis.dynamicRange - 10) / 20)),
      
      // Compression adjustments based on dynamic range and rhythm complexity
      compressionThreshold: Math.max(-20, Math.min(-10, -15 + (audioAnalysis.dynamicRange - 8) / 4)),
      compressionRatio: Math.max(3.5, Math.min(6.0, 4.5 + audioAnalysis.rhythmComplexity * 2)),
      compressionAttack: Math.max(0.003, Math.min(0.008, 0.005 - audioAnalysis.rhythmComplexity * 0.001)),
      compressionRelease: Math.max(0.2, Math.min(0.3, 0.25 + audioAnalysis.rhythmComplexity * 0.01)),
      compressionKnee: Math.max(4, Math.min(8, 6 + audioAnalysis.dynamicRange / 5))
    };

    return adjustments;
  };
  
  const processHipHopDeluxeGenre = async (): Promise<AudioBuffer> => {
    try {
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create processing chain - Intelligent Hip Hop Deluxe settings
      const gainNode = offlineContext.createGain();
      const compressor = offlineContext.createDynamicsCompressor();
      
      // Create EQ bands for Hip Hop Deluxe
      const lowShelf60 = offlineContext.createBiquadFilter();
      const lowShelf120 = offlineContext.createBiquadFilter();
      const peaking400 = offlineContext.createBiquadFilter();
      const peaking1000 = offlineContext.createBiquadFilter();
      const peaking3200 = offlineContext.createBiquadFilter();
      const highShelf10000 = offlineContext.createBiquadFilter();

      // Get intelligent adjustments
      const adjustments = getIntelligentAdjustments();

      // Hip Hop Deluxe - Intelligent Industry Standard Settings
      gainNode.gain.value = adjustments.gainBoost;
      
      // EQ Settings for Hip Hop Deluxe with intelligent adjustments
      // Bass boost for heavy, punchy low end
      lowShelf60.type = 'lowshelf';
      lowShelf60.frequency.value = 60;
      lowShelf60.gain.value = adjustments.bassBoost;
      
      lowShelf120.type = 'lowshelf';
      lowShelf120.frequency.value = 120;
      lowShelf120.gain.value = adjustments.lowMidBoost;
      
      // Mid-range control for vocals and instruments
      peaking400.type = 'peaking';
      peaking400.frequency.value = 400;
      peaking400.Q.value = 0.7;
      peaking400.gain.value = adjustments.midCut;
      
      peaking1000.type = 'peaking';
      peaking1000.frequency.value = 1000;
      peaking1000.Q.value = 0.7;
      peaking1000.gain.value = adjustments.presenceBoost;
      
      // High-end for clarity and air
      peaking3200.type = 'peaking';
      peaking3200.frequency.value = 3200;
      peaking3200.Q.value = 0.7;
      peaking3200.gain.value = adjustments.clarityBoost;
      
      highShelf10000.type = 'highshelf';
      highShelf10000.frequency.value = 10000;
      highShelf10000.gain.value = adjustments.airBoost;
      
      // Intelligent compression settings for Hip Hop Deluxe
      compressor.threshold.value = adjustments.compressionThreshold;
      compressor.ratio.value = adjustments.compressionRatio;
      compressor.attack.value = adjustments.compressionAttack;
      compressor.release.value = adjustments.compressionRelease;
      compressor.knee.value = adjustments.compressionKnee;

      // Connect the processing chain for Hip Hop Deluxe
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
      console.error('Error processing Hip Hop Deluxe genre:', error);
      throw new Error('Failed to process Hip Hop Deluxe genre');
    }
  };

  // Auto-process when component mounts
  React.useEffect(() => {
    processHipHopDeluxeGenre()
      .then(onProcessed)
      .catch(onError);
  }, [audioBuffer, audioAnalysis]);

  return null; // This component doesn't render anything
};

export default HipHopDeluxeProcessor; 