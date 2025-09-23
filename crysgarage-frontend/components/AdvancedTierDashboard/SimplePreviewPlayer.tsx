import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Music } from 'lucide-react';

interface SimplePreviewPlayerProps {
  audioFile: File | null;
  selectedGenre?: string;
  isProcessing?: boolean;
}

export interface SimplePreviewPlayerRef {
  updatePreviewUrl: (url: string) => void;
  play: () => void;
  pause: () => void;
  applyEffects: (effects: any) => void;
  getAnalyserNode: () => AnalyserNode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const SimplePreviewPlayer = forwardRef<SimplePreviewPlayerRef, SimplePreviewPlayerProps>(({
  audioFile,
  selectedGenre,
  isProcessing
}, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peaksRef = useRef<Float32Array | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const waveContainerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [waveReady, setWaveReady] = useState(false);

  // Initialize audio URL when file changes
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl('');
    }
  }, [audioFile]);

  // Decode uploaded file to generate waveform peaks
  useEffect(() => {
    let cancelled = false;
    const decodeAndComputePeaks = async () => {
      if (!audioFile) { peaksRef.current = null; drawWaveform(); return; }
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        // Compute peaks (absolute average) over fixed buckets
        const numChannels = audioBuffer.numberOfChannels;
        const dataL = audioBuffer.getChannelData(0);
        const dataR = numChannels > 1 ? audioBuffer.getChannelData(1) : null;
        const desiredBuckets = 1000; // resolution
        const samplesPerBucket = Math.max(1, Math.floor(audioBuffer.length / desiredBuckets));
        const peaks = new Float32Array(desiredBuckets);
        for (let i = 0; i < desiredBuckets; i++) {
          const start = i * samplesPerBucket;
          const end = Math.min(audioBuffer.length, start + samplesPerBucket);
          let sum = 0;
          let count = 0;
          for (let s = start; s < end; s++) {
            const l = dataL[s] || 0;
            const r = dataR ? (dataR[s] || 0) : l;
            const v = (Math.abs(l) + Math.abs(r)) * 0.5;
            sum += v;
            count++;
          }
          peaks[i] = count ? sum / count : 0;
        }
        // Normalize peaks to the local maximum so waveform fills the vertical space
        let peakMax = 0;
        for (let i = 0; i < peaks.length; i++) {
          if (peaks[i] > peakMax) peakMax = peaks[i];
        }
        if (peakMax > 0) {
          for (let i = 0; i < peaks.length; i++) {
            peaks[i] = peaks[i] / peakMax;
          }
        }
        if (!cancelled) {
          peaksRef.current = peaks;
          drawWaveform();
        }
        ctx.close();
      } catch (e) {
        console.warn('Waveform decode failed:', e);
        peaksRef.current = null;
        drawWaveform();
      }
    };
    decodeAndComputePeaks();
    return () => { cancelled = true; };
  }, [audioFile]);

  // Draw waveform onto canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const peaks = peaksRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    const width = cssWidth * dpr;
    const height = cssHeight * dpr;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Background bar
    ctx.fillStyle = '#2b2b2f';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform (thicker columns)
    const midY = height / 2;
    const maxBar = Math.max(1, height * 0.45);
    const total = peaks ? peaks.length : 0;
    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const playedX = Math.floor(progressRatio * width);

    const drawSegment = (startX: number, endX: number, color: string) => {
      ctx.fillStyle = color;
      if (!total) {
        // Draw flat bar if no peaks yet
        ctx.fillRect(startX, midY - 2, Math.max(0, endX - startX), 4);
        return;
      }
      const columnWidth = Math.max(1, Math.floor(dpr * 2));
      for (let x = startX; x < endX; x += columnWidth) {
        const pIndex = Math.floor((x / width) * total);
        const amp = Math.min(1, peaks![Math.min(total - 1, Math.max(0, pIndex))]);
        const barH = Math.max(1, amp * maxBar);
        ctx.fillRect(x, midY - barH, columnWidth, barH * 2);
      }
    };

    // Played part (gold) and remaining (graphite)
    drawSegment(0, playedX, '#d4af37');
    drawSegment(playedX, width, '#49494f');

    // Playhead
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playedX, 0, Math.max(1, Math.floor(dpr)), height);
  };

  // Redraw on progress changes or resize
  useEffect(() => {
    drawWaveform();
  }, [currentTime, duration]);

  // Draw once on mount and when source URL changes
  useEffect(() => {
    drawWaveform();
  }, [audioUrl]);

  useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener('resize', onResize);
    // Observe canvas size changes precisely
    let ro: ResizeObserver | null = null;
    if (canvasRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => drawWaveform());
      ro.observe(canvasRef.current);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && canvasRef.current) {
        try { ro.unobserve(canvasRef.current); } catch {}
      }
    };
  }, []);

  // Initialize WaveSurfer (external dependency) to render waveform and enable seek
  useEffect(() => {
    let destroyed = false;
    const initWaveform = async () => {
      try {
        if (!audioRef.current || !waveContainerRef.current || !audioUrl) return;
        // Dynamic ESM import from CDN
        const mod: any = await import('https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js');
        if (destroyed) return;
        // Destroy previous instance if any
        if (waveSurferRef.current) {
          try { waveSurferRef.current.destroy(); } catch {}
          waveSurferRef.current = null;
        }
        const WaveSurfer = mod.default || mod;
        const ws = WaveSurfer.create({
          container: waveContainerRef.current,
          waveColor: '#67676f',
          progressColor: '#d4af37',
          cursorColor: '#ffffff',
          height: 80,
          barWidth: 4,
          barGap: 1,
          barRadius: 2,
          barHeight: 1, // 100% height
          normalize: true,
          minPxPerSec: 50, // zoom out fully to fill and show large waves
          fillParent: true,
          autoCenter: true,
          partialRender: true,
          pixelRatio: Math.min(2, (window.devicePixelRatio || 1)),
          interact: true,
          dragToSeek: true,
          // Use the existing HTMLAudioElement as the media source so it stays in our processing flow
          media: audioRef.current,
        });
        waveSurferRef.current = ws;
        setWaveReady(true);
        ws.on('ready', () => setWaveReady(true));
        ws.on('seek', (progress: number) => {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = progress * audioRef.current.duration;
          }
        });
      } catch (e) {
        // Fallback to canvas rendering already implemented
        console.warn('WaveSurfer init failed, using canvas fallback:', e);
        setWaveReady(false);
      }
    };
    initWaveform();
    return () => {
      destroyed = true;
      if (waveSurferRef.current) {
        try { waveSurferRef.current.destroy(); } catch {}
        waveSurferRef.current = null;
      }
      setWaveReady(false);
    };
  }, [audioUrl]);

  // Canvas seeking handlers
  const seekFromEvent = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!audioRef.current || duration <= 0) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isSeekingRef.current = true;
    seekFromEvent(e);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSeekingRef.current) seekFromEvent(e);
  };
  const handleMouseUp = () => { isSeekingRef.current = false; };
  const handleMouseLeave = () => { isSeekingRef.current = false; };

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlay = async () => {
    if (audioRef.current) {
      try {
        // Init audio context and chain lazily on first play
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current && !sourceRef.current) {
          try {
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          } catch {}
          // Build processing chain
          const ctx = audioContextRef.current;
          // Create 8-band EQ
          eqNodesRef.current = Array.from({ length: 8 }, () => ctx.createBiquadFilter());
          const freqs = [60, 150, 400, 1000, 2500, 6000, 10000, 16000];
          const types: BiquadFilterType[] = ['lowshelf','peaking','peaking','peaking','peaking','peaking','peaking','highshelf'];
          eqNodesRef.current.forEach((node, i) => { node.frequency.value = freqs[i]; node.type = types[i]; node.Q.value = 1; node.gain.value = 0; });
          compressorRef.current = ctx.createDynamicsCompressor();
          limiterRef.current = ctx.createDynamicsCompressor();
          if (limiterRef.current) { limiterRef.current.threshold.value = -1; limiterRef.current.knee.value = 0; limiterRef.current.ratio.value = 20; limiterRef.current.attack.value = 0.001; limiterRef.current.release.value = 0.05; }
          // Analyser for real-time spectrum
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.8;
          outputGainRef.current = ctx.createGain();
          outputGainRef.current.gain.value = 1.0;

          // Connect: source -> eq chain -> comp -> limiter -> gain -> destination
          let current: AudioNode = sourceRef.current;
          if (eqNodesRef.current.length) {
            current.connect(eqNodesRef.current[0]);
            for (let i = 0; i < eqNodesRef.current.length - 1; i++) {
              eqNodesRef.current[i].connect(eqNodesRef.current[i + 1]);
            }
            current = eqNodesRef.current[eqNodesRef.current.length - 1];
          }
          if (compressorRef.current) { current.connect(compressorRef.current); current = compressorRef.current; }
          if (limiterRef.current) { current.connect(limiterRef.current); current = limiterRef.current; }
          // Connect analyser between limiter and output
          if (analyserRef.current) { current.connect(analyserRef.current); current = analyserRef.current; }
          if (outputGainRef.current) { current.connect(outputGainRef.current); outputGainRef.current.connect(ctx.destination); }
        }
        // Resume context if suspended
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Expose functions through ref
  useImperativeHandle(ref, () => ({
    updatePreviewUrl: (url: string) => {
      if (audioRef.current) {
        console.log('🎵 Updating preview URL:', url);
        
        // Stop current playback
        if (!audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        
        // Update the audio source
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Reset time and duration
        setCurrentTime(0);
        setDuration(0);
        
        // Wait for metadata to load
        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current?.duration || 0);
          console.log('🎵 Preview audio loaded, duration:', audioRef.current?.duration);
        }, { once: true });
        
        // Handle load errors
        audioRef.current.addEventListener('error', (e) => {
          console.error('❌ Failed to load preview audio:', e);
        }, { once: true });
        
        // Auto-play when ready so genre changes are heard immediately
        audioRef.current.addEventListener('canplay', async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
            console.log('🎵 Auto-play started after URL update');
          } catch (err) {
            console.warn('⚠️ Auto-play blocked or failed:', err);
          }
        }, { once: true });
        
        console.log('✅ Preview URL updated successfully');
      }
    },
    applyEffects: (effects: any) => {
      // effects: { eq: {bands:[{gain}]}, compressor:{threshold,ratio,attack,release,enabled}, loudness:{gain,enabled}, limiter:{enabled}}
      try {
        // Ensure context and chain exist
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx && !sourceRef.current && audioRef.current) {
          try { sourceRef.current = ctx.createMediaElementSource(audioRef.current); } catch {}
          // Build chain
          eqNodesRef.current = Array.from({ length: 8 }, () => ctx.createBiquadFilter());
          const freqs = [60, 150, 400, 1000, 2500, 6000, 10000, 16000];
          const types: BiquadFilterType[] = ['lowshelf','peaking','peaking','peaking','peaking','peaking','peaking','highshelf'];
          eqNodesRef.current.forEach((node, i) => { node.frequency.value = freqs[i]; node.type = types[i]; node.Q.value = 1; node.gain.value = 0; });
          compressorRef.current = ctx.createDynamicsCompressor();
          limiterRef.current = ctx.createDynamicsCompressor();
          if (limiterRef.current) { limiterRef.current.threshold.value = -1; limiterRef.current.knee.value = 0; limiterRef.current.ratio.value = 20; limiterRef.current.attack.value = 0.001; limiterRef.current.release.value = 0.05; }
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.8;
          outputGainRef.current = ctx.createGain(); outputGainRef.current.gain.value = 1.0;
          // Connect chain
          let current: AudioNode = sourceRef.current;
          current.connect(eqNodesRef.current[0]);
          for (let i = 0; i < eqNodesRef.current.length - 1; i++) { eqNodesRef.current[i].connect(eqNodesRef.current[i + 1]); }
          current = eqNodesRef.current[eqNodesRef.current.length - 1];
          if (compressorRef.current) { current.connect(compressorRef.current); current = compressorRef.current; }
          if (limiterRef.current) { current.connect(limiterRef.current); current = limiterRef.current; }
          if (analyserRef.current) { current.connect(analyserRef.current); current = analyserRef.current; }
          if (outputGainRef.current) { current.connect(outputGainRef.current); outputGainRef.current.connect(ctx.destination); }
        }
        if (audioContextRef.current?.state === 'suspended') { audioContextRef.current.resume().catch(() => {}); }
        // EQ gains
        if (effects?.eq?.bands && eqNodesRef.current.length) {
          effects.eq.bands.forEach((band: any, i: number) => {
            if (eqNodesRef.current[i]) {
              eqNodesRef.current[i].gain.value = Number(band.gain || 0);
            }
          });
        }
        // Compressor
        if (compressorRef.current && effects?.compressor?.enabled !== false) {
          const c = effects.compressor;
          compressorRef.current.threshold.value = Number(c.threshold ?? -18);
          compressorRef.current.ratio.value = Number(c.ratio ?? 2);
          compressorRef.current.attack.value = Number((c.attack ?? 10) / 1000);
          compressorRef.current.release.value = Number((c.release ?? 250) / 1000);
        }
        // Loudness/output gain
        if (outputGainRef.current && effects?.loudness?.enabled !== false) {
          const db = Number(effects.loudness?.gain ?? 0);
          const lin = Math.pow(10, db / 20);
          outputGainRef.current.gain.value = lin;
        }
        // Keep playback going so changes are heard immediately
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
          console.log('🎛️ Effects applied successfully');
        }
      } catch (e) {
        console.warn('applyEffects failed:', e);
      }
    },
    getAnalyserNode: () => analyserRef.current,
    play: handlePlay,
    pause: handlePause,
    isPlaying,
    currentTime,
    duration
  }), [isPlaying, currentTime, duration]);

  if (!audioFile) {
    return (
      <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-crys-gold" />
          </div>
          <div className="ml-4">
            <h3 className="text-crys-white font-medium">No Audio File</h3>
            <p className="text-crys-light-grey text-sm">Upload an audio file to start preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-audio-panel-bg border border-audio-panel-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-crys-gold/20 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-crys-gold" />
          </div>
          <div>
            <h3 className="text-crys-white font-medium">{audioFile.name}</h3>
            <p className="text-crys-light-grey text-sm">
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
              {selectedGenre && ` • ${selectedGenre}`}
            </p>
          </div>
        </div>
        
        <button
          onClick={handlePlayPause}
          disabled={isProcessing}
          className="flex items-center space-x-2 bg-crys-blue/20 hover:bg-crys-blue/30 text-crys-blue px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-sm">Preview</span>
        </button>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Unified Waveform Seekbar (Wave + Time labels act as a single seek control) */}
      <div className="mt-4">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs text-crys-light-grey w-8">{formatTime(currentTime)}</span>
          <div className="flex-1">
            {/* If WaveSurfer is ready, it owns the visual waveform/seek. Otherwise, canvas fallback. */}
            {waveReady ? (
              <div
                ref={waveContainerRef}
                className="w-full h-20 rounded-md overflow-hidden cursor-pointer select-none bg-[#1f1f23]"
                onClick={(e) => {
                  // Ensure clicks anywhere in the container seek
                  if (!audioRef.current || !duration) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                  audioRef.current.currentTime = ratio * duration;
                }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-20 rounded-md cursor-pointer select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </div>
          <span className="text-xs text-crys-light-grey w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-yellow-400">Processing audio with Python backend...</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default SimplePreviewPlayer;
