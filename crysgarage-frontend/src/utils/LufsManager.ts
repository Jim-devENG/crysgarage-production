import { LufsFrame, LufsOptions, LufsMeasurement, LUFS_CONSTANTS } from '../types/lufs';

export class LufsManager {
  private audioContext: AudioContext | null = null;
  private lufsNode: AudioWorkletNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isInitialized = false;
  private onFrameCallback: ((frame: LufsFrame) => void) | null = null;
  private options: LufsOptions;

  constructor(options: LufsOptions = {}) {
    this.options = {
      targetLufs: options.targetLufs ?? LUFS_CONSTANTS.DEFAULT_TARGET,
      updateIntervalMs: options.updateIntervalMs ?? LUFS_CONSTANTS.DEFAULT_UPDATE_INTERVAL,
      oversampleFactor: options.oversampleFactor ?? LUFS_CONSTANTS.DEFAULT_OVERSAMPLE_FACTOR
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new AudioContext({ 
        latencyHint: "interactive",
        sampleRate: 48000 // Ensure consistent sample rate
      });

      // Load the LUFS processor
      await this.audioContext.audioWorklet.addModule('/lufs-processor.js');

      // Create LUFS worklet node
      this.lufsNode = new AudioWorkletNode(this.audioContext, "lufs-processor", {
        processorOptions: this.options,
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2] // Stereo output
      });

      // Set up message handling
      this.lufsNode.port.onmessage = (event) => {
        const frame = event.data as LufsFrame;
        if (this.onFrameCallback) {
          this.onFrameCallback(frame);
        }
      };

      // Connect to destination (optional - for monitoring)
      this.lufsNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log('LUFS Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LUFS Manager:', error);
      throw error;
    }
  }

  async connectToMediaStream(stream: MediaStream): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.lufsNode) {
      throw new Error('LUFS Manager not initialized');
    }

    try {
      // Create source from media stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      
      // Connect to LUFS processor
      this.sourceNode.connect(this.lufsNode);
      
      console.log('Connected to media stream for LUFS measurement');
    } catch (error) {
      console.error('Failed to connect to media stream:', error);
      throw error;
    }
  }

  async connectToAudioElement(audioElement: HTMLAudioElement): Promise<void> {
    if (!this.isInitialized || !this.audioContext || !this.lufsNode) {
      throw new Error('LUFS Manager not initialized');
    }

    try {
      // Create source from audio element
      const sourceNode = this.audioContext.createMediaElementSource(audioElement);
      
      // Connect to LUFS processor
      sourceNode.connect(this.lufsNode);
      
      console.log('Connected to audio element for LUFS measurement');
    } catch (error) {
      console.error('Failed to connect to audio element:', error);
      throw error;
    }
  }

  connectToAudioNode(inputNode: AudioNode): void {
    if (!this.isInitialized || !this.lufsNode) {
      throw new Error('LUFS Manager not initialized');
    }

    try {
      inputNode.connect(this.lufsNode);
      console.log('Connected to audio node for LUFS measurement');
    } catch (error) {
      console.error('Failed to connect to audio node:', error);
      throw error;
    }
  }

  onFrame(callback: (frame: LufsFrame) => void): void {
    this.onFrameCallback = callback;
  }

  getMeasurement(): LufsMeasurement | null {
    // This would return the latest measurement if stored
    // For now, measurements come through the callback
    return null;
  }

  updateOptions(newOptions: Partial<LufsOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // Note: AudioWorklet options cannot be changed after creation
    // A new instance would need to be created for option changes
    console.warn('LUFS options updated, but AudioWorklet requires reinitialization for changes to take effect');
  }

  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async suspend(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }

  disconnect(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.lufsNode) {
      this.lufsNode.disconnect();
      this.lufsNode = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    this.onFrameCallback = null;
  }

  isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }

  getAudioContextState(): string {
    return this.audioContext?.state || 'closed';
  }
}

// Utility functions for LUFS calculations
export class LufsUtils {
  static formatLufsValue(value: number | null): string {
    if (value === null) return "−∞";
    return `${Math.round(value)} LUFS`;
  }

  static formatTruePeak(value: number | null): string {
    if (value === null) return "−∞";
    return `${value.toFixed(1)} dBTP`;
  }

  static formatGainToTarget(value: number | null): string {
    if (value === null) return "−∞";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)} dB`;
  }

  static getLufsColor(value: number | null): string {
    if (value === null) return "text-gray-500";
    if (value > -10) return "text-red-500";
    if (value > -16) return "text-yellow-500";
    return "text-green-500";
  }

  static getTruePeakColor(value: number | null): string {
    if (value === null) return "text-gray-500";
    if (value > -1) return "text-red-500";
    if (value > -3) return "text-yellow-500";
    return "text-green-500";
  }

  static getGainToTargetColor(value: number | null): string {
    if (value === null) return "text-gray-500";
    if (Math.abs(value) < 0.5) return "text-green-500";
    if (Math.abs(value) < 2) return "text-yellow-500";
    return "text-red-500";
  }

  static isValidLufsValue(value: number | null): boolean {
    return value !== null && value > LUFS_CONSTANTS.ABSOLUTE_GATE;
  }
}
