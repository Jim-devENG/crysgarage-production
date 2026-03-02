import React, { useState, useEffect } from 'react';

interface DeploymentStatus {
  status: string;
  timestamp: string;
  version: string;
  git: {
    sha: string;
    branch: string;
  };
  mvp: {
    is_mvp: boolean;
    stage: string;
    message: string;
  };
  deployment: {
    instance: string;
    port: number;
    deployment_type: string;
    zero_downtime: boolean;
  };
  components: {
    backend: {
      status: string;
      instance: string;
      port: number;
      version: string;
    };
  };
  system: {
    zero_downtime: boolean;
    blue_green_active: boolean;
    health: string;
  };
}

export const DevDeploymentIndicator: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Secret key combination: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
      // Also allow Escape to hide
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Fetch deployment status when visible
  useEffect(() => {
    if (isVisible) {
      fetchDeploymentStatus();
      // Refresh every 30 seconds when visible
      const interval = setInterval(fetchDeploymentStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const fetchDeploymentStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://crysgarage.studio/api/deployment/status', {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // Check if response is actually JSON (not HTML)
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // If we got HTML instead of JSON, Nginx routing isn't configured
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        setError('API routing not configured. Endpoint returns HTML instead of JSON.');
        console.warn('Deployment status endpoint returned HTML. Nginx may need configuration update.');
        return;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        setError(`Invalid JSON response: ${text.substring(0, 100)}...`);
        console.error('Failed to parse JSON:', parseErr, 'Response:', text.substring(0, 200));
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Failed to fetch deployment status'}`);
      }
      
      setStatus(data);
    } catch (err) {
      // Network errors, CORS, etc.
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Cannot connect to deployment API: ${errorMessage}`);
      console.error('Failed to fetch deployment status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  const instanceColor = status?.deployment.instance === 'blue' 
    ? 'bg-blue-600' 
    : status?.deployment.instance === 'green' 
    ? 'bg-green-600' 
    : 'bg-gray-600';

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-crys-graphite/95 backdrop-blur-sm border border-crys-gold/30 rounded-lg shadow-2xl p-4 max-w-sm text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${instanceColor} animate-pulse`}></div>
          <span className="text-crys-gold font-semibold">DEV STATUS</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-crys-white/50 hover:text-crys-white transition-colors"
          title="Hide (Esc)"
        >
          ✕
        </button>
      </div>

      {loading && !status && (
        <div className="text-crys-white/70 py-2">Loading...</div>
      )}

      {error && (
        <div className="text-red-400 py-2">Error: {error}</div>
      )}

      {status && (
        <div className="space-y-2 text-crys-white/90">
          {/* MVP Badge */}
          {status.mvp.is_mvp && (
            <div className="bg-crys-gold/20 border border-crys-gold/50 rounded px-2 py-1 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-crys-gold">●</span>
                <span className="text-crys-gold font-semibold">{status.mvp.stage}</span>
              </div>
              <div className="text-crys-white/70 text-[10px] mt-1">
                {status.mvp.message}
              </div>
            </div>
          )}

          {/* Instance Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-crys-white/50 text-[10px]">Instance</div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${instanceColor}`}></div>
                <span className="font-semibold uppercase">{status.deployment.instance || 'unknown'}</span>
              </div>
            </div>
            <div>
              <div className="text-crys-white/50 text-[10px]">Port</div>
              <div className="font-semibold">{status.deployment.port || 'N/A'}</div>
            </div>
          </div>

          {/* Version Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-crys-white/50 text-[10px]">Version</div>
              <div className="font-semibold">{status.version}</div>
            </div>
            <div>
              <div className="text-crys-white/50 text-[10px]">Git SHA</div>
              <div className="font-mono text-[10px]">{status.git.sha || 'N/A'}</div>
            </div>
          </div>

          {/* System Status */}
          <div className="pt-2 border-t border-crys-white/10">
            <div className="flex items-center justify-between">
              <span className="text-crys-white/50 text-[10px]">Zero-Downtime</span>
              <span className={`text-xs ${status.system.zero_downtime ? 'text-green-400' : 'text-red-400'}`}>
                {status.system.zero_downtime ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-crys-white/50 text-[10px]">Health</span>
              <span className={`text-xs ${status.system.health === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>
                {status.system.health}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-crys-white/40 text-[9px] pt-1 border-t border-crys-white/10">
            Updated: {new Date(status.timestamp).toLocaleTimeString()}
          </div>

          {/* Hint */}
          <div className="text-crys-white/30 text-[9px] pt-1 italic">
            Press Ctrl+Shift+D to toggle
          </div>
        </div>
      )}
    </div>
  );
};

