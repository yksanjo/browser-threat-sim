import React from 'react';

interface StatusProps {
  enabled: boolean;
}

const Status: React.FC<StatusProps> = ({ enabled }) => {
  return (
    <div className={`status-badge ${enabled ? 'enabled' : 'disabled'}`}>
      <span className={`status-dot ${enabled ? 'active' : 'inactive'}`}></span>
      <span>{enabled ? 'Protection Active' : 'Disabled'}</span>
    </div>
  );
};

export default Status;
