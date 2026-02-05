import React, { useState, useEffect } from 'react';
import Status from './Status';
import Controls from './Controls';
import Stats from './Stats';
import { ExtensionState, UserStats } from '../shared/types';

const Popup: React.FC = () => {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_EXTENSION_STATE' });
      if (response?.state) {
        setState(response.state);
      } else {
        setError('Failed to load extension state');
      }
    } catch (err) {
      setError('Could not connect to extension');
      console.error('Error loading state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SET_EXTENSION_ENABLED',
        enabled
      });
      setState(prev => prev ? { ...prev, enabled } : null);
    } catch (err) {
      console.error('Error toggling extension:', err);
    }
  };

  const handleSync = async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
      // Reload state after sync
      await loadState();
    } catch (err) {
      console.error('Error syncing:', err);
    }
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
          <button className="btn btn-primary" onClick={loadState}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="popup-container">
        <div className="error-container">
          <p className="error-text">Extension not initialized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>🛡️ Browser Threat Simulator</h1>
        <p className="subtitle">Security Awareness Training</p>
        <Status enabled={state.enabled} />
      </header>

      <main className="popup-content">
        <Stats stats={state.userStats} />
        
        <Controls 
          enabled={state.enabled}
          onToggle={handleToggle}
          onSync={handleSync}
          lastSync={state.lastSync}
        />

        <div className="info-section">
          <p>
            <strong>Training Mode:</strong> Simulated phishing attempts will appear 
            during your normal browsing to help you recognize real threats.
          </p>
        </div>
      </main>

      <footer className="popup-footer">
        <a href="#" onClick={(e) => {
          e.preventDefault();
          chrome.tabs.create({ url: 'http://localhost:3000' });
        }}>
          Open CISO Dashboard →
        </a>
      </footer>
    </div>
  );
};

export default Popup;
