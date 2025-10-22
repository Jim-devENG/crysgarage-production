import React, { useState, useEffect } from 'react';
import AudioFormatService, { AudioFormat, SampleRate } from '../services/audioFormatService';

interface AudioFormatSelectorProps {
  selectedFormat: string;
  selectedSampleRate: number;
  onFormatChange: (format: string) => void;
  onSampleRateChange: (sampleRate: number) => void;
  tier?: 'free' | 'professional' | 'advanced';
  className?: string;
}

const AudioFormatSelector: React.FC<AudioFormatSelectorProps> = ({
  selectedFormat,
  selectedSampleRate,
  onFormatChange,
  onSampleRateChange,
  tier = 'free',
  className = ''
}) => {
  const [formats, setFormats] = useState<AudioFormat[]>([]);
  const [sampleRates, setSampleRates] = useState<SampleRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormatOptions = async () => {
      try {
        const formatService = AudioFormatService.getInstance();
        const options = await formatService.getFormatOptions();
        
        // Filter formats based on tier
        let availableFormats = options.formats;
        if (tier === 'free') {
          availableFormats = options.formats.filter(format => 
            ['MP3', 'WAV'].includes(format.name)
          );
        } else if (tier === 'professional') {
          availableFormats = options.formats.filter(format => 
            ['MP3', 'WAV', 'FLAC'].includes(format.name)
          );
        }
        // Advanced tier gets all formats
        
        setFormats(availableFormats);
        setSampleRates(options.sampleRates);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load format options:', error);
        setIsLoading(false);
      }
    };

    loadFormatOptions();
  }, [tier]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-crys-gold"></div>
        <span className="ml-2 text-crys-light-grey">Loading formats...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-crys-light-grey mb-2">
          Output Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((format) => (
            <button
              key={format.name}
              onClick={() => onFormatChange(format.name)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedFormat === format.name
                  ? 'border-crys-gold bg-crys-gold/10 text-crys-gold'
                  : 'border-crys-dark-grey bg-crys-dark-grey/50 text-crys-light-grey hover:border-crys-gold/50'
              }`}
            >
              <div className="text-left">
                <div className="font-medium">{format.name}</div>
                <div className="text-xs opacity-75">{format.description}</div>
                <div className="text-xs opacity-60">
                  {format.quality === 'lossless' ? 'Lossless' : 'Lossy'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sample Rate Selection */}
      <div>
        <label className="block text-sm font-medium text-crys-light-grey mb-2">
          Sample Rate
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sampleRates.map((rate) => (
            <button
              key={rate.value}
              onClick={() => onSampleRateChange(rate.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedSampleRate === rate.value
                  ? 'border-crys-gold bg-crys-gold/10 text-crys-gold'
                  : 'border-crys-dark-grey bg-crys-dark-grey/50 text-crys-light-grey hover:border-crys-gold/50'
              }`}
            >
              <div className="text-left">
                <div className="font-medium">{rate.label}</div>
                <div className="text-xs opacity-75">{rate.description}</div>
                <div className="text-xs opacity-60 capitalize">{rate.quality}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Description */}
      <div className="p-3 bg-crys-dark-grey/30 rounded-lg">
        <div className="text-sm text-crys-light-grey">
          <span className="font-medium">Quality: </span>
          <span className="text-crys-gold">
            {AudioFormatService.getInstance().getQualityDescription(selectedFormat, selectedSampleRate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioFormatSelector;
