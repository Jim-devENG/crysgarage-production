import { useState } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Settings, Zap, Volume2, Sliders, Lock, DollarSign } from "lucide-react";

interface ProcessingOption {
  id: string;
  label: string;
  description: string;
  price: number;
  enabled: boolean;
  available: boolean;
}

interface ProcessingConfigProps {
  selectedTier: string;
  fileName?: string;
  onConfigChange: (config: ProcessingConfiguration) => void;
  onNext?: () => void;
}

export interface ProcessingConfiguration {
  sampleRate: string;
  resolution: string;
  noiseReduction: boolean;
  tuningCorrection: boolean;
  downloadFormat: string[];
  totalCost: number;
}

export function ProcessingConfig({ selectedTier, fileName, onConfigChange, onNext }: ProcessingConfigProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  
  // Configuration state
  const [sampleRate, setSampleRate] = useState<string>('44.1');
  const [resolution, setResolution] = useState<string>('16');
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [tuningCorrection, setTuningCorrection] = useState(false);
  const [downloadFormats, setDownloadFormats] = useState<string[]>(['wav']);

  // Define tier-specific options
  const getTierOptions = (tier: string) => {
    const options = {
      free: {
        sampleRates: [
          { value: '44.1', label: '44.1kHz', price: 0, available: true },
          { value: '48', label: '48kHz', price: 5, available: false }
        ],
        resolutions: [
          { value: '16', label: '16-bit', price: 0, available: true },
          { value: '24', label: '24-bit', price: 1, available: false },
          { value: '32', label: '32-bit', price: 1, available: false }
        ],
        formats: ['mp3', 'wav'],
        noiseReduction: { price: 2, available: false },
        tuningCorrection: { price: 2, available: false },
        maxFileSize: '60MB'
      },
      professional: {
        sampleRates: [
          { value: '44.1', label: '44.1kHz', price: 0, available: true },
          { value: '48', label: '48kHz', price: 0, available: true },
          { value: '192', label: '192kHz', price: 5, available: false }
        ],
        resolutions: [
          { value: '16', label: '16-bit', price: 0, available: true },
          { value: '24', label: '24-bit', price: 1, available: false },
          { value: '32', label: '32-bit', price: 1, available: false }
        ],
        formats: ['mp3', 'wav', 'flac'],
        noiseReduction: { price: 0, available: true },
        tuningCorrection: { price: 0, available: true },
        maxFileSize: '100MB'
      },
      advanced: {
        sampleRates: [
          { value: '44.1', label: '44.1kHz', price: 0, available: true },
          { value: '48', label: '48kHz', price: 0, available: true },
          { value: '192', label: '192kHz', price: 0, available: true }
        ],
        resolutions: [
          { value: '16', label: '16-bit', price: 0, available: true },
          { value: '24', label: '24-bit', price: 0, available: true },
          { value: '32', label: '32-bit', price: 0, available: true }
        ],
        formats: ['mp3', 'wav', 'flac', 'aiff'],
        noiseReduction: { price: 0, available: true },
        tuningCorrection: { price: 0, available: true },
        maxFileSize: 'Unlimited'
      }
    };
    
    return options[tier as keyof typeof options] || options.free;
  };

  const tierOptions = getTierOptions(selectedTier);

  const calculateTotalCost = () => {
    let cost = 0;
    
    // Sample rate cost
    const sampleRateOption = tierOptions.sampleRates.find(sr => sr.value === sampleRate);
    if (sampleRateOption && !sampleRateOption.available) cost += sampleRateOption.price;
    
    // Resolution cost
    const resolutionOption = tierOptions.resolutions.find(res => res.value === resolution);
    if (resolutionOption && !resolutionOption.available) cost += resolutionOption.price;
    
    // Noise reduction cost
    if (noiseReduction && !tierOptions.noiseReduction.available) {
      cost += tierOptions.noiseReduction.price;
    }
    
    // Tuning correction cost
    if (tuningCorrection && !tierOptions.tuningCorrection.available) {
      cost += tierOptions.tuningCorrection.price;
    }
    
    return cost;
  };

  const handleOptionChange = (optionType: string, value: any, requiresPayment: boolean, price: number) => {
    if (requiresPayment && price > 0) {
      setPendingOption(`${optionType}-${value}`);
      setShowPayment(true);
      return;
    }
    
    applyOption(optionType, value);
  };

  const applyOption = (optionType: string, value: any) => {
    switch (optionType) {
      case 'sampleRate':
        setSampleRate(value);
        break;
      case 'resolution':
        setResolution(value);
        break;
      case 'noiseReduction':
        setNoiseReduction(value);
        break;
      case 'tuningCorrection':
        setTuningCorrection(value);
        break;
      case 'format':
        setDownloadFormats(prev => 
          prev.includes(value) 
            ? prev.filter(f => f !== value)
            : [...prev, value]
        );
        break;
    }
    
    updateConfig();
  };

  const updateConfig = () => {
    const config: ProcessingConfiguration = {
      sampleRate: sampleRate + 'kHz',
      resolution: resolution + '-bit',
      noiseReduction,
      tuningCorrection,
      downloadFormat: downloadFormats,
      totalCost: calculateTotalCost()
    };
    
    onConfigChange(config);
  };

  const handlePayment = () => {
    if (pendingOption) {
      const [optionType, value] = pendingOption.split('-');
      applyOption(optionType, value);
      setShowPayment(false);
      setPendingOption(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-crys-white text-xl mb-2">Processing Configuration</h3>
        <p className="text-crys-light-grey text-sm">
          Configure your mastering settings for optimal results
        </p>
        {fileName && (
          <Badge variant="secondary" className="mt-2 bg-crys-gold/20 text-crys-gold">
            File: {fileName}
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Audio Quality Settings */}
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-crys-gold" />
              <h4 className="text-crys-white">Audio Quality</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample Rate */}
            <div>
              <label className="text-crys-white text-sm font-medium mb-2 block">Sample Rate</label>
              <Select value={sampleRate} onValueChange={(value) => {
                const option = tierOptions.sampleRates.find(sr => sr.value === value);
                handleOptionChange('sampleRate', value, !option?.available, option?.price || 0);
              }}>
                <SelectTrigger className="bg-crys-graphite border-crys-gold/30 text-crys-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-audio-panel-bg border-audio-panel-border">
                  {tierOptions.sampleRates.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-crys-white hover:bg-crys-gold/10"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {!option.available && option.price > 0 && (
                          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs ml-2">
                            +${option.price}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-crys-white text-sm font-medium mb-2 block">Bit Depth</label>
              <Select value={resolution} onValueChange={(value) => {
                const option = tierOptions.resolutions.find(res => res.value === value);
                handleOptionChange('resolution', value, !option?.available, option?.price || 0);
              }}>
                <SelectTrigger className="bg-crys-graphite border-crys-gold/30 text-crys-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-audio-panel-bg border-audio-panel-border">
                  {tierOptions.resolutions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-crys-white hover:bg-crys-gold/10"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {!option.available && option.price > 0 && (
                          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs ml-2">
                            +${option.price}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Processing Options */}
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-crys-gold" />
              <h4 className="text-crys-white">Processing Options</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Noise Reduction */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-crys-white text-sm font-medium">Noise Reduction</label>
                <p className="text-crys-light-grey text-xs">Remove background noise and artifacts</p>
              </div>
              <div className="flex items-center gap-2">
                {!tierOptions.noiseReduction.available && tierOptions.noiseReduction.price > 0 && (
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                    +${tierOptions.noiseReduction.price}
                  </Badge>
                )}
                <Switch
                  checked={noiseReduction}
                  onCheckedChange={(checked) => 
                    handleOptionChange('noiseReduction', checked, !tierOptions.noiseReduction.available, tierOptions.noiseReduction.price)
                  }
                />
              </div>
            </div>

            {/* Tuning Correction */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-crys-white text-sm font-medium">444Hz Tuning</label>
                <p className="text-crys-light-grey text-xs">Natural tuning frequency correction</p>
              </div>
              <div className="flex items-center gap-2">
                {!tierOptions.tuningCorrection.available && tierOptions.tuningCorrection.price > 0 && (
                  <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                    +${tierOptions.tuningCorrection.price}
                  </Badge>
                )}
                <Switch
                  checked={tuningCorrection}
                  onCheckedChange={(checked) => 
                    handleOptionChange('tuningCorrection', checked, !tierOptions.tuningCorrection.available, tierOptions.tuningCorrection.price)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Formats */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-crys-gold" />
            <h4 className="text-crys-white">Download Formats</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tierOptions.formats.map((format) => (
              <Button
                key={format}
                variant={downloadFormats.includes(format) ? "default" : "outline"}
                size="sm"
                onClick={() => applyOption('format', format)}
                className={downloadFormats.includes(format) 
                  ? "bg-crys-gold hover:bg-crys-gold-muted text-crys-black"
                  : "border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
                }
              >
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      {calculateTotalCost() > 0 && (
        <Card className="bg-crys-gold/10 border-crys-gold/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-crys-white">Additional Costs</h4>
                <p className="text-crys-light-grey text-sm">Premium options selected</p>
              </div>
              <div className="text-right">
                <div className="text-crys-gold text-xl font-medium">+${calculateTotalCost()}</div>
                <div className="text-crys-light-grey text-xs">Total additional cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-audio-panel-bg border-audio-panel-border">
          <DialogHeader>
            <DialogTitle className="text-crys-white">Premium Feature Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-crys-graphite/30 rounded-lg">
              <p className="text-crys-white">This feature requires an additional payment to unlock.</p>
              <p className="text-crys-light-grey text-sm mt-1">
                Premium features enhance your mastering quality and provide more output options.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black flex-1"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Unlock Feature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Next Button */}
      {onNext && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}