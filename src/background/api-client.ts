import { UserStats, SimulationEvent, Campaign, DashboardConfig } from '../shared/types';
import { STORAGE_KEYS, API_ENDPOINTS, DEFAULT_DASHBOARD_URL } from '../shared/constants';
import { storage } from '../shared/storage';

/**
 * API Client for CISO Dashboard Communication
 */

export class ApiClient {
  private baseUrl: string = DEFAULT_DASHBOARD_URL;
  private apiKey: string = '';
  private organizationId: string = '';
  private initialized: boolean = false;

  constructor() {
    this.loadConfig();
  }

  /**
   * Load dashboard configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const config = await storage.get<DashboardConfig>(STORAGE_KEYS.DASHBOARD_CONFIG);
      if (config) {
        this.baseUrl = config.apiEndpoint || DEFAULT_DASHBOARD_URL;
        this.apiKey = config.apiKey || '';
        this.organizationId = config.organizationId || '';
        this.initialized = true;
      }
    } catch (error) {
      console.error('[BTS] Error loading API config:', error);
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    if (!this.initialized) {
      await this.loadConfig();
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Organization-ID': this.organizationId,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`[BTS] API request failed: ${endpoint}`, error);
      return null;
    }
  }

  /**
   * Send simulation event to dashboard
   */
  async sendEvent(event: SimulationEvent): Promise<boolean> {
    try {
      await this.request(API_ENDPOINTS.EVENTS, {
        method: 'POST',
        body: JSON.stringify(event)
      });
      return true;
    } catch (error) {
      console.error('[BTS] Error sending event:', error);
      // Queue for retry
      await this.queueEvent(event);
      return false;
    }
  }

  /**
   * Sync user stats with dashboard
   */
  async syncStats(stats: UserStats): Promise<boolean> {
    try {
      await this.request(API_ENDPOINTS.STATS, {
        method: 'POST',
        body: JSON.stringify(stats)
      });
      return true;
    } catch (error) {
      console.error('[BTS] Error syncing stats:', error);
      return false;
    }
  }

  /**
   * Get campaign configuration
   */
  async getCampaignConfig(): Promise<{ campaignId: string; active: boolean } | null> {
    return this.request<{ campaignId: string; active: boolean }>(API_ENDPOINTS.CONFIG);
  }

  /**
   * Get active campaigns
   */
  async getCampaigns(): Promise<Campaign[] | null> {
    return this.request<Campaign[]>(API_ENDPOINTS.CAMPAIGNS);
  }

  /**
   * Get user stats from dashboard
   */
  async getDashboardStats(userId: string): Promise<UserStats | null> {
    return this.request<UserStats>(`${API_ENDPOINTS.STATS}/${userId}`);
  }

  /**
   * Queue event for retry
   */
  private async queueEvent(event: SimulationEvent): Promise<void> {
    try {
      const queue = await storage.get<SimulationEvent[]>('bts_event_queue') || [];
      queue.push(event);
      await storage.set('bts_event_queue', queue);
    } catch (error) {
      console.error('[BTS] Error queuing event:', error);
    }
  }

  /**
   * Process queued events
   */
  async processQueue(): Promise<void> {
    try {
      const queue = await storage.get<SimulationEvent[]>('bts_event_queue') || [];
      if (queue.length === 0) return;

      const failed: SimulationEvent[] = [];

      for (const event of queue) {
        const success = await this.sendEvent(event);
        if (!success) {
          failed.push(event);
        }
      }

      // Update queue with remaining failed events
      await storage.set('bts_event_queue', failed);
    } catch (error) {
      console.error('[BTS] Error processing queue:', error);
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<DashboardConfig>): Promise<void> {
    try {
      const current = await storage.get<DashboardConfig>(STORAGE_KEYS.DASHBOARD_CONFIG) || {
        apiEndpoint: DEFAULT_DASHBOARD_URL,
        apiKey: '',
        organizationId: '',
        reportingInterval: 60000
      };

      const updated = { ...current, ...config };
      await storage.set(STORAGE_KEYS.DASHBOARD_CONFIG, updated);

      this.baseUrl = updated.apiEndpoint;
      this.apiKey = updated.apiKey;
      this.organizationId = updated.organizationId;
      this.initialized = true;
    } catch (error) {
      console.error('[BTS] Error updating config:', error);
      throw error;
    }
  }

  /**
   * Test connection to dashboard
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ status: string }>('/api/health');
      
      if (response) {
        return { success: true, message: 'Connected to dashboard successfully' };
      }
      
      return { success: false, message: 'Could not connect to dashboard' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error}` };
    }
  }

  /**
   * Get red team scenarios
   */
  async getRedTeamScenarios(): Promise<any[] | null> {
    return this.request<any[]>(`${API_ENDPOINTS.REDTEAM}/scenarios`);
  }

  /**
   * Submit red team scenario result
   */
  async submitRedTeamResult(scenarioId: string, result: any): Promise<boolean> {
    try {
      await this.request(`${API_ENDPOINTS.REDTEAM}/results`, {
        method: 'POST',
        body: JSON.stringify({ scenarioId, result, timestamp: Date.now() })
      });
      return true;
    } catch (error) {
      console.error('[BTS] Error submitting red team result:', error);
      return false;
    }
  }
}
