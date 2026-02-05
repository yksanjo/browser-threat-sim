// Browser Threat Simulator - Constants

export const EXTENSION_NAME = 'Browser Threat Simulator';
export const EXTENSION_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  USER_STATS: 'bts_user_stats',
  EXTENSION_STATE: 'bts_extension_state',
  DASHBOARD_CONFIG: 'bts_dashboard_config',
  DETECTED_SIMULATIONS: 'bts_detected_simulations',
  USER_CONTEXT: 'bts_user_context',
  ML_MODEL_STATE: 'bts_ml_model_state'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CAMPAIGNS: '/api/campaigns',
  EVENTS: '/api/events',
  STATS: '/api/stats',
  REDTEAM: '/api/redteam',
  CONFIG: '/api/config'
} as const;

// Default API URLs
export const DEFAULT_DASHBOARD_URL = 'http://localhost:3000';

// Timing Constants
export const SYNC_INTERVAL_MS = 60000; // 1 minute
export const CONTEXT_REFRESH_INTERVAL_MS = 300000; // 5 minutes
export const MAX_CONTEXT_AGE_MS = 3600000; // 1 hour
export const SIMULATION_DELAY_MIN_MS = 5000;
export const SIMULATION_DELAY_MAX_MS = 30000;

// ML Model Constants
export const ML_CONFIG = {
  MODEL_PATH: 'ai/tf-model/credential-detection',
  INPUT_FEATURES: 12,
  HIDDEN_UNITS: 64,
  OUTPUT_CLASSES: 2,
  CONFIDENCE_THRESHOLD: 0.75,
  RETRAIN_THRESHOLD: 100 // events before retrain
} as const;

// Phishing Simulation Templates
export const PHISHING_TEMPLATES = {
  [Platform.GITHUB]: {
    subjects: [
      'Critical: Repository access suspended',
      'Security alert: Unusual sign-in detected',
      'Action required: 2FA verification needed',
      'Your GitHub Copilot subscription expires today',
      'Repository transfer request from {organization}'
    ],
    senders: [
      { name: 'GitHub Security', email: 'security@github.com' },
      { name: 'GitHub Support', email: 'support@github.com' },
      { name: 'GitHub Actions', email: 'actions@github.com' }
    ]
  },
  [Platform.LINKEDIN]: {
    subjects: [
      '{connection} shared a post with you',
      'You appeared in {count} searches this week',
      'Your LinkedIn Premium trial expires today',
      'Action required: Verify your identity',
      '{connection} endorsed you for a skill'
    ],
    senders: [
      { name: 'LinkedIn', email: 'messages-noreply@linkedin.com' },
      { name: 'LinkedIn Security', email: 'security@linkedin.com' }
    ]
  },
  [Platform.GMAIL]: {
    subjects: [
      'Google Workspace: Security alert',
      'Your Gmail storage is 99% full',
      'Sign-in attempt blocked',
      'Verify your recovery email',
      'Google Drive: File shared with you'
    ],
    senders: [
      { name: 'Google', email: 'no-reply@accounts.google.com' },
      { name: 'Gmail Team', email: 'mail-noreply@google.com' }
    ]
  }
} as const;

// Risk Scores
export const RISK_WEIGHTS = {
  CREDENTIAL_ENTERED: 50,
  LINK_CLICKED: 25,
  SIMULATION_IGNORED: 10,
  SIMULATION_DETECTED: -20,
  REPORTED_PHISHING: -30
} as const;

// UI Messages
export const MESSAGES = {
  SIMULATION_DETECTED: {
    title: '⚠️ Security Training Alert',
    body: 'You successfully identified a simulated phishing attempt! Great job staying vigilant.',
    action: 'View Details'
  },
  CREDENTIAL_WARNING: {
    title: '🔒 Security Warning',
    body: 'You entered credentials on a simulated phishing page. In a real attack, your account would be compromised.',
    action: 'Learn More'
  },
  EXTENSION_DISABLED: {
    title: 'Browser Threat Simulator Disabled',
    body: 'Phishing simulations are currently paused.'
  }
} as const;

// Feature Flags
export const FEATURES = {
  ML_DETECTION: true,
  REAL_TIME_SYNC: true,
  RED_TEAM_MODE: true,
  CONTEXT_ANALYSIS: true,
  BEHAVIORAL_TRACKING: true
} as const;

// CSS Selectors for Context Extraction
export const SELECTORS = {
  GITHUB: {
    USERNAME: '.js-feature-preview-indicator-container [data-login]',
    EMAIL: '.email',
    ORG: '[data-hovercard-type="organization"]',
    REPO_LIST: '[data-testid="repo-list-item"]'
  },
  LINKEDIN: {
    NAME: '.pv-top-card-v2-section__meta h1',
    HEADLINE: '.pv-top-card-v2-section__headline',
    COMPANY: '.pv-top-card-v2-section__company-name'
  },
  GMAIL: {
    EMAIL: '[data-email]',
    THREAD_SUBJECT: '[data-legacy-thread-id]'
  }
} as const;

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PASSWORD_FIELD: /password|pass|pwd|pin/i,
  USERNAME_FIELD: /username|user|email|login|account/i,
  SUSPICIOUS_DOMAIN: /(phish|fake|test-sim|threat-sim)/i
} as const;

// Event Types for Analytics
export const ANALYTICS_EVENTS = {
  EXTENSION_INSTALLED: 'extension_installed',
  EXTENSION_ENABLED: 'extension_enabled',
  EXTENSION_DISABLED: 'extension_disabled',
  SIMULATION_TRIGGERED: 'simulation_triggered',
  SIMULATION_COMPLETED: 'simulation_completed',
  STATS_SYNCED: 'stats_synced'
} as const;
