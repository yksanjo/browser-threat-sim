import { 
  PhishingSimulation, 
  PhishingType, 
  Platform, 
  UserContext, 
  SimulationContent,
  SimulationMetadata,
  TriggerCondition
} from '../shared/types';
import { PHISHING_TEMPLATES, PATTERNS } from '../shared/constants';

/**
 * Simulation Engine
 * Generates contextual phishing simulations based on user context
 */

export class SimulationEngine {
  private lastSimulationTime: number = 0;
  private readonly MIN_INTERVAL_MS = 300000; // 5 minutes between simulations
  private simulationCount: number = 0;

  /**
   * Determine if we should trigger a simulation now
   */
  async shouldTriggerSimulation(platform: Platform, context: UserContext): Promise<boolean> {
    // Check minimum interval
    if (Date.now() - this.lastSimulationTime < this.MIN_INTERVAL_MS) {
      return false;
    }

    // Don't show too many simulations
    if (this.simulationCount >= 5) {
      return false;
    }

    // Random chance (20% base + context factors)
    const baseChance = 0.2;
    const contextFactor = this.calculateContextFactor(context);
    const probability = Math.min(baseChance + contextFactor, 0.6);

    return Math.random() < probability;
  }

  /**
   * Generate a contextual phishing simulation
   */
  async generateSimulation(platform: Platform, context: UserContext): Promise<PhishingSimulation> {
    const type = this.selectPhishingType(platform, context);
    const templates = PHISHING_TEMPLATES[platform];
    
    // Personalize content based on context
    const content = this.generateContent(type, platform, context, templates);
    
    const simulation: PhishingSimulation = {
      id: this.generateId(),
      type,
      targetPlatform: platform,
      content,
      triggerConditions: this.generateTriggerConditions(type),
      metadata: {
        createdAt: Date.now(),
        campaignId: 'default-campaign',
        difficulty: this.calculateDifficulty(),
        trainingObjective: this.getTrainingObjective(type),
        redTeamControlled: false
      }
    };

    this.lastSimulationTime = Date.now();
    this.simulationCount++;

    return simulation;
  }

  /**
   * Select appropriate phishing type based on platform and context
   */
  private selectPhishingType(platform: Platform, context: UserContext): PhishingType {
    const types: PhishingType[] = [
      PhishingType.CREDENTIAL_HARVEST,
      PhishingType.OAUTH_GRANT,
      PhishingType.MFA_BYPASS
    ];

    // Weight based on platform
    const weights: Record<Platform, PhishingType[]> = {
      [Platform.GITHUB]: [
        PhishingType.CREDENTIAL_HARVEST,
        PhishingType.OAUTH_GRANT,
        PhishingType.CREDENTIAL_HARVEST,
        PhishingType.MFA_BYPASS
      ],
      [Platform.LINKEDIN]: [
        PhishingType.CREDENTIAL_HARVEST,
        PhishingType.OAUTH_GRANT,
        PhishingType.CREDENTIAL_HARVEST
      ],
      [Platform.GMAIL]: [
        PhishingType.CREDENTIAL_HARVEST,
        PhishingType.MFA_BYPASS,
        PhishingType.CREDENTIAL_HARVEST,
        PhishingType.SESSION_HIJACK
      ],
      [Platform.UNKNOWN]: types
    };

    const platformTypes = weights[platform] || types;
    return platformTypes[Math.floor(Math.random() * platformTypes.length)];
  }

  /**
   * Generate personalized content
   */
  private generateContent(
    type: PhishingType,
    platform: Platform,
    context: UserContext,
    templates: any
  ): SimulationContent {
    const subject = this.personalizeTemplate(
      this.selectRandom(templates.subjects),
      context
    );

    const sender = this.selectRandom(templates.senders);

    return {
      title: subject,
      body: this.generateBody(type, platform, context),
      sender: sender.name,
      senderEmail: sender.email,
      urgency: this.selectUrgency(),
      actionText: this.getActionText(type),
      actionUrl: this.getActionUrl(type, platform),
      styling: {
        position: this.selectPosition(type),
        theme: 'light',
        brandColors: this.getBrandColors(platform),
        logoUrl: this.getLogoUrl(platform)
      }
    };
  }

  /**
   * Generate email/body content
   */
  private generateBody(type: PhishingType, platform: Platform, context: UserContext): string {
    const bodies: Record<PhishingType, string[]> = {
      [PhishingType.CREDENTIAL_HARVEST]: [
        `We noticed unusual activity on your ${platform} account. Please verify your identity to prevent account suspension.`,
        `Your ${platform} session has expired. Please log in again to continue.`,
        `A suspicious login attempt was detected from a new device. Confirm your identity immediately.`,
        `Your ${platform} account requires verification due to security policy updates.`
      ],
      [PhishingType.OAUTH_GRANT]: [
        `A third-party application is requesting access to your ${platform} account. Review and approve the permissions.`,
        `Grant access to continue using ${platform} integration with your productivity tools.`,
        `Authorization required: A new device is attempting to sync with your account.`
      ],
      [PhishingType.MFA_BYPASS]: [
        `Your two-factor authentication needs to be reconfigured. Click below to update your security settings.`,
        `We've upgraded our security system. Please verify your backup codes to maintain account access.`,
        `MFA sync required: Your authenticator app needs to be reconnected.`
      ],
      [PhishingType.SESSION_HIJACK]: [
        `Your session has been terminated due to inactivity. Please sign in again to continue.`,
        `Multiple concurrent sessions detected. Verify your current session to continue.`
      ],
      [PhishingType.CLIPBOARD_HIJACK]: [
        `Copy this verification code to complete your action: [suspicious code will be injected]`,
        `Use this one-time password for verification.`
      ],
      [PhishingType.FILE_DOWNLOAD]: [
        `A secure document has been shared with you. Download and review immediately.`,
        `Your invoice is ready for download. Click to access your files.`
      ]
    };

    const options = bodies[type] || bodies[PhishingType.CREDENTIAL_HARVEST];
    let body = this.selectRandom(options);

    // Personalize with context
    if (context.username) {
      body = body.replace('your', `${context.username}'s`);
    }
    if (context.organization) {
      body += ` This affects your access to ${context.organization} resources.`;
    }

    return body;
  }

  /**
   * Get action button text
   */
  private getActionText(type: PhishingType): string {
    const texts: Record<PhishingType, string> = {
      [PhishingType.CREDENTIAL_HARVEST]: 'Verify Account',
      [PhishingType.OAUTH_GRANT]: 'Grant Access',
      [PhishingType.MFA_BYPASS]: 'Update Security',
      [PhishingType.SESSION_HIJACK]: 'Sign In',
      [PhishingType.CLIPBOARD_HIJACK]: 'Copy Code',
      [PhishingType.FILE_DOWNLOAD]: 'Download Now'
    };
    return texts[type];
  }

  /**
   * Get fake action URL
   */
  private getActionUrl(type: PhishingType, platform: Platform): string {
    // These are fake URLs for training purposes
    const domains: Record<Platform, string> = {
      [Platform.GITHUB]: 'github.com',
      [Platform.LINKEDIN]: 'linkedin.com',
      [Platform.GMAIL]: 'google.com',
      [Platform.UNKNOWN]: 'example.com'
    };

    return `https://${domains[platform]}/security/verify`;
  }

  /**
   * Select display position
   */
  private selectPosition(type: PhishingType): 'modal' | 'banner' | 'notification' | 'inline' {
    const positions: Record<PhishingType, ('modal' | 'banner' | 'notification' | 'inline')[]> = {
      [PhishingType.CREDENTIAL_HARVEST]: ['modal', 'modal', 'notification'],
      [PhishingType.OAUTH_GRANT]: ['modal', 'banner'],
      [PhishingType.MFA_BYPASS]: ['modal', 'notification'],
      [PhishingType.SESSION_HIJACK]: ['banner', 'notification'],
      [PhishingType.CLIPBOARD_HIJACK]: ['notification', 'inline'],
      [PhishingType.FILE_DOWNLOAD]: ['notification', 'modal']
    };

    const options = positions[type] || ['modal'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Select urgency level
   */
  private selectUrgency(): 'low' | 'medium' | 'high' | 'critical' {
    const weights = ['medium', 'medium', 'high', 'high', 'critical'];
    return weights[Math.floor(Math.random() * weights.length)] as any;
  }

  /**
   * Get brand colors for platform
   */
  private getBrandColors(platform: Platform): string[] {
    const colors: Record<Platform, string[]> = {
      [Platform.GITHUB]: ['#24292e', '#0366d6'],
      [Platform.LINKEDIN]: ['#0077b5', '#000000'],
      [Platform.GMAIL]: ['#ea4335', '#4285f4', '#34a853', '#fbbc05'],
      [Platform.UNKNOWN]: ['#333333']
    };
    return colors[platform] || colors[Platform.UNKNOWN];
  }

  /**
   * Get logo URL
   */
  private getLogoUrl(platform: Platform): string | undefined {
    // Would return actual logo URLs in production
    return undefined;
  }

  /**
   * Calculate difficulty based on user performance
   */
  private calculateDifficulty(): 'easy' | 'medium' | 'hard' | 'expert' {
    const levels: ('easy' | 'medium' | 'hard' | 'expert')[] = 
      ['easy', 'easy', 'medium', 'medium', 'hard'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  /**
   * Get training objective for simulation type
   */
  private getTrainingObjective(type: PhishingType): string {
    const objectives: Record<PhishingType, string> = {
      [PhishingType.CREDENTIAL_HARVEST]: 'Recognize credential harvesting attempts',
      [PhishingType.OAUTH_GRANT]: 'Identify malicious OAuth requests',
      [PhishingType.MFA_BYPASS]: 'Detect MFA bypass attempts',
      [PhishingType.SESSION_HIJACK]: 'Recognize session hijacking indicators',
      [PhishingType.CLIPBOARD_HIJACK]: 'Identify clipboard manipulation',
      [PhishingType.FILE_DOWNLOAD]: 'Recognize malicious download prompts'
    };
    return objectives[type];
  }

  /**
   * Generate trigger conditions
   */
  private generateTriggerConditions(type: PhishingType): TriggerCondition[] {
    return [
      {
        type: 'time',
        value: Date.now() + Math.random() * 60000,
        operator: 'gt'
      },
      {
        type: 'action',
        value: 'page_focus',
        operator: 'equals'
      }
    ];
  }

  /**
   * Calculate context factor for simulation probability
   */
  private calculateContextFactor(context: UserContext): number {
    let factor = 0;

    // More context = more realistic simulations possible
    if (context.username) factor += 0.1;
    if (context.email) factor += 0.1;
    if (context.organization) factor += 0.1;
    if (context.connections && context.connections.length > 0) factor += 0.1;
    if (context.recentActivity && context.recentActivity.length > 0) factor += 0.1;

    return factor;
  }

  /**
   * Personalize template with context
   */
  private personalizeTemplate(template: string, context: UserContext): string {
    return template
      .replace(/{username}/g, context.username || 'there')
      .replace(/{organization}/g, context.organization || 'your organization')
      .replace(/{connection}/g, context.connections?.[0]?.name || 'A connection')
      .replace(/{count}/g, String(Math.floor(Math.random() * 50) + 10));
  }

  /**
   * Select random item from array
   */
  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
