import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Database, 
  Users, 
  Music, 
  CreditCard,
  Settings,
  AlertCircle,
  Wifi,
  WifiOff,
  Code,
  Link
} from "lucide-react";

interface APIEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  status: 'ready' | 'not-implemented' | 'mock-data' | 'needs-backend';
  description: string;
  mappedComponent: string;
  implementationStatus: string;
  currentState: string;
}

interface APIIntegrationLayerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function APIIntegrationLayer({ isVisible, onClose }: APIIntegrationLayerProps) {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
    {
      id: 'auth',
      name: 'User Authentication',
      endpoint: '/users/self',
      method: 'GET',
      status: 'ready',
      description: 'Handle user login/register and session management',
      mappedComponent: 'AuthModal, Header',
      implementationStatus: 'Frontend ready, needs backend API',
      currentState: 'Using demo/mock authentication'
    },
    {
      id: 'upload',
      name: 'Audio Upload',
      endpoint: '/audios',
      method: 'POST',
      status: 'ready',
      description: 'Upload audio files for mastering processing',
      mappedComponent: 'UploadInterface, Dashboards',
      implementationStatus: 'UI complete, needs file upload backend',
      currentState: 'File selection works, upload simulation only'
    },
    {
      id: 'mastering',
      name: 'Start Mastering',
      endpoint: '/masterings',
      method: 'POST',
      status: 'ready',
      description: 'Initiate Crys Garage Engine mastering process with genre and settings',
      mappedComponent: 'ProcessingConfig, MasteringControls',
      implementationStatus: 'Frontend ready, needs mastering engine API',
      currentState: 'Config collection works, processing is simulated'
    },
    {
      id: 'mastering-status',
      name: 'Mastering Status',
      endpoint: '/masterings/:id',
      method: 'GET',
      status: 'ready',
      description: 'Poll for real-time mastering progress updates',
      mappedComponent: 'SignalFlow, MasteringResults',
      implementationStatus: 'Progress UI ready, needs real-time polling',
      currentState: 'Simulated progress with setTimeout'
    },
    {
      id: 'download',
      name: 'Audio Download',
      endpoint: '/audios/download_by_token',
      method: 'GET',
      status: 'ready',
      description: 'Download mastered audio in various formats',
      mappedComponent: 'MasteringResults',
      implementationStatus: 'Download UI ready, needs file serving backend',
      currentState: 'Download buttons functional, no actual files'
    },
    {
      id: 'plans',
      name: 'Studio Plans',
endpoint: '/plans',
method: 'GET',
status: 'mock-data',
description: 'Retrieve available subscription tiers and studio access',
mappedComponent: 'PricingPage, PricingTiers',
      implementationStatus: 'Static pricing data, can be connected easily',
      currentState: 'Hardcoded tier data in components'
    },
    {
      id: 'payments',
      name: 'Payment Processing',
      endpoint: '/payments',
      method: 'POST',
      status: 'needs-backend',
      description: 'Handle Paystack/Stripe payment integration',
      mappedComponent: 'BillingModal, AddonsMarketplace',
      implementationStatus: 'Payment UI ready, needs payment processor integration',
      currentState: 'Payment flows designed, no actual processing'
    },
    {
      id: 'user-credits',
      name: 'Credits Management',
      endpoint: '/users/credits',
      method: 'GET',
      status: 'mock-data',
      description: 'Track user credits and subscription status',
      mappedComponent: 'Header, UserProfile, Dashboards',
      implementationStatus: 'Credit display ready, needs real credit tracking',
      currentState: 'Local state management with demo numbers'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-blue-500/20 text-blue-400';
      case 'mock-data': return 'bg-yellow-500/20 text-yellow-400';
      case 'needs-backend': return 'bg-orange-500/20 text-orange-400';
      case 'not-implemented': return 'bg-red-500/20 text-red-400';
      default: return 'bg-crys-gold/20 text-crys-gold';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Code className="w-4 h-4" />;
      case 'mock-data': return <Clock className="w-4 h-4" />;
      case 'needs-backend': return <Link className="w-4 h-4" />;
      case 'not-implemented': return <XCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Frontend Ready';
      case 'mock-data': return 'Mock Data';
      case 'needs-backend': return 'Needs Backend';
      case 'not-implemented': return 'Not Implemented';
      default: return status;
    }
  };

  const readyCount = endpoints.filter(e => e.status === 'ready').length;
  const mockCount = endpoints.filter(e => e.status === 'mock-data').length;
  const needsBackendCount = endpoints.filter(e => e.status === 'needs-backend').length;
  const frontendProgress = ((readyCount + mockCount) / endpoints.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-audio-panel-bg border-audio-panel-border max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-crys-white flex items-center gap-2">
                <Database className="w-5 h-5 text-crys-gold" />
                Frontend-Backend Integration Status
              </CardTitle>
              <p className="text-crys-light-grey text-sm mt-1">
                Current implementation status of API integration points in Crysgarage Studio
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-crys-graphite text-crys-light-grey hover:text-crys-white"
            >
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Implementation Status */}
          <Card className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-blue-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-crys-white text-lg font-semibold">Frontend Implementation Status</h3>
                  <p className="text-crys-light-grey text-sm">Components ready for backend API integration</p>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">{frontendProgress.toFixed(0)}% Ready</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{readyCount}</div>
                  <div className="text-crys-light-grey text-sm">Frontend Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">{mockCount}</div>
                  <div className="text-crys-light-grey text-sm">Mock Data</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-1">{needsBackendCount}</div>
                  <div className="text-crys-light-grey text-sm">Needs Backend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-crys-gold mb-1">{endpoints.length}</div>
                  <div className="text-crys-light-grey text-sm">Total Endpoints</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress value={frontendProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Implementation Status Legend */}
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Code className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-blue-400 font-medium">Frontend Ready</div>
                <div className="text-crys-light-grey text-xs">UI complete, awaiting backend</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-yellow-400 font-medium">Mock Data</div>
                <div className="text-crys-light-grey text-xs">Using static/demo data</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <Link className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-orange-400 font-medium">Needs Backend</div>
                <div className="text-crys-light-grey text-xs">Requires API implementation</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <XCircle className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-red-400 font-medium">Not Implemented</div>
                <div className="text-crys-light-grey text-xs">Still in development</div>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h3 className="text-crys-white text-lg font-semibold mb-4">API Integration Points</h3>
            <div className="grid gap-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="bg-crys-graphite/30 border-crys-graphite">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(endpoint.status)}
                            <h4 className="text-crys-white font-medium">{endpoint.name}</h4>
                          </div>
                          <Badge className={getStatusColor(endpoint.status)}>
                            {getStatusLabel(endpoint.status)}
                          </Badge>
                          <Badge variant="secondary" className="bg-crys-gold/20 text-crys-gold text-xs">
                            {endpoint.method}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-crys-light-grey">Endpoint:</span>
                            <code className="text-crys-gold bg-crys-black/30 px-2 py-1 rounded text-xs mono-font">
                              {endpoint.endpoint}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-crys-light-grey">Components:</span>
                            <span className="text-crys-white">{endpoint.mappedComponent}</span>
                          </div>
                          <p className="text-crys-light-grey">{endpoint.description}</p>
                          <div className="mt-2 p-2 bg-crys-black/30 rounded">
                            <div className="text-xs text-crys-gold mb-1">Implementation Status:</div>
                            <div className="text-xs text-crys-light-grey">{endpoint.implementationStatus}</div>
                            <div className="text-xs text-crys-gold mt-1">Current State:</div>
                            <div className="text-xs text-crys-light-grey">{endpoint.currentState}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <Card className="bg-crys-gold/5 border-crys-gold/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-crys-white font-medium mb-2">🚀 Next Steps for Backend Integration</h4>
                  <div className="space-y-2 text-sm text-crys-light-grey">
                    <div>• Set up Laravel backend with SOX audio engine</div>
                    <div>• Implement user authentication and session management</div>
                    <div>• Create file upload endpoints with audio processing pipeline</div>
                    <div>• Integrate Paystack/Stripe for payment processing</div>
                    <div>• Add real-time WebSocket connections for mastering progress</div>
                    <div>• Replace mock data with actual database queries</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-crys-gold/30 text-crys-gold hover:bg-crys-gold/10">
                    Backend Specs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}