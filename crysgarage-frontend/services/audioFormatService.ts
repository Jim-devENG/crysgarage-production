/**
 * Audio Format Service
 * Handles all supported audio formats, sample rates, and MIME types
 */

export interface AudioFormat {
  name: string;
  extension: string;
  mimeType: string;
  codec: string;
  description: string;
  quality: 'lossy' | 'lossless';
  maxBitrate?: number;
  maxBitDepth?: number;
}

export interface SampleRate {
  value: number;
  label: string;
  description: string;
  quality: 'standard' | 'high' | 'premium';
}

export interface AudioFormatOptions {
  formats: AudioFormat[];
  sampleRates: SampleRate[];
  defaultFormat: string;
  defaultSampleRate: number;
}

class AudioFormatService {
  private static instance: AudioFormatService;
  private formatOptions: AudioFormatOptions | null = null;

  private constructor() {}

  public static getInstance(): AudioFormatService {
    if (!AudioFormatService.instance) {
      AudioFormatService.instance = new AudioFormatService();
    }
    return AudioFormatService.instance;
  }

  /**
   * Get all supported audio formats
   */
  public getSupportedFormats(): AudioFormat[] {
    return [
      {
        name: 'WAV',
        extension: '.wav',
        mimeType: 'audio/wav',
        codec: 'pcm_s16le',
        description: 'Uncompressed audio format',
        quality: 'lossless',
        maxBitDepth: 32
      },
      {
        name: 'MP3',
        extension: '.mp3',
        mimeType: 'audio/mpeg',
        codec: 'libmp3lame',
        description: 'Compressed audio format',
        quality: 'lossy',
        maxBitrate: 320
      },
      {
        name: 'FLAC',
        extension: '.flac',
        mimeType: 'audio/flac',
        codec: 'flac',
        description: 'Free Lossless Audio Codec',
        quality: 'lossless',
        maxBitDepth: 32
      },
      {
        name: 'AAC',
        extension: '.aac',
        mimeType: 'audio/aac',
        codec: 'aac',
        description: 'Advanced Audio Coding',
        quality: 'lossy',
        maxBitrate: 256
      },
      {
        name: 'OGG',
        extension: '.ogg',
        mimeType: 'audio/ogg',
        codec: 'libvorbis',
        description: 'Ogg Vorbis format',
        quality: 'lossy',
        maxBitrate: 320
      },
      {
        name: 'M4A',
        extension: '.m4a',
        mimeType: 'audio/mp4',
        codec: 'aac',
        description: 'MPEG-4 Audio',
        quality: 'lossy',
        maxBitrate: 256
      }
    ];
  }

  /**
   * Get all supported sample rates
   */
  public getSupportedSampleRates(): SampleRate[] {
    return [
      {
        value: 22050,
        label: '22.05 kHz',
        description: 'Standard quality',
        quality: 'standard'
      },
      {
        value: 44100,
        label: '44.1 kHz',
        description: 'CD quality',
        quality: 'standard'
      },
      {
        value: 48000,
        label: '48 kHz',
        description: 'Professional audio',
        quality: 'high'
      },
      {
        value: 96000,
        label: '96 kHz',
        description: 'High-resolution audio',
        quality: 'premium'
      }
    ];
  }

  /**
   * Get format options from backend
   */
  public async getFormatOptions(): Promise<AudioFormatOptions> {
    if (this.formatOptions) {
      return this.formatOptions;
    }

    try {
      // Try to get from backend first
      const response = await fetch('/supported-formats');
      if (response.ok) {
        const data = await response.json();
        this.formatOptions = {
          formats: this.getSupportedFormats(),
          sampleRates: this.getSupportedSampleRates(),
          defaultFormat: 'MP3',
          defaultSampleRate: 44100
        };
        return this.formatOptions;
      }
    } catch (error) {
      console.warn('Failed to fetch format options from backend, using defaults');
    }

    // Fallback to default options
    this.formatOptions = {
      formats: this.getSupportedFormats(),
      sampleRates: this.getSupportedSampleRates(),
      defaultFormat: 'MP3',
      defaultSampleRate: 44100
    };

    return this.formatOptions;
  }

  /**
   * Get format by name
   */
  public getFormatByName(name: string): AudioFormat | null {
    const formats = this.getSupportedFormats();
    return formats.find(format => format.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get sample rate by value
   */
  public getSampleRateByValue(value: number): SampleRate | null {
    const sampleRates = this.getSupportedSampleRates();
    return sampleRates.find(rate => rate.value === value) || null;
  }

  /**
   * Get MIME type for format
   */
  public getMimeType(formatName: string): string {
    const format = this.getFormatByName(formatName);
    return format?.mimeType || 'application/octet-stream';
  }

  /**
   * Get file extension for format
   */
  public getFileExtension(formatName: string): string {
    const format = this.getFormatByName(formatName);
    return format?.extension || '.mp3';
  }

  /**
   * Validate format and sample rate combination
   */
  public validateFormatCombination(formatName: string, sampleRate: number): boolean {
    const format = this.getFormatByName(formatName);
    const rate = this.getSampleRateByValue(sampleRate);

    if (!format || !rate) {
      return false;
    }

    // All combinations are valid for our supported formats
    return true;
  }

  /**
   * Get recommended bitrate for format
   */
  public getRecommendedBitrate(formatName: string): number {
    const format = this.getFormatByName(formatName);
    if (!format) return 320;

    switch (format.name) {
      case 'MP3':
        return 320;
      case 'AAC':
      case 'M4A':
        return 256;
      case 'OGG':
        return 320;
      default:
        return 320;
    }
  }

  /**
   * Get recommended bit depth for format
   */
  public getRecommendedBitDepth(formatName: string): number {
    const format = this.getFormatByName(formatName);
    if (!format) return 16;

    switch (format.name) {
      case 'WAV':
        return 24;
      case 'FLAC':
        return 24;
      default:
        return 16;
    }
  }

  /**
   * Format file size for display
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get quality description for format and sample rate
   */
  public getQualityDescription(formatName: string, sampleRate: number): string {
    const format = this.getFormatByName(formatName);
    const rate = this.getSampleRateByValue(sampleRate);

    if (!format || !rate) return 'Unknown quality';

    const qualityParts = [];
    
    if (format.quality === 'lossless') {
      qualityParts.push('Lossless');
    } else {
      qualityParts.push('Lossy');
    }

    if (rate.quality === 'premium') {
      qualityParts.push('High-Resolution');
    } else if (rate.quality === 'high') {
      qualityParts.push('Professional');
    } else {
      qualityParts.push('Standard');
    }

    return qualityParts.join(' ');
  }
}

export default AudioFormatService;
