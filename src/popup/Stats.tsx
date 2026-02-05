import React from 'react';
import { UserStats } from '../shared/types';

interface StatsProps {
  stats: UserStats;
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  const getDetectionRate = (): number => {
    if (stats.simulationsSeen === 0) return 0;
    return Math.round((stats.simulationsDetected / stats.simulationsSeen) * 100);
  };

  const getRiskClass = (score: number): string => {
    if (score < 30) return 'good';
    if (score < 70) return 'warning';
    return 'danger';
  };

  const getRiskLabel = (score: number): string => {
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  const formatTime = (ms: number): string => {
    if (!ms) return 'N/A';
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <>
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{stats.simulationsSeen}</div>
          <div className="stat-label">Seen</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${getDetectionClass(stats)}`}>
            {getDetectionRate()}%
          </div>
          <div className="stat-label">Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(stats.averageDetectionTime)}</div>
          <div className="stat-label">Avg Time</div>
        </div>
      </div>

      <div className="risk-section">
        <h3>Security Risk Score</h3>
        <div className="risk-bar-container">
          <div 
            className={`risk-bar ${getRiskClass(stats.riskScore)}`}
            style={{ width: `${stats.riskScore}%` }}
          ></div>
        </div>
        <div className="risk-label">
          <span>{getRiskLabel(stats.riskScore)}</span>
          <span>{stats.riskScore}/100</span>
        </div>
      </div>

      <div className="stats-section" style={{ marginBottom: '16px' }}>
        <div className="stat-card">
          <div className={`stat-value ${stats.simulationsClicked > 0 ? 'warning' : 'good'}`}>
            {stats.simulationsClicked}
          </div>
          <div className="stat-label">Clicked</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${stats.credentialsEntered > 0 ? 'danger' : 'good'}`}>
            {stats.credentialsEntered}
          </div>
          <div className="stat-label">Credentials</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
            {stats.difficultyProgression.currentLevel}
          </div>
          <div className="stat-label">Difficulty</div>
        </div>
      </div>
    </>
  );
};

const getDetectionClass = (stats: UserStats): string => {
  const rate = stats.simulationsSeen > 0 ? (stats.simulationsDetected / stats.simulationsSeen) : 0;
  if (rate >= 0.8) return 'good';
  if (rate >= 0.5) return 'warning';
  return 'danger';
};

export default Stats;
