import { Genre } from '../ProfessionalTierDashboard';

export const InstrumentalBeatsProcessor = {
  name: 'Instrumentals & Beats',
  description: 'Optimized for instrumental tracks and beat production with intelligent dynamics',
  color: 'bg-cyan-600',

  // Common metrics ranges for reference
  metrics: {
    bassRange: { min: 40, max: 200 },    // Hz
    midRange: { min: 200, max: 2000 },   // Hz
    trebleRange: { min: 2000, max: 20000 }, // Hz
    targetLUFS: -14,                      // Industry standard loudness
    peakLimit: -1.0,                      // dB, True Peak limit
    dynamicRange: { min: 6, max: 12 },    // dB, Typical range for beats
    rhythmComplexity: { min: 0.3, max: 0.8 }, // Normalized 0-1
    transientResponse: { min: 5, max: 20 }, // ms, Attack time range
  },

  // Intelligent processing parameters
  getProcessingParams: (analysis: any) => {
    // Start with base settings
    const params = {
      gain: 1.0,
      bassBoost: 0,
      lowMidBoost: 0,
      midCut: 0,
      highMidBoost: 0,
      presenceBoost: 0,
      airBoost: 0,
      compressionThreshold: -18,
      compressionRatio: 4,
      attackTime: 10,
      releaseTime: 100,
      makeupGain: 2.0,
      saturation: 0,
      stereoWidth: 100,
      transientPreservation: 0.5
    };

    if (!analysis) return params;

    // Intelligent bass adjustment based on content
    params.bassBoost = Math.max(0, Math.min(6, 
      3 - (analysis.bassContent - 100) / 20
    ));

    // Dynamic compression based on rhythm complexity
    params.compressionRatio = Math.max(2, Math.min(6,
      4 + analysis.rhythmComplexity * 2
    ));
    params.compressionThreshold = Math.max(-24, Math.min(-12,
      -18 + (analysis.dynamicRange - 8) * 0.5
    ));

    // Transient preservation for beats
    params.attackTime = Math.max(5, Math.min(20,
      10 + analysis.rhythmComplexity * 5
    ));

    // Mid-range clarity for melodic elements
    params.midCut = analysis.midContent > 120 ? -2 : -1;
    params.highMidBoost = Math.max(0, Math.min(3,
      1.5 + (120 - analysis.midContent) / 40
    ));

    // Presence and air for high-end detail
    params.presenceBoost = Math.max(0, Math.min(3,
      1.5 + (130 - analysis.trebleContent) / 30
    ));
    params.airBoost = Math.max(0, Math.min(2,
      1 + (120 - analysis.trebleContent) / 40
    ));

    // Stereo width based on content
    params.stereoWidth = Math.max(90, Math.min(120,
      100 + analysis.rhythmComplexity * 20
    ));

    // Saturation for warmth
    params.saturation = Math.max(0, Math.min(0.3,
      0.15 + (analysis.dynamicRange - 10) / 40
    ));

    return params;
  },

  // Processing chain setup
  setupProcessingChain: (context: BaseAudioContext, source: AudioBufferSourceNode) => {
    const params = InstrumentalBeatsProcessor.getProcessingParams(null);
    
    // Create processing nodes
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = params.compressionThreshold;
    compressor.ratio.value = params.compressionRatio;
    compressor.attack.value = params.attackTime / 1000;
    compressor.release.value = params.releaseTime / 1000;
    compressor.knee.value = 6;

    // EQ bands
    const lowShelf = context.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 100;
    lowShelf.gain.value = params.bassBoost;

    const lowMid = context.createBiquadFilter();
    lowMid.type = 'peaking';
    lowMid.frequency.value = 300;
    lowMid.Q.value = 0.7;
    lowMid.gain.value = params.lowMidBoost;

    const mid = context.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 1.0;
    mid.gain.value = params.midCut;

    const highMid = context.createBiquadFilter();
    highMid.type = 'peaking';
    highMid.frequency.value = 3000;
    highMid.Q.value = 0.7;
    highMid.gain.value = params.highMidBoost;

    const presence = context.createBiquadFilter();
    presence.type = 'peaking';
    presence.frequency.value = 5000;
    presence.Q.value = 0.7;
    presence.gain.value = params.presenceBoost;

    const air = context.createBiquadFilter();
    air.type = 'highshelf';
    air.frequency.value = 10000;
    air.gain.value = params.airBoost;

    // Gain stage
    const outputGain = context.createGain();
    outputGain.gain.value = params.makeupGain;

    // Connect the chain
    source
      .connect(lowShelf)
      .connect(lowMid)
      .connect(mid)
      .connect(highMid)
      .connect(presence)
      .connect(air)
      .connect(compressor)
      .connect(outputGain)
      .connect(context.destination);

    return {
      compressor,
      lowShelf,
      lowMid,
      mid,
      highMid,
      presence,
      air,
      outputGain
    };
  }
} as const;
