import { MLInput, FormField, UserBehavior, MLPrediction, RiskFactor } from '../shared/types';

/**
 * Credential Entry Detector
 * Monitors pages for credential entry and uses ML/heuristics to detect potential theft
 */

class CredentialDetector {
  private formFields: FormField[] = [];
  private userBehavior: UserBehavior = {
    timeOnPage: 0,
    mouseMovements: 0,
    keystrokes: 0,
    formInteractions: 0
  };
  private pageLoadTime: number = Date.now();
  private suspiciousForms: Set<HTMLFormElement> = new Set();
  private mlModelLoaded: boolean = false;

  // Patterns for detection
  private readonly PASSWORD_PATTERNS = [
    /password/i, /pass/i, /pwd/i, /pin/i, /secret/i,
    /current.*password/i, /new.*password/i, /confirm.*password/i
  ];

  private readonly USERNAME_PATTERNS = [
    /username/i, /user/i, /email/i, /login/i, /account/i,
    /identifier/i, /signin/i, /userid/i
  ];

  private readonly SUSPICIOUS_KEYWORDS = [
    'verify', 'confirm', 'update', 'suspend', 'limited', 'security',
    'unusual activity', 'unauthorized', 'breach', 'expired'
  ];

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.scanForms();
    this.setupEventListeners();
    this.startBehaviorTracking();
    await this.loadMLModel();
    console.log('[BTS] Credential detector initialized');
  }

  /**
   * Scan page for forms and password fields
   */
  private scanForms(): void {
    const forms = document.querySelectorAll('form');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    console.log(`[BTS] Found ${forms.length} forms, ${passwordInputs.length} password fields`);

    // Analyze each form
    forms.forEach(form => {
      this.analyzeForm(form);
    });

    // Also check for password fields outside forms
    passwordInputs.forEach(input => {
      if (!input.closest('form')) {
        this.analyzeStandaloneInput(input);
      }
    });
  }

  /**
   * Analyze a form for suspicious characteristics
   */
  private analyzeForm(form: HTMLFormElement): void {
    const inputs = form.querySelectorAll('input');
    const formFields: FormField[] = [];
    let hasPassword = false;
    let hasUsername = false;

    inputs.forEach(input => {
      const field = this.extractFieldInfo(input);
      formFields.push(field);

      if (field.isPassword) hasPassword = true;
      if (this.isUsernameField(input)) hasUsername = true;
    });

    // Check if this looks like a login form
    if (hasPassword && hasUsername) {
      const riskScore = this.calculateFormRiskScore(form, formFields);
      
      if (riskScore > 0.6) {
        this.suspiciousForms.add(form);
        console.log('[BTS] Suspicious login form detected:', form.action, 'Risk:', riskScore);
        
        // Monitor this form
        this.monitorForm(form);
      }
    }
  }

  /**
   * Extract field information
   */
  private extractFieldInfo(input: HTMLInputElement): FormField {
    const type = input.type || 'text';
    const name = input.name || input.id || '';
    const autocomplete = input.autocomplete || '';
    
    return {
      type,
      name,
      autocomplete,
      isPassword: type === 'password' || this.PASSWORD_PATTERNS.some(p => p.test(name)),
      isHidden: type === 'hidden'
    };
  }

  /**
   * Check if input is a username field
   */
  private isUsernameField(input: HTMLInputElement): boolean {
    const name = (input.name || input.id || input.placeholder || '').toLowerCase();
    return input.type === 'email' || 
           this.USERNAME_PATTERNS.some(p => p.test(name));
  }

  /**
   * Calculate risk score for a form
   */
  private calculateFormRiskScore(form: HTMLFormElement, fields: FormField[]): number {
    let score = 0;
    const checks = 5;

    // Check 1: Is action URL suspicious?
    const action = form.action || window.location.href;
    if (this.isSuspiciousUrl(action)) {
      score += 1;
    }

    // Check 2: Is form on HTTPS?
    if (!window.location.protocol.includes('https')) {
      score += 0.5;
    }

    // Check 3: Does page have suspicious content?
    if (this.hasSuspiciousContent()) {
      score += 0.8;
    }

    // Check 4: Is this a known legitimate domain?
    if (this.isKnownLegitimateDomain()) {
      score -= 0.5;
    }

    // Check 5: Form field analysis
    const hasAutocompleteOff = fields.some(f => f.autocomplete === 'off' && f.isPassword);
    if (hasAutocompleteOff) {
      score += 0.3;
    }

    return score / checks;
  }

  /**
   * Check if URL is suspicious
   */
  private isSuspiciousUrl(url: string): boolean {
    const suspicious = [
      /phish/i, /fake/i, /test-sim/i, /threat-sim/i,
      /(login|signin|auth)\.(?!google|github|microsoft)/i,
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses
      /bit\.ly|tinyurl|t\.co|goo\.gl/i // URL shorteners
    ];

    return suspicious.some(pattern => pattern.test(url));
  }

  /**
   * Check for suspicious page content
   */
  private hasSuspiciousContent(): boolean {
    const text = document.body.innerText.toLowerCase();
    return this.SUSPICIOUS_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Check if current domain is known legitimate
   */
  private isKnownLegitimateDomain(): boolean {
    const legitimateDomains = [
      'github.com',
      'linkedin.com',
      'google.com',
      'microsoft.com',
      'apple.com',
      'amazon.com'
    ];

    return legitimateDomains.some(domain => window.location.hostname.includes(domain));
  }

  /**
   * Monitor a form for credential entry
   */
  private monitorForm(form: HTMLFormElement): void {
    // Track input focus
    form.addEventListener('focusin', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT') {
        this.userBehavior.formInteractions++;
        
        // Send ML prediction request
        this.predictCredentialEntry();
      }
    }, true);

    // Track form submission
    form.addEventListener('submit', (e) => {
      this.handleFormSubmit(form, e);
    });

    // Also track button clicks that might submit
    const buttons = form.querySelectorAll('button, input[type="submit"]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.checkForCredentialEntry(form);
      });
    });
  }

  /**
   * Analyze standalone password input
   */
  private analyzeStandaloneInput(input: HTMLInputElement): void {
    console.log('[BTS] Standalone password field detected');
    
    input.addEventListener('focus', () => {
      this.predictCredentialEntry();
    });
  }

  /**
   * Handle form submission
   */
  private handleFormSubmit(form: HTMLFormElement, event: Event): void {
    const hasCredentials = this.checkForCredentialEntry(form);
    
    if (hasCredentials && this.suspiciousForms.has(form)) {
      // Alert user about potential credential theft
      this.alertCredentialRisk();
    }
  }

  /**
   * Check if credentials are being entered
   */
  private checkForCredentialEntry(form: HTMLFormElement): boolean {
    const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
    const usernameInput = form.querySelector('input[type="email"], input[name*="user"], input[name*="email"]') as HTMLInputElement;

    const hasPassword = passwordInput && passwordInput.value.length > 0;
    const hasUsername = usernameInput && usernameInput.value.length > 0;

    if (hasPassword) {
      // Report potential credential entry
      this.reportCredentialEntry({
        hasUsername,
        hasPassword,
        url: window.location.href,
        formAction: form.action,
        isSuspicious: this.suspiciousForms.has(form)
      });
    }

    return hasPassword || hasUsername;
  }

  /**
   * Use ML model to predict if this is credential entry
   */
  private async predictCredentialEntry(): Promise<MLPrediction | null> {
    if (!this.mlModelLoaded) {
      return null;
    }

    const input: MLInput = {
      formFields: this.formFields,
      url: window.location.href,
      pageContext: document.title + ' ' + document.body.innerText.substring(0, 500),
      userBehavior: this.userBehavior
    };

    try {
      // Send to background script for ML prediction
      const response = await chrome.runtime.sendMessage({
        type: 'ML_PREDICT',
        input
      });

      if (response?.prediction) {
        const prediction = response.prediction as MLPrediction;
        
        if (prediction.isCredentialEntry && prediction.confidence > 0.75) {
          this.alertCredentialRisk(prediction);
        }

        return prediction;
      }
    } catch (error) {
      console.error('[BTS] ML prediction error:', error);
    }

    return null;
  }

  /**
   * Load ML model
   */
  private async loadMLModel(): Promise<void> {
    try {
      // Check if ML is available in background script
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_ML_STATUS' });
      this.mlModelLoaded = response?.available || false;
      
      console.log('[BTS] ML Model loaded:', this.mlModelLoaded);
    } catch (error) {
      console.log('[BTS] ML Model not available');
      this.mlModelLoaded = false;
    }
  }

  /**
   * Setup event listeners for behavior tracking
   */
  private setupEventListeners(): void {
    // Track mouse movements
    document.addEventListener('mousemove', () => {
      this.userBehavior.mouseMovements++;
    }, { passive: true });

    // Track keystrokes
    document.addEventListener('keydown', () => {
      this.userBehavior.keystrokes++;
    }, { passive: true });

    // Listen for dynamically added forms
    const observer = new MutationObserver((mutations) => {
      let shouldRescan = false;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'FORM' || element.querySelector('form, input[type="password"]')) {
              shouldRescan = true;
            }
          }
        });
      });

      if (shouldRescan) {
        setTimeout(() => this.scanForms(), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Start tracking user behavior metrics
   */
  private startBehaviorTracking(): void {
    setInterval(() => {
      this.userBehavior.timeOnPage = Date.now() - this.pageLoadTime;
    }, 1000);
  }

  /**
   * Report credential entry to background
   */
  private reportCredentialEntry(data: Record<string, unknown>): void {
    chrome.runtime.sendMessage({
      type: 'CREDENTIAL_ENTRY_DETECTED',
      data: {
        ...data,
        timestamp: Date.now(),
        userBehavior: this.userBehavior
      }
    }).catch(err => console.error('[BTS] Error reporting credential entry:', err));
  }

  /**
   * Alert user about credential risk
   */
  private alertCredentialRisk(prediction?: MLPrediction): void {
    // Only alert once per page
    if ((window as unknown as Record<string, unknown>).__btsAlertShown) return;
    (window as unknown as Record<string, unknown>).__btsAlertShown = true;

    // Create alert
    const alert = document.createElement('div');
    alert.className = 'bts-detector-alert';
    alert.innerHTML = `
      <div class="bts-alert-content">
        <div class="bts-alert-header">
          <span class="bts-alert-icon">🔒</span>
          <h3>Security Warning</h3>
        </div>
        <p>You are about to enter credentials on <strong>${window.location.hostname}</strong>.</p>
        ${prediction?.riskFactors?.length ? `
          <div class="bts-risk-factors">
            <p><strong>Risk detected:</strong></p>
            <ul>
              ${prediction.riskFactors.map(rf => `<li>${rf.description}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <p class="bts-alert-question">Do you recognize this website?</p>
        <div class="bts-alert-actions">
          <button class="bts-btn bts-btn-safe">Yes, I recognize it</button>
          <button class="bts-btn bts-btn-danger">No, this looks suspicious</button>
        </div>
      </div>
    `;

    this.addAlertStyles();
    document.body.appendChild(alert);

    // Setup buttons
    alert.querySelector('.bts-btn-safe')?.addEventListener('click', () => {
      alert.remove();
    });

    alert.querySelector('.bts-btn-danger')?.addEventListener('click', () => {
      this.reportSuspiciousSite();
      alert.innerHTML = `
        <div class="bts-alert-content">
          <span class="bts-alert-icon">✓</span>
          <h3>Reported!</h3>
          <p>Thanks for being cautious. This site has been reported to your security team.</p>
        </div>
      `;
      setTimeout(() => alert.remove(), 3000);
    });

    // Report detection
    chrome.runtime.sendMessage({
      type: 'CREDENTIAL_RISK_ALERT_SHOWN',
      url: window.location.href,
      confidence: prediction?.confidence || 0.5
    });
  }

  /**
   * Report suspicious site
   */
  private reportSuspiciousSite(): void {
    chrome.runtime.sendMessage({
      type: 'REPORT_SUSPICIOUS_SITE',
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  /**
   * Add alert styles
   */
  private addAlertStyles(): void {
    if (document.getElementById('bts-detector-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'bts-detector-styles';
    styles.textContent = `
      .bts-detector-alert {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483647;
        animation: bts-fade-in 0.2s ease;
      }
      @keyframes bts-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .bts-alert-content {
        background: white;
        padding: 32px;
        border-radius: 12px;
        max-width: 480px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .bts-alert-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .bts-alert-icon { font-size: 28px; }
      .bts-alert-header h3 { margin: 0; font-size: 20px; }
      .bts-risk-factors {
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 8px;
        padding: 12px;
        margin: 16px 0;
      }
      .bts-risk-factors ul { margin: 8px 0 0 0; padding-left: 20px; }
      .bts-risk-factors li { margin-bottom: 4px; }
      .bts-alert-question {
        font-weight: 600;
        margin-top: 20px;
        margin-bottom: 16px;
      }
      .bts-alert-actions {
        display: flex;
        gap: 12px;
      }
      .bts-btn {
        flex: 1;
        padding: 12px 20px;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }
      .bts-btn-safe {
        background: #28a745;
        color: white;
      }
      .bts-btn-safe:hover { background: #218838; }
      .bts-btn-danger {
        background: #dc3545;
        color: white;
      }
      .bts-btn-danger:hover { background: #c82333; }
    `;
    document.head.appendChild(styles);
  }
}

// Initialize detector
new CredentialDetector();

export { CredentialDetector };
