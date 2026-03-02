import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Music, 
  Volume2, 
  Sliders, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Download
} from "lucide-react";

interface ProcessingPageProps {
  progress: number;
  isProcessing: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface ProcessingStep {
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  completed: boolean;
}

export function ProcessingPage({ progress, isProcessing }: ProcessingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState<ProcessingStep[]>([
    {
      name: 'Noise Reduction',
      description: 'Removing background noise and artifacts',
      icon: <Volume2 className="w-4 h-4" />,
      progress: 0,
      completed: false
    },
    {
      name: 'EQ Adjustment',
      description: 'Applying genre-specific equalization',
      icon: <Sliders className="w-4 h-4" />,
      progress: 0,
      completed: false
    },
    {
      name: 'Compression',
      description: 'Dynamic range compression',
      icon: <Zap className="w-4 h-4" />,
      progress: 0,
      completed: false
    },
    {
      name: 'Stereo Enhancement',
      description: 'Widening stereo image',
      icon: <Music className="w-4 h-4" />,
      progress: 0,
      completed: false
    },
    {
      name: 'Limiting',
      description: 'Peak limiting and protection',
      icon: <Volume2 className="w-4 h-4" />,
      progress: 0,
      completed: false
    },
    {
      name: 'Loudness Normalization',
      description: 'LUFS normalization to target level',
      icon: <CheckCircle className="w-4 h-4" />,
      progress: 0,
      completed: false
    }
  ]);

  useEffect(() => {
    if (isProcessing) {
      // Update step progress based on overall progress
      const stepThresholds = [10, 25, 40, 55, 70, 85];
      
      const updatedSteps = stepProgress.map((step, index) => {
        const threshold = stepThresholds[index];
        const nextThreshold = stepThresholds[index + 1] || 100;
        
        if (progress >= threshold) {
          const stepProgress = Math.min(100, ((progress - threshold) / (nextThreshold - threshold)) * 100);
          return {
            ...step,
            progress: stepProgress,
            completed: progress >= nextThreshold
          };
        }
        return step;
      });
      
      setStepProgress(updatedSteps);
      
      // Update current step
      const activeStep = stepThresholds.findIndex(threshold => progress < threshold);
      setCurrentStep(activeStep === -1 ? stepProgress.length - 1 : activeStep);
    }
  }, [progress, isProcessing]);

  const getStepStatus = (step: ProcessingStep, index: number) => {
    if (step.completed) return 'completed';
    if (index === currentStep) return 'active';
    if (index < currentStep) return 'completed';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-crys-white text-3xl mb-2">Processing Your Audio</h2>
        <p className="text-crys-light-grey">
          Applying professional mastering with {stepProgress[currentStep]?.name.toLowerCase()}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-crys-white text-xl">Overall Progress</h3>
            <Badge variant="secondary">{progress}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-4" />
          <p className="text-crys-light-grey text-sm">
            {stepProgress[currentStep]?.description}
          </p>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <div className="grid gap-4">
        {stepProgress.map((step, index) => {
          const status = getStepStatus(step, index);
          
          return (
            <Card key={index} className={`transition-all duration-300 ${
              status === 'active' ? 'border-crys-gold bg-crys-dark-grey/20' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      status === 'active' ? 'bg-crys-gold/20 text-crys-gold' :
                      'bg-crys-dark-grey text-crys-light-grey'
                    }`}>
                      {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.icon}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${
                        status === 'completed' ? 'text-green-400' :
                        status === 'active' ? 'text-crys-gold' :
                        'text-crys-white'
                      }`}>
                        {step.name}
                      </h4>
                      <p className="text-crys-light-grey text-xs">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {status === 'active' && (
                      <div className="w-16">
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}
                    <Badge variant={
                      status === 'completed' ? 'default' :
                      status === 'active' ? 'secondary' :
                      'outline'
                    }>
                      {status === 'completed' ? 'Done' :
                       status === 'active' ? `${step.progress}%` :
                       'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Processing Info */}
      <Card className="mt-8">
        <CardHeader>
          <h3 className="text-crys-white text-lg">Processing Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-crys-light-grey">Current Step:</span>
              <p className="text-crys-white">{stepProgress[currentStep]?.name}</p>
            </div>
            <div>
              <span className="text-crys-light-grey">Progress:</span>
              <p className="text-crys-white">{progress}%</p>
            </div>
            <div>
              <span className="text-crys-light-grey">Steps Completed:</span>
              <p className="text-crys-white">{stepProgress.filter(s => s.completed).length} / {stepProgress.length}</p>
            </div>
            <div>
              <span className="text-crys-light-grey">Estimated Time:</span>
              <p className="text-crys-white">~{Math.max(1, Math.ceil((100 - progress) / 10))} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 