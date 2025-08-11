import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  Play, 
  Pause, 
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
  Settings,
  Zap,
  Music,
  Download
} from "lucide-react";

interface LiveAudioControlsProps {
  masteredAudioUrl: string;
  originalAudioUrl?: string;
  fileName: string;
  onSave?: (audioBlob: Blob) => void;
  onDownload?: () => void;
}

interface AudioControls {
  volume: number;
  bass: number;
  treble: number;
  compression: number;
  stereoWidth: number;
}

interface ProcessingRequest {
  originalAudioUrl: string;
  fileName: string;
  adjustments: AudioControls;
}

export function LiveAudioControls({ 
  masteredAudioUrl, 
  originalAudioUrl, 
  fileName,
  onSave,
  onDownload 
}: LiveAudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAudioContextInitialized, setIsAudioContextInitialized] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const stereoPannerRef = useRef<StereoPannerNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [controls, setControls] = useState<AudioControls>({
    volume: 1.0,
    bass: 1.0,
    treble: 1.0,
    compression: 1.0,
    stereoWidth: 1.0
  });

  // Initialize Web Audio API when user first interacts
  const initializeAudioContext = async () => {
    if (isAudioContextInitialized || !audioRef.current) return;

    try {
      console.log('Initializing Web Audio API...');
      console.log('Audio element:', audioRef.current);
      console.log('Audio URL:', masteredAudioUrl);
      
      // Create Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio context created:', audioContextRef.current);
      console.log('Audio context state:', audioContextRef.current.state);
      
      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContextRef.current.resume();
        console.log('Audio context resumed, new state:', audioContextRef.current.state);
      }
      
      // Create audio nodes
      gainNodeRef.current = audioContextRef.current.createGain();
      biquadFilterRef.current = audioContextRef.current.createBiquadFilter();
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      stereoPannerRef.current = audioContextRef.current.createStereoPanner();
      console.log('Audio nodes created');
      
      // Create source from audio element
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      console.log('Media element source created');
      
      // Connect the audio nodes
      sourceNodeRef.current
        .connect(biquadFilterRef.current)
        .connect(compressorRef.current)
        .connect(gainNodeRef.current)
        .connect(stereoPannerRef.current)
        .connect(audioContextRef.current.destination);
      console.log('Audio nodes connected');
      
      // Set initial filter type for bass/treble
      biquadFilterRef.current.type = 'lowshelf';
      biquadFilterRef.current.frequency.value = 200;
      
      setIsAudioContextInitialized(true);
      setAudioError(null);
      console.log('Web Audio API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
      setAudioError(`Audio processing not supported: ${error.message}`);
    }
  };

  // Apply audio controls
  useEffect(() => {
    if (!audioContextRef.current || !isAudioContextInitialized) return;

    try {
      // Volume control
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(controls.volume, audioContextRef.current.currentTime);
      }

      // Bass control
      if (biquadFilterRef.current) {
        biquadFilterRef.current.gain.setValueAtTime(controls.bass - 1, audioContextRef.current.currentTime);
      }

      // Treble control (create high shelf filter)
      if (biquadFilterRef.current) {
        biquadFilterRef.current.type = controls.treble > 1 ? 'highshelf' : 'lowshelf';
        biquadFilterRef.current.frequency.setValueAtTime(controls.treble > 1 ? 3000 : 200, audioContextRef.current.currentTime);
        biquadFilterRef.current.gain.setValueAtTime(controls.treble > 1 ? controls.treble - 1 : controls.bass - 1, audioContextRef.current.currentTime);
      }

      // Compression control
      if (compressorRef.current) {
        compressorRef.current.threshold.setValueAtTime(-50 + (controls.compression - 1) * 20, audioContextRef.current.currentTime);
        compressorRef.current.ratio.setValueAtTime(controls.compression, audioContextRef.current.currentTime);
      }

      // Stereo width control
      if (stereoPannerRef.current) {
        stereoPannerRef.current.pan.setValueAtTime((controls.stereoWidth - 1) * 0.5, audioContextRef.current.currentTime);
      }
    } catch (error) {
      console.error('Error applying audio controls:', error);
    }
  }, [controls, isAudioContextInitialized]);

  const handlePlay = async () => {
    if (!audioRef.current) {
      console.error('No audio element reference');
      setAudioError('No audio element available');
      return;
    }

    console.log('Play button clicked');
    console.log('Audio element:', audioRef.current);
    console.log('Audio URL:', masteredAudioUrl);
    console.log('Audio element src:', audioRef.current.src);
    console.log('Audio element readyState:', audioRef.current.readyState);

    try {
      // Initialize audio context on first play
      if (!isAudioContextInitialized) {
        console.log('Initializing audio context on first play...');
        await initializeAudioContext();
      }

      if (isPlaying) {
        console.log('Pausing audio...');
        audioRef.current.pause();
      } else {
        console.log('Playing audio...');
        await audioRef.current.play();
        console.log('Audio play started successfully');
      }
    } catch (error) {
      console.error('Playback error:', error);
      setAudioError(`Failed to play audio: ${error.message}`);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setAudioError(null);
      console.log('Audio metadata loaded, duration:', audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = (event: any) => {
    console.error('Audio error:', event);
    setAudioError('Failed to load audio file');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetControls = () => {
    setControls({
      volume: 1.0,
      bass: 1.0,
      treble: 1.0,
      compression: 1.0,
      stereoWidth: 1.0
    });
  };

  // Process audio with Ruby backend using exact adjustments
  const processAudioWithRuby = async () => {
    if (!originalAudioUrl) {
      setAudioError('Original audio URL not available');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Sending adjustments to Ruby processor...');

    try {
      const processingRequest: ProcessingRequest = {
        originalAudioUrl: originalAudioUrl,
        fileName: fileName,
        adjustments: controls
      };

      console.log('Sending processing request to Ruby:', processingRequest);

      // Send to Ruby backend for processing
      const response = await fetch('http://localhost:4567/process_with_adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processingRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Ruby processing result:', result);

      if (result.success) {
        setProcessingStatus('Processing complete! Downloading file...');
        
        // Download the processed file
        const downloadResponse = await fetch(result.downloadUrl);
        const audioBlob = await downloadResponse.blob();
        
        // Create download link
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.[^/.]+$/, '')}_exact_adjustments.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setProcessingStatus('Download complete! Your audio with exact adjustments has been saved.');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setAudioError(`Processing failed: ${error.message}`);
      setProcessingStatus('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Audio Player */}
      <Card className="bg-audio-panel-bg border-crys-gold/20 border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-crys-gold" />
            <h4 className="text-crys-white">Live Audio Mastering</h4>
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold">
              Real-Time Controls
            </Badge>
            {isAudioContextInitialized && (
              <Badge variant="outline" className="border-green-500/30 text-green-400">
                Audio Processing Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={masteredAudioUrl}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            crossOrigin="anonymous"
          />

          {/* Audio Player Controls */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={handlePlay}
              disabled={!masteredAudioUrl}
              className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <div className="flex-1">
              <Progress value={(currentTime / duration) * 100} className="h-3" />
              <div className="flex justify-between text-sm text-crys-light-grey mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetControls}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Status Information */}
          <div className="space-y-2">
            <div className="text-xs text-crys-light-grey">
              Audio URL: {masteredAudioUrl ? 'Loaded' : 'Not available'}
            </div>
            <div className="text-xs text-crys-light-grey">
              Audio Context: {isAudioContextInitialized ? 'Active' : 'Not initialized'}
            </div>
            {audioError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-sm font-medium">Error:</span>
                  <span className="text-sm">{audioError}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Audio Controls */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Real-Time Audio Controls</h4>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-crys-gold" />
                <label className="text-sm font-medium text-crys-white">Volume</label>
                <span className="text-xs text-crys-light-grey ml-auto">
                  {(controls.volume * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={controls.volume}
                onChange={(e) => setControls(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-crys-light-grey">
                <span>0%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Bass Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-crys-gold" />
                <label className="text-sm font-medium text-crys-white">Bass</label>
                <span className="text-xs text-crys-light-grey ml-auto">
                  {(controls.bass * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={controls.bass}
                onChange={(e) => setControls(prev => ({ ...prev, bass: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-crys-light-grey">
                <span>-50%</span>
                <span>100%</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Treble Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-crys-gold" />
                <label className="text-sm font-medium text-crys-white">Treble</label>
                <span className="text-xs text-crys-light-grey ml-auto">
                  {(controls.treble * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={controls.treble}
                onChange={(e) => setControls(prev => ({ ...prev, treble: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-crys-light-grey">
                <span>-50%</span>
                <span>100%</span>
                <span>+100%</span>
              </div>
            </div>

            {/* Compression Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-crys-gold" />
                <label className="text-sm font-medium text-crys-white">Compression</label>
                <span className="text-xs text-crys-light-grey ml-auto">
                  {controls.compression.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={controls.compression}
                onChange={(e) => setControls(prev => ({ ...prev, compression: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-crys-light-grey">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            {/* Stereo Width Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-crys-gold" />
                <label className="text-sm font-medium text-crys-white">Stereo Width</label>
                <span className="text-xs text-crys-light-grey ml-auto">
                  {(controls.stereoWidth * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={controls.stereoWidth}
                onChange={(e) => setControls(prev => ({ ...prev, stereoWidth: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-crys-light-grey">
                <span>10%</span>
                <span>100%</span>
                <span>300%</span>
              </div>
            </div>
          </div>

          {/* Control Values Display */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
            <h5 className="text-crys-white font-medium mb-3">Current Settings:</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-crys-gold font-bold">{(controls.volume * 100).toFixed(0)}%</div>
                <div className="text-crys-light-grey text-xs">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-crys-gold font-bold">{(controls.bass * 100).toFixed(0)}%</div>
                <div className="text-crys-light-grey text-xs">Bass</div>
              </div>
              <div className="text-center">
                <div className="text-crys-gold font-bold">{(controls.treble * 100).toFixed(0)}%</div>
                <div className="text-crys-light-grey text-xs">Treble</div>
              </div>
              <div className="text-center">
                <div className="text-crys-gold font-bold">{controls.compression.toFixed(1)}x</div>
                <div className="text-crys-light-grey text-xs">Compression</div>
              </div>
              <div className="text-center">
                <div className="text-crys-gold font-bold">{(controls.stereoWidth * 100).toFixed(0)}%</div>
                <div className="text-crys-light-grey text-xs">Stereo Width</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Controls */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-crys-light-grey" />
            <h4 className="text-crys-white">Save Your Mastered Audio</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-crys-light-grey text-sm">
              Save your audio with the exact adjustments you made. Ruby will process your original audio file with these precise parameters.
            </p>
            
            <div className="flex gap-4">
              <Button
                onClick={processAudioWithRuby}
                disabled={isProcessing || !originalAudioUrl || !isAudioContextInitialized}
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-crys-black mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save with Exact Adjustments
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={onDownload}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Original
              </Button>
            </div>

            {/* Processing Status */}
            {processingStatus && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm">{processingStatus}</span>
                </div>
              </div>
            )}

            <div className="bg-crys-gold/10 border border-crys-gold/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-crys-gold mb-2">
                <span className="text-sm font-medium">💡 How It Works</span>
              </div>
              <div className="text-xs text-crys-light-grey space-y-1">
                <p>• Adjust controls while playing to hear changes in real-time</p>
                <p>• When you save, Ruby processes your original file with these exact parameters</p>
                <p>• You get the exact same sound you heard during live adjustment</p>
                <p>• All adjustments are applied to the original audio file, not just playback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #fbbf24;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
          
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #fbbf24;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }
        `
      }} />
    </div>
  );
} 