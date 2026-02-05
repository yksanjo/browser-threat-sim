import { FormField, UserBehavior, MLPrediction, RiskFactor } from '../shared/types';

/**
 * Credential Entry Detector
 * ML-based detection of credential entry on suspicious sites
 */

export interface DetectionInput {
  formFields: FormField[];
  url: string;
  pageTitle: string;
  pageContent: string;
  userBehavior: UserBehavior;
  timestamp: number;
}

export class CredentialDetector {
  private patterns = {
    password: [/password/i, /pwd/i, /pass/i, /pin/i, /secret/i],
    username: [/username/i, /user/i, /email/i, /login/i, /account/i],
    suspicious: [
      /verify.*account/i, /confirm.*identity/i, /update.*password/i,
      /suspicious.*activity/i, /unauthorized.*access/i, /account.*suspend/i
    ],
    legitimate: [
      /github\.com/i, /linkedin\.com/i, /google\.com/i,
      /microsoft\.com/i, /apple\.com/i, /amazon\.com/i
    ]
  };

  private knownLegitimateDomains = new Set([
    'github.com', 'linkedin.com', 'google.com',
    'accounts.google.com', 'login.microsoftonline.com',
    'appleid.apple.com', 'amazon.com'
  ]);

  /**
   * Analyze page for credential theft risk
   */
  analyze(input: DetectionInput): MLPrediction {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    // Check for password field
    const hasPasswordField = input.formFields.some(f => f.isPassword);
    if (hasPasswordField) {
      riskScore += 0.25;
      riskFactors.push({
        type: 'password_field',
        severity: 'high',
        description: 'Password field detected'
      });
    }

    // Check for username field
    const hasUsernameField = input.formFields.some(f => 
      f.type === 'email' || this.patterns.username.some(p => p.test(f.name))
    );
    if (hasUsernameField) {
      riskScore += 0.1;
    }

    // Check URL security
    const urlRisk = this.analyzeUrl(input.url);
    riskScore += urlRisk.score;
    riskFactors.push(...urlRisk.factors);

    // Check page content
    const contentRisk = this.analyzeContent(input.pageTitle + ' ' + input.pageContent);
    riskScore += contentRisk.score;
    riskFactors.push(...contentRisk.factors);

    // Analyze user behavior
    const behaviorRisk = this.analyzeBehavior(input.userBehavior);
    riskScore += behaviorRisk.score;
    riskFactors.push(...behaviorRisk.factors);

    // Normalize score
    riskScore = Math.min(riskScore, 1.0);

    return {
      isCredentialEntry: hasPasswordField && riskScore > 0.6,
      confidence: riskScore,
      riskFactors: riskFactors.slice(0, 5) // Limit to top 5
    };
  }

  /**
   * Analyze URL for suspicious patterns
   */
  private analyzeUrl(url: string): { score: number; factors: RiskFactor[] } {
    let score = 0;
    const factors: RiskFactor[] = [];

    try {
      const urlObj = new URL(url);

      // HTTPS check
      if (urlObj.protocol !== 'https:') {
        score += 0.2;
        factors.push({
          type: 'insecure_protocol',
          severity: 'high',
          description: 'Page does not use HTTPS encryption'
        });
      }

      // Domain legitimacy check
      const domain = urlObj.hostname.toLowerCase();
      const isLegitimate = Array.from(this.knownLegitimateDomains).some(d => 
        domain === d || domain.endsWith('.' + d)
      );

      if (!isLegitimate) {
        score += 0.15;
        factors.push({
          type: 'unknown_domain',
          severity: 'medium',
          description: 'Domain is not in known legitimate list'
        });
      }

      // Check for suspicious patterns in URL
      const suspiciousPatterns = [
        /signin.*verify/i, /secure.*login/i, /account.*update/i,
        /confirm.*identity/i, /auth.*verify/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(url)) {
          score += 0.1;
          factors.push({
            type: 'suspicious_url_pattern',
            severity: 'medium',
            description: 'URL contains suspicious keywords'
          });
          break;
        }
      }

      // Check for IP address
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
        score += 0.2;
        factors.push({
          type: 'ip_address',
          severity: 'high',
          description: 'URL uses IP address instead of domain name'
        });
      }

      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly'];
      if (shorteners.some(s => domain.includes(s))) {
        score += 0.15;
        factors.push({
          type: 'url_shortener',
          severity: 'medium',
          description: 'URL uses a link shortener'
        });
      }

    } catch {
      // Invalid URL
      score += 0.3;
      factors.push({
        type: 'invalid_url',
        severity: 'high',
        description: 'Could not parse URL'
      });
    }

    return { score, factors };
  }

  /**
   * Analyze page content for phishing indicators
   */
  private analyzeContent(content: string): { score: number; factors: RiskFactor[] } {
    let score = 0;
    const factors: RiskFactor[] = [];
    const lowerContent = content.toLowerCase();

    // Check for urgency keywords
    const urgencyKeywords = [
      'immediately', 'urgent', 'asap', 'right now', 'limited time',
      'account will be', 'suspended', 'terminated', '24 hours'
    ];

    const urgencyCount = urgencyKeywords.filter(k => lowerContent.includes(k)).length;
    if (urgencyCount > 0) {
      score += Math.min(urgencyCount * 0.05, 0.15);
      factors.push({
        type: 'urgency_language',
        severity: 'medium',
        description: 'Page uses urgent or threatening language'
      });
    }

    // Check for security-related keywords
    const securityKeywords = [
      'verify', 'confirm', 'update', 'security', 'unauthorized',
      'suspicious', 'breach', 'compromised'
    ];

    const securityCount = securityKeywords.filter(k => lowerContent.includes(k)).length;
    if (securityCount > 2) {
      score += Math.min((securityCount - 2) * 0.03, 0.1);
    }

    // Check for grammar/spelling issues (simplified)
    const commonTypos = ['acount', 'verfy', 'securty', 'login', 'signin'];
    for (const typo of commonTypos) {
      if (lowerContent.includes(typo)) {
        score += 0.05;
        factors.push({
          type: 'suspicious_spelling',
          severity: 'low',
          description: 'Possible spelling errors detected'
        });
        break;
      }
    }

    return { score, factors };
  }

  /**
   * Analyze user behavior for anomalies
   */
  private analyzeBehavior(behavior: UserBehavior): { score: number; factors: RiskFactor[] } {
    let score = 0;
    const factors: RiskFactor[] = [];

    // Rushed entry (fast typing, short time on page)
    if (behavior.timeOnPage < 3000 && behavior.keystrokes > 10) {
      score += 0.05;
      factors.push({
        type: 'rushed_behavior',
        severity: 'low',
        description: 'Quick form entry detected'
      });
    }

    // No mouse movement (possible automated input)
    if (behavior.mouseMovements < 5 && behavior.keystrokes > 20) {
      score += 0.05;
      factors.push({
        type: 'low_interaction',
        severity: 'low',
        description: 'Unusually low mouse interaction'
      });
    }

    return { score, factors };
  }

  /**
   * Check if form is likely a login form
   */
  isLoginForm(fields: FormField[]): boolean {
    const hasPassword = fields.some(f => f.isPassword);
    const hasUsername = fields.some(f => 
      f.type === 'email' || 
      f.type === 'text' && this.patterns.username.some(p => p.test(f.name))
    );

    return hasPassword && hasUsername;
  }

  /**
   * Get recommendations based on detection
   */
  getRecommendations(prediction: MLPrediction): string[] {
    const recommendations: string[] = [];

    if (prediction.confidence > 0.8) {
      recommendations.push('This page shows strong signs of a phishing attempt.');
      recommendations.push('Do not enter any credentials.');
    } else if (prediction.confidence > 0.5) {
      recommendations.push('Exercise caution on this page.');
      recommendations.push('Verify the URL is correct before entering credentials.');
    }

    for (const factor of prediction.riskFactors) {
      switch (factor.type) {
        case 'insecure_protocol':
          recommendations.push('Never enter passwords on non-HTTPS sites.');
          break;
        case 'unknown_domain':
          recommendations.push('Double-check you are on the legitimate website.');
          break;
        case 'urgency_language':
          recommendations.push('Be suspicious of urgent requests.');
          break;
      }
    }

    return recommendations;
  }
}
