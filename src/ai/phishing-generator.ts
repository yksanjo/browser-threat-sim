import { 
  PhishingSimulation, 
  PhishingType, 
  Platform, 
  UserContext, 
  SimulationContent,
  SimulationMetadata 
} from '../shared/types';
import { ContextAnalyzer, ContextAnalysis } from './context-analyzer';

/**
 * Phishing Content Generator
 * Generates realistic, contextual phishing content using AI analysis
 */

export interface GenerationOptions {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  customPayload?: string;
  redTeamMode?: boolean;
}

export class PhishingGenerator {
  private contextAnalyzer: ContextAnalyzer;
  
  constructor() {
    this.contextAnalyzer = new ContextAnalyzer();
  }

  /**
   * Generate a contextual phishing simulation
   */
  generate(
    platform: Platform,
    context: UserContext,
    analysis: ContextAnalysis,
    options: GenerationOptions
  ): PhishingSimulation {
    const type = this.selectAttackVector(platform, analysis, options);
    const content = this.generateContent(type, platform, context, analysis, options);
    
    return {
      id: this.generateId(),
      type,
      targetPlatform: platform,
      content,
      triggerConditions: this.generateTriggers(type, context),
      metadata: {
        createdAt: Date.now(),
        campaignId: 'generated',
        difficulty: options.difficulty,
        trainingObjective: this.getTrainingObjective(type),
        redTeamControlled: options.redTeamMode || false
      }
    };
  }

  /**
   * Select appropriate attack vector
   */
  private selectAttackVector(
    platform: Platform,
    analysis: ContextAnalysis,
    options: GenerationOptions
  ): PhishingType {
    const candidates = analysis.suggestedAttackVectors || ['credential_harvest'];
    
    // Map string vectors to PhishingType enum
    const vectorMap: Record<string, PhishingType> = {
      'credential_harvest': PhishingType.CREDENTIAL_HARVEST,
      'oauth_grant': PhishingType.OAUTH_GRANT,
      'mfa_bypass': PhishingType.MFA_BYPASS,
      'session_hijack': PhishingType.SESSION_HIJACK,
      'connection_impersonation': PhishingType.CREDENTIAL_HARVEST
    };

    const validTypes = candidates
      .map(v => vectorMap[v])
      .filter(Boolean) as PhishingType[];

    if (validTypes.length === 0) {
      return PhishingType.CREDENTIAL_HARVEST;
    }

    // Weight by difficulty
    if (options.difficulty === 'expert') {
      // More sophisticated attacks for expert level
      return validTypes.includes(PhishingType.OAUTH_GRANT) 
        ? PhishingType.OAUTH_GRANT 
        : validTypes[0];
    }

    return validTypes[Math.floor(Math.random() * validTypes.length)];
  }

  /**
   * Generate simulation content
   */
  private generateContent(
    type: PhishingType,
    platform: Platform,
    context: UserContext,
    analysis: ContextAnalysis,
    options: GenerationOptions
  ): SimulationContent {
    const templates = this.getTemplates(platform, type);
    const personalization = this.buildPersonalization(context, analysis);
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      title: this.personalize(template.title, personalization),
      body: this.personalize(template.body, personalization),
      sender: this.generateSender(platform, type, context),
      senderEmail: this.generateSenderEmail(platform, type),
      urgency: options.urgency || this.selectUrgency(options.difficulty),
      actionText: template.actionText,
      actionUrl: this.generateActionUrl(platform, type),
      styling: {
        position: template.position,
        theme: 'light',
        brandColors: this.getBrandColors(platform),
        logoUrl: this.getLogoUrl(platform)
      }
    };
  }

  /**
   * Get templates for platform and type
   */
  private getTemplates(platform: Platform, type: PhishingType): any[] {
    const templateSets: Record<Platform, Record<PhishingType, any[]>> = {
      [Platform.GITHUB]: {
        [PhishingType.CREDENTIAL_HARVEST]: [
          {
            title: 'Critical: Repository access suspended',
            body: 'We detected suspicious activity on your account. Your repository access has been temporarily suspended. Verify your identity to restore access.',
            actionText: 'Verify Identity',
            position: 'modal'
          },
          {
            title: 'Security alert: New sign-in from unknown device',
            body: 'A new device signed in to your GitHub account from an unrecognized location. If this wasn\'t you, secure your account immediately.',
            actionText: 'Review Activity',
            position: 'modal'
          }
        ],
        [PhishingType.OAUTH_GRANT]: [
          {
            title: 'GitHub App Authorization Required',
            body: 'The GitHub App "DevOps Toolkit" is requesting access to your repositories. Grant access to continue using automated workflows.',
            actionText: 'Authorize App',
            position: 'banner'
          }
        ],
        [PhishingType.MFA_BYPASS]: [
          {
            title: 'Two-Factor Authentication Update Required',
            body: 'We\'re updating our 2FA system. Please verify your backup codes to ensure continued access to your account.',
            actionText: 'Update 2FA',
            position: 'modal'
          }
        ],
        [PhishingType.SESSION_HIJACK]: [
          {
            title: 'Session Expired',
            body: 'Your session has expired due to inactivity. Please sign in again to continue.',
            actionText: 'Sign In',
            position: 'notification'
          }
        ],
        [PhishingType.CLIPBOARD_HIJACK]: [
          {
            title: 'Verification Code',
            body: 'Your one-time verification code is ready. Click to copy to clipboard.',
            actionText: 'Copy Code',
            position: 'notification'
          }
        ],
        [PhishingType.FILE_DOWNLOAD]: [
          {
            title: 'Security Report Available',
            body: 'Your repository security scan has completed. Download the detailed report.',
            actionText: 'Download Report',
            position: 'notification'
          }
        ]
      },
      [Platform.LINKEDIN]: {
        [PhishingType.CREDENTIAL_HARVEST]: [
          {
            title: '{connection} shared a post with you',
            body: '{connection} thought you\'d be interested in this article. View it now to see what they shared.',
            actionText: 'View Post',
            position: 'notification'
          },
          {
            title: 'Your LinkedIn Premium trial expires today',
            body: 'Don\'t lose access to Premium features. Update your payment information to continue enjoying LinkedIn Premium.',
            actionText: 'Update Payment',
            position: 'modal'
          }
        ],
        [PhishingType.OAUTH_GRANT]: [
          {
            title: 'New App Connection Request',
            body: '"Resume Builder Pro" wants to access your LinkedIn profile. This will help optimize your job search.',
            actionText: 'Connect App',
            position: 'banner'
          }
        ],
        [PhishingType.MFA_BYPASS]: [
          {
            title: 'Account Verification Required',
            body: 'To continue using LinkedIn securely, please verify your account with your phone number.',
            actionText: 'Verify Now',
            position: 'modal'
          }
        ],
        [PhishingType.SESSION_HIJACK]: [
          {
            title: 'Login Required',
            body: 'Please sign in again to view this content from your network.',
            actionText: 'Sign In',
            position: 'modal'
          }
        ],
        [PhishingType.CLIPBOARD_HIJACK]: [],
        [PhishingType.FILE_DOWNLOAD]: []
      },
      [Platform.GMAIL]: {
        [PhishingType.CREDENTIAL_HARVEST]: [
          {
            title: 'Google: Sign-in attempt was blocked',
            body: 'Someone just used your password to try to sign in to your Google Account. We blocked them, but you should check what happened.',
            actionText: 'Check Activity',
            position: 'modal'
          },
          {
            title: 'Your Gmail storage is 99% full',
            body: 'You are running out of storage space. Upgrade now to avoid losing emails or upgrade to Google One for more storage.',
            actionText: 'Free Up Space',
            position: 'banner'
          }
        ],
        [PhishingType.OAUTH_GRANT]: [
          {
            title: 'Security Checkup: Third-party access',
            body: 'An app you haven\'t used in 30 days still has access to your Google Account. Review and revoke if unnecessary.',
            actionText: 'Review Access',
            position: 'notification'
          }
        ],
        [PhishingType.MFA_BYPASS]: [
          {
            title: '2-Step Verification Update',
            body: 'We\'re making 2-Step Verification more secure. Update your settings to continue protecting your account.',
            actionText: 'Update Settings',
            position: 'modal'
          }
        ],
        [PhishingType.SESSION_HIJACK]: [
          {
            title: 'Session Timeout',
            body: 'For your security, your session has expired. Please sign in again.',
            actionText: 'Sign In',
            position: 'modal'
          }
        ],
        [PhishingType.CLIPBOARD_HIJACK]: [],
        [PhishingType.FILE_DOWNLOAD]: [
          {
            title: 'Secure file shared with you',
            body: 'Someone shared a confidential document with you via Google Drive. Download requires verification.',
            actionText: 'Download File',
            position: 'notification'
          }
        ]
      },
      [Platform.UNKNOWN]: {
        [PhishingType.CREDENTIAL_HARVEST]: [],
        [PhishingType.OAUTH_GRANT]: [],
        [PhishingType.MFA_BYPASS]: [],
        [PhishingType.SESSION_HIJACK]: [],
        [PhishingType.CLIPBOARD_HIJACK]: [],
        [PhishingType.FILE_DOWNLOAD]: []
      }
    };

    return templateSets[platform]?.[type] || templateSets[Platform.GITHUB][PhishingType.CREDENTIAL_HARVEST];
  }

  /**
   * Build personalization data from context
   */
  private buildPersonalization(context: UserContext, analysis: ContextAnalysis): Record<string, string> {
    return {
      username: context.username || 'there',
      email: context.email || 'your email',
      organization: context.organization || 'your organization',
      connection: analysis.keyContacts[0] || 'Someone',
      count: String(Math.floor(Math.random() * 40) + 10)
    };
  }

  /**
   * Personalize template string
   */
  private personalize(template: string, data: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
  }

  /**
   * Generate realistic sender name
   */
  private generateSender(platform: Platform, type: PhishingType, context: UserContext): string {
    const senders: Record<Platform, string[]> = {
      [Platform.GITHUB]: ['GitHub Security', 'GitHub Support', 'GitHub Actions', 'GitHub Team'],
      [Platform.LINKEDIN]: ['LinkedIn', 'LinkedIn Security', 'LinkedIn Notifications'],
      [Platform.GMAIL]: ['Google', 'Gmail Team', 'Google Security'],
      [Platform.UNKNOWN]: ['Security Team']
    };

    const list = senders[platform] || senders[Platform.UNKNOWN];
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Generate sender email
   */
  private generateSenderEmail(platform: Platform, type: PhishingType): string {
    const emails: Record<Platform, string[]> = {
      [Platform.GITHUB]: ['noreply@github.com', 'security@github.com', 'support@github.com'],
      [Platform.LINKEDIN]: ['messages-noreply@linkedin.com', 'security@linkedin.com'],
      [Platform.GMAIL]: ['no-reply@accounts.google.com', 'noreply@google.com'],
      [Platform.UNKNOWN]: ['security@notification.local']
    };

    const list = emails[platform] || emails[Platform.UNKNOWN];
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * Generate action URL
   */
  private generateActionUrl(platform: Platform, type: PhishingType): string {
    const domains: Record<Platform, string> = {
      [Platform.GITHUB]: 'github.com',
      [Platform.LINKEDIN]: 'linkedin.com',
      [Platform.GMAIL]: 'google.com',
      [Platform.UNKNOWN]: 'example.com'
    };

    return `https://${domains[platform]}/security-check`;
  }

  /**
   * Select urgency level
   */
  private selectUrgency(difficulty: string): 'low' | 'medium' | 'high' | 'critical' {
    const levels: Record<string, ('low' | 'medium' | 'high' | 'critical')[]> = {
      easy: ['low', 'low', 'medium'],
      medium: ['medium', 'high'],
      hard: ['high', 'critical'],
      expert: ['critical', 'high', 'critical']
    };

    const options = levels[difficulty] || levels.medium;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate trigger conditions
   */
  private generateTriggers(type: PhishingType, context: UserContext): any[] {
    return [
      {
        type: 'time',
        value: Date.now() + 5000 + Math.random() * 30000,
        operator: 'gt'
      },
      {
        type: 'action',
        value: 'page_visible',
        operator: 'equals'
      }
    ];
  }

  /**
   * Get brand colors for platform
   */
  private getBrandColors(platform: Platform): string[] {
    const colors: Record<Platform, string[]> = {
      [Platform.GITHUB]: ['#24292e', '#0366d6'],
      [Platform.LINKEDIN]: ['#0077b5', '#000000'],
      [Platform.GMAIL]: ['#4285f4', '#ea4335', '#fbbc05', '#34a853'],
      [Platform.UNKNOWN]: ['#333333']
    };
    return colors[platform];
  }

  /**
   * Get logo URL
   */
  private getLogoUrl(platform: Platform): string | undefined {
    // In production, return actual logo URLs
    return undefined;
  }

  /**
   * Get training objective for simulation type
   */
  private getTrainingObjective(type: PhishingType): string {
    const objectives: Record<PhishingType, string> = {
      [PhishingType.CREDENTIAL_HARVEST]: 'Recognize credential harvesting attempts',
      [PhishingType.OAUTH_GRANT]: 'Identify malicious OAuth requests',
      [PhishingType.MFA_BYPASS]: 'Detect MFA bypass attempts',
      [PhishingType.SESSION_HIJACK]: 'Recognize session hijacking',
      [PhishingType.CLIPBOARD_HIJACK]: 'Identify clipboard manipulation',
      [PhishingType.FILE_DOWNLOAD]: 'Recognize malicious downloads'
    };
    return objectives[type];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate red team scenario
   */
  generateRedTeamScenario(
    targetUser: string,
    attackVector: string,
    customPayload?: string
  ): PhishingSimulation {
    // Generate a highly targeted, realistic scenario
    return {
      id: this.generateId(),
      type: PhishingType.CREDENTIAL_HARVEST,
      targetPlatform: Platform.GMAIL,
      content: {
        title: `Internal: ${customPayload || 'Action Required'}`,
        body: `Hi ${targetUser},\n\n${customPayload || 'Please review the attached document and provide your feedback by EOD.'}`,
        sender: 'IT Security Team',
        senderEmail: 'security@company.local',
        urgency: 'high',
        actionText: 'View Document',
        actionUrl: 'https://docs.company-secure.local',
        styling: {
          position: 'notification',
          theme: 'light'
        }
      },
      triggerConditions: [],
      metadata: {
        createdAt: Date.now(),
        campaignId: 'red-team',
        difficulty: 'expert',
        trainingObjective: 'Red team exercise',
        redTeamControlled: true
      }
    };
  }
}
