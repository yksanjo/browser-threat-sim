import { UserContext, Platform, Activity } from '../shared/types';

/**
 * GitHub Context Reader
 * Extracts user context from GitHub pages for contextual phishing simulations
 */

class GitHubContextReader {
  private context: Partial<UserContext> = {
    platform: Platform.GITHUB,
    timestamp: Date.now()
  };

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.isGitHubPage()) {
      this.extractContext();
      this.setupMutationObserver();
      this.reportContext();
    }
  }

  private isGitHubPage(): boolean {
    return window.location.hostname === 'github.com';
  }

  private extractContext(): void {
    try {
      // Extract username
      const usernameElement = document.querySelector('[data-login]');
      if (usernameElement) {
        this.context.username = usernameElement.getAttribute('data-login') || undefined;
      }

      // Alternative: get from meta or URL
      if (!this.context.username) {
        const metaUser = document.querySelector('meta[name="user-login"]');
        if (metaUser) {
          this.context.username = metaUser.getAttribute('content') || undefined;
        }
      }

      // Extract email from profile page
      const emailElements = document.querySelectorAll('a[href^="mailto:"]');
      if (emailElements.length > 0) {
        const emailHref = emailElements[0].getAttribute('href');
        if (emailHref) {
          this.context.email = emailHref.replace('mailto:', '');
        }
      }

      // Extract organization
      const orgElements = document.querySelectorAll('[data-hovercard-type="organization"]');
      if (orgElements.length > 0) {
        const org = orgElements[0].textContent?.trim();
        if (org) {
          this.context.organization = org;
        }
      }

      // Extract recent activity
      this.context.recentActivity = this.extractRecentActivity();

      console.log('[BTS] GitHub context extracted:', this.context);
    } catch (error) {
      console.error('[BTS] Error extracting GitHub context:', error);
    }
  }

  private extractRecentActivity(): Activity[] {
    const activities: Activity[] = [];
    
    try {
      // Extract from news feed / dashboard
      const activityElements = document.querySelectorAll('.notification-list-item, .dashboard .js-news-feed-event');
      
      activityElements.forEach((el, index) => {
        if (index >= 5) return; // Limit to 5 recent activities
        
        const text = el.textContent?.trim();
        if (text) {
          activities.push({
            type: 'github_activity',
            content: text.substring(0, 200), // Limit length
            timestamp: Date.now() - (index * 3600000) // Estimate timestamp
          });
        }
      });

      // Extract repository info if on repo page
      if (window.location.pathname.includes('/')) {
        const repoName = document.querySelector('strong[itemprop="name"]');
        if (repoName) {
          activities.push({
            type: 'repository_view',
            content: `Viewing repository: ${repoName.textContent}`,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('[BTS] Error extracting activities:', error);
    }

    return activities;
  }

  private setupMutationObserver(): void {
    // Re-extract context when DOM changes (single page app navigation)
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if significant elements were added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches('[data-login], .js-news-feed-event')) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        this.extractContext();
        this.reportContext();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private reportContext(): void {
    // Send context to background script
    chrome.runtime.sendMessage({
      type: 'CONTEXT_UPDATE',
      platform: Platform.GITHUB,
      context: this.context
    }).catch(err => {
      console.error('[BTS] Error reporting context:', err);
    });
  }

  public getContext(): Partial<UserContext> {
    return this.context;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GitHubContextReader();
  });
} else {
  new GitHubContextReader();
}

export { GitHubContextReader };
