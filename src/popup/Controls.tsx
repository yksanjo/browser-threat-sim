import React, { useState } from 'react';

interface ControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onSync: () => void;
  lastSync: number;
}

const Controls: React.FC<ControlsProps> = ({ enabled, onToggle, onSync, lastSync }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  const formatLastSync = (timestamp: number): string => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="controls-section">
      <h3>Controls</h3>
      
      <div className="toggle-container">
        <span className="toggle-label">Enable Simulations</span>
        <div 
          className={`toggle-switch ${enabled ? 'active' : ''}`}
          onClick={() => onToggle(!enabled)}
          role="switch"
          aria-checked={enabled}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onToggle(!enabled);
            }
          }}
        >
        </div>
      </div>

      <button 
        className="btn btn-secondary"
        onClick={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <span className="spinner-small"></span>
            Syncing...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Sync with Dashboard
          </>
        )}
      </button>
      
      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
        Last sync: {formatLastSync(lastSync)}
      </p>
    </div>
  );
};

export default Controls;
