import React from 'react';
import { DEV_MODE, disableDevMode, getDevModeInfo } from '../utils/secureDevMode';

/**
 * Dev Mode Badge Component
 * Shows a visual indicator when dev mode is active
 * Appears in bottom-right corner with controls
 */
export function DevModeBadge() {
  const [showDetails, setShowDetails] = React.useState(false);
  const devInfo = getDevModeInfo();

  if (!DEV_MODE) {
    return null;
  }

  const handleDisable = () => {
    if (confirm('Disable Dev Mode? This will reload the page.')) {
      disableDevMode();
    }
  };

  return (
    <>
      {/* Main Badge */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ff006e, #ff4500)',
          color: 'white',
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '10px 16px',
          borderRadius: '8px',
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(255, 0, 110, 0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 110, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 110, 0.4)';
        }}
      >
        <span style={{ fontSize: '16px' }}>🧪</span>
        <span>Dev Mode Active</span>
        <span style={{ 
          fontSize: '10px', 
          opacity: 0.8,
          marginLeft: '4px' 
        }}>
          {showDetails ? '▼' : '▲'}
        </span>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div
          style={{
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            background: 'rgba(20, 20, 30, 0.98)',
            color: 'white',
            fontSize: '12px',
            padding: '16px',
            borderRadius: '8px',
            zIndex: 9998,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            minWidth: '280px',
            maxWidth: '400px',
            border: '1px solid rgba(255, 0, 110, 0.3)',
          }}
        >
          <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ff006e' }}>
              🧪 Development Mode
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              Authentication & Payment Bypassed
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Status:</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✅ Enabled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Localhost:</span>
              <span>{devInfo.isLocalhost ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Env Dev:</span>
              <span>{devInfo.envDevMode ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Valid Key:</span>
              <span>{devInfo.hasValidKey ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255, 0, 110, 0.1)', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '11px',
            lineHeight: '1.4'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ff006e' }}>
              Features:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Unlimited credits</li>
              <li>All tiers unlocked</li>
              <li>No authentication required</li>
              <li>No payment required</li>
            </ul>
          </div>

          <button
            onClick={handleDisable}
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔒 Disable Dev Mode
          </button>

          <div style={{ 
            marginTop: '10px', 
            fontSize: '10px', 
            opacity: 0.6,
            textAlign: 'center'
          }}>
            Click badge to collapse
          </div>
        </div>
      )}
    </>
  );
}

