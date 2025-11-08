// Temporarily disabled due to audio context type issues
// import { AudioContext, AudioBufferSourceNode, GainNode, DynamicsCompressorNode, BiquadFilterNode, StereoPannerNode, WaveShaperNode, IAudioNode, IBaseAudioContext } from 'standardized-audio-context';

export const ElectronicEDMProcessor = {
  name: 'Electronic / EDM (House, Techno, Trance, Dubstep, Drum & Bass, Electro)',
  description: 'High-energy electronic music with powerful bass, crisp highs, and dynamic processing',
  color: 'bg-violet-600',

  metrics: {
    targetLUFS: -8.0,
    peakLimit: -0.1,
    dynamicRange: 6.0,
    bassContent: 0.4,
    midContent: 0.3,
    trebleContent: 0.3,
    synthPresence: 0.7,
    kickImpact: 0.8,
    energyLevel: 0.9,
    sidechainEffect: 0.6,
    stereoWidth: 0.8,
    harmonicRichness: 0.6,
    punch: 0.9,
    brightness: 0.8
  },

  getProcessingParams: (analysis: any) => {
    // Base parameters for Electronic/EDM music
    const baseParams = {
      makeupGain: 3.0,
      bassBoost: 4.0,
      subBass: 5.0,
      midBoost: 1.0,
      presenceBoost: 3.0,
      clarityBoost: 4.0,
      airBoost: 3.0,
      compressionThreshold: -12.0,
      compressionRatio: 6.0,
      stereoWidth: 0.8,
      saturation: 0.2,
      brightness: 0.8,
      punch: 0.9,
      sidechainIntensity: 0.6
    };

    // Dynamic adjustments based on audio analysis
    if (analysis) {
      // Adjust gain based on overall level (EDM is typically loud)
      if (analysis.lufs < -12) {
        baseParams.makeupGain += 4.0;
      } else if (analysis.lufs > -6) {
        baseParams.makeupGain -= 2.0;
      }

      // Adjust bass based on bass content (EDM needs powerful low end)
      if (analysis.bassContent < 0.3) {
        baseParams.bassBoost += 3.0;
        baseParams.subBass += 2.0;
      } else if (analysis.bassContent > 0.5) {
        baseParams.bassBoost -= 1.0;
        baseParams.subBass -= 1.0;
      }

      // Adjust mids for synth clarity
      if (analysis.midContent < 0.25) {
        baseParams.midBoost += 2.0;
      } else if (analysis.midContent > 0.4) {
        baseParams.midBoost -= 1.0;
      }

      // Adjust highs for electronic sparkle
      if (analysis.trebleContent < 0.25) {
        baseParams.presenceBoost += 2.0;
        baseParams.clarityBoost += 2.0;
        baseParams.airBoost += 1.5;
      } else if (analysis.trebleContent > 0.4) {
        baseParams.presenceBoost -= 1.0;
        baseParams.clarityBoost -= 1.0;
      }

      // Adjust compression based on dynamic range (EDM is heavily compressed)
      if (analysis.dynamicRange > 10) {
        baseParams.compressionThreshold = -10.0;
        baseParams.compressionRatio = 8.0;
      } else if (analysis.dynamicRange < 4) {
        baseParams.compressionThreshold = -16.0;
        baseParams.compressionRatio = 4.0;
      }

      // Adjust brightness based on energy level
      if (analysis.energyLevel > 0.8) {
        baseParams.brightness += 0.2;
        baseParams.clarityBoost += 1.0;
      } else if (analysis.energyLevel < 0.6) {
        baseParams.brightness -= 0.1;
        baseParams.punch += 0.1;
      }

      // Adjust stereo width based on mix characteristics
      if (analysis.stereoWidth < 0.6) {
        baseParams.stereoWidth += 0.2;
      } else if (analysis.stereoWidth > 0.9) {
        baseParams.stereoWidth -= 0.1;
      }

      // Adjust punch based on transient response
      if (analysis.transientResponse < 0.7) {
        baseParams.punch += 0.2;
        baseParams.sidechainIntensity += 0.1;
      } else if (analysis.transientResponse > 0.9) {
        baseParams.punch -= 0.1;
      }

      // Adjust saturation based on harmonic content
      if (analysis.harmonicRichness < 0.5) {
        baseParams.saturation += 0.3;
      } else if (analysis.harmonicRichness > 0.8) {
        baseParams.saturation -= 0.1;
      }
    }

    return baseParams;
  },

  setupProcessingChain: (context: BaseAudioContext, source: AudioBufferSourceNode) => {
    // Create aggressive compressor for EDM punch
    const compressor = new DynamicsCompressorNode(context, {
      threshold: -12.0,
      knee: 2.0,
      ratio: 6.0,
      attack: 0.001,
      release: 0.05
    });

    // Multi-band EQ optimized for EDM frequencies
    const subBass = new BiquadFilterNode(context, {
      type: 'lowshelf',
      frequency: 40,
      gain: 5.0,
      Q: 0.5
    });

    const bass = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 80,
      gain: 4.0,
      Q: 1.0
    });

    const lowMid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 200,
      gain: 1.0,
      Q: 0.8
    });

    const mid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 800,
      gain: 1.0,
      Q: 1.0
    });

    const highMid = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 2000,
      gain: 3.0,
      Q: 1.2
    });

    const presence = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 5000,
      gain: 3.0,
      Q: 1.0
    });

    const air = new BiquadFilterNode(context, {
      type: 'highshelf',
      frequency: 12000,
      gain: 3.0,
      Q: 0.7
    });

    // Brightness filter for electronic sparkle
    const brightness = new BiquadFilterNode(context, {
      type: 'peaking',
      frequency: 8000,
      gain: 2.0,
      Q: 0.8
    });

    // Stereo enhancer for wide electronic sound
    const stereoPanner = new StereoPannerNode(context, {
      pan: 0.0
    });

    // Waveshaper for subtle harmonic enhancement
    const waveshaper = new WaveShaperNode(context);
    const curve = new Float32Array(44100);
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      // Subtle saturation curve for electronic music
      curve[i] = x + 0.2 * Math.sin(x * Math.PI);
    }
    waveshaper.curve = curve;
    waveshaper.oversample = '4x';

    // Sidechain-style compressor for pumping effect
    const sidechainComp = new DynamicsCompressorNode(context, {
      threshold: -18.0,
      knee: 1.0,
      ratio: 4.0,
      attack: 0.001,
      release: 0.1
    });

    // Output gain
    const outputGain = new GainNode(context, {
      gain: 1.0
    });

    // Connect the processing chain
    source.connect(compressor);
    compressor.connect(subBass);
    subBass.connect(bass);
    bass.connect(lowMid);
    lowMid.connect(mid);
    mid.connect(highMid);
    highMid.connect(presence);
    presence.connect(air);
    air.connect(brightness);
    brightness.connect(sidechainComp);
    sidechainComp.connect(stereoPanner);
    stereoPanner.connect(waveshaper);
    waveshaper.connect(outputGain);

    return {
      compressor,
      subBass,
      bass,
      lowMid,
      mid,
      highMid,
      presence,
      air,
      brightness,
      sidechainComp,
      stereoPanner,
      waveshaper,
      outputGain
    };
  }
};
