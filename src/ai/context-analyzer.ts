import { UserContext, Platform, Activity, Connection } from '../shared/types';

/**
 * Context Analyzer
 * Analyzes user context to generate realistic, personalized phishing simulations
 */

export interface ContextAnalysis {
  riskProfile: 'low' | 'medium' | 'high';
  primaryPlatform: Platform;
  keyContacts: string[];
  topics: string[];
  organizations: string[];
  suggestedAttackVectors: string[];
  personalizationScore: number;
}

export class ContextAnalyzer {
  /**
   * Analyze user context across all platforms
   */
  analyze(userContexts: Partial<Record<Platform, UserContext>>): ContextAnalysis {
    const contexts = Object.values(userContexts).filter(Boolean) as UserContext[];
    
    if (contexts.length === 0) {
      return this.getDefaultAnalysis();
    }

    return {
      riskProfile: this.calculateRiskProfile(contexts),
      primaryPlatform: this.determinePrimaryPlatform(contexts),
      keyContacts: this.extractKeyContacts(contexts),
      topics: this.extractTopics(contexts),
      organizations: this.extractOrganizations(contexts),
      suggestedAttackVectors: this.suggestAttackVectors(contexts),
      personalizationScore: this.calculatePersonalizationScore(contexts)
    };
  }

  /**
   * Calculate risk profile based on user behavior
   */
  private calculateRiskProfile(contexts: UserContext[]): 'low' | 'medium' | 'high' {
    let riskScore = 50; // Base score

    for (const context of contexts) {
      // More activity = higher exposure
      if (context.recentActivity && context.recentActivity.length > 10) {
        riskScore += 10;
      }

      // More connections = wider attack surface
      if (context.connections && context.connections.length > 50) {
        riskScore += 10;
      }

      // LinkedIn users often targeted for business email compromise
      if (context.platform === Platform.LINKEDIN) {
        riskScore += 5;
      }
    }

    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Determine primary platform based on activity
   */
  private determinePrimaryPlatform(contexts: UserContext[]): Platform {
    const activityCounts: Record<Platform, number> = {
      [Platform.GITHUB]: 0,
      [Platform.LINKEDIN]: 0,
      [Platform.GMAIL]: 0,
      [Platform.UNKNOWN]: 0
    };

    for (const context of contexts) {
      const activityCount = context.recentActivity?.length || 0;
      activityCounts[context.platform] += activityCount;
    }

    const entries = Object.entries(activityCounts) as [Platform, number][];
    entries.sort((a, b) => b[1] - a[1]);

    return entries[0][0];
  }

  /**
   * Extract key contacts from all contexts
   */
  private extractKeyContacts(contexts: UserContext[]): string[] {
    const contacts = new Set<string>();

    for (const context of contexts) {
      if (context.connections) {
        for (const connection of context.connections.slice(0, 5)) {
          contacts.add(connection.name);
        }
      }
    }

    return Array.from(contacts);
  }

  /**
   * Extract topics from user activity
   */
  private extractTopics(contexts: UserContext[]): string[] {
    const topicKeywords: Record<string, string[]> = {
      'security': ['security', 'phishing', 'password', 'auth', '2fa', 'mfa'],
      'development': ['code', 'repo', 'commit', 'pull request', 'merge', 'bug', 'feature'],
      'business': ['meeting', 'project', 'deadline', 'client', 'revenue', 'sales'],
      'cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'deployment'],
      'data': ['database', 'analytics', 'metrics', 'dashboard', 'report']
    };

    const topicScores: Record<string, number> = {};

    for (const context of contexts) {
      if (context.recentActivity) {
        for (const activity of context.recentActivity) {
          const content = activity.content.toLowerCase();
          
          for (const [topic, keywords] of Object.entries(topicKeywords)) {
            for (const keyword of keywords) {
              if (content.includes(keyword)) {
                topicScores[topic] = (topicScores[topic] || 0) + 1;
              }
            }
          }
        }
      }
    }

    // Sort by score and return top topics
    const sorted = Object.entries(topicScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    return sorted;
  }

  /**
   * Extract organizations from contexts
   */
  private extractOrganizations(contexts: UserContext[]): string[] {
    const orgs = new Set<string>();

    for (const context of contexts) {
      if (context.organization) {
        orgs.add(context.organization);
      }
    }

    return Array.from(orgs);
  }

  /**
   * Suggest attack vectors based on context
   */
  private suggestAttackVectors(contexts: UserContext[]): string[] {
    const vectors: string[] = [];
    const platforms = contexts.map(c => c.platform);

    if (platforms.includes(Platform.GITHUB)) {
      vectors.push('oauth_grant', 'credential_harvest', 'session_hijack');
    }

    if (platforms.includes(Platform.LINKEDIN)) {
      vectors.push('credential_harvest', 'connection_impersonation');
    }

    if (platforms.includes(Platform.GMAIL)) {
      vectors.push('credential_harvest', 'oauth_grant', 'mfa_bypass');
    }

    return [...new Set(vectors)];
  }

  /**
   * Calculate how well we can personalize simulations
   */
  private calculatePersonalizationScore(contexts: UserContext[]): number {
    let score = 0;
    const maxScore = contexts.length * 4;

    for (const context of contexts) {
      if (context.username) score++;
      if (context.email) score++;
      if (context.organization) score++;
      if (context.connections && context.connections.length > 0) score++;
    }

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Analyze timing patterns for optimal simulation delivery
   */
  analyzeTimingPatterns(contexts: UserContext[]): { 
    bestTime: number; 
    bestDay: number; 
    timezone?: string;
  } {
    const timestamps: number[] = [];

    for (const context of contexts) {
      if (context.recentActivity) {
        for (const activity of context.recentActivity) {
          timestamps.push(activity.timestamp);
        }
      }
    }

    if (timestamps.length === 0) {
      return { bestTime: 9, bestDay: 1 }; // Default to Monday 9am
    }

    // Find most active hour
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);

    for (const timestamp of timestamps) {
      const date = new Date(timestamp);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    }

    const bestTime = hourCounts.indexOf(Math.max(...hourCounts));
    const bestDay = dayCounts.indexOf(Math.max(...dayCounts));

    return { bestTime, bestDay };
  }

  /**
   * Get default analysis when no context available
   */
  private getDefaultAnalysis(): ContextAnalysis {
    return {
      riskProfile: 'medium',
      primaryPlatform: Platform.UNKNOWN,
      keyContacts: [],
      topics: [],
      organizations: [],
      suggestedAttackVectors: ['credential_harvest'],
      personalizationScore: 0
    };
  }

  /**
   * Cross-reference contexts for relationship mapping
   */
  buildRelationshipGraph(contexts: UserContext[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const context of contexts) {
      if (context.connections) {
        const userId = context.username || context.email || context.platform;
        const connections = context.connections.map(c => c.name);
        graph.set(userId, connections);
      }
    }

    return graph;
  }

  /**
   * Detect anomalies in user behavior
   */
  detectAnomalies(context: UserContext): string[] {
    const anomalies: string[] = [];

    if (context.recentActivity) {
      // Check for burst activity
      const sorted = [...context.recentActivity].sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i].timestamp - sorted[i - 1].timestamp;
        if (diff < 1000) { // Less than 1 second apart
          anomalies.push('burst_activity');
          break;
        }
      }

      // Check for unusual hours
      const lastActivity = sorted[sorted.length - 1];
      if (lastActivity) {
        const hour = new Date(lastActivity.timestamp).getHours();
        if (hour < 6 || hour > 23) {
          anomalies.push('unusual_hours');
        }
      }
    }

    return anomalies;
  }
}
