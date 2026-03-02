import { useState } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { 
  Sliders, 
  Volume2, 
  Music2, 
  Zap, 
  RotateCcw, 
  Play, 
  Pause,
  Eye,
  EyeOff
} from "lucide-react";

interface MasteringControlsProps {
  isAdvancedTier?: boolean;
  onParameterChange?: (module: string, parameter: string, value: number) => void;
}

export function MasteringControls({ 
  isAdvancedTier = false, 
  onParameterChange 
}: MasteringControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEducation, setShowEducation] = useState(true);
  
  // EQ State
  const [eqBands, setEqBands] = useState({
    '32Hz': 0,
    '64Hz': 0,
    '125Hz': 0,
    '250Hz': 0,
    '500Hz': 0,
    '1kHz': 0,
    '2kHz': 0,
    '4kHz': 0,
    '8kHz': 0
  });
  
  // Compressor State
  const [compressor, setCompressor] = useState({
    threshold: -12,
    ratio: 3,
    attack: 10,
    release: 100,
    enabled: true
  });
  
  // Stereo State
  const [stereoWidth, setStereoWidth] = useState(0);
  const [bassBoost, setBassBoost] = useState(0);
  const [presenceBoost, setPresenceBoost] = useState(0);
  
  // Limiter State
  const [limiter, setLimiter] = useState({
    threshold: -1,
    ceiling: -0.3,
    release: 50,
    enabled: true
  });

  const updateEQ = (frequency: string, value: number[]) => {
    setEqBands(prev => ({ ...prev, [frequency]: value[0] }));
    onParameterChange?.('eq', frequency, value[0]);
  };

  const updateCompressor = (param: string, value: number[]) => {
    setCompressor(prev => ({ ...prev, [param]: value[0] }));
    onParameterChange?.('compressor', param, value[0]);
  };

  if (!isAdvancedTier) {
    return (
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-crys-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sliders className="w-8 h-8 text-crys-gold" />
          </div>
          <h3 className="text-crys-white text-xl mb-2">Manual Mastering Controls</h3>
          <p className="text-crys-light-grey mb-6">
            Upgrade to Advanced Manual tier to access real-time mastering controls, 
            8-band EQ, compression settings, and live preview.
          </p>
          <Button className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black">
            Upgrade to Advanced
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-crys-white text-lg">Real-Time Mastering Controls</h3>
              <p className="text-crys-light-grey text-sm">Professional manual mastering tools</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEducation(!showEducation)}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                {showEducation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Education Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                A/B Preview
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Graphic EQ */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-crys-gold" />
            <h4 className="text-crys-white">8-Band Graphic EQ</h4>
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-9 gap-3">
            {Object.entries(eqBands).map(([freq, value]) => (
              <div key={freq} className="text-center">
                <div className="h-32 flex flex-col-reverse items-center mb-2">
                  <Slider
                    value={[value]}
                    onValueChange={(val) => updateEQ(freq, val)}
                    min={-12}
                    max={12}
                    step={0.5}
                    orientation="vertical"
                    className="h-full"
                  />
                </div>
                <div className="mono-font text-xs text-crys-gold">{value > 0 ? '+' : ''}{value}dB</div>
                <div className="text-xs text-crys-light-grey">{freq}</div>
              </div>
            ))}
          </div>
          
          {showEducation && (
            <div className="p-3 bg-crys-gold/10 border border-crys-gold/30 rounded-lg">
              <p className="text-crys-gold text-sm">
                💡 <strong>EQ Tip:</strong> Boost frequencies that need presence, cut frequencies that sound muddy. 
                Small adjustments (±3dB) usually work best.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Compressor */}
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-crys-gold" />
              <h4 className="text-crys-white">Compressor</h4>
              <Switch 
                checked={compressor.enabled}
                onCheckedChange={(checked) => 
                  setCompressor(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-crys-white">Threshold</label>
                  <span className="mono-font text-crys-gold">{compressor.threshold}dB</span>
                </div>
                <Slider
                  value={[compressor.threshold]}
                  onValueChange={(val) => updateCompressor('threshold', val)}
                  min={-24}
                  max={0}
                  step={0.5}
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-crys-white">Ratio</label>
                  <span className="mono-font text-crys-gold">{compressor.ratio}:1</span>
                </div>
                <Slider
                  value={[compressor.ratio]}
                  onValueChange={(val) => updateCompressor('ratio', val)}
                  min={1}
                  max={20}
                  step={0.1}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-crys-white">Attack</label>
                    <span className="mono-font text-crys-gold text-xs">{compressor.attack}ms</span>
                  </div>
                  <Slider
                    value={[compressor.attack]}
                    onValueChange={(val) => updateCompressor('attack', val)}
                    min={0.1}
                    max={100}
                    step={0.1}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-crys-white">Release</label>
                    <span className="mono-font text-crys-gold text-xs">{compressor.release}ms</span>
                  </div>
                  <Slider
                    value={[compressor.release]}
                    onValueChange={(val) => updateCompressor('release', val)}
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>
            </div>
            
            {showEducation && (
              <div className="p-3 bg-crys-gold/10 border border-crys-gold/30 rounded-lg">
                <p className="text-crys-gold text-xs">
                  💡 Lower threshold = more compression. Higher ratio = more aggressive. 
                  Fast attack tames peaks, slow attack preserves punch.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stereo & Enhancement */}
        <Card className="bg-audio-panel-bg border-audio-panel-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5 text-crys-gold" />
              <h4 className="text-crys-white">Stereo & Enhancement</h4>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Stereo Width</label>
                <span className="mono-font text-crys-gold">{stereoWidth > 0 ? '+' : ''}{stereoWidth}%</span>
              </div>
              <Slider
                value={[stereoWidth]}
                onValueChange={(val) => setStereoWidth(val[0])}
                min={-50}
                max={50}
                step={1}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Bass Boost</label>
                <span className="mono-font text-crys-gold">{bassBoost > 0 ? '+' : ''}{bassBoost}dB</span>
              </div>
              <Slider
                value={[bassBoost]}
                onValueChange={(val) => setBassBoost(val[0])}
                min={-6}
                max={6}
                step={0.1}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Presence</label>
                <span className="mono-font text-crys-gold">{presenceBoost > 0 ? '+' : ''}{presenceBoost}dB</span>
              </div>
              <Slider
                value={[presenceBoost]}
                onValueChange={(val) => setPresenceBoost(val[0])}
                min={-6}
                max={6}
                step={0.1}
              />
            </div>
            
            {showEducation && (
              <div className="p-3 bg-crys-gold/10 border border-crys-gold/30 rounded-lg">
                <p className="text-crys-gold text-xs">
                  💡 Stereo width affects spaciousness. Bass boost enhances low-end. 
                  Presence adds clarity and sparkle to vocals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Limiter */}
      <Card className="bg-audio-panel-bg border-audio-panel-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-crys-gold" />
            <h4 className="text-crys-white">Limiter</h4>
            <Switch 
              checked={limiter.enabled}
              onCheckedChange={(checked) => 
                setLimiter(prev => ({ ...prev, enabled: checked }))
              }
            />
            <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs ml-auto">
              -14 LUFS Target
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Threshold</label>
                <span className="mono-font text-crys-gold">{limiter.threshold}dB</span>
              </div>
              <Slider
                value={[limiter.threshold]}
                onValueChange={(val) => setLimiter(prev => ({ ...prev, threshold: val[0] }))}
                min={-20}
                max={0}
                step={0.1}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Ceiling</label>
                <span className="mono-font text-crys-gold">{limiter.ceiling}dB</span>
              </div>
              <Slider
                value={[limiter.ceiling]}
                onValueChange={(val) => setLimiter(prev => ({ ...prev, ceiling: val[0] }))}
                min={-1}
                max={0}
                step={0.1}
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-crys-white">Release</label>
                <span className="mono-font text-crys-gold text-xs">{limiter.release}ms</span>
              </div>
              <Slider
                value={[limiter.release]}
                onValueChange={(val) => setLimiter(prev => ({ ...prev, release: val[0] }))}
                min={10}
                max={1000}
                step={10}
              />
            </div>
          </div>
          
          {showEducation && (
            <div className="p-3 bg-crys-gold/10 border border-crys-gold/30 rounded-lg mt-4">
              <p className="text-crys-gold text-sm">
                💡 <strong>Limiter Controls:</strong> Threshold sets maximum level, ceiling prevents digital clipping, 
                release time affects transparency. Aim for -14 LUFS for streaming platforms.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Actions */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
        <Button className="bg-crys-gold hover:bg-crys-gold-muted text-crys-black px-8">
          Apply Mastering
        </Button>
      </div>
    </div>
  );
}