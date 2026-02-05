import { MLInput, MLPrediction, RiskFactor, SimulationEvent, EventType } from '../shared/types';

/**
 * ML Model for Credential Theft Detection
 * Uses TensorFlow.js for in-browser prediction
 */

export class MLModel {
  private model: any = null;
  private loaded: boolean = false;
  private trainingData: SimulationEvent[] = [];
  private readonly CONFIDENCE_THRESHOLD = 0.75;

  /**
   * Initialize the ML model
   */
  async initialize(): Promise<void> {
    try {
      // Try to load TensorFlow.js
      if (typeof tf !== 'undefined') {
        await this.loadModel();
      } else {
        console.log('[BTS] TensorFlow.js not available, using heuristic model');
        this.loaded = true;
      }
    } catch (error) {
      console.error('[BTS] Error initializing ML model:', error);
      // Fallback to heuristic model
      this.loaded = true;
    }
  }

  /**
   * Load TensorFlow.js model
   */
  private async loadModel(): Promise<void> {
    try {
      // In production, load a pre-trained model
      // For now, create a simple model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [12], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 2, activation: 'softmax' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.loaded = true;
      console.log('[BTS] ML model loaded');
    } catch (error) {
      console.error('[BTS] Error loading ML model:', error);
      throw error;
    }
  }

  /**
   * Make prediction on credential entry
   */
  async predict(input: MLInput): Promise<MLPrediction> {
    if (!this.loaded) {
      return this.heuristicPrediction(input);
    }

    try {
      // Extract features
      const features = this.extractFeatures(input);
      
      // If TensorFlow is available, use it
      if (this.model && typeof tf !== 'undefined') {
        const tensor = tf.tensor2d([features]);
        const prediction = this.model.predict(tensor) as any;
        const values = await prediction.data();
        tensor.dispose();
        prediction.dispose();

        const credentialEntryProbability = values[1];
        
        return {
          isCredentialEntry: credentialEntryProbability > this.CONFIDENCE_THRESHOLD,
          confidence: credentialEntryProbability,
          riskFactors: this.identifyRiskFactors(input)
        };
      }

      // Fallback to heuristic
      return this.heuristicPrediction(input);
    } catch (error) {
      console.error('[BTS] Prediction error:', error);
      return this.heuristicPrediction(input);
    }
  }

  /**
   * Heuristic-based prediction (fallback)
   */
  private heuristicPrediction(input: MLInput): MLPrediction {
    let score = 0;
    const riskFactors: RiskFactor[] = [];

    // Factor 1: Password field present
    const hasPassword = input.formFields.some(f => f.isPassword);
    if (hasPassword) {
      score += 0.3;
      riskFactors.push({
        type: 'password_field',
        severity: 'high',
        description: 'Password field detected on page'
      });
    }

    // Factor 2: HTTPS check
    if (!input.url.startsWith('https')) {
      score += 0.2;
      riskFactors.push({
        type: 'insecure_connection',
        severity: 'high',
        description: 'Page uses insecure HTTP connection'
      });
    }

    // Factor 3: Suspicious URL patterns
    if (this.isSuspiciousUrl(input.url)) {
      score += 0.3;
      riskFactors.push({
        type: 'suspicious_url',
        severity: 'high',
        description: 'URL contains suspicious patterns'
      });
    }

    // Factor 4: User behavior - rushed entry
    if (input.userBehavior.timeOnPage < 5000 && input.userBehavior.keystrokes > 10) {
      score += 0.1;
      riskFactors.push({
        type: 'rushed_entry',
        severity: 'low',
        description: 'Quick form entry detected'
      });
    }

    // Factor 5: Hidden fields
    const hiddenFields = input.formFields.filter(f => f.isHidden).length;
    if (hiddenFields > 2) {
      score += 0.1;
      riskFactors.push({
        type: 'hidden_fields',
        severity: 'medium',
        description: 'Multiple hidden form fields detected'
      });
    }

    // Factor 6: Suspicious content
    if (this.hasSuspiciousContent(input.pageContext)) {
      score += 0.2;
      riskFactors.push({
        type: 'urgent_language',
        severity: 'medium',
        description: 'Page uses urgent/pressure language'
      });
    }

    return {
      isCredentialEntry: score > this.CONFIDENCE_THRESHOLD,
      confidence: Math.min(score, 1.0),
      riskFactors
    };
  }

  /**
   * Extract features from input for ML model
   */
  private extractFeatures(input: MLInput): number[] {
    return [
      // Form field features
      input.formFields.filter(f => f.isPassword).length,
      input.formFields.filter(f => f.isHidden).length,
      input.formFields.filter(f => f.type === 'email').length,
      input.formFields.filter(f => f.type === 'text').length,
      
      // URL features
      input.url.startsWith('https') ? 1 : 0,
      this.isSuspiciousUrl(input.url) ? 1 : 0,
      input.url.length > 100 ? 1 : 0,
      
      // Behavior features
      Math.min(input.userBehavior.timeOnPage / 60000, 1), // Normalized to 0-1 (1 min max)
      Math.min(input.userBehavior.mouseMovements / 100, 1),
      Math.min(input.userBehavior.keystrokes / 50, 1),
      Math.min(input.userBehavior.formInteractions / 10, 1),
      
      // Content features
      this.hasSuspiciousContent(input.pageContext) ? 1 : 0
    ];
  }

  /**
   * Check if URL is suspicious
   */
  private isSuspiciousUrl(url: string): boolean {
    const patterns = [
      /phish/i, /fake/i, /login.*verify/i, /security.*check/i,
      /bit\.ly|tinyurl|t\.co/i,
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
    ];
    return patterns.some(p => p.test(url));
  }

  /**
   * Check for suspicious content
   */
  private hasSuspiciousContent(content: string): boolean {
    const keywords = [
      'verify', 'confirm', 'update', 'suspend', 'limited',
      'unusual activity', 'unauthorized', 'breach', 'expired',
      'account will be', 'immediate action', 'click here'
    ];
    const lowerContent = content.toLowerCase();
    return keywords.some(k => lowerContent.includes(k));
  }

  /**
   * Identify specific risk factors
   */
  private identifyRiskFactors(input: MLInput): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (input.formFields.some(f => f.isPassword)) {
      factors.push({
        type: 'password_field',
        severity: 'high',
        description: 'Password field present'
      });
    }

    if (!input.url.startsWith('https')) {
      factors.push({
        type: 'insecure',
        severity: 'high',
        description: 'Not using HTTPS'
      });
    }

    if (this.isSuspiciousUrl(input.url)) {
      factors.push({
        type: 'url',
        severity: 'high',
        description: 'Suspicious URL pattern'
      });
    }

    return factors;
  }

  /**
   * Add training example
   */
  addTrainingExample(event: SimulationEvent): void {
    this.trainingData.push(event);

    // Retrain model periodically
    if (this.trainingData.length >= 100) {
      this.retrainModel();
    }
  }

  /**
   * Retrain model with new data
   */
  private async retrainModel(): Promise<void> {
    if (!this.model || typeof tf === 'undefined') return;

    try {
      console.log('[BTS] Retraining ML model with', this.trainingData.length, 'examples');
      
      // Prepare training data
      // This is simplified - real implementation would be more sophisticated
      const xs: number[][] = [];
      const ys: number[][] = [];

      for (const event of this.trainingData) {
        // Convert event to features
        // Simplified - real implementation would extract proper features
        const features = [
          event.type === EventType.CREDENTIAL_ENTERED ? 1 : 0,
          event.type === EventType.SIMULATION_DETECTED ? 1 : 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        
        xs.push(features);
        ys.push(event.type === EventType.CREDENTIAL_ENTERED ? [0, 1] : [1, 0]);
      }

      const xsTensor = tf.tensor2d(xs);
      const ysTensor = tf.tensor2d(ys);

      await this.model.fit(xsTensor, ysTensor, {
        epochs: 5,
        batchSize: 32,
        verbose: 0
      });

      xsTensor.dispose();
      ysTensor.dispose();

      // Clear training data
      this.trainingData = [];

      console.log('[BTS] Model retrained successfully');
    } catch (error) {
      console.error('[BTS] Error retraining model:', error);
    }
  }

  /**
   * Check if model is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Save model to storage
   */
  async saveModel(): Promise<void> {
    if (!this.model) return;
    
    try {
      // In a real implementation, save to IndexedDB or Chrome storage
      console.log('[BTS] Model saved');
    } catch (error) {
      console.error('[BTS] Error saving model:', error);
    }
  }
}

// Declare TensorFlow types for TypeScript
declare const tf: any;
