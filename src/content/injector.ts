import { PhishingSimulation, SimulationContent, Platform, PhishingType } from '../shared/types';

/**
 * Phishing Simulation Injector
 * Injects realistic phishing simulations into web pages for training purposes
 */

interface InjectionConfig {
  simulation: PhishingSimulation;
  targetElement?: Element;
  delay?: number;
}

class PhishingInjector {
  private activeSimulations: Map<string, HTMLElement> = new Map();
  private simulationId: string | null = null;

  constructor() {
    this.listenForMessages();
  }

  private listenForMessages(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'INJECT_SIMULATION') {
        this.injectSimulation(message.simulation);
        sendResponse({ success: true });
      } else if (message.type === 'REMOVE_SIMULATION') {
        this.removeSimulation(message.simulationId);
        sendResponse({ success: true });
      } else if (message.type === 'GET_ACTIVE_SIMULATIONS') {
        sendResponse({ simulations: Array.from(this.activeSimulations.keys()) });
      }
      return true;
    });
  }

  /**
   * Inject a phishing simulation into the page
   */
  public injectSimulation(simulation: PhishingSimulation): boolean {
    try {
      // Check if simulation already active
      if (this.activeSimulations.has(simulation.id)) {
        console.log('[BTS] Simulation already active:', simulation.id);
        return false;
      }

      this.simulationId = simulation.id;
      
      switch (simulation.content.styling.position) {
        case 'modal':
          this.injectModal(simulation);
          break;
        case 'banner':
          this.injectBanner(simulation);
          break;
        case 'notification':
          this.injectNotification(simulation);
          break;
        case 'inline':
          this.injectInline(simulation);
          break;
        default:
          this.injectModal(simulation);
      }

      // Report simulation shown
      this.reportEvent('SIMULATION_SHOWN', simulation.id);
      
      return true;
    } catch (error) {
      console.error('[BTS] Error injecting simulation:', error);
      return false;
    }
  }

  /**
   * Inject a modal-style phishing simulation
   */
  private injectModal(simulation: PhishingSimulation): void {
    const { content } = simulation;
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = `bts-sim-${simulation.id}`;
    modal.className = 'bts-modal-overlay';
    modal.innerHTML = `
      <div class="bts-modal ${content.styling.theme}">
        <div class="bts-modal-header">
          ${content.styling.logoUrl ? `<img src="${content.styling.logoUrl}" class="bts-logo" alt="">` : ''}
          <h2 class="bts-title">${this.escapeHtml(content.title)}</h2>
          <button class="bts-close" aria-label="Close">&times;</button>
        </div>
        <div class="bts-modal-body">
          ${content.sender ? `<p class="bts-sender"><strong>From:</strong> ${this.escapeHtml(content.sender)} ${content.senderEmail ? `&lt;${this.escapeHtml(content.senderEmail)}&gt;` : ''}</p>` : ''}
          <p class="bts-body">${this.escapeHtml(content.body)}</p>
          ${this.getSimulationForm(simulation)}
        </div>
        <div class="bts-modal-footer">
          <button class="bts-action-btn ${content.urgency === 'critical' ? 'bts-urgent' : ''}">
            ${this.escapeHtml(content.actionText)}
          </button>
          ${content.actionUrl ? `<p class="bts-url-hint">Will redirect to: ${this.maskUrl(content.actionUrl)}</p>` : ''}
        </div>
      </div>
    `;

    // Add styles
    this.addModalStyles();

    // Setup event listeners
    this.setupModalListeners(modal, simulation);

    // Inject into page
    document.body.appendChild(modal);
    this.activeSimulations.set(simulation.id, modal);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('bts-visible');
    });
  }

  /**
   * Inject a banner-style simulation
   */
  private injectBanner(simulation: PhishingSimulation): void {
    const { content } = simulation;
    
    const banner = document.createElement('div');
    banner.id = `bts-sim-${simulation.id}`;
    banner.className = `bts-banner bts-banner-${content.urgency} ${content.styling.theme}`;
    banner.innerHTML = `
      <div class="bts-banner-content">
        <span class="bts-banner-icon">${this.getUrgencyIcon(content.urgency)}</span>
        <span class="bts-banner-text">${this.escapeHtml(content.title)} - ${this.escapeHtml(content.body.substring(0, 100))}${content.body.length > 100 ? '...' : ''}</span>
        <button class="bts-banner-action">${this.escapeHtml(content.actionText)}</button>
      </div>
      <button class="bts-banner-close" aria-label="Dismiss">&times;</button>
    `;

    this.addBannerStyles();
    this.setupBannerListeners(banner, simulation);

    // Insert at top of page
    document.body.insertBefore(banner, document.body.firstChild);
    this.activeSimulations.set(simulation.id, banner);

    requestAnimationFrame(() => {
      banner.classList.add('bts-visible');
    });
  }

  /**
   * Inject a notification-style simulation
   */
  private injectNotification(simulation: PhishingSimulation): void {
    const { content } = simulation;
    
    const notification = document.createElement('div');
    notification.id = `bts-sim-${simulation.id}`;
    notification.className = `bts-notification ${content.styling.theme}`;
    notification.innerHTML = `
      <div class="bts-notification-header">
        <span class="bts-notification-title">${this.escapeHtml(content.title)}</span>
        <button class="bts-notification-close">&times;</button>
      </div>
      <div class="bts-notification-body">
        ${content.sender ? `<p class="bts-notification-sender">${this.escapeHtml(content.sender)}</p>` : ''}
        <p>${this.escapeHtml(content.body.substring(0, 150))}${content.body.length > 150 ? '...' : ''}</p>
      </div>
      <div class="bts-notification-actions">
        <button class="bts-notification-btn bts-primary">${this.escapeHtml(content.actionText)}</button>
        <button class="bts-notification-btn bts-secondary">Dismiss</button>
      </div>
    `;

    this.addNotificationStyles();
    this.setupNotificationListeners(notification, simulation);

    // Position in corner
    document.body.appendChild(notification);
    this.activeSimulations.set(simulation.id, notification);

    requestAnimationFrame(() => {
      notification.classList.add('bts-visible');
    });
  }

  /**
   * Inject inline content
   */
  private injectInline(simulation: PhishingSimulation): void {
    // For inline, we would need a target element
    // This is typically used for email content injection
    console.log('[BTS] Inline injection not yet implemented');
  }

  /**
   * Get HTML form based on simulation type
   */
  private getSimulationForm(simulation: PhishingSimulation): string {
    switch (simulation.type) {
      case PhishingType.CREDENTIAL_HARVEST:
        return `
          <form class="bts-form" onsubmit="return false;">
            <div class="bts-form-group">
              <label for="bts-email">Email</label>
              <input type="email" id="bts-email" class="bts-input" placeholder="Enter your email" autocomplete="email">
            </div>
            <div class="bts-form-group">
              <label for="bts-password">Password</label>
              <input type="password" id="bts-password" class="bts-input" placeholder="Enter your password" autocomplete="current-password">
            </div>
          </form>
        `;
      case PhishingType.OAUTH_GRANT:
        return `
          <div class="bts-oauth-scopes">
            <p>This application is requesting access to:</p>
            <ul>
              <li>Read your email</li>
              <li>Access your contacts</li>
              <li>Send emails on your behalf</li>
            </ul>
          </div>
        `;
      default:
        return '';
    }
  }

  /**
   * Setup modal event listeners
   */
  private setupModalListeners(modal: HTMLElement, simulation: PhishingSimulation): void {
    // Close button
    const closeBtn = modal.querySelector('.bts-close');
    closeBtn?.addEventListener('click', () => {
      this.handleSimulationDetected(simulation.id);
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.handleSimulationDetected(simulation.id);
      }
    });

    // Action button
    const actionBtn = modal.querySelector('.bts-action-btn');
    actionBtn?.addEventListener('click', () => {
      this.handleActionClicked(simulation);
    });

    // Form inputs - monitor for credential entry
    const inputs = modal.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.reportEvent('FORM_FOCUSED', simulation.id);
      });
      input.addEventListener('input', () => {
        this.checkCredentialEntry(simulation, modal);
      });
    });
  }

  /**
   * Setup banner event listeners
   */
  private setupBannerListeners(banner: HTMLElement, simulation: PhishingSimulation): void {
    const closeBtn = banner.querySelector('.bts-banner-close');
    closeBtn?.addEventListener('click', () => {
      this.handleSimulationDetected(simulation.id);
    });

    const actionBtn = banner.querySelector('.bts-banner-action');
    actionBtn?.addEventListener('click', () => {
      this.handleActionClicked(simulation);
    });
  }

  /**
   * Setup notification event listeners
   */
  private setupNotificationListeners(notification: HTMLElement, simulation: PhishingSimulation): void {
    const closeBtn = notification.querySelector('.bts-notification-close, .bts-secondary');
    closeBtn?.addEventListener('click', () => {
      this.handleSimulationDetected(simulation.id);
    });

    const actionBtn = notification.querySelector('.bts-primary');
    actionBtn?.addEventListener('click', () => {
      this.handleActionClicked(simulation);
    });
  }

  /**
   * Handle when user detects the simulation
   */
  private handleSimulationDetected(simulationId: string): void {
    this.reportEvent('SIMULATION_DETECTED', simulationId);
    this.removeSimulation(simulationId);
    this.showSuccessMessage();
  }

  /**
   * Handle action button click
   */
  private handleActionClicked(simulation: PhishingSimulation): void {
    this.reportEvent('LINK_CLICKED', simulation.id);
    
    // Show warning that this was a simulation
    this.showWarningMessage();
    
    // Remove simulation
    setTimeout(() => {
      this.removeSimulation(simulation.id);
    }, 3000);
  }

  /**
   * Check if user entered credentials
   */
  private checkCredentialEntry(simulation: PhishingSimulation, container: HTMLElement): void {
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    if (emailInput?.value && passwordInput?.value) {
      // User entered credentials on a phishing page!
      this.reportEvent('CREDENTIAL_ENTERED', simulation.id, {
        hasUsername: !!emailInput.value,
        hasPassword: !!passwordInput.value,
        // Never send actual credentials - only metadata
        usernameLength: emailInput.value.length,
        passwordLength: passwordInput.value.length
      });

      this.showCredentialWarning();
    }
  }

  /**
   * Remove a simulation from the page
   */
  private removeSimulation(simulationId: string): void {
    const element = this.activeSimulations.get(simulationId);
    if (element) {
      element.classList.remove('bts-visible');
      setTimeout(() => {
        element.remove();
        this.activeSimulations.delete(simulationId);
      }, 300);
    }
  }

  /**
   * Show success message for detecting simulation
   */
  private showSuccessMessage(): void {
    const message = document.createElement('div');
    message.className = 'bts-success-message';
    message.innerHTML = `
      <div class="bts-success-content">
        <span class="bts-success-icon">✓</span>
        <div>
          <h3>Great job! You identified a simulated phishing attempt.</h3>
          <p>You've earned +20 security awareness points!</p>
        </div>
      </div>
    `;
    this.addSuccessStyles();
    document.body.appendChild(message);

    setTimeout(() => message.classList.add('bts-visible'), 10);
    setTimeout(() => {
      message.classList.remove('bts-visible');
      setTimeout(() => message.remove(), 300);
    }, 5000);
  }

  /**
   * Show warning message for clicking phishing link
   */
  private showWarningMessage(): void {
    const warning = document.createElement('div');
    warning.className = 'bts-warning-message';
    warning.innerHTML = `
      <div class="bts-warning-content">
        <span class="bts-warning-icon">⚠️</span>
        <div>
          <h3>Security Alert!</h3>
          <p>You clicked a link in a simulated phishing attempt. In a real attack, this could have compromised your account.</p>
        </div>
      </div>
    `;
    this.addWarningStyles();
    document.body.appendChild(warning);

    setTimeout(() => warning.classList.add('bts-visible'), 10);
    setTimeout(() => {
      warning.classList.remove('bts-visible');
      setTimeout(() => warning.remove(), 300);
    }, 6000);
  }

  /**
   * Show credential warning
   */
  private showCredentialWarning(): void {
    const warning = document.createElement('div');
    warning.className = 'bts-critical-warning';
    warning.innerHTML = `
      <div class="bts-critical-content">
        <span class="bts-critical-icon">🚨</span>
        <div>
          <h3>CRITICAL: You entered credentials on a phishing page!</h3>
          <p>In a real attack, your account would now be compromised. Never enter credentials on unfamiliar sites.</p>
          <p><strong>This was a training simulation. No data was transmitted.</strong></p>
        </div>
      </div>
    `;
    this.addCriticalStyles();
    document.body.appendChild(warning);

    setTimeout(() => warning.classList.add('bts-visible'), 10);
  }

  /**
   * Report event to background script
   */
  private reportEvent(type: string, simulationId: string, metadata?: Record<string, unknown>): void {
    chrome.runtime.sendMessage({
      type: 'SIMULATION_EVENT',
      event: {
        type,
        simulationId,
        url: window.location.href,
        timestamp: Date.now(),
        metadata
      }
    }).catch(err => console.error('[BTS] Error reporting event:', err));
  }

  /**
   * Helper: Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Helper: Mask URL for display
   */
  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/...`;
    } catch {
      return url.substring(0, 30) + '...';
    }
  }

  /**
   * Helper: Get icon for urgency level
   */
  private getUrgencyIcon(urgency: string): string {
    switch (urgency) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return 'ℹ️';
      default: return 'ℹ️';
    }
  }

  // CSS Styles
  private addModalStyles(): void {
    if (document.getElementById('bts-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-modal-styles';
    styles.textContent = `
      .bts-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .bts-modal-overlay.bts-visible { opacity: 1; }
      .bts-modal {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .bts-modal.dark {
        background: #1a1a1a;
        color: white;
      }
      .bts-modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .bts-modal.dark .bts-modal-header { border-color: #333; }
      .bts-logo { width: 32px; height: 32px; }
      .bts-title { flex: 1; margin: 0; font-size: 18px; }
      .bts-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .bts-modal-body { padding: 20px; }
      .bts-sender { color: #666; font-size: 14px; margin-bottom: 16px; }
      .bts-body { line-height: 1.6; }
      .bts-form-group { margin-bottom: 16px; }
      .bts-form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
      }
      .bts-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .bts-modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
      }
      .bts-action-btn {
        background: #0066cc;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
      }
      .bts-action-btn.bts-urgent {
        background: #dc3545;
        animation: bts-pulse 2s infinite;
      }
      @keyframes bts-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      .bts-url-hint {
        font-size: 12px;
        color: #999;
        margin-top: 12px;
      }
    `;
    document.head.appendChild(styles);
  }

  private addBannerStyles(): void {
    if (document.getElementById('bts-banner-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-banner-styles';
    styles.textContent = `
      .bts-banner {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 999998;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      .bts-banner.bts-visible { transform: translateY(0); }
      .bts-banner-critical { background: #dc3545; color: white; }
      .bts-banner-high { background: #fd7e14; color: white; }
      .bts-banner-medium { background: #ffc107; color: black; }
      .bts-banner-content { display: flex; align-items: center; gap: 12px; flex: 1; }
      .bts-banner-icon { font-size: 20px; }
      .bts-banner-text { flex: 1; }
      .bts-banner-action {
        background: white;
        color: #333;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      .bts-banner-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: inherit;
        margin-left: 12px;
      }
    `;
    document.head.appendChild(styles);
  }

  private addNotificationStyles(): void {
    if (document.getElementById('bts-notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-notification-styles';
    styles.textContent = `
      .bts-notification {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 360px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 999997;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      }
      .bts-notification.bts-visible { transform: translateX(0); }
      .bts-notification.dark { background: #1a1a1a; color: white; }
      .bts-notification-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .bts-notification-title { font-weight: 600; }
      .bts-notification-close { background: none; border: none; font-size: 18px; cursor: pointer; }
      .bts-notification-body { padding: 16px; }
      .bts-notification-sender { color: #666; font-size: 14px; margin-bottom: 8px; }
      .bts-notification-actions {
        padding: 16px;
        display: flex;
        gap: 12px;
        border-top: 1px solid #e0e0e0;
      }
      .bts-notification-btn {
        flex: 1;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      .bts-notification-btn.bts-primary {
        background: #0066cc;
        color: white;
        border: none;
      }
      .bts-notification-btn.bts-secondary {
        background: transparent;
        border: 1px solid #ddd;
      }
    `;
    document.head.appendChild(styles);
  }

  private addSuccessStyles(): void {
    if (document.getElementById('bts-success-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-success-styles';
    styles.textContent = `
      .bts-success-message {
        position: fixed;
        top: 24px;
        right: 24px;
        background: #28a745;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 1000000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
      }
      .bts-success-message.bts-visible { transform: translateX(0); }
      .bts-success-content { display: flex; align-items: center; gap: 16px; }
      .bts-success-icon { font-size: 32px; }
      .bts-success-content h3 { margin: 0 0 4px 0; font-size: 16px; }
      .bts-success-content p { margin: 0; opacity: 0.9; }
    `;
    document.head.appendChild(styles);
  }

  private addWarningStyles(): void {
    if (document.getElementById('bts-warning-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-warning-styles';
    styles.textContent = `
      .bts-warning-message {
        position: fixed;
        top: 24px;
        right: 24px;
        background: #fd7e14;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 1000000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
      }
      .bts-warning-message.bts-visible { transform: translateX(0); }
      .bts-warning-content { display: flex; align-items: center; gap: 16px; }
      .bts-warning-icon { font-size: 32px; }
      .bts-warning-content h3 { margin: 0 0 4px 0; font-size: 16px; }
      .bts-warning-content p { margin: 0; opacity: 0.9; }
    `;
    document.head.appendChild(styles);
  }

  private addCriticalStyles(): void {
    if (document.getElementById('bts-critical-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'bts-critical-styles';
    styles.textContent = `
      .bts-critical-warning {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        background: #dc3545;
        color: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        z-index: 1000001;
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 500px;
        text-align: center;
      }
      .bts-critical-warning.bts-visible { 
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .bts-critical-icon { font-size: 48px; display: block; margin-bottom: 16px; }
      .bts-critical-content h3 { margin: 0 0 12px 0; font-size: 20px; }
      .bts-critical-content p { margin: 0 0 8px 0; opacity: 0.95; }
    `;
    document.head.appendChild(styles);
  }
}

// Initialize injector
new PhishingInjector();

export { PhishingInjector };
