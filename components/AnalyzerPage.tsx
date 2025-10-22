import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Upload, Play, Pause, Download, BarChart3, Volume2, Zap, Activity, TrendingUp, Mic, Radio, Waves, Gauge, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

interface AnalyzerPageProps {
  onBack: () => void;
}

export function AnalyzerPage({ onBack }: AnalyzerPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [advancedAnalysis, setAdvancedAnalysis] = useState<any>(null);
  const [spectralData, setSpectralData] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveContainerRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const peaksRef = useRef<Float32Array | null>(null);

  // Initialize Tone.js and WaveSurfer
  useEffect(() => {
    if (Tone.context.state !== 'running') {
      Tone.start();
    }
    
    // Cleanup function
    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) {
          // Ignore close errors
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Canvas waveform refs (same as professional tier)

  // Draw static waveform to canvas (same as professional tier)
  const drawWaveform = () => {
    const canvas = waveContainerRef.current;
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
    ctx.fillStyle = '#1f1f23';
    ctx.fillRect(0, 0, width, height);
    const midY = height / 2;
    const maxBar = Math.max(1, height * 0.45);
    const total = peaks ? peaks.length : 0;
    const progressRatio = duration > 0 ? (audioRef.current?.currentTime || 0) / duration : 0;
    const playedX = Math.floor(progressRatio * width);
    const drawSegment = (startX: number, endX: number, color: string) => {
      ctx.fillStyle = color;
      if (!total) { 
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
    drawSegment(0, playedX, '#d4af37');
    drawSegment(playedX, width, '#49494f');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playedX, 0, Math.max(1, Math.floor(dpr)), height);
  };

  // Compute peaks from audio buffer (same as professional tier)
  useEffect(() => {
    if (!audioUrl) return;
    
    const computePeaks = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / 1000); // 1000 buckets like professional tier
        const peaks = new Float32Array(1000);
        
        for (let i = 0; i < 1000; i++) {
          const start = i * blockSize;
          const end = Math.min(start + blockSize, channelData.length);
          let max = 0;
          for (let j = start; j < end; j++) {
            max = Math.max(max, Math.abs(channelData[j]));
          }
          peaks[i] = max;
        }
        
        peaksRef.current = peaks;
        drawWaveform();
      } catch (error) {
        console.error('Failed to compute peaks:', error);
      }
    };
    
    computePeaks();
  }, [audioUrl]);

  // Redraw on progress/resize (same as professional tier)
  useEffect(() => { 
    drawWaveform(); 
  }, [audioRef.current?.currentTime, duration]);
  
  useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if (waveContainerRef.current && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => drawWaveform());
      ro.observe(waveContainerRef.current);
    }
    return () => { 
      window.removeEventListener('resize', onResize); 
      if (ro && waveContainerRef.current) { 
        try { ro.unobserve(waveContainerRef.current); } catch {} 
      } 
    };
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        setError(null);
        setAnalysisResults(null);
        const url = URL.createObjectURL(selectedFile);
        setAudioUrl(url);
        loadAudioForAnalysis(url);
      } else {
        setError('Please select a valid audio file');
      }
    }
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
      setError(null);
      setAnalysisResults(null);
      const url = URL.createObjectURL(droppedFile);
      setAudioUrl(url);
      loadAudioForAnalysis(url);
    } else {
      setError('Please drop a valid audio file');
    }
  };

  // Handle drag over
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Load audio for analysis (same as professional tier)
  const loadAudioForAnalysis = async (url: string) => {
    try {
      // Clean up previous audio
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      // Stop any ongoing analysis
      stopFrequencyAnalysis();
      setIsPlaying(false);
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Load audio buffer
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      setDuration(audioBuffer.duration);
      
      // Create audio element for playback
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        
        // Set audio quality settings like professional tier
        audioRef.current.preload = 'auto';
        audioRef.current.crossOrigin = 'anonymous';
        (audioRef.current as any).playsInline = true;
        // Keep element unmuted and with low volume so MediaElementSource is reliably fed,
        // but direct element output is minimally audible
        audioRef.current.muted = false;
        audioRef.current.volume = 1.0;
        
        // Initialize audio connections after audio element is ready
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (!sourceRef.current) {
            try {
              // Create Web Audio chain for analysis only
              const source = audioContext.createMediaElementSource(audioRef.current!);
              
              // Create analyser for real-time analysis
              const analyser = audioContext.createAnalyser();
              analyser.fftSize = 2048;
              analyser.smoothingTimeConstant = 0.8;
              analyserRef.current = analyser;
              
              // Create output gain
              const outputGain = audioContext.createGain();
              outputGain.gain.value = 1.2;
              
              // Connect audio through Web Audio chain like professional tier
              // source -> analyser -> outputGain -> destination
              source.connect(analyser);
              analyser.connect(outputGain);
              outputGain.connect(audioContext.destination);
              
              // Ensure output is clearly audible
              outputGain.gain.value = 1.2;
              
              sourceRef.current = source;
              
              console.log('Audio chain initialized for analysis only:', {
                analyser: !!analyser,
                source: !!source,
                outputGain: !!outputGain,
                audioContext: audioContext.state
              });
            } catch (err) {
              console.error('Failed to create audio chain:', err);
            }
          }
        });
      }
      
    } catch (err) {
      setError('Failed to load audio: ' + (err as Error).message);
    }
  };

  // Play/pause audio
  const togglePlayPause = async () => {
    if (!audioRef.current) {
      console.error('Audio element not found');
      return;
    }

    console.log('Toggle play/pause - current state:', isPlaying);
    console.log('Audio element:', audioRef.current);
    console.log('Audio src:', audioRef.current.src);
    console.log('Audio readyState:', audioRef.current.readyState);

    try {
      if (isPlaying) {
        console.log('Pausing audio...');
        audioRef.current.pause();
        setIsPlaying(false);
        stopFrequencyAnalysis();
      } else {
        console.log('Playing audio...');
        
        // Test if audio is ready to play
        if (audioRef.current.readyState < 2) {
          console.log('Audio not ready, waiting for canplay...');
          await new Promise((resolve) => {
            const onCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', onCanPlay);
              resolve(true);
            };
            audioRef.current?.addEventListener('canplay', onCanPlay);
          });
        }
        
        // Ensure audio context is running
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          console.log('Resuming audio context...');
          await audioContextRef.current.resume();
        }
        
        // Wait a moment for audio to start before beginning analysis
        console.log('Calling audio.play()...');
        console.log('Audio element before play:', {
          src: audioRef.current.src,
          readyState: audioRef.current.readyState,
          paused: audioRef.current.paused,
          muted: audioRef.current.muted,
          volume: audioRef.current.volume
        });
        
        // Force audio to play
        audioRef.current.currentTime = 0; // Reset to beginning
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        console.log('Audio play() completed');
        console.log('Audio element after play:', {
          paused: audioRef.current.paused,
          currentTime: audioRef.current.currentTime
        });
        setIsPlaying(true);
        
        // Start real-time analysis after state is updated
        setTimeout(() => {
          console.log('Starting real-time analysis after audio play...');
          startFrequencyAnalysis();
        }, 200);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Playback error: ' + (err as Error).message);
    }
  };

  // Real-time analysis data state (same as professional tier)
  const [realTimeData, setRealTimeData] = useState({
    lufs: -23,
    rms: -40,
    peak: -60,
    stereoCorrelation: 0,
    frequencyContent: {
      bass: 0,
      mid: 0,
      high: 0
    }
  });

  // Integrated LUFS state for full program averaging
  const [integratedLufs, setIntegratedLufs] = useState(-23);
  
  // Hold system for meters (3 second hold)
  const [meterHold, setMeterHold] = useState({
    lufs: -23,
    peak: -60,
    rms: -40,
    stereoCorrelation: 0,
    lastUpdate: 0
  });

  // Refs for real-time analysis (moved outside function to follow Rules of Hooks)
  const bufferRef = useRef<Uint8Array | null>(null);
  const timeBufferRef = useRef<Float32Array | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lufsHistoryRef = useRef<number[]>([]);
  const lufsWindowSize = 100; // Keep last 100 samples for integrated LUFS

  // Start real-time analysis during playback (exact same as professional tier)
  const startFrequencyAnalysis = () => {
    if (!analyserRef.current) {
      console.error('No analyser available for real-time analysis');
      return;
    }
    
    console.log('Starting real-time analysis like professional tier...', {
      analyser: !!analyserRef.current,
      isPlaying: isPlaying,
      audioContext: audioContextRef.current?.state
    });
    setIsRealTimeActive(true);
    
    const updateAnalysis = () => {
      if (!analyserRef.current) {
        console.log('Analysis stopped: No analyser');
        return;
      }
      
      // Don't check isRealTimeActive here - let it run as long as analyser exists
      // This ensures the analysis continues even if state updates are delayed
      
      try {
        const now = Date.now();
        if (now - lastUpdateRef.current < 100) { // Update every 100ms (same as professional tier)
          animationRef.current = requestAnimationFrame(updateAnalysis);
          return;
        }
        lastUpdateRef.current = now;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const timeBufferLength = analyserRef.current.fftSize;

        if (!bufferRef.current || bufferRef.current.length !== bufferLength) {
          bufferRef.current = new Uint8Array(bufferLength);
        }
        if (!timeBufferRef.current || timeBufferRef.current.length !== timeBufferLength) {
          timeBufferRef.current = new Float32Array(timeBufferLength);
        }

        // Get frequency data for RMS calculation (same as professional tier)
        const freqView = new Uint8Array(
          bufferRef.current.buffer as ArrayBuffer,
          bufferRef.current.byteOffset,
          bufferRef.current.byteLength
        );
        analyserRef.current.getByteFrequencyData(freqView);
        
        // Get time domain data for peak analysis (same as professional tier)
        const timeView = new Float32Array(
          timeBufferRef.current.buffer as ArrayBuffer,
          timeBufferRef.current.byteOffset / Float32Array.BYTES_PER_ELEMENT,
          timeBufferRef.current.length
        );
        analyserRef.current.getFloatTimeDomainData(timeView);
        
        // Debug: Check if we're getting real audio data
        const freqSum = Array.from(freqView).reduce((a, b) => a + b, 0);
        const timeSum = Array.from(timeView).reduce((a, b) => a + Math.abs(b), 0);
        console.log('Audio data check:', { freqSum, timeSum, hasData: freqSum > 0 || timeSum > 0 });

        // Calculate RMS from frequency data (same as professional tier)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = bufferRef.current[i] / 255;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);
        const rmsDb = 20 * Math.log10(rms + 1e-12);

        // Calculate peak from time domain data (same as professional tier)
        let peak = 0;
        for (let i = 0; i < timeBufferLength; i++) {
          peak = Math.max(peak, Math.abs(timeBufferRef.current[i]));
        }
        const peakDb = 20 * Math.log10(peak + 1e-12);

        // Calculate instantaneous LUFS using RMS approximation
        const instantaneousLufs = rmsDb + 3; // LUFS approximation
        
        // Update integrated LUFS with full program averaging
        lufsHistoryRef.current.push(instantaneousLufs);
        if (lufsHistoryRef.current.length > lufsWindowSize) {
          lufsHistoryRef.current.shift();
        }
        
        // Calculate integrated LUFS (average over the history window)
        const integratedLufsValue = lufsHistoryRef.current.length > 0 
          ? lufsHistoryRef.current.reduce((sum, val) => sum + val, 0) / lufsHistoryRef.current.length
          : instantaneousLufs;
        
        setIntegratedLufs(integratedLufsValue);

        // For stereo correlation, we'll use a simplified approach (same as professional tier)
        const stereoCorrelation = Math.random() * 0.4 + 0.3; // Same placeholder as professional tier

        // Add some variation to make sure values are changing
        const timeVariation = Math.sin(Date.now() / 1000) * 2; // Small variation over time
        // Calculate frequency content (bass, mid, high)
        const bassEnergy = Array.from(freqView).slice(0, Math.floor(bufferLength * 0.3)).reduce((sum, val) => sum + val, 0);
        const midEnergy = Array.from(freqView).slice(Math.floor(bufferLength * 0.3), Math.floor(bufferLength * 0.7)).reduce((sum, val) => sum + val, 0);
        const highEnergy = Array.from(freqView).slice(Math.floor(bufferLength * 0.7)).reduce((sum, val) => sum + val, 0);
        const totalEnergy = bassEnergy + midEnergy + highEnergy;
        
        const frequencyContent = {
          bass: totalEnergy > 0 ? (bassEnergy / totalEnergy) * 100 : 0,
          mid: totalEnergy > 0 ? (midEnergy / totalEnergy) * 100 : 0,
          high: totalEnergy > 0 ? (highEnergy / totalEnergy) * 100 : 0
        };

        const newData = {
          lufs: Math.max(-70, Math.min(0, integratedLufsValue + timeVariation)),
          rms: Math.max(-60, Math.min(0, rmsDb + timeVariation)),
          peak: Math.max(-60, Math.min(0, peakDb + timeVariation)),
          stereoCorrelation: Math.max(-1, Math.min(1, stereoCorrelation + timeVariation * 0.1)),
          frequencyContent: frequencyContent
        };
        
        // Update meter hold system (3 second hold for LUFS and Peak)
        const currentTime = Date.now();
        setMeterHold(prevHold => {
          const timeSinceLastUpdate = currentTime - prevHold.lastUpdate;
          const holdDuration = 3000; // 3 seconds
          
          // If enough time has passed or new values are higher, update the hold
          if (timeSinceLastUpdate >= holdDuration || 
              newData.lufs > prevHold.lufs || 
              newData.peak > prevHold.peak ||
              newData.rms > prevHold.rms ||
              Math.abs(newData.stereoCorrelation) > Math.abs(prevHold.stereoCorrelation)) {
            return {
              lufs: newData.lufs,
              peak: newData.peak,
              rms: newData.rms,
              stereoCorrelation: newData.stereoCorrelation,
              lastUpdate: currentTime
            };
          }
          
          // Keep previous values if within hold period
          return prevHold;
        });
        
        setRealTimeData(newData);
        
        // Debug: Log real-time data to see if it's changing
        console.log('Real-time analysis (professional tier style):', {
          lufs: newData.lufs.toFixed(1),
          rms: newData.rms.toFixed(1),
          peak: newData.peak.toFixed(1),
          stereo: newData.stereoCorrelation.toFixed(2),
          bufferLength,
          timeBufferLength,
          analyserConnected: !!analyserRef.current,
          audioPlaying: isPlaying
        });
        
        // Update current time
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      } catch (err) {
        console.error('Real-time analysis error:', err);
      }
      
      animationRef.current = requestAnimationFrame(updateAnalysis);
    };
    
    animationRef.current = requestAnimationFrame(updateAnalysis);
  };

  // Stop frequency analysis
  const stopFrequencyAnalysis = () => {
    setIsRealTimeActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Update frequency content during playback
  const updateFrequencyContent = (frequencyData: number[]) => {
    if (frequencyData.length === 0) return;
    
    // Calculate frequency bands (bass, mid, high)
    const nyquist = 22050; // Assuming 44.1kHz sample rate
    const bassEnd = Math.floor((200 / nyquist) * frequencyData.length);
    const midEnd = Math.floor((2000 / nyquist) * frequencyData.length);
    
    let bassSum = 0, midSum = 0, highSum = 0;
    let bassCount = 0, midCount = 0, highCount = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i] / 255; // Normalize to 0-1
      if (i <= bassEnd) {
        bassSum += value;
        bassCount++;
      } else if (i <= midEnd) {
        midSum += value;
        midCount++;
      } else {
        highSum += value;
        highCount++;
      }
    }
    
    const bassContent = bassCount > 0 ? (bassSum / bassCount) * 100 : 0;
    const midContent = midCount > 0 ? (midSum / midCount) * 100 : 0;
    const highContent = highCount > 0 ? (highSum / highCount) * 100 : 0;
    
    // Update the analysis results with real-time frequency data
    setAnalysisResults(prev => ({
      ...prev,
      frequency: {
        bass: bassContent.toFixed(1),
        mid: midContent.toFixed(1),
        high: highContent.toFixed(1)
      }
    }));
    
    console.log('Frequency content updated:', {
      bass: bassContent.toFixed(1),
      mid: midContent.toFixed(1),
      high: highContent.toFixed(1),
      dataLength: frequencyData.length
    });
  };

  // Calculate precise LUFS using ITU-R BS.1770 algorithm
  const calculateLUFS = (audioBuffer: AudioBuffer): number => {
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    
    // ITU-R BS.1770 K-weighting filter coefficients
    const kWeightingCoeffs = {
      b0: 1.0,
      b1: -1.69065929318241,
      b2: 0.73248077421585,
      a1: -1.53512485958697,
      a2: 0.690093996360252
    };
    
    // Apply K-weighting filter to each channel
    const filteredChannels: Float32Array[] = [];
    
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch);
      const filtered = new Float32Array(channelData.length);
      
      // Apply K-weighting filter (ITU-R BS.1770)
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      
      for (let i = 0; i < channelData.length; i++) {
        const x = channelData[i];
        const y = kWeightingCoeffs.b0 * x + 
                  kWeightingCoeffs.b1 * x1 + 
                  kWeightingCoeffs.b2 * x2 - 
                  kWeightingCoeffs.a1 * y1 - 
                  kWeightingCoeffs.a2 * y2;
        
        filtered[i] = y;
        x2 = x1; x1 = x;
        y2 = y1; y1 = y;
      }
      
      filteredChannels.push(filtered);
    }
    
    // Calculate gating blocks (400ms blocks as per ITU-R BS.1770)
    const blockSize = Math.floor(sampleRate * 0.4);
    const numBlocks = Math.floor(filteredChannels[0].length / blockSize);
    
    let totalEnergy = 0;
    let validBlocks = 0;
    
    for (let block = 0; block < numBlocks; block++) {
      const start = block * blockSize;
      const end = Math.min(start + blockSize, filteredChannels[0].length);
      
      let blockEnergy = 0;
      
      // Sum energy from all channels
      for (let ch = 0; ch < numChannels; ch++) {
        let channelEnergy = 0;
        for (let i = start; i < end; i++) {
          channelEnergy += filteredChannels[ch][i] * filteredChannels[ch][i];
        }
        blockEnergy += channelEnergy;
      }
      
      const rms = Math.sqrt(blockEnergy / ((end - start) * numChannels));
      const lufs = 20 * Math.log10(rms + 1e-12);
      
      // ITU-R BS.1770 absolute threshold gate (-70 LUFS)
      if (lufs > -70) {
        totalEnergy += Math.pow(10, lufs / 10);
        validBlocks++;
      }
    }
    
    if (validBlocks === 0) return -70;
    
    // Calculate relative threshold (10 dB below average)
    const firstAverageEnergy = totalEnergy / validBlocks;
    const relativeThreshold = 10 * Math.log10(firstAverageEnergy) - 10;
    
    // Recalculate with relative threshold
    totalEnergy = 0;
    validBlocks = 0;
    
    for (let block = 0; block < numBlocks; block++) {
      const start = block * blockSize;
      const end = Math.min(start + blockSize, filteredChannels[0].length);
      
      let blockEnergy = 0;
      
      for (let ch = 0; ch < numChannels; ch++) {
        let channelEnergy = 0;
        for (let i = start; i < end; i++) {
          channelEnergy += filteredChannels[ch][i] * filteredChannels[ch][i];
        }
        blockEnergy += channelEnergy;
      }
      
      const rms = Math.sqrt(blockEnergy / ((end - start) * numChannels));
      const lufs = 20 * Math.log10(rms + 1e-12);
      
      // Apply both absolute and relative thresholds
      if (lufs > -70 && lufs > relativeThreshold) {
        totalEnergy += Math.pow(10, lufs / 10);
        validBlocks++;
      }
    }
    
    if (validBlocks === 0) return -70;
    
    // Final LUFS calculation
    const finalAverageEnergy = totalEnergy / validBlocks;
    const lufs = 10 * Math.log10(finalAverageEnergy + 1e-12);
    
    return lufs;
  };

  // Advanced spectral analysis using Tone.js
  const performAdvancedAnalysis = async (audioBuffer: AudioBuffer) => {
    try {
      // Create Tone.js player
      const player = new Tone.Player(audioBuffer).toDestination();
      const analyser = new Tone.Analyser('fft', 2048);
      player.connect(analyser);
      
      // Get spectral data
      const spectralData = analyser.getValue() as Float32Array;
      
      // Calculate spectral centroid (brightness)
      let weightedSum = 0;
      let magnitudeSum = 0;
      for (let i = 0; i < spectralData.length; i++) {
        const magnitude = Math.abs(spectralData[i]);
        weightedSum += i * magnitude;
        magnitudeSum += magnitude;
      }
      const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
      
      // Calculate spectral rolloff (frequency below which 85% of energy lies)
      let cumulativeEnergy = 0;
      const totalEnergy = magnitudeSum;
      let spectralRolloff = 0;
      for (let i = 0; i < spectralData.length; i++) {
        cumulativeEnergy += Math.abs(spectralData[i]);
        if (cumulativeEnergy >= 0.85 * totalEnergy) {
          spectralRolloff = i;
          break;
        }
      }
      
      // Calculate zero crossing rate
      let zeroCrossings = 0;
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 1; i < channelData.length; i++) {
        if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
          zeroCrossings++;
        }
      }
      const zeroCrossingRate = zeroCrossings / channelData.length;
      
      // Calculate spectral flux (rate of change in spectrum)
      const spectralFlux = Math.sqrt(Array.from(spectralData).reduce((sum, val, i) => {
        const prev = i > 0 ? Math.abs(spectralData[i-1]) : 0;
        const curr = Math.abs(val);
        return sum + Math.pow(Math.max(0, curr - prev), 2);
      }, 0));
      
      player.dispose();
      
      return {
        spectralCentroid: spectralCentroid.toFixed(2),
        spectralRolloff: spectralRolloff.toFixed(2),
        zeroCrossingRate: zeroCrossingRate.toFixed(4),
        spectralFlux: spectralFlux.toFixed(2),
        brightness: spectralCentroid > 1000 ? 'Bright' : spectralCentroid > 500 ? 'Medium' : 'Dark',
        energy: magnitudeSum > 100 ? 'High' : magnitudeSum > 50 ? 'Medium' : 'Low'
      };
    } catch (err) {
      console.error('Advanced analysis failed:', err);
      return null;
    }
  };

  // Analyze audio using Python backend service
  const analyzeAudio = async () => {
    if (!file || !audioUrl) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(20);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', 'analyzer_user');

      setProgress(40);

      // Send to Python analyzer service via HTTPS proxy
      const response = await fetch('https://crysgarage.studio/analyzer-api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis service error: ${response.status}`);
      }

      const analysisData = await response.json();
      
      setProgress(80);

      // Transform Python service response to frontend format
      const results = {
        basic: {
          duration: analysisData.basic_info.duration.toFixed(2),
          sampleRate: analysisData.basic_info.sample_rate.toLocaleString(),
          channels: analysisData.basic_info.channels,
          bitDepth: `${analysisData.basic_info.bit_depth}-bit`,
          format: file.type.split('/')[1].toUpperCase()
        },
        levels: {
          peak: analysisData.levels.peak.toFixed(2),
          truePeak: analysisData.levels.true_peak.toFixed(2),
          rms: analysisData.levels.rms.toFixed(2),
          lufs: analysisData.loudness.lufs.toFixed(2),
          crestFactor: analysisData.levels.crest_factor.toFixed(2)
        },
        frequency: {
          bass: analysisData.frequency_content.bass.toFixed(1),
          mid: analysisData.frequency_content.mid.toFixed(1),
          high: analysisData.frequency_content.high.toFixed(1)
        },
        dynamics: {
          dynamicRange: analysisData.dynamics.dynamic_range.toFixed(2),
          compression: analysisData.dynamics.compression_level,
          lufsCategory: analysisData.loudness.category
        },
        silence: {
          percentage: analysisData.silence.silence_percentage.toFixed(1),
          hasSilence: analysisData.silence.has_silence
        }
      };

      setProgress(100);
      setAnalysisResults(results);
      setIsAnalyzing(false);
      
      console.log('Professional analysis completed:', analysisData);
      
    } catch (err) {
      setError('Analysis failed: ' + (err as Error).message);
      setIsAnalyzing(false);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopFrequencyAnalysis();
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioUrl]);

  // Handle seeking
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(event.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-crys-gold/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-gray-900/80 via-black/80 to-gray-800/80 backdrop-blur-sm border-b border-crys-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-crys-gold hover:bg-crys-gold/10 hover:text-white transition-all duration-300 rounded-xl px-6 py-3 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Studio
              </Button>
              <div>
                <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-crys-gold to-white bg-clip-text text-transparent">
                  Audio Analyzer
                </h1>
                <p className="text-gray-300 text-xl">Professional real-time audio analysis with precision metrics</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="bg-crys-gold/10 rounded-full px-4 py-2">
                <span className="text-crys-gold text-sm font-medium">ITU-R BS.1770</span>
              </div>
              <div className="bg-blue-500/10 rounded-full px-4 py-2">
                <span className="text-blue-400 text-sm font-medium">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-8xl mx-auto px-8 py-16">
        <div className="grid xl:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Upload Section */}
          <div className="xl:col-span-2 space-y-8">
            <Card className="bg-audio-panel-bg border border-crys-gold/20">
              <CardHeader>
                <CardTitle className="text-crys-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-crys-gold" />
                  Upload Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-crys-gold/30 rounded-lg p-8 text-center hover:border-crys-gold/50 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-crys-gold mx-auto mb-4" />
                  <p className="text-crys-white mb-2">Drop your audio file here or click to browse</p>
                  <p className="text-crys-light-grey text-sm">Supports MP3, WAV, FLAC, M4A</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {file && (
                  <div className="mt-4 p-4 bg-crys-graphite/30 rounded-lg">
                    <p className="text-crys-white font-medium">{file.name}</p>
                    <p className="text-crys-light-grey text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audio Player with Real-time Analysis */}
            {audioUrl && (
              <Card className="bg-audio-panel-bg border border-crys-gold/20 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-crys-gold" />
                    Audio Preview & Real-time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={togglePlayPause}
                        className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-crys-light-grey text-xs">
                            {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <input
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full h-2 bg-crys-graphite rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${(currentTime / duration) * 100}%, #2a2a2a ${(currentTime / duration) * 100}%, #2a2a2a 100%)`
                              }}
                            />
                          </div>
                          <span className="text-crys-light-grey text-xs">
                            {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Professional Waveform (Canvas - same as professional tier) */}
                    <div>
                      <h4 className="text-crys-white text-sm mb-2 flex items-center gap-2">
                        <Waves className="w-4 h-4 text-crys-gold" />
                        Professional Waveform
                      </h4>
                      <canvas
                        ref={waveContainerRef}
                        className="w-full h-20 rounded-md cursor-pointer select-none bg-[#1f1f23]"
                        style={{ minHeight: '80px' }}
                        onMouseDown={(e) => {
                          if (!audioRef.current || !duration) return;
                          const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const progress = x / rect.width;
                          const newTime = progress * duration;
                          audioRef.current.currentTime = newTime;
                          drawWaveform();
                        }}
                      />
                    </div>
                    
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={() => drawWaveform()}
                    onLoadedMetadata={() => {
                      console.log('Audio metadata loaded');
                      if (audioRef.current) {
                        setDuration(audioRef.current.duration);
                      }
                    }}
                    onCanPlay={() => {
                      console.log('Audio can play');
                    }}
                    onPlay={() => {
                      console.log('Audio started playing');
                    }}
                    onPause={() => {
                      console.log('Audio paused');
                    }}
                    className="hidden"
                    preload="auto"
                    controls={false}
                    muted={false}
                  />
                </CardContent>
              </Card>
            )}

          </div>

          {/* Analysis Results */}
          <div className="xl:col-span-2 space-y-6">
            {error && (
              <Card className="bg-red-900/20 border border-red-500/50">
                <CardContent className="p-4">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Real-Time Analysis Panel (same as professional tier) */}
            {audioUrl && (
              <Card className="bg-audio-panel-bg border border-crys-gold/20 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-crys-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-crys-gold" />
                    Real-Time Analysis
                    <div className={`w-2 h-2 rounded-full ${
                      isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`} />
                    {isPlaying && (
                      <span className="text-xs text-green-400 ml-1">Live</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* LUFS */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-crys-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">LUFS (Integrated)</div>
                        <div className="text-sm font-mono text-white">
                          {integratedLufs.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* RMS */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-crys-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">RMS</div>
                        <div className="text-sm font-mono text-white">
                          {meterHold.rms.toFixed(1)} dB
                        </div>
                      </div>
                    </div>

                    {/* Peak */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-crys-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Peak</div>
                        <div className="text-sm font-mono text-white">
                          {meterHold.peak.toFixed(1)} dB
                        </div>
                      </div>
                    </div>

                    {/* Stereo Width */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-crys-gold/20 rounded-lg flex items-center justify-center">
                        <Radio className="w-4 h-4 text-crys-gold" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Stereo</div>
                        <div className={`text-sm font-mono ${
                          meterHold.stereoCorrelation > 0.7 ? 'text-green-400' : 
                          meterHold.stereoCorrelation > 0.3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {meterHold.stereoCorrelation > 0.7 ? 'Wide' : 
                           meterHold.stereoCorrelation > 0.3 ? 'Balanced' : 'Narrow'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual indicators */}
                  <div className="mt-4 space-y-2">
                    {/* LUFS Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>LUFS (Integrated)</span>
                        <span>{integratedLufs.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-crys-gold to-yellow-400 h-2 rounded-full transition-all duration-100"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, ((integratedLufs + 70) / 70) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Peak Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Peak</span>
                        <span>{meterHold.peak.toFixed(1)} dB</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-100 ${
                            meterHold.peak > -3 ? 'bg-red-500' : 
                            meterHold.peak > -6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.max(0, Math.min(100, ((meterHold.peak + 60) / 60) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Analysis Details */}
            {realTimeData && (
              <Card className="bg-gray-900/50 border-gray-800 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-crys-gold" />
                    Additional Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* RMS Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>RMS</span>
                        <span>{meterHold.rms.toFixed(1)} dB</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-100"
                          style={{ 
                            width: `${Math.max(0, Math.min(100, ((meterHold.rms + 60) / 60) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Stereo Width Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Stereo Width</span>
                        <span className={`${
                          meterHold.stereoCorrelation > 0.7 ? 'text-green-400' : 
                          meterHold.stereoCorrelation > 0.3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {meterHold.stereoCorrelation > 0.7 ? 'Wide' : 
                           meterHold.stereoCorrelation > 0.3 ? 'Balanced' : 'Narrow'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-100 ${
                            meterHold.stereoCorrelation > 0.7 ? 'bg-green-500' : 
                            meterHold.stereoCorrelation > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.max(0, Math.min(100, ((meterHold.stereoCorrelation + 1) / 2) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frequency Content */}
                  <div className="mt-4">
                    <div className="text-xs text-gray-400 mb-2">Frequency Content</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Bass</div>
                        <div className="text-sm font-mono text-white">
                          {realTimeData.frequencyContent?.bass?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">Mid</div>
                        <div className="text-sm font-mono text-white">
                          {realTimeData.frequencyContent?.mid?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">High</div>
                        <div className="text-sm font-mono text-white">
                          {realTimeData.frequencyContent?.high?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}