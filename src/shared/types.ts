// Browser Threat Simulator - Type Definitions

export interface UserContext {
  platform: Platform;
  userId?: string;
  username?: string;
  email?: string;
  organization?: string;
  recentActivity?: Activity[];
  connections?: Connection[];
  timestamp: number;
}

export enum Platform {
  GITHUB = 'github',
  LINKEDIN = 'linkedin',
  GMAIL = 'gmail',
  UNKNOWN = 'unknown'
}

export interface Activity {
  type: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface Connection {
  name: string;
  platform: Platform;
  relationship: string;
  recentInteraction?: string;
}

export interface PhishingSimulation {
  id: string;
  type: PhishingType;
  targetPlatform: Platform;
  content: SimulationContent;
  triggerConditions: TriggerCondition[];
  metadata: SimulationMetadata;
}

export enum PhishingType {
  CREDENTIAL_HARVEST = 'credential_harvest',
  OAUTH_GRANT = 'oauth_grant',
  MFA_BYPASS = 'mfa_bypass',
  SESSION_HIJACK = 'session_hijack',
  CLIPBOARD_HIJACK = 'clipboard_hijack',
  FILE_DOWNLOAD = 'file_download'
}

export interface SimulationContent {
  title: string;
  body: string;
  sender?: string;
  senderEmail?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionText: string;
  actionUrl?: string;
  styling: ElementStyling;
}

export interface ElementStyling {
  position: 'modal' | 'banner' | 'inline' | 'notification';
  theme: 'light' | 'dark';
  brandColors?: string[];
  logoUrl?: string;
}

export interface TriggerCondition {
  type: 'time' | 'action' | 'url' | 'element' | 'ml_prediction';
  value: string | number | boolean;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'regex';
}

export interface SimulationMetadata {
  createdAt: number;
  campaignId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  trainingObjective: string;
  redTeamControlled: boolean;
}

export interface SimulationEvent {
  id: string;
  simulationId: string;
  type: EventType;
  timestamp: number;
  url: string;
  context: UserContext;
  metadata?: Record<string, unknown>;
}

export enum EventType {
  SIMULATION_SHOWN = 'simulation_shown',
  LINK_CLICKED = 'link_clicked',
  FORM_FOCUSED = 'form_focused',
  CREDENTIAL_ENTERED = 'credential_entered',
  SIMULATION_DETECTED = 'simulation_detected',
  SIMULATION_IGNORED = 'simulation_ignored',
  REPORTED_PHISHING = 'reported_phishing'
}

export interface CredentialAttempt {
  id: string;
  simulationId: string;
  username?: string;
  password?: string;
  timestamp: number;
  detectionMethod: 'ml_model' | 'form_analysis' | 'heuristic';
  confidence: number;
  isReal: boolean; // Always false for training
}

export interface UserStats {
  userId: string;
  simulationsSeen: number;
  simulationsClicked: number;
  credentialsEntered: number;
  simulationsDetected: number;
  averageDetectionTime: number;
  difficultyProgression: DifficultyProgression;
  riskScore: number;
  lastUpdated: number;
}

export interface DifficultyProgression {
  currentLevel: 'easy' | 'medium' | 'hard' | 'expert';
  successRate: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetPlatforms: Platform[];
  simulations: PhishingSimulation[];
  schedule: CampaignSchedule;
  metrics: CampaignMetrics;
  active: boolean;
  createdAt: number;
  createdBy: string;
}

export interface CampaignSchedule {
  startDate: number;
  endDate?: number;
  frequency: 'once' | 'daily' | 'weekly' | 'continuous';
  timeWindow?: {
    start: string; // HH:mm
    end: string;
  };
}

export interface CampaignMetrics {
  participants: number;
  emailsSent: number;
  linksClicked: number;
  credentialsEntered: number;
  detectionRate: number;
  averageTimeToDetection: number;
}

export interface DashboardConfig {
  apiEndpoint: string;
  apiKey: string;
  organizationId: string;
  reportingInterval: number;
}

export interface MLInput {
  formFields: FormField[];
  url: string;
  pageContext: string;
  userBehavior: UserBehavior;
}

export interface FormField {
  type: string;
  name: string;
  autocomplete?: string;
  isPassword: boolean;
  isHidden: boolean;
}

export interface UserBehavior {
  timeOnPage: number;
  mouseMovements: number;
  keystrokes: number;
  formInteractions: number;
}

export interface MLPrediction {
  isCredentialEntry: boolean;
  confidence: number;
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface RedTeamScenario {
  id: string;
  name: string;
  description: string;
  attackVector: string;
  customPayload?: string;
  targetUsers: string[];
  successCriteria: string[];
}

export interface ExtensionState {
  enabled: boolean;
  currentCampaign?: string;
  userStats: UserStats;
  lastSync: number;
  detectedSimulations: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
