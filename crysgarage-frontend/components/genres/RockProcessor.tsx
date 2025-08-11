import { AudioContext, AudioBufferSourceNode, GainNode, DynamicsCompressorNode, BiquadFilterNode, StereoPannerNode, WaveShaperNode, AudioNode, BaseAudioContext } from 'standardized-audio-context';

export const RockProcessor = {
  name: 'Rock (Classic Rock, Alternative, Indie, Hard Rock)',
  description: 'Powerful rock music with driving guitars, punchy drums, and energetic dynamics',
  color: 'bg-orange-600',

  metrics: {
    targetLUFS: -14.0,
    peakLimit: -1.0,
    dynamicRange: 8.0,
    bassContent: 0.3,
    midContent: 0.4,
    trebleContent: 0.3,
    guitarPresence: 0.6,
    drumImpact: 0.7,
    energyLevel: 0.8,
    distortionLevel: 0.4,
    stereoWidth: 0.6,
    harmonicRichness: 0.7,
    punch: 0.8,
    warmth: 0.5
  },

  getProcessingParams: (analysis: any) => {
    // Base parameters for rock music
    const baseParams = {
      makeupGain: 2.0,
      bassBoost: 3.0,
      midBoost: 2.0,
      presenceBoost: 4.0,
      clarityBoost: 3.0,
      airBoost: 2.0,
      compressionThreshold: -20.0,
      compressionRatio: 4.0,
      stereoWidth: 0.6,
      saturation: 0.3,
      warmth: 0.5,
      punch: 0.8
    };

    // Dynamic adjustments based on audio analysis
    if (analysis) {
      // Adjust gain based on overall level
      if (analysis.lufs < -18) {
        baseParams.makeupGain += 3.0;
      } else if (analysis.lufs > -12) {
        baseParams.makeupGain -= 1.0;
      }

      // Adjust bass based on bass content
      if (analysis.bassContent < 0.25) {
        baseParams.bassBoost += 2.0;
      } else if (analysis.bassContent > 0.4) {
        baseParams.bassBoost -= 1.0;
      }

      // Adjust mids for guitar presence
      if (analysis.midContent < 0.35) {
        baseParams.midBoost += 1.5;
      } else if (analysis.midContent > 0.5) {
        baseParams.midBoost -= 1.0;
      }

      // Adjust presence for guitar clarity
      if (analysis.trebleContent < 0.25) {
        baseParams.presenceBoost += 2.0;
      } else if (analysis.trebleContent > 0.35) {
        baseParams.presenceBoost -= 1.0;
      }

      // Adjust compression based on dynamic range
      if (analysis.dynamicRange > 12) {
        baseParams.compressionThreshold = -16.0;
        baseParams.compressionRatio = 3.0;
      } else if (analysis.dynamicRange < 6) {
        baseParams.compressionThreshold = -24.0;
        baseParams.compressionRatio = 5.0;
      }

      // Adjust saturation based on energy level
      if (analysis.energyLevel > 0.8) {
        baseParams.saturation += 0.2;
      } else if (analysis.energyLevel < 0.6) {
        baseParams.saturation -= 0.1;
      }

      // Adjust stereo width based on mix characteristics
      if (analysis.stereoWidth < 0.4) {
        baseParams.stereoWidth += 0.2;
      } else if (analysis.stereoWidth > 0.7) {
        baseParams.stereoWidth -= 0.1;
      }

      // Adjust punch based on transient response
      if (analysis.transientResponse < 0.6) {
        baseParams.punch += 0.2;
      } else if (analysis.transientResponse > 0.8) {
        baseParams.punch -= 0.1;
      }
    }

    return baseParams;
  },

  setupProcessingChain: (context: BaseAudioContext, source: AudioBufferSourceNode) => {
    // Create compressor for punch and control
    const compressor = new DynamicsCompressorNode(context, {
      threshold: -20.0,
      knee: 10.0,
      ratio: 4.0,
      attack: 0.003,
      release: 0.25
    });

    // Multi-band EQ for rock frequencies
    const lowShelf = new BiquadFilterNode(context, {
      type: 'lowshelf',
      frequency: 80,
      gain: 3.0,
      Q: 0.7
    });

    const lowMid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 200,
      gain: 2.0,
      Q: 1.0
    });

    const mid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 800,
      gain: 2.0,
      Q: 1.0
    });

    const highMid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 2500,
      gain: 3.0,
      Q: 1.0
    });

    const presence = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 4000,
      gain: 4.0,
      Q: 1.0
    });

    const air = new BiquadFilterNode(context, {
      type: 'highshelf',
      frequency: 8000,
      gain: 2.0,
      Q: 0.7
    });

    // Warmth filter for classic rock feel
    const warmth = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 120,
      gain: 1.5,
      Q: 0.5
    });

    // Stereo panner for width
    const stereoPanner = new StereoPannerNode(context, {
      pan: 0.0
    });

    // Waveshaper for saturation/distortion
    const waveshaper = new WaveShaperNode(context);
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = (Math.PI + x) * x * x / (Math.PI + x * x);
    }
    waveshaper.curve = curve;
    waveshaper.oversample = '2x';

    // Output gain
    const outputGain = new GainNode(context, {
      gain: 1.0
    });

    // Connect the processing chain
    source.connect(compressor);
    compressor.connect(lowShelf);
    lowShelf.connect(lowMid);
    lowMid.connect(mid);
    mid.connect(highMid);
    highMid.connect(presence);
    presence.connect(air);
    air.connect(warmth);
    warmth.connect(stereoPanner);
    stereoPanner.connect(waveshaper);
    waveshaper.connect(outputGain);

    return {
      compressor,
      lowShelf,
      lowMid,
      mid,
      highMid,
      presence,
      air,
      warmth,
      stereoPanner,
      waveshaper,
      outputGain
    };
  }
};
