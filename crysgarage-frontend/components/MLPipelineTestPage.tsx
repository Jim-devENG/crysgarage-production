import React, { useState, useEffect } from 'react';
import MLPipelineUpload from './MLPipelineUpload';
import { mlPipelineService } from '../services/mlPipelineAPI';

const MLPipelineTestPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      // Check Laravel backend health instead of direct ML pipeline
      const response = await fetch('/api/health');
      const health = await response.json();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ status: 'error', message: 'Backend service not available' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessingComplete = (result: any) => {
    console.log('Processing completed:', result);
    // You can add additional logic here, like updating UI state
  };

  const handleError = (error: string) => {
    console.error('Processing error:', error);
    // You can add error handling logic here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crys-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crys-gold mx-auto mb-4"></div>
          <p className="text-crys-white">Checking ML Pipeline status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crys-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-crys-white mb-4">
            Crys Garage ML Pipeline
          </h1>
          <p className="text-lg text-crys-light-grey">
            Advanced AI-powered audio mastering with genre-specific recommendations
          </p>
        </div>

        {/* Health Status */}
        <div className="mb-8">
          <div className={`p-4 rounded-lg border ${
            healthStatus?.status === 'healthy' 
              ? 'bg-crys-charcoal border-crys-gold' 
              : 'bg-crys-charcoal border-red-500'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                healthStatus?.status === 'healthy' ? 'bg-crys-gold' : 'bg-red-500'
              }`}></div>
              <div>
                <div className={`font-medium ${
                  healthStatus?.status === 'healthy' ? 'text-crys-white' : 'text-red-400'
                }`}>
                  Backend Service Status: {healthStatus?.status || 'Unknown'}
                </div>
                {healthStatus?.service && (
                  <div className="text-sm text-crys-light-grey">
                    {healthStatus.service} v{healthStatus.version}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="text-crys-gold text-2xl mb-3">🎵</div>
            <h3 className="text-lg font-semibold text-crys-white mb-2">Genre-Specific Processing</h3>
            <p className="text-crys-light-grey text-sm">
              AI-powered recommendations tailored for Hip Hop, Afrobeats, Gospel, and more
            </p>
          </div>
          
          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="text-crys-gold text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-crys-white mb-2">Tier-Based Quality</h3>
            <p className="text-crys-light-grey text-sm">
              Free, Pro, and Advanced tiers with different processing speeds and output formats
            </p>
          </div>
          
          <div className="bg-crys-charcoal p-6 rounded-lg border border-crys-graphite">
            <div className="text-crys-gold text-2xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-crys-white mb-2">Real-Time Processing</h3>
            <p className="text-crys-light-grey text-sm">
              Fast processing with live progress updates and instant download links
            </p>
          </div>
        </div>

        {/* ML Pipeline Upload Component */}
        <MLPipelineUpload
          onProcessingComplete={handleProcessingComplete}
          onError={handleError}
        />

        {/* API Endpoints Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Health Check</div>
              <div className="text-gray-600 font-mono">GET /api/health.php</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Upload Audio</div>
              <div className="text-gray-600 font-mono">POST /api/upload-audio.php</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Process Audio</div>
              <div className="text-gray-600 font-mono">POST /api/process-audio.php</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Base URL</div>
              <div className="text-gray-600 font-mono">https://crysgarage.studio/ml-pipeline</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Select an audio file by dragging and dropping or clicking "Choose File"</li>
            <li>Choose your processing tier (Free, Pro, or Advanced)</li>
            <li>Select the genre of your audio for optimal ML recommendations</li>
            <li>Click "Start ML Processing" to begin the AI-powered mastering</li>
            <li>Download your processed audio in multiple formats</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MLPipelineTestPage;
