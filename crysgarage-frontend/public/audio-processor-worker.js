// Audio Processing Web Worker
// This runs in a separate thread to avoid blocking the UI

 self.onmessage = async function(e) {
   const { audioData, audioEffects, sampleRate, channels, length } = e.data;
   
   console.log('🎵 Web Worker received data:', { sampleRate, channels, length, audioEffects });
   
   try {
     // Report progress
     self.postMessage({ type: 'progress', progress: 10, stage: 'Initializing audio processing...' });
    
    // Create offline audio context in the worker
    const offlineContext = new OfflineAudioContext(channels, length, sampleRate);
    
    // Create audio buffer from the transferred data
    const audioBuffer = offlineContext.createBuffer(channels, length, sampleRate);
    
         // Copy the audio data
     for (let channel = 0; channel < channels; channel++) {
       const channelData = audioBuffer.getChannelData(channel);
       channelData.set(new Float32Array(audioData[channel])); // Convert back to Float32Array
     }
    
    self.postMessage({ type: 'progress', progress: 20, stage: 'Setting up audio processing...' });
    
    // Create audio source
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    let currentNode = source;
    let effectsApplied = 0;
    
    self.postMessage({ type: 'progress', progress: 30, stage: 'Applying audio effects...' });
    
    // Apply EQ effects
    if (audioEffects.eq && audioEffects.eq.enabled && audioEffects.eq.bands.length > 0) {
      audioEffects.eq.bands.forEach((band) => {
        const eqNode = offlineContext.createBiquadFilter();
        eqNode.type = band.type;
        eqNode.frequency.value = band.frequency;
        eqNode.gain.value = band.gain;
        eqNode.Q.value = band.q;
        currentNode.connect(eqNode);
        currentNode = eqNode;
        effectsApplied++;
      });
    }
    
    // Apply Compressor
    if (audioEffects.compressor && audioEffects.compressor.enabled) {
      const compressorNode = offlineContext.createDynamicsCompressor();
      compressorNode.threshold.value = audioEffects.compressor.threshold;
      compressorNode.ratio.value = audioEffects.compressor.ratio;
      compressorNode.attack.value = audioEffects.compressor.attack;
      compressorNode.release.value = audioEffects.compressor.release;
      currentNode.connect(compressorNode);
      currentNode = compressorNode;
      effectsApplied++;
    }
    
         // Apply Loudness
     if (audioEffects.loudness && audioEffects.loudness.enabled) {
       const gainNode = offlineContext.createGain();
       gainNode.gain.value = Math.pow(10, audioEffects.loudness.gain / 20); // Convert dB to linear
       currentNode.connect(gainNode);
       currentNode = gainNode;
       effectsApplied++;
     }
    
    // Apply Limiter
    if (audioEffects.limiter && audioEffects.limiter.enabled) {
      const limiterNode = offlineContext.createDynamicsCompressor();
      limiterNode.threshold.value = audioEffects.limiter.threshold;
      limiterNode.ratio.value = 20; // Hard limiting
      limiterNode.attack.value = 0.001;
      limiterNode.release.value = 0.1;
      currentNode.connect(limiterNode);
      currentNode = limiterNode;
      effectsApplied++;
    }
    
         // Apply G-Tuner (pitch correction)
     if (audioEffects.gTuner && audioEffects.gTuner.enabled) {
       // Apply 444Hz reference frequency correction
       const gTunerNode = offlineContext.createBiquadFilter();
       gTunerNode.type = 'peaking';
       gTunerNode.frequency.value = 444;
       gTunerNode.gain.value = 3;
       gTunerNode.Q.value = 10;
       currentNode.connect(gTunerNode);
       currentNode = gTunerNode;
       effectsApplied++;
     }
    
    self.postMessage({ type: 'progress', progress: 50, stage: 'Rendering audio with effects...' });
    
    // Connect to destination and start rendering
    currentNode.connect(offlineContext.destination);
    source.start(0);
    
    // Render the audio (this is the heavy part)
    const renderedBuffer = await offlineContext.startRendering();
    
    self.postMessage({ type: 'progress', progress: 70, stage: 'Converting to WAV format...' });
    
    // Convert to WAV format
    const wavBlob = convertToWAV(renderedBuffer);
    
    self.postMessage({ type: 'progress', progress: 90, stage: 'Finalizing...' });
    
         console.log('✅ Web Worker processing completed with', effectsApplied, 'effects applied');
     
     // Send the result back
     self.postMessage({ 
       type: 'complete', 
       blob: wavBlob,
       effectsApplied: effectsApplied 
     });
    
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

// WAV conversion function
function convertToWAV(audioBuffer) {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  
  // 16-bit WAV
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  
  // Create buffer
  const buffer = new ArrayBuffer(44 + length * numberOfChannels * bytesPerSample);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * bytesPerSample, true);
  writeString(8, 'WAVE');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * bytesPerSample, true);
  
  // Write audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    // Report progress every 5% for large files
    if (length > 1000000 && i % Math.floor(length / 20) === 0) {
      const progress = Math.round((i / length) * 100);
      self.postMessage({ 
        type: 'progress', 
        progress: 70 + (progress * 0.2), // 70-90% range
        stage: `Converting to WAV format... ${progress}%`
      });
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}
