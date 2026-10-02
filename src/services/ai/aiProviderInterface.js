/**
 * AI Provider Interface Specification
 * Allows swapping between Gemini, Anthropic, OpenAI, or local/deterministic engines.
 */
export class AIProviderInterface {
  constructor(name = 'AbstractProvider') {
    this.name = name;
  }

  /**
   * Analyzes source data and returns a structured analysis payload
   * @param {object} sourceData - Module 1 source payload
   * @param {object} options - Options including timeout, temperature, onProgress
   * @returns {Promise<object>} - Raw or structured analysis output
   */
  async analyze(sourceData, options = {}) {
    throw new Error(`Method analyze() not implemented on provider: ${this.name}`);
  }

  /**
   * Transforms source data and Module 2 analysis according to user configuration
   * @param {object} transformationRequest - Module 3 transformation request
   * @param {object} options - Options including timeout, temperature, onProgress
   * @returns {Promise<Array<object>>} - Generated outputs array
   */
  async transform(transformationRequest, options = {}) {
    throw new Error(`Method transform() not implemented on provider: ${this.name}`);
  }

  /**
   * Health check to test provider readiness
   */
  async isAvailable() {
    return true;
  }
}
