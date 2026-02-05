import { UserContext, Platform, Activity, Connection } from '../shared/types';

/**
 * LinkedIn Context Reader
 * Extracts user context from LinkedIn pages for contextual phishing simulations
 */

class LinkedInContextReader {
  private context: Partial<UserContext> = {
    platform: Platform.LINKEDIN,
    timestamp: Date.now()
  };

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isLinkedInPage()) {
      this.extractContext();
      this.setupMutationObserver();
      this.reportContext();
    }
  }

  private isLinkedInPage(): boolean {
    return window.location.hostname === 'www.linkedin.com';
  }

  private extractContext(): void {
    try {
      // Extract profile name
      const nameSelectors = [
        '.pv-top-card-v2-section__meta h1',
        '.top-card-layout__title',
        '.profile-card__name',
        '[data-test-id="profile-card-name"]'
      ];

      for (const selector of nameSelectors) {
        const nameEl = document.querySelector(selector);
        if (nameEl?.textContent) {
          this.context.username = nameEl.textContent.trim();
          break;
        }
      }

      // Extract headline/title
      const headlineSelectors = [
        '.pv-top-card-v2-section__headline',
        '.top-card-layout__headline',
        '.profile-card__headline'
      ];

      for (const selector of headlineSelectors) {
        const headlineEl = document.querySelector(selector);
        if (headlineEl?.textContent) {
          const headline = headlineEl.textContent.trim();
          this.context.recentActivity = this.context.recentActivity || [];
          this.context.recentActivity.push({
            type: 'headline',
            content: headline,
            timestamp: Date.now()
          });
          break;
        }
      }

      // Extract company
      const companySelectors = [
        '.pv-top-card-v2-section__company-name',
        '.top-card-layout__company',
        '[data-test-id="profile-card-company"]'
      ];

      for (const selector of companySelectors) {
        const companyEl = document.querySelector(selector);
        if (companyEl?.textContent) {
          this.context.organization = companyEl.textContent.trim();
          break;
        }
      }

      // Extract connections
      this.context.connections = this.extractConnections();

      console.log('[BTS] LinkedIn context extracted:', this.context);
    } catch (error) {
      console.error('[BTS] Error extracting LinkedIn context:', error);
    }
  }

  private extractConnections(): Connection[] {
    const connections: Connection[] = [];
    
    try {
      // Look for connection suggestions or recent interactions
      const connectionElements = document.querySelectorAll(
        '.discover-entity-card, .mn-connection-card, .feed-shared-actor__name'
      );

      connectionElements.forEach((el, index) => {
        if (index >= 5) return; // Limit connections

        const nameEl = el.querySelector('.discover-person-card__name, .mn-connection-card__name, span[dir="ltr"]');
        const name = nameEl?.textContent?.trim();

        if (name && name !== this.context.username) {
          connections.push({
            name,
            platform: Platform.LINKEDIN,
            relationship: index < 2 ? 'close' : 'network',
            recentInteraction: el.textContent?.includes('Message') ? 'messaging' : undefined
          });
        }
      });
    } catch (error) {
      console.error('[BTS] Error extracting connections:', error);
    }

    return connections;
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check for profile-related elements
              if (element.querySelector('.pv-top-card, .top-card-layout')) {
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
        }, 1000); // Delay for React rendering
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
      platform: Platform.LINKEDIN,
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
    new LinkedInContextReader();
  });
} else {
  new LinkedInContextReader();
}

export { LinkedInContextReader };
