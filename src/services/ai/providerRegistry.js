import { DeterministicNLPProvider } from './deterministicNLPProvider.js';
import { GeminiAIProvider } from './geminiProvider.js';

let activeProviderInstance = null;

/**
 * Returns the currently active AI Provider instance
 * @returns {AIProviderInterface}
 */
export function getActiveAIProvider() {
  if (!activeProviderInstance) {
    // If Gemini key is set, use Gemini with fallback, otherwise use Deterministic engine
    const hasGeminiKey = typeof import.meta !== 'undefined' && import.meta.env && Boolean(import.meta.env.VITE_GEMINI_API_KEY);
    activeProviderInstance = hasGeminiKey ? new GeminiAIProvider() : new DeterministicNLPProvider();
  }
  return activeProviderInstance;
}

/**
 * Explicitly sets or swaps the active AI provider
 * @param {string|object} provider - 'deterministic' | 'gemini' | custom AIProviderInterface instance
 */
export function setActiveAIProvider(provider) {
  if (typeof provider === 'string') {
    if (provider.toLowerCase() === 'gemini') {
      activeProviderInstance = new GeminiAIProvider();
    } else {
      activeProviderInstance = new DeterministicNLPProvider();
    }
  } else if (provider && typeof provider.analyze === 'function') {
    activeProviderInstance = provider;
  }
  return activeProviderInstance;
}

/**
 * Diagnostic helper to check connectivity of current AI provider
 */
export async function checkAIConnectivity(options = {}) {
  const provider = getActiveAIProvider();
  if (provider && typeof provider.checkConnection === 'function') {
    return provider.checkConnection(options);
  }
  return {
    ok: true,
    model: 'DeterministicNLPProvider',
    hasApiKey: false,
    status: 200,
    statusText: 'OK',
    errorStatus: null,
    message: 'Local deterministic NLP engine active.',
    durationMs: 0
  };
}
