import { useState } from 'react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { 
  Volume2, 
  SlidersHorizontal, 
  Settings, 
  Zap, 
  Music, 
  Download,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface SignalFlowProps {
  isProcessing?: boolean;
  fileName?: string;
}

export function SignalFlow({ isProcessing = false, fileName }: SignalFlowProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const modules = [
    {
      id: "input",
      name: "Input",
      icon: <Volume2 className="w-5 h-5" />,
      description: "Raw audio signal",
      active: true
    },
    {
      id: "analyzer",
      name: "Crys Garage Engine",
      icon: <Zap className="w-5 h-5" />,
      description: "AI analysis & processing",
      active: isProcessing
    },
    {
      id: "eq",
      name: "EQ",
      icon: <SlidersHorizontal className="w-5 h-5" />,
      description: "Frequency correction",
      active: isProcessing
    },
    {
      id: "dynamics",
      name: "Dynamics",
      icon: <Settings className="w-5 h-5" />,
      description: "Compression & limiting",
      active: isProcessing
    },
    {
      id: "harmonics",
      name: "Harmonics",
      icon: <Music className="w-5 h-5" />,
      description: "Warmth & character",
      active: isProcessing
    },
    {
      id: "output",
      name: "Output",
      icon: <Download className="w-5 h-5" />,
      description: "Mastered audio",
      active: isProcessing
    }
  ];

  return (
    <Card className="bg-audio-panel-bg border-audio-panel-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-crys-white text-lg">Master Flow Console</h3>
            <p className="text-crys-light-grey text-sm">
              {fileName ? `Processing: ${fileName}` : "Signal chain visualization"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              disabled={!fileName}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Signal Flow Chain */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-crys-graphite"></div>
          {isProcessing && (
            <div className="absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-crys-gold to-transparent flow-signal"></div>
          )}
          
          {/* Modules */}
          <div className="grid grid-cols-6 gap-4 relative z-10">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`
                  text-center cursor-pointer transition-all duration-200
                  ${activeModule === module.id ? 'transform scale-105' : ''}
                `}
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
              >
                {/* Module Icon */}
                <div 
                  className={`
                    w-16 h-16 rounded-lg border-2 flex items-center justify-center mx-auto mb-2 transition-all duration-200
                    ${module.active 
                      ? 'border-crys-gold bg-crys-gold/20 text-crys-gold pulse-gold' 
                      : 'border-crys-graphite bg-crys-graphite/20 text-audio-inactive'
                    }
                    ${activeModule === module.id ? 'shadow-lg shadow-crys-gold/30' : ''}
                  `}
                >
                  {module.icon}
                </div>
                
                {/* Module Info */}
                <h4 className="text-crys-white text-sm font-medium">{module.name}</h4>
                <p className="text-crys-light-grey text-xs mt-1">{module.description}</p>
                
                {/* Active Indicator */}
                {module.active && (
                  <Badge 
                    variant="secondary" 
                    className="mt-2 bg-crys-gold/20 text-crys-gold text-xs"
                  >
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module Details */}
        {activeModule && (
          <div className="mt-6 p-4 bg-crys-graphite/30 rounded-lg border border-crys-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 text-crys-gold">
                {modules.find(m => m.id === activeModule)?.icon}
              </div>
              <h4 className="text-crys-white">
                {modules.find(m => m.id === activeModule)?.name}
              </h4>
            </div>
            <p className="text-crys-light-grey text-sm mb-3">
              {getModuleDetails(activeModule)}
            </p>
            
            {/* Module-specific controls would go here */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                Bypass
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10"
              >
                Settings
              </Button>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mt-6 p-3 bg-crys-gold/10 border border-crys-gold/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-crys-gold rounded-full pulse-gold"></div>
              <span className="text-crys-gold text-sm">Processing audio through Crys Garage Engine...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getModuleDetails(moduleId: string): string {
  const details: Record<string, string> = {
    input: "Raw audio signal analysis and gain staging. Ensures optimal levels for processing.",
    analyzer: "Advanced analysis using the Crys Garage Engine. Detects genre, key, tempo, and audio characteristics.",
    eq: "Intelligent frequency correction and enhancement. Adjusts bass, mids, and treble for optimal tonal balance.",
    dynamics: "Compression and limiting for consistent levels and punch. Enhances rhythm and presence.",
    harmonics: "Adds warmth and character through harmonic enhancement. Brings analog-style depth to digital audio.",
    output: "Final mastered audio with industry-standard loudness levels. Ready for streaming and distribution."
  };
  
  return details[moduleId] || "Module processing information.";
}