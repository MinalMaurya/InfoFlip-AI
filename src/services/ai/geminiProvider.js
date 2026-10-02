import { AIProviderInterface } from './aiProviderInterface.js';
import { DeterministicNLPProvider } from './deterministicNLPProvider.js';
import { buildTransformationSystemPrompt, buildTransformationUserPrompt } from '../transformation/transformationPrompts.js';
import { createOutputItem } from '../../types/transformation.js';
import { buildCommunicationSystemPrompt, buildCommunicationUserPrompt } from '../communication/communicationPrompts.js';
import { createCommunicationOutputItem } from '../../types/communication.js';
import { DeterministicCommunicationProvider } from '../communication/deterministicCommunicationProvider.js';

/**
 * Global quota exhaustion tracker within the active browser session.
 * Prevents repeating doomed API requests when free-tier daily quota is already exhausted.
 */
let isGlobalQuotaExhausted = false;
let quotaExhaustedTimestamp = null;

export function getQuotaExhaustionStatus() {
  return {
    isExhausted: isGlobalQuotaExhausted,
    exhaustedAt: quotaExhaustedTimestamp
  };
}

export function resetQuotaExhaustionStatus() {
  isGlobalQuotaExhausted = false;
  quotaExhaustedTimestamp = null;
}

/**
 * Safely redacts API keys and sensitive tokens from error messages, URLs, and logs.
 * Never exposes the Gemini API key in logs, UI, or exceptions.
 * 
 * @param {string} text - Text possibly containing sensitive credentials
 * @param {string|null} apiKey - Active API key to redact
 * @returns {string} - Cleaned text safe for logging
 */
export function redactApiKey(text, apiKey = null) {
  if (!text) return '';
  let cleaned = String(text);
  if (apiKey) {
    cleaned = cleaned.replaceAll(apiKey, '[REDACTED_API_KEY]');
  }
  // Strip query string key parameter: ?key=... or &key=...
  cleaned = cleaned.replace(/([?&]key=)[^&\s"']+/gi, '$1[REDACTED_API_KEY]');
  return cleaned;
}

/**
 * Detects whether an error from the Gemini API represents non-transient quota exhaustion
 * (such as daily limits, free-tier request limits, or account billing exhaustion)
 * versus a momentary transient concurrency spike.
 * 
 * Specifically matches:
 * - HTTP 429 with status RESOURCE_EXHAUSTED or QUOTA_EXHAUSTED
 * - Error messages containing:
 *   - "quota"
 *   - "quota exceeded"
 *   - "free_tier" / "free tier"
 *   - "generate_content_free_tier_requests"
 *   - "GenerateRequestsPerDayPerProjectPerModel-FreeTier"
 *   - "plan and billing" / "billing details"
 * 
 * @param {number} errCode - HTTP status code
 * @param {string} errStatus - Error status string (e.g. 'RESOURCE_EXHAUSTED')
 * @param {string} errMessage - Error message details
 * @returns {boolean} - True if quota is exhausted
 */
export function isQuotaExhaustionError(errCode, errStatus = '', errMessage = '') {
  const code = Number(errCode);
  const statusStr = String(errStatus || '').toUpperCase();
  const msg = String(errMessage || '').toLowerCase();

  const isExplicitQuotaMessage = (
    msg.includes('quota') ||
    msg.includes('quota exceeded') ||
    msg.includes('free_tier') ||
    msg.includes('free tier') ||
    msg.includes('generate_content_free_tier_requests') ||
    msg.includes('generaterequestsperdayperprojectpermodel-freetier') ||
    msg.includes('exceeded your current quota') ||
    msg.includes('plan and billing') ||
    msg.includes('billing details') ||
    msg.includes('daily limit') ||
    msg.includes('per-day') ||
    msg.includes('per day')
  );

  // If status is RESOURCE_EXHAUSTED or QUOTA_EXHAUSTED and message contains quota indicators
  if (code === 429 && (statusStr === 'RESOURCE_EXHAUSTED' || statusStr === 'QUOTA_EXHAUSTED' || isExplicitQuotaMessage)) {
    // If message is generic concurrency without any quota indicator, it is treated as temporary rate limit
    if (!isExplicitQuotaMessage && (msg.includes('rate_limit') || msg.includes('too_many_requests') || msg.includes('concurrent'))) {
      return false;
    }
    return true;
  }

  // Also catch when message explicitly indicates quota exhaustion regardless of code
  if (isExplicitQuotaMessage && (code === 429 || statusStr === 'RESOURCE_EXHAUSTED')) {
    return true;
  }

  return false;
}

/**
 * Classifies a Gemini API error into distinct operational categories:
 * - 'QUOTA_EXHAUSTED': Hard free-tier or daily quota reached (immediate fallback, NO RETRY)
 * - 'RATE_LIMITED': Temporary concurrency / burst per-second rate limit (limited retry)
 * - 'SERVICE_UNAVAILABLE': HTTP 503 server capacity spike (limited retry)
 * - 'AUTHENTICATION_ERROR': 401, 403 (non-transient, no retry)
 * - 'INVALID_REQUEST': 400 (non-transient, no retry)
 * - 'UNKNOWN': Other errors
 * 
 * @param {number} errCode
 * @param {string} errStatus
 * @param {string} errMessage
 * @returns {'QUOTA_EXHAUSTED' | 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'AUTHENTICATION_ERROR' | 'INVALID_REQUEST' | 'UNKNOWN'}
 */
export function classifyGeminiError(errCode, errStatus = '', errMessage = '') {
  const code = Number(errCode);
  const statusUpper = String(errStatus || '').toUpperCase();
  const msgLower = String(errMessage || '').toLowerCase();

  // 1. Quota Exhaustion (Non-retryable daily / free-tier limit)
  if (isQuotaExhaustionError(code, statusUpper, msgLower)) {
    return 'QUOTA_EXHAUSTED';
  }

  // 2. Temporary Rate Limit (Retryable concurrency / burst TPS throttle)
  if (code === 429 || statusUpper === 'RATE_LIMITED' || msgLower.includes('rate_limit') || msgLower.includes('too_many_requests')) {
    return 'RATE_LIMITED';
  }

  // 3. Service Unavailable (Retryable 503 capacity spike)
  if (code === 503 || statusUpper === 'UNAVAILABLE' || statusUpper === 'SERVICE_UNAVAILABLE') {
    return 'SERVICE_UNAVAILABLE';
  }

  // 4. Authentication Error (Non-retryable 401 / 403)
  if (code === 401 || code === 403 || statusUpper === 'UNAUTHENTICATED' || statusUpper === 'PERMISSION_DENIED' || msgLower.includes('api key') || msgLower.includes('unauthorized')) {
    return 'AUTHENTICATION_ERROR';
  }

  // 5. Invalid Request (Non-retryable 400)
  if (code === 400 || statusUpper === 'INVALID_ARGUMENT' || statusUpper === 'BAD_REQUEST') {
    return 'INVALID_REQUEST';
  }

  return 'UNKNOWN';
}

/**
 * Core REST helper for invoking Google Gemini models via generateContent.
 * 
 * Responsibilities:
 * - Construct official v1beta REST endpoint
 * - Construct compatible request payload (system_instruction, contents, generationConfig)
 * - Support Gemini 3 series thinkingConfig (thinkingLevel: 'low' | 'medium' | 'high')
 * - Safe response parsing & Markdown fence stripping for JSON mode
 * - Robust error extraction (code, status, message, category)
 * - Developer diagnostics conforming to requirements without exposing credentials
 * - Timeout handling via AbortController
 * - Instant fallback for 429 quota exhaustion (zero retries)
 * - Limited exponential-backoff retries only for genuinely transient 429/503 errors
 * 
 * @param {object} options
 * @param {string} options.apiKey - Gemini API key
 * @param {string} [options.model='gemini-3.8-flash'] - Target model identifier
 * @param {string} [options.systemInstruction] - Optional system instruction text
 * @param {string} [options.prompt] - User prompt text
 * @param {Array<object>} [options.contents] - Optional raw contents array
 * @param {boolean} [options.jsonMode=false] - Whether to require application/json output
 * @param {string} [options.thinkingLevel='low'] - Thinking depth ('low', 'medium', 'high')
 * @param {number} [options.temperature=0.2] - Sampling temperature
 * @param {number} [options.timeoutMs=25000] - Abort timeout in milliseconds
 * @param {number} [options.retries=1] - Retries for genuinely transient errors
 * @param {number} [options.retryDelayMs=800] - Base delay before retrying transient errors
 * @param {function} [options.fetchFn] - Optional fetch override for testing
 * @returns {Promise<{ text: string, json: any, data: object, finishReason: string, usage: object }>}
 */
export async function callGeminiGenerateContent({
  apiKey,
  model = 'gemini-3.8-flash',
  systemInstruction = null,
  prompt = null,
  contents = null,
  jsonMode = false,
  thinkingLevel = 'low',
  temperature = 0.2,
  timeoutMs = 20000,
  retries = 1,
  retryDelayMs = 800,
  fetchFn = null
}) {
  if (!apiKey) {
    throw new Error('Gemini API key is required but was not provided.');
  }

  const fetchImpl = fetchFn || (typeof globalThis !== 'undefined' ? globalThis.fetch : fetch);
  if (typeof fetchImpl !== 'function') {
    throw new Error('Global fetch API is not available in the current environment.');
  }

  const defaultModel = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL)
    ? import.meta.env.VITE_GEMINI_MODEL
    : 'gemini-3.8-flash';
  const modelName = model || defaultModel;
  // Use clean endpoint URL without ?key= parameter to prevent browser console from printing key on network errors
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;

  // Construct request body
  const bodyPayload = {};

  if (systemInstruction) {
    bodyPayload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  if (Array.isArray(contents) && contents.length > 0) {
    bodyPayload.contents = contents;
  } else if (prompt) {
    bodyPayload.contents = [
      {
        parts: [{ text: prompt }]
      }
    ];
  } else {
    throw new Error('Either prompt or contents must be provided to callGeminiGenerateContent.');
  }

  const generationConfig = {
    temperature: typeof temperature === 'number' ? temperature : 0.2
  };

  if (jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  // Configure thinkingLevel for Gemini 3 series models to optimize latency and prevent server timeouts
  if (thinkingLevel && typeof thinkingLevel === 'string') {
    generationConfig.thinkingConfig = {
      thinkingLevel
    };
  }

  bodyPayload.generationConfig = generationConfig;

  // Maximum attempts: at most 1 retry (max 2 attempts total) for transient errors (503/429 rate limit)
  const maxRetries = Math.min(typeof retries === 'number' && retries >= 0 ? retries : 1, 1);
  const maxAttempts = maxRetries + 1;
  const baseRetryDelay = Math.min(typeof retryDelayMs === 'number' && retryDelayMs > 0 ? retryDelayMs : 800, 1000);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    // Do not increase timeout beyond 20 seconds
    const timeout = Math.min(timeoutMs || 20000, 20000);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errCode = response.status;
        let errStatus = response.statusText || 'UNKNOWN_STATUS';
        let errMessage = `HTTP error ${response.status}`;

        try {
          const rawErrorBody = await response.text();
          if (rawErrorBody) {
            const parsedError = JSON.parse(rawErrorBody);
            if (parsedError?.error) {
              errCode = parsedError.error.code || errCode;
              errStatus = parsedError.error.status || errStatus;
              errMessage = parsedError.error.message || errMessage;
            } else {
              errMessage = rawErrorBody;
            }
          }
        } catch {
          // If response body is not JSON, retain default status text
        }

        const safeMessage = redactApiKey(errMessage, apiKey);
        const errorCategory = classifyGeminiError(errCode, errStatus, safeMessage);
        const isQuotaExhausted = errorCategory === 'QUOTA_EXHAUSTED';
        const isTransient = (errorCategory === 'RATE_LIMITED' || errorCategory === 'SERVICE_UNAVAILABLE');

        // Structured diagnostic logging conforming strictly to Requirement 7:
        console.warn(
          `Gemini API:\nHTTP ${errCode}\nCategory: ${errorCategory}\nProvider fallback: DeterministicFallback\nStatus: ${errStatus}\nMessage: ${safeMessage}`
        );

        const error = new Error(`Gemini API error: HTTP ${errCode} [${errStatus}]: ${safeMessage}`);
        error.status = errCode;
        error.errorStatus = errStatus;
        error.apiMessage = safeMessage;
        error.errorCategory = errorCategory;
        error.isQuotaExhausted = isQuotaExhausted;
        error.isTransient = isTransient;

        // Requirement 1 & 2: Daily/free-tier quota exhaustion is NOT repeatedly retried.
        // Immediately record session status and throw so caller falls back to DeterministicNLPProvider.
        if (isQuotaExhausted) {
          isGlobalQuotaExhausted = true;
          quotaExhaustedTimestamp = Date.now();
          throw error;
        }

        // Requirements 3 & 4: Limited bounded retry only for transient SERVICE_UNAVAILABLE or RATE_LIMITED (at most 1 retry, short delay)
        if (isTransient && attempt < maxAttempts) {
          const delay = Math.min(baseRetryDelay * attempt, 1000);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        throw error;
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`Malformed Gemini response: Server did not return valid JSON: ${parseErr.message}`);
      }

      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      const candidateText = candidate?.content?.parts?.[0]?.text;

      if (!candidateText) {
        if (finishReason && finishReason !== 'STOP') {
          throw new Error(`Gemini generation stopped unexpectedly with reason: ${finishReason}`);
        }
        throw new Error('Empty response candidate text from Gemini API.');
      }

      let parsedJson = null;
      if (jsonMode) {
        try {
          let cleanJsonText = candidateText.trim();
          // Strip Markdown JSON code blocks if model wrapped the JSON
          if (cleanJsonText.startsWith('```')) {
            cleanJsonText = cleanJsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
          }
          parsedJson = JSON.parse(cleanJsonText);
        } catch (jsonErr) {
          throw new Error(`Failed to parse structured JSON from Gemini response: ${jsonErr.message}`);
        }
      }

      return {
        text: candidateText,
        json: parsedJson,
        data,
        finishReason,
        usage: data?.usageMetadata || null
      };

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Gemini request timed out after ${timeout}ms.`);
        timeoutErr.status = 408;
        timeoutErr.errorStatus = 'TIMEOUT';
        timeoutErr.apiMessage = `Request timed out after ${timeout}ms.`;
        timeoutErr.errorCategory = 'SERVICE_UNAVAILABLE';
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }
      lastError = err;
      // Do not retry quota exhaustion or non-transient errors
      if (err.isQuotaExhausted || !err.isTransient || attempt >= maxAttempts) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Gemini API call failed unexpectedly.');
}

/**
 * Safe connection diagnostic function for Gemini 3.8 Flash.
 * Tests API key availability, network connectivity, and model availability.
 * Never prints or leaks the API key.
 * 
 * @param {string|null} [apiKey=null] - Optional override key (defaults to VITE_GEMINI_API_KEY)
 * @param {object} [options={}] - Diagnostic options
 * @returns {Promise<object>} Structured diagnostic result
 */
export async function checkGeminiConnection(apiKey = null, options = {}) {
  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null);
  const envModel = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL ? import.meta.env.VITE_GEMINI_MODEL : null;
  const targetModel = options.model || envModel || 'gemini-3.8-flash';

  if (options.resetQuotaCache) {
    resetQuotaExhaustionStatus();
  }

  if (!key) {
    return {
      ok: false,
      model: targetModel,
      hasApiKey: false,
      status: null,
      statusText: null,
      errorCategory: 'AUTHENTICATION_ERROR',
      errorStatus: 'MISSING_API_KEY',
      isQuotaExhausted: false,
      reason: 'Missing API key',
      message: 'No Gemini API key detected (VITE_GEMINI_API_KEY is not defined in environment).',
      durationMs: 0
    };
  }

  const startTime = Date.now();
  try {
    const result = await callGeminiGenerateContent({
      apiKey: key,
      model: targetModel,
      prompt: 'Reply with the single word OK.',
      timeoutMs: options.timeoutMs || 10000,
      thinkingLevel: 'low',
      retries: options.retries ?? 0, // Diagnostic uses 0 retries to report actual status fast
      retryDelayMs: 500,
      fetchFn: options.fetchFn
    });

    return {
      ok: true,
      model: targetModel,
      hasApiKey: true,
      status: 200,
      statusText: 'OK',
      errorCategory: null,
      errorStatus: null,
      isQuotaExhausted: false,
      reason: null,
      message: `Connected successfully to ${targetModel}.`,
      responsePreview: (result.text || '').trim(),
      durationMs: Date.now() - startTime
    };
  } catch (err) {
    const isQuota = err.isQuotaExhausted || isQuotaExhaustionError(err.status, err.errorStatus, err.apiMessage || err.message);
    const friendlyMessage = isQuota
      ? 'Gemini quota exhausted — using deterministic fallback.'
      : (err.apiMessage || err.message);

    return {
      ok: false,
      model: targetModel,
      hasApiKey: true,
      status: err.status || null,
      statusText: err.statusText || null,
      errorCategory: err.errorCategory || (isQuota ? 'QUOTA_EXHAUSTED' : 'UNKNOWN'),
      errorStatus: err.errorStatus || 'REQUEST_FAILED',
      isQuotaExhausted: isQuota,
      reason: isQuota ? 'Gemini quota exhausted' : null,
      message: redactApiKey(friendlyMessage, key),
      durationMs: Date.now() - startTime
    };
  }
}

// Expose safe diagnostic helper on window in browser runtime for developer convenience
if (typeof window !== 'undefined') {
  window.checkGeminiConnection = (opts = {}) => checkGeminiConnection(null, opts);
}

/**
 * Gemini AI Provider implementation for InfoFlip-AI.
 * Communicates with Google Gemini models via generateContent REST API.
 * Seamlessly falls back to DeterministicNLPProvider on error, quota exhaustion, or timeout.
 */
export class GeminiAIProvider extends AIProviderInterface {
  constructor(apiKey = null, options = {}) {
    super('GeminiAIProvider');
    this.apiKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null);
    const envModel = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL ? import.meta.env.VITE_GEMINI_MODEL : null;
    this.model = options.model || envModel || 'gemini-3.8-flash';
    this.fallbackProvider = new DeterministicNLPProvider();
    this.isQuotaExhausted = false;
  }

  async isAvailable() {
    return Boolean(this.apiKey);
  }

  /**
   * Diagnostic health check for live Gemini connectivity
   */
  async checkConnection(options = {}) {
    return checkGeminiConnection(this.apiKey, { model: this.model, ...options });
  }

  /**
   * Transforms source text and Module 2 analysis into requested outputs using Gemini 3.8 Flash.
   * If Gemini returns an error (quota exhaustion, 503 high demand, or timeout),
   * immediately falls back to DeterministicTransformer with clear metadata explanation.
   */
  async transform(request, options = {}) {
    // If no API key configured, use deterministic provider gracefully
    if (!this.apiKey) {
      const fallbackOutputs = await this.fallbackProvider.transform(request, {
        ...options,
        fallbackReason: 'Missing API key'
      });
      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          reason: 'Missing API key'
        }
      }));
    }

    // Fast-path: if quota is already known to be exhausted in this session, avoid doomed network call
    if ((this.isQuotaExhausted || isGlobalQuotaExhausted) && !options.bypassQuotaCache) {
      console.warn('Gemini API:\nHTTP 429\nCategory: QUOTA_EXHAUSTED\nProvider fallback: DeterministicFallback\nMessage: Fast-falling back due to session quota exhaustion.');
      const fallbackOutputs = await this.fallbackProvider.transform(request, {
        ...options,
        fallbackReason: 'Gemini quota exhausted'
      });
      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          reason: 'Gemini quota exhausted'
        }
      }));
    }

    try {
      const systemInstruction = buildTransformationSystemPrompt();
      const userPrompt = buildTransformationUserPrompt(request);

      const { json } = await callGeminiGenerateContent({
        apiKey: this.apiKey,
        model: this.model,
        systemInstruction,
        prompt: userPrompt,
        jsonMode: true,
        thinkingLevel: 'low',
        temperature: 0.2,
        timeoutMs: Math.min(options.timeoutMs || 20000, 20000),
        retries: options.retries ?? 1,
        retryDelayMs: Math.min(options.retryDelayMs || 800, 1000),
        fetchFn: options.fetchFn
      });

      const rawOutputs = Array.isArray(json?.outputs) ? json.outputs : [];
      if (rawOutputs.length === 0) {
        throw new Error('No outputs produced by Gemini API.');
      }

      return rawOutputs.map(out => {
        const textToCount = JSON.stringify(out.content);
        const wordCount = textToCount.split(/\s+/).filter(Boolean).length;
        const charCount = textToCount.length;

        return createOutputItem({
          transformationId: request.transformationId,
          format: out.format,
          status: 'generated',
          content: out.content,
          metadata: {
            provider: 'Gemini 3.8 Flash',
            isFallback: false,
            reason: null,
            generatedAt: new Date().toISOString(),
            wordCount,
            charCount
          }
        });
      });
    } catch (err) {
      const safeErrMessage = redactApiKey(err.message, this.apiKey);
      console.warn('Gemini transformation failed or timed out. Falling back to Deterministic Transformation Engine:', safeErrMessage);

      // Determine clean fallback reason (Requirement 5 & 6)
      const isQuota = err.isQuotaExhausted || isQuotaExhaustionError(err.status, err.errorStatus, safeErrMessage);
      if (isQuota) {
        this.isQuotaExhausted = true;
        isGlobalQuotaExhausted = true;
      }

      const fallbackReason = isQuota
        ? 'Gemini quota exhausted'
        : (err.isTimeout ? 'Gemini timeout' : 'Gemini unavailable');

      const fallbackOutputs = await this.fallbackProvider.transform(request, {
        ...options,
        fallbackReason
      });

      // Requirement 5 & 6: Clearly show Provider: DeterministicFallback and Reason: Gemini quota exhausted
      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          reason: fallbackReason
        }
      }));
    }
  }

  /**
   * Analyzes source document using Gemini 3.8 Flash.
   * On failure, quota exhaustion, or timeout, gracefully falls back to DeterministicNLPProvider.
   */
  async analyze(sourceData, options = {}) {
    // If no API key configured, use deterministic provider gracefully
    if (!this.apiKey) {
      return this.fallbackProvider.analyze(sourceData, options);
    }

    // Fast-path: if quota is already known to be exhausted in this session, avoid doomed network call
    if ((this.isQuotaExhausted || isGlobalQuotaExhausted) && !options.bypassQuotaCache) {
      console.warn('Gemini API:\nHTTP 429\nCategory: QUOTA_EXHAUSTED\nProvider fallback: DeterministicFallback\nMessage: Fast-falling back due to session quota exhaustion.');
      return this.fallbackProvider.analyze(sourceData, {
        ...options,
        fallbackReason: 'Gemini quota exhausted'
      });
    }

    try {
      const prompt = `You are the Content Understanding Engine of InfoFlip-AI.
Analyze the following source content and output strictly valid JSON matching this schema:
{
  "overview": { "title": string, "summary": string, "mainTopic": string, "category": string, "contentType": string },
  "intent": { "primary": string, "secondary": string[] },
  "language": { "name": string, "code": string },
  "tone": { "primary": string, "secondary": string[] },
  "audience": { "detected": string[], "confidence": number, "evidenceLevel": "Detected"|"Inferred" },
  "keyFacts": [ { "fact": string, "importance": "high"|"medium"|"low", "evidenceLevel": "Detected" } ],
  "entities": { "people": string[], "organizations": string[], "locations": string[], "products": string[], "technologies": string[], "dates": string[], "other": string[] },
  "topics": string[],
  "keywords": { "primary": string[], "secondary": string[] },
  "importantDates": [ { "date": string, "context": string, "isDeadline": boolean } ],
  "importantNumbers": [ { "value": string, "label": string, "context": string } ],
  "claims": [ { "statement": string, "type": "source-stated"|"ai-inferred" } ],
  "urgency": { "level": "high"|"medium"|"low"|"not_detected", "reasons": string[] },
  "confidence": { "overall": number, "topicConfidence": number, "intentConfidence": number, "audienceConfidence": number }
}

Content to analyze:
${sourceData.extractedText || sourceData.rawText}`;

      const { json } = await callGeminiGenerateContent({
        apiKey: this.apiKey,
        model: this.model,
        prompt,
        jsonMode: true,
        thinkingLevel: 'low',
        temperature: 0.2,
        timeoutMs: Math.min(options.timeoutMs || 20000, 20000),
        retries: options.retries ?? 1,
        retryDelayMs: Math.min(options.retryDelayMs || 800, 1000),
        fetchFn: options.fetchFn
      });

      return {
        ...json,
        sourceTraceability: {
          sourceId: sourceData.sourceId || 'src-unknown',
          sourceType: sourceData.sourceType || 'text',
          fileName: sourceData.fileName || null,
          analyzedCharacters: (sourceData.extractedText || sourceData.rawText || '').length,
          analyzedWords: (sourceData.extractedText || sourceData.rawText || '').split(/\s+/).filter(Boolean).length
        }
      };
    } catch (err) {
      const safeErrMessage = redactApiKey(err.message, this.apiKey);
      console.warn('Gemini AI Provider failed or timed out. Falling back to Deterministic NLP Engine:', safeErrMessage);

      const isQuota = err.isQuotaExhausted || isQuotaExhaustionError(err.status, err.errorStatus, safeErrMessage);
      if (isQuota) {
        this.isQuotaExhausted = true;
        isGlobalQuotaExhausted = true;
      }

      return this.fallbackProvider.analyze(sourceData, {
        ...options,
        fallbackReason: isQuota ? 'Gemini quota exhausted' : undefined
      });
    }
  }

  /**
   * Generates channel-specific communication outputs using Gemini 3.8 Flash.
   * On failure, quota exhaustion, or timeout, gracefully falls back to DeterministicCommunicationProvider.
   */
  async communicate(request, options = {}) {
    const deterministicProvider = new DeterministicCommunicationProvider();

    // If no API key configured, use deterministic provider gracefully
    if (!this.apiKey) {
      const fallbackOutputs = deterministicProvider.generate(request, {
        ...options,
        fallbackReason: 'Missing API key'
      });
      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          fallbackReason: 'Missing API key'
        }
      }));
    }

    // Fast-path: if quota is already known to be exhausted in this session, avoid doomed network call
    if ((this.isQuotaExhausted || isGlobalQuotaExhausted) && !options.bypassQuotaCache) {
      console.warn('Gemini API:\nHTTP 429\nCategory: QUOTA_EXHAUSTED\nProvider fallback: DeterministicFallback\nMessage: Fast-falling back due to session quota exhaustion.');
      const fallbackOutputs = deterministicProvider.generate(request, {
        ...options,
        fallbackReason: 'Gemini quota exhausted'
      });
      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          fallbackReason: 'Gemini quota exhausted'
        }
      }));
    }

    try {
      const systemInstruction = buildCommunicationSystemPrompt();
      const userPrompt = buildCommunicationUserPrompt(request);

      const { json } = await callGeminiGenerateContent({
        apiKey: this.apiKey,
        model: this.model,
        systemInstruction,
        prompt: userPrompt,
        jsonMode: true,
        thinkingLevel: 'low',
        temperature: 0.2,
        timeoutMs: Math.min(options.timeoutMs || 20000, 20000),
        retries: options.retries ?? 1,
        retryDelayMs: Math.min(options.retryDelayMs || 800, 1000),
        fetchFn: options.fetchFn
      });

      const rawOutputs = Array.isArray(json?.outputs) ? json.outputs : [];
      if (rawOutputs.length === 0) {
        throw new Error('No communication outputs produced by Gemini API.');
      }

      return rawOutputs.map(out => {
        const contentStr = typeof out.content === 'string' ? out.content : JSON.stringify(out.content);
        const wordCount = contentStr.split(/\s+/).filter(Boolean).length;
        const characterCount = contentStr.length;

        return createCommunicationOutputItem({
          channelId: out.channelId,
          title: out.title,
          content: contentStr,
          structuredData: out.structuredData || null,
          metadata: {
            provider: 'Gemini 3.8 Flash',
            isFallback: false,
            fallbackReason: null,
            generatedAt: new Date().toISOString(),
            wordCount,
            characterCount
          },
          sourceTraceability: Array.isArray(out.sourceTraceability) && out.sourceTraceability.length > 0
            ? out.sourceTraceability
            : [{ fact: request.analysis?.keyFacts?.[0] || 'Source verified fact', sourceId: request.sourceId, origin: 'analysis.keyFacts' }]
        });
      });
    } catch (err) {
      const safeErrMessage = redactApiKey(err.message, this.apiKey);
      console.warn('Gemini communication generation failed or timed out. Falling back to Deterministic Engine:', safeErrMessage);

      const isQuota = err.isQuotaExhausted || isQuotaExhaustionError(err.status, err.errorStatus, safeErrMessage);
      if (isQuota) {
        this.isQuotaExhausted = true;
        isGlobalQuotaExhausted = true;
      }

      const fallbackReason = isQuota
        ? 'Gemini quota exhausted'
        : (err.isTimeout ? 'Gemini timeout' : 'Gemini unavailable');

      const fallbackOutputs = deterministicProvider.generate(request, {
        ...options,
        fallbackReason
      });

      return fallbackOutputs.map(out => ({
        ...out,
        metadata: {
          ...out.metadata,
          provider: 'DeterministicFallback',
          isFallback: true,
          fallbackReason
        }
      }));
    }
  }
}
