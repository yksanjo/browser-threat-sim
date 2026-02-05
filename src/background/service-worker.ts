import { ExtensionState, UserStats, SimulationEvent, EventType, UserContext, Platform } from '../shared/types';
import { STORAGE_KEYS, SYNC_INTERVAL_MS } from '../shared/constants';
import { storage } from '../shared/storage';
import { ApiClient } from './api-client';
import { SimulationEngine } from './simulation-engine';
import { MLModel } from './ml-model';

/**
 * Browser Threat Simulator - Background Service Worker
 * Main service worker handling all background tasks
 */

class BackgroundService {
  private apiClient: ApiClient;
  private simulationEngine: SimulationEngine;
  private mlModel: MLModel;
  private syncInterval: number | null = null;
  private extensionState: ExtensionState = {
    enabled: true,
    userStats: this.createDefaultStats(),
    lastSync: 0,
    detectedSimulations: []
  };
  private userContext: Partial<Record<Platform, UserContext>> = {};

  constructor() {
    this.apiClient = new ApiClient();
    this.simulationEngine = new SimulationEngine();
    this.mlModel = new MLModel();
    this.init();
  }

  private async init(): Promise<void> {
    console.log('[BTS] Service Worker initializing...');

    // Load stored state
    await this.loadState();

    // Setup event listeners
    this.setupMessageListeners();
    this.setupTabListeners();
    this.setupAlarmListeners();

    // Initialize ML model
    await this.mlModel.initialize();

    // Start sync interval
    this.startSyncInterval();

    console.log('[BTS] Service Worker initialized');
  }

  /**
   * Load extension state from storage
   */
  private async loadState(): Promise<void> {
    try {
      const state = await storage.get<ExtensionState>(STORAGE_KEYS.EXTENSION_STATE);
      if (state) {
        this.extensionState = { ...this.extensionState, ...state };
      }

      // Load user contexts
      const contexts = await storage.get<Partial<Record<Platform, UserContext>>>(STORAGE_KEYS.USER_CONTEXT);
      if (contexts) {
        this.userContext = contexts;
      }
    } catch (error) {
      console.error('[BTS] Error loading state:', error);
    }
  }

  /**
   * Save extension state to storage
   */
  private async saveState(): Promise<void> {
    try {
      await storage.set(STORAGE_KEYS.EXTENSION_STATE, this.extensionState);
    } catch (error) {
      console.error('[BTS] Error saving state:', error);
    }
  }

  /**
   * Setup message listeners from content scripts and popup
   */
  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'CONTEXT_UPDATE':
          await this.handleContextUpdate(message.platform, message.context);
          sendResponse({ success: true });
          break;

        case 'SIMULATION_EVENT':
          await this.handleSimulationEvent(message.event);
          sendResponse({ success: true });
          break;

        case 'CREDENTIAL_ENTRY_DETECTED':
          await this.handleCredentialEntry(message.data);
          sendResponse({ success: true });
          break;

        case 'CREDENTIAL_RISK_ALERT_SHOWN':
          await this.handleRiskAlertShown(message);
          sendResponse({ success: true });
          break;

        case 'REPORT_SUSPICIOUS_SITE':
          await this.handleSuspiciousSiteReport(message);
          sendResponse({ success: true });
          break;

        case 'ML_PREDICT':
          const prediction = await this.mlModel.predict(message.input);
          sendResponse({ prediction });
          break;

        case 'CHECK_ML_STATUS':
          sendResponse({ available: this.mlModel.isLoaded() });
          break;

        case 'GET_USER_STATS':
          sendResponse({ stats: this.extensionState.userStats });
          break;

        case 'GET_EXTENSION_STATE':
          sendResponse({ state: this.extensionState });
          break;

        case 'SET_EXTENSION_ENABLED':
          this.extensionState.enabled = message.enabled;
          await this.saveState();
          sendResponse({ success: true });
          break;

        case 'TRIGGER_SIMULATION':
          await this.triggerSimulation(message.simulation);
          sendResponse({ success: true });
          break;

        case 'SYNC_NOW':
          await this.syncWithDashboard();
          sendResponse({ success: true });
          break;

        default:
          console.warn('[BTS] Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[BTS] Error handling message:', error);
      sendResponse({ success: false, error: String(error) });
    }
  }

  /**
   * Handle context updates from content scripts
   */
  private async handleContextUpdate(platform: Platform, context: Partial<UserContext>): Promise<void> {
    console.log('[BTS] Context update from', platform, context);

    // Store context
    this.userContext[platform] = {
      ...context,
      platform,
      timestamp: Date.now()
    } as UserContext;

    await storage.set(STORAGE_KEYS.USER_CONTEXT, this.userContext);

    // Check if we should trigger a simulation
    if (this.extensionState.enabled && this.extensionState.currentCampaign) {
      const shouldSimulate = await this.simulationEngine.shouldTriggerSimulation(
        platform,
        this.userContext[platform]!
      );

      if (shouldSimulate) {
        await this.injectSimulation(platform);
      }
    }
  }

  /**
   * Handle simulation events from content scripts
   */
  private async handleSimulationEvent(event: SimulationEvent): Promise<void> {
    console.log('[BTS] Simulation event:', event);

    // Update stats based on event type
    const stats = this.extensionState.userStats;
    stats.simulationsSeen++;

    switch (event.type) {
      case EventType.LINK_CLICKED:
        stats.simulationsClicked++;
        stats.riskScore += 25;
        break;

      case EventType.CREDENTIAL_ENTERED:
        stats.credentialsEntered++;
        stats.riskScore += 50;
        break;

      case EventType.SIMULATION_DETECTED:
        stats.simulationsDetected++;
        stats.riskScore = Math.max(0, stats.riskScore - 20);
        break;

      case EventType.REPORTED_PHISHING:
        stats.simulationsDetected++;
        stats.riskScore = Math.max(0, stats.riskScore - 30);
        break;
    }

    // Update detection time if detected
    if (event.type === EventType.SIMULATION_DETECTED && event.metadata?.shownAt) {
      const detectionTime = event.timestamp - event.metadata.shownAt;
      this.updateAverageDetectionTime(detectionTime);
    }

    stats.lastUpdated = Date.now();
    await this.saveState();

    // Send to dashboard
    await this.apiClient.sendEvent(event);

    // Add to training data for ML model
    this.mlModel.addTrainingExample(event);
  }

  /**
   * Handle credential entry detection
   */
  private async handleCredentialEntry(data: Record<string, unknown>): Promise<void> {
    console.log('[BTS] Credential entry detected:', data);

    // Update stats
    this.extensionState.userStats.credentialsEntered++;
    this.extensionState.userStats.riskScore += 50;
    await this.saveState();

    // Report to dashboard
    await this.apiClient.sendEvent({
      id: this.generateId(),
      simulationId: data.simulationId as string || 'unknown',
      type: EventType.CREDENTIAL_ENTERED,
      timestamp: Date.now(),
      url: data.url as string,
      context: this.userContext[data.platform as Platform] || { platform: Platform.UNKNOWN, timestamp: Date.now() },
      metadata: {
        hasUsername: data.hasUsername,
        hasPassword: data.hasPassword,
        isSuspicious: data.isSuspicious,
        detectionMethod: data.detectionMethod || 'heuristic'
      }
    });
  }

  /**
   * Handle risk alert shown
   */
  private async handleRiskAlertShown(data: { url: string; confidence: number }): Promise<void> {
    await this.apiClient.sendEvent({
      id: this.generateId(),
      simulationId: 'risk-alert',
      type: EventType.SIMULATION_DETECTED,
      timestamp: Date.now(),
      url: data.url,
      context: { platform: Platform.UNKNOWN, timestamp: Date.now() },
      metadata: {
        alertType: 'credential_risk',
        confidence: data.confidence
      }
    });
  }

  /**
   * Handle suspicious site report
   */
  private async handleSuspiciousSiteReport(data: { url: string }): Promise<void> {
    console.log('[BTS] Suspicious site reported:', data.url);

    // Update stats
    this.extensionState.userStats.simulationsDetected++;
    this.extensionState.userStats.riskScore = Math.max(0, this.extensionState.userStats.riskScore - 30);
    await this.saveState();

    // Report to dashboard
    await this.apiClient.sendEvent({
      id: this.generateId(),
      simulationId: 'user-report',
      type: EventType.REPORTED_PHISHING,
      timestamp: Date.now(),
      url: data.url,
      context: { platform: Platform.UNKNOWN, timestamp: Date.now() },
      metadata: {}
    });

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon48.png',
      title: 'Site Reported',
      message: 'Thank you for reporting this suspicious site. Your security team has been notified.'
    });
  }

  /**
   * Inject a simulation into a page
   */
  private async injectSimulation(platform: Platform): Promise<void> {
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      // Generate simulation
      const simulation = await this.simulationEngine.generateSimulation(
        platform,
        this.userContext[platform]!
      );

      // Inject via content script
      await chrome.tabs.sendMessage(tab.id, {
        type: 'INJECT_SIMULATION',
        simulation
      });

      console.log('[BTS] Simulation injected:', simulation.id);
    } catch (error) {
      console.error('[BTS] Error injecting simulation:', error);
    }
  }

  /**
   * Trigger a simulation manually
   */
  private async triggerSimulation(simulationData: any): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: 'INJECT_SIMULATION',
      simulation: simulationData
    });
  }

  /**
   * Setup tab change listeners
   */
  private setupTabListeners(): void {
    chrome.tabs.onActivated.addListener(() => {
      // Check for simulation opportunities when tab changes
      this.checkForSimulationOpportunity();
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        // Page loaded, could be opportunity for simulation
        this.checkForSimulationOpportunity();
      }
    });
  }

  /**
   * Setup alarm listeners for periodic tasks
   */
  private setupAlarmListeners(): void {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'sync-dashboard') {
        this.syncWithDashboard();
      }
    });

    // Create sync alarm
    chrome.alarms.create('sync-dashboard', {
      periodInMinutes: 1
    });
  }

  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      this.syncWithDashboard();
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Sync data with dashboard
   */
  private async syncWithDashboard(): Promise<void> {
    try {
      // Sync stats
      await this.apiClient.syncStats(this.extensionState.userStats);

      // Get updated campaign config
      const config = await this.apiClient.getCampaignConfig();
      if (config) {
        this.extensionState.currentCampaign = config.campaignId;
      }

      this.extensionState.lastSync = Date.now();
      await this.saveState();

      console.log('[BTS] Synced with dashboard');
    } catch (error) {
      console.error('[BTS] Error syncing with dashboard:', error);
    }
  }

  /**
   * Check for simulation opportunity
   */
  private async checkForSimulationOpportunity(): Promise<void> {
    if (!this.extensionState.enabled || !this.extensionState.currentCampaign) {
      return;
    }

    // Logic to determine if we should show simulation now
    // This is handled by context updates, but could add additional logic here
  }

  /**
   * Update average detection time
   */
  private updateAverageDetectionTime(newTime: number): void {
    const stats = this.extensionState.userStats;
    const current = stats.averageDetectionTime;
    const count = stats.simulationsDetected;

    stats.averageDetectionTime = (current * (count - 1) + newTime) / count;
  }

  /**
   * Create default user stats
   */
  private createDefaultStats(): UserStats {
    return {
      userId: this.generateId(),
      simulationsSeen: 0,
      simulationsClicked: 0,
      credentialsEntered: 0,
      simulationsDetected: 0,
      averageDetectionTime: 0,
      difficultyProgression: {
        currentLevel: 'easy',
        successRate: 0,
        consecutiveSuccesses: 0,
        consecutiveFailures: 0
      },
      riskScore: 50,
      lastUpdated: Date.now()
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Initialize service worker
new BackgroundService();

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('[BTS] Extension started');
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[BTS] Extension installed:', details.reason);
});
