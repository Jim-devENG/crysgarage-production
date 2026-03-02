// Temporarily disabled due to audio context type issues
// import { AudioContext, AudioBufferSourceNode, GainNode, DynamicsCompressorNode, BiquadFilterNode, StereoPannerNode, WaveShaperNode, IAudioNode, IBaseAudioContext } from 'standardized-audio-context';

export const RnBSoulProcessor = {
  name: 'R&B / Soul',
  description: 'Smooth R&B and soul music with warm vocals and rich harmonies',
  color: 'bg-emerald-600',

  // Common metrics ranges for reference
  metrics: {
    bassRange: { min: 60, max: 250 },    // Hz, Warmer bass for R&B
    midRange: { min: 250, max: 2500 },   // Hz, Vocal and harmonic range
    trebleRange: { min: 2500, max: 18000 }, // Hz, Smooth high end
    targetLUFS: -16,                      // Slightly quieter for R&B warmth
    peakLimit: -1.5,                      // dB, More conservative peak limit
    dynamicRange: { min: 8, max: 15 },    // dB, Preserve dynamics for soul
    vocalPresence: { min: 0.4, max: 0.9 }, // Normalized 0-1, Vocal focus
    harmonicRichness: { min: 0.3, max: 0.8 }, // Normalized 0-1, Harmony content
    warmth: { min: 0.5, max: 0.9 },       // Normalized 0-1, Warmth factor
  },

  // Intelligent processing parameters for R&B/Soul
  getProcessingParams: (analysis: any) => {
    // Start with base settings optimized for R&B/Soul
    const params = {
      gain: 1.0,
      bassBoost: 0,
      lowMidBoost: 0,
      midBoost: 0,
      highMidBoost: 0,
      presenceBoost: 0,
      airBoost: 0,
      compressionThreshold: -20,
      compressionRatio: 3,
      attackTime: 15,
      releaseTime: 150,
      makeupGain: 1.5,
      saturation: 0,
      stereoWidth: 95,
      vocalEnhancement: 0,
      warmthBoost: 0,
      harmonicEnhancement: 0
    };

    if (!analysis) return params;

    // Vocal-focused processing
    params.vocalEnhancement = Math.max(0, Math.min(4,
      2 + (analysis.vocalPresence - 0.6) * 5
    ));

    // Warm bass enhancement for R&B
    params.bassBoost = Math.max(0, Math.min(5,
      2.5 + (100 - analysis.bassContent) / 20
    ));

    // Rich mid-range for vocals and harmonies
    params.midBoost = Math.max(0, Math.min(4,
      2 + (analysis.vocalPresence - 0.5) * 4
    ));

    // Gentle compression for soul dynamics
    params.compressionRatio = Math.max(2, Math.min(4,
      3 - (analysis.dynamicRange - 10) / 5
    ));
    params.compressionThreshold = Math.max(-24, Math.min(-16,
      -20 + (analysis.dynamicRange - 10) * 0.3
    ));

    // Slower attack for vocal transients
    params.attackTime = Math.max(10, Math.min(25,
      15 + (1 - analysis.vocalPresence) * 10
    ));

    // Longer release for smooth soul feel
    params.releaseTime = Math.max(100, Math.min(200,
      150 + analysis.dynamicRange * 3
    ));

    // Presence boost for vocal clarity
    params.presenceBoost = Math.max(0, Math.min(3,
      1.5 + (analysis.vocalPresence - 0.6) * 3
    ));

    // Gentle air boost for smooth high end
    params.airBoost = Math.max(0, Math.min(2,
      1 + (analysis.trebleContent - 110) / 20
    ));

    // Warmth enhancement
    params.warmthBoost = Math.max(0, Math.min(3,
      1.5 + (0.7 - analysis.trebleContent / 150) * 3
    ));

    // Harmonic enhancement for rich R&B sound
    params.harmonicEnhancement = Math.max(0, Math.min(2,
      1 + (analysis.vocalPresence - 0.5) * 2
    ));

    // Conservative stereo width for centered vocals
    params.stereoWidth = Math.max(85, Math.min(105,
      95 + (analysis.vocalPresence - 0.6) * 10
    ));

    // Subtle saturation for warmth
    params.saturation = Math.max(0, Math.min(0.2,
      0.1 + (analysis.dynamicRange - 10) / 50
    ));

    return params;
  },

  // Processing chain setup for R&B/Soul
  setupProcessingChain: (context: BaseAudioContext, source: AudioBufferSourceNode) => {
    const params = RnBSoulProcessor.getProcessingParams(null);
    
    // Create processing nodes
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = params.compressionThreshold;
    compressor.ratio.value = params.compressionRatio;
    compressor.attack.value = params.attackTime / 1000;
    compressor.release.value = params.releaseTime / 1000;
    compressor.knee.value = 12; // Softer knee for R&B

    // EQ bands optimized for R&B/Soul
    const lowShelf = context.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 120; // Warmer bass focus
    lowShelf.gain.value = params.bassBoost;

    const lowMid = context.createBiquadFilter();
    lowMid.type = 'peaking';
    lowMid.frequency.value = 250; // Vocal fundamentals
    lowMid.Q.value = 0.7;
    lowMid.gain.value = params.lowMidBoost;

    const mid = context.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 800; // Main vocal range
    mid.Q.value = 1.0;
    mid.gain.value = params.midBoost;

    const highMid = context.createBiquadFilter();
    highMid.type = 'peaking';
    highMid.frequency.value = 2000; // Vocal presence
    highMid.Q.value = 1.2;
    highMid.gain.value = params.highMidBoost;

    const presence = context.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 3500; // Vocal clarity
    presence.Q.value = 1.5;
    presence.gain.value = params.presenceBoost;

    const air = context.createBiquadFilter();
    air.type = 'highshelf';
    air.frequency.value = 8000; // Smooth air
    air.gain.value = params.airBoost;

    // Warmth filter
    const warmth = context.createBiquadFilter();
    warmth.type = 'peaking';
    warmth.frequency.value = 6000; // Warmth enhancement
    warmth.Q.value = 0.8;
    warmth.gain.value = params.warmthBoost;

    // Stereo panner for width control
    const stereoPanner = context.createStereoPanner();
    stereoPanner.pan.value = 0; // Centered for vocals

    // Saturation for warmth
    const waveshaper = context.createWaveShaper();
    const saturationCurve = new Float32Array(4096);
    for (let i = 0; i < 4096; i++) {
      const x = (i * 2) / 4096 - 1;
      saturationCurve[i] = Math.sign(x) * (1 - Math.exp(-Math.abs(x) * (1 + params.saturation * 3)));
    }
    waveshaper.curve = saturationCurve;

    // Output gain
    const outputGain = context.createGain();
    outputGain.gain.value = params.makeupGain;

    // Connect the processing chain
    source.connect(compressor);
    compressor.connect(lowShelf);
    lowShelf.connect(lowMid);
    lowMid.connect(mid);
    mid.connect(highMid);
    highMid.connect(presence);
    presence.connect(air);
    air.connect(warmth);
    warmth.connect(waveshaper);
    waveshaper.connect(stereoPanner);
    stereoPanner.connect(outputGain);

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
