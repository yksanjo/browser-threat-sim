import { StorageKeys } from './constants';

/**
 * Chrome Storage Wrapper
 * Provides type-safe access to Chrome extension storage
 */

export class StorageManager {
  private static instance: StorageManager;
  private storage: chrome.storage.StorageArea;

  private constructor() {
    this.storage = chrome.storage.local;
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.storage.get(key);
      return result[key] as T || null;
    } catch (error) {
      console.error(`[BTS] Error getting ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await this.storage.set({ [key]: value });
    } catch (error) {
      console.error(`[BTS] Error setting ${key} in storage:`, error);
      throw error;
    }
  }

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await this.storage.remove(key);
    } catch (error) {
      console.error(`[BTS] Error removing ${key} from storage:`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      console.error('[BTS] Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from storage
   */
  async getMultiple<T extends Record<string, unknown>>(
    keys: string[]
  ): Promise<Partial<T>> {
    try {
      const result = await this.storage.get(keys);
      return result as Partial<T>;
    } catch (error) {
      console.error('[BTS] Error getting multiple keys from storage:', error);
      return {};
    }
  }

  /**
   * Set multiple values in storage
   */
  async setMultiple<T extends Record<string, unknown>>(
    items: T
  ): Promise<void> {
    try {
      await this.storage.set(items);
    } catch (error) {
      console.error('[BTS] Error setting multiple items in storage:', error);
      throw error;
    }
  }

  /**
   * Listen for storage changes
   */
  onChanged(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        callback(changes);
      }
    });
  }

  /**
   * Get storage usage
   */
  async getUsage(): Promise<{ used: number; available: number }> {
    try {
      const bytes = await this.storage.getBytesInUse();
      return {
        used: bytes,
        available: chrome.storage.local.QUOTA_BYTES - bytes
      };
    } catch (error) {
      console.error('[BTS] Error getting storage usage:', error);
      return { used: 0, available: 0 };
    }
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();

// Typed storage helpers for specific data types
export const UserStorage = {
  async getStats() {
    return storage.get(StorageKeys.USER_STATS);
  },

  async setStats(stats: unknown) {
    return storage.set(StorageKeys.USER_STATS, stats);
  },

  async getContext() {
    return storage.get(StorageKeys.USER_CONTEXT);
  },

  async setContext(context: unknown) {
    return storage.set(StorageKeys.USER_CONTEXT, context);
  }
};

export const ConfigStorage = {
  async getDashboardConfig() {
    return storage.get(StorageKeys.DASHBOARD_CONFIG);
  },

  async setDashboardConfig(config: unknown) {
    return storage.set(StorageKeys.DASHBOARD_CONFIG, config);
  },

  async getExtensionState() {
    return storage.get(StorageKeys.EXTENSION_STATE);
  },

  async setExtensionState(state: unknown) {
    return storage.set(StorageKeys.EXTENSION_STATE, state);
  }
};

export const SimulationStorage = {
  async getDetectedSimulations(): Promise<string[]> {
    return storage.get(StorageKeys.DETECTED_SIMULATIONS) || [];
  },

  async addDetectedSimulation(simulationId: string): Promise<void> {
    const detected = await this.getDetectedSimulations();
    if (!detected.includes(simulationId)) {
      detected.push(simulationId);
      await storage.set(StorageKeys.DETECTED_SIMULATIONS, detected);
    }
  },

  async clearDetectedSimulations(): Promise<void> {
    await storage.set(StorageKeys.DETECTED_SIMULATIONS, []);
  }
};
