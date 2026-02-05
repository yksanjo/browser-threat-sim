export interface UserStats {
  userId: string;
  simulationsSeen: number;
  simulationsClicked: number;
  credentialsEntered: number;
  simulationsDetected: number;
  averageDetectionTime: number;
  difficultyProgression: {
    currentLevel: 'easy' | 'medium' | 'hard' | 'expert';
    successRate: number;
    consecutiveSuccesses: number;
    consecutiveFailures: number;
  };
  riskScore: number;
  lastUpdated: number;
}

export interface SimulationEvent {
  id: string;
  simulationId: string;
  type: string;
  timestamp: number;
  url: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetPlatforms: string[];
  schedule: {
    startDate: number;
    endDate?: number;
    frequency: string;
  };
  metrics: CampaignMetrics;
  active: boolean;
  createdAt: number;
}

export interface CampaignMetrics {
  participants: number;
  emailsSent: number;
  linksClicked: number;
  credentialsEntered: number;
  detectionRate: number;
  averageTimeToDetection: number;
}

export interface RedTeamScenario {
  id: string;
  name: string;
  description: string;
  attackVector: string;
  targetUsers: string[];
  successCriteria: string[];
  createdAt: number;
  status: 'pending' | 'active' | 'completed';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSimulations: number;
  overallDetectionRate: number;
  averageRiskScore: number;
  recentEvents: SimulationEvent[];
}

export interface Report {
  id: string;
  type: 'user' | 'campaign' | 'organization';
  title: string;
  createdAt: number;
  data: unknown;
}
