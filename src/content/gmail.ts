import { UserContext, Platform, Activity } from '../shared/types';

/**
 * Gmail Context Reader
 * Extracts user context from Gmail for contextual phishing simulations
 */

class GmailContextReader {
  private context: Partial<UserContext> = {
    platform: Platform.GMAIL,
    timestamp: Date.now()
  };

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isGmailPage()) {
      this.extractContext();
      this.setupMutationObserver();
      this.reportContext();
    }
  }

  private isGmailPage(): boolean {
    return window.location.hostname === 'mail.google.com';
  }

  private extractContext(): void {
    try {
      // Extract email address
      const emailSelectors = [
        '[data-hovercard-id][data-email]',
        '[data-email]',
        'a[href^="https://accounts.google.com"]',
        '.gb_d[title]'
      ];

      for (const selector of emailSelectors) {
        const emailEl = document.querySelector(selector);
        if (emailEl) {
          const email = emailEl.getAttribute('data-email') || 
                       emailEl.getAttribute('title') ||
                       emailEl.textContent;
          
          if (email && this.isValidEmail(email)) {
            this.context.email = email.trim();
            break;
          }
        }
      }

      // Extract from account menu
      const accountMenu = document.querySelector('[aria-label*="@"]');
      if (accountMenu) {
        const ariaLabel = accountMenu.getAttribute('aria-label') || '';
        const emailMatch = ariaLabel.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          this.context.email = emailMatch[0];
        }
      }

      // Extract recent email subjects
      this.context.recentActivity = this.extractEmailSubjects();

      console.log('[BTS] Gmail context extracted:', this.context);
    } catch (error) {
      console.error('[BTS] Error extracting Gmail context:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private extractEmailSubjects(): Activity[] {
    const activities: Activity[] = [];
    
    try {
      // Look for email subject lines in the inbox
      const subjectSelectors = [
        '[data-legacy-thread-id] .bog',  // Classic Gmail
        '[role="main"] [data-thread-id] span[data-thread-id]', // Newer Gmail
        '.y6', // Another Gmail selector
        '[data-test-id="message-subject"]'
      ];

      for (const selector of subjectSelectors) {
        const subjectElements = document.querySelectorAll(selector);
        
        if (subjectElements.length > 0) {
          subjectElements.forEach((el, index) => {
            if (index >= 5) return; // Limit to 5 subjects

            const subject = el.textContent?.trim();
            if (subject && subject.length > 0) {
              activities.push({
                type: 'email_subject',
                content: subject,
                timestamp: Date.now() - (index * 60000) // Estimate based on position
              });
            }
          });
          break; // Use first matching selector
        }
      }

      // Extract sender information
      const senderElements = document.querySelectorAll('.yW span[email]');
      senderElements.forEach((el, index) => {
        if (index >= 3) return;

        const senderEmail = el.getAttribute('email');
        const senderName = el.textContent?.trim();
        
        if (senderEmail) {
          activities.push({
            type: 'sender',
            content: `${senderName} <${senderEmail}>`,
            timestamp: Date.now(),
            metadata: { senderEmail, senderName }
          });
        }
      });
    } catch (error) {
      console.error('[BTS] Error extracting email subjects:', error);
    }

    return activities;
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check for email list or account info changes
              if (element.querySelector('[data-legacy-thread-id], [data-thread-id]') ||
                  element.matches('[data-email]')) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        setTimeout(() => {
          this.extractContext();
          this.reportContext();
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private reportContext(): void {
    chrome.runtime.sendMessage({
      type: 'CONTEXT_UPDATE',
      platform: Platform.GMAIL,
      context: this.context
    }).catch(err => {
      console.error('[BTS] Error reporting context:', err);
    });
  }

  public getContext(): Partial<UserContext> {
    return this.context;
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GmailContextReader();
  });
} else {
  new GmailContextReader();
}

export { GmailContextReader };
