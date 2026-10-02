import assert from 'assert';
import { 
  callGeminiGenerateContent, 
  checkGeminiConnection, 
  redactApiKey, 
  isQuotaExhaustionError,
  classifyGeminiError,
  GeminiAIProvider,
  resetQuotaExhaustionStatus,
  getQuotaExhaustionStatus
} from '../services/ai/geminiProvider.js';
import { SAMPLE_ANALYSIS } from '../services/analysisService.js';
import { OUTPUT_FORMAT_IDS } from '../types/transformation.js';

console.log('========================================');
console.log('🧪 RUNNING GEMINI INTEGRATION & RESILIENCE SUITE');
console.log('========================================');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  resetQuotaExhaustionStatus();
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  resetQuotaExhaustionStatus();
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

const mockRequest = {
  transformationId: 'trans-mock-test',
  source: {
    sourceId: 'src-1',
    extractedText: 'Cyclone warning issued for coastal areas with 105 km/h winds and 210mm rainfall.'
  },
  analysis: SAMPLE_ANALYSIS,
  configuration: {
    targetAudience: ['General Public'],
    tone: 'Urgent',
    language: 'English',
    detailLevel: 'Balanced',
    objective: 'Advise',
    contentStyle: 'Structured'
  },
  requestedOutputs: [OUTPUT_FORMAT_IDS.LINKEDIN]
};

// ============================================================================
// SUITE 1 (CASE F): CREDENTIAL SECURITY & API KEY SANITIZATION
// ============================================================================
console.log('\n--- Suite 1 (Case F): Credential Security & API Key Redaction ---');
{
  it('Case F1: Redacts plain API key from string', () => {
    const key = 'AIzaSySecretFakeApiKey1234567890';
    const text = `Error connecting with key ${key} to upstream server`;
    const cleaned = redactApiKey(text, key);
    assert(!cleaned.includes(key), 'Key must not be present in sanitized output');
    assert(cleaned.includes('[REDACTED_API_KEY]'), 'Key must be replaced with placeholder');
  });

  it('Case F2: Redacts query parameter key from URLs', () => {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=AQ.secretKey123&other=param';
    const cleaned = redactApiKey(url, 'AQ.secretKey123');
    assert(!cleaned.includes('AQ.secretKey123'), 'Key must not be present in URL');
    assert(cleaned.includes('key=[REDACTED_API_KEY]'), 'Key query param must be masked');
  });

  it('Case F3: Never exposes API key in thrown error message or diagnostics', async () => {
    const fakeKey = 'AIzaSySecretExposureTestKey999';
    const mockFailFetch = async () => ({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({
        error: {
          code: 400,
          message: `Invalid key ${fakeKey} provided in request`,
          status: 'INVALID_ARGUMENT'
        }
      })
    });

    try {
      await callGeminiGenerateContent({
        apiKey: fakeKey,
        prompt: 'test',
        fetchFn: mockFailFetch,
        retries: 0
      });
      assert.fail('Should have thrown');
    } catch (err) {
      assert(!err.message.includes(fakeKey), 'Error message must not contain raw API key');
      assert(err.message.includes('[REDACTED_API_KEY]'), 'Error message must have redacted key');
    }
  });

  await itAsync('Case F4: REST endpoint uses x-goog-api-key header and does NOT append ?key= to URL', async () => {
    const fakeKey = 'AQ.SecretHeaderKey999';
    let capturedUrl = null;
    let capturedHeaders = null;

    const mockInspectFetch = async (url, opts) => {
      capturedUrl = url;
      capturedHeaders = opts.headers;
      return {
        ok: true,
        text: async () => JSON.stringify({
          candidates: [{
            content: { parts: [{ text: 'OK' }] },
            finishReason: 'STOP'
          }]
        })
      };
    };

    await callGeminiGenerateContent({
      apiKey: fakeKey,
      prompt: 'test',
      fetchFn: mockInspectFetch
    });

    assert(capturedUrl, 'Fetch must have been called');
    assert(!capturedUrl.includes('key='), `Endpoint URL must NOT include key query parameter (got ${capturedUrl})`);
    assert(!capturedUrl.includes(fakeKey), 'Endpoint URL must NOT contain the secret API key');
    assert(capturedHeaders && capturedHeaders['x-goog-api-key'] === fakeKey, 'API key must be passed securely in x-goog-api-key header');
  });
}

// ============================================================================
// SUITE 2 (CASE E): MISSING API KEY HANDLING
// ============================================================================
console.log('\n--- Suite 2 (Case E): Missing API Key Handling ---');
{
  await itAsync('Case E1: callGeminiGenerateContent rejects immediately if apiKey is missing', async () => {
    let threw = false;
    try {
      await callGeminiGenerateContent({ apiKey: null, prompt: 'Hello' });
    } catch (err) {
      threw = true;
      assert(err.message.includes('Gemini API key is required'), 'Throws descriptive error');
    }
    assert(threw, 'Should have thrown for missing API key');
  });

  await itAsync('Case E2: checkGeminiConnection reports missing API key without failing', async () => {
    const diag = await checkGeminiConnection(null);
    assert(diag.ok === false, 'Diagnostic ok is false');
    assert(diag.hasApiKey === false, 'hasApiKey is false');
    assert(diag.errorStatus === 'MISSING_API_KEY', 'errorStatus is MISSING_API_KEY');
    assert(diag.reason === 'Missing API key', 'reason is Missing API key');
  });

  await itAsync('Case E3: GeminiAIProvider falls back cleanly to Deterministic engine when apiKey is missing', async () => {
    const provider = new GeminiAIProvider(null);
    assert((await provider.isAvailable()) === false, 'isAvailable() returns false without key');

    const result = await provider.transform(mockRequest);
    assert(Array.isArray(result) && result.length === 1, 'Generates output via fallback');
    assert(result[0].metadata.provider === 'DeterministicFallback', 'Provider is DeterministicFallback');
    assert(result[0].metadata.isFallback === true, 'isFallback is true');
    assert(result[0].metadata.reason === 'Missing API key', 'reason is Missing API key');

    const analysisResult = await provider.analyze({
      sourceId: 'src-1',
      rawText: 'Cyclone storm alert with heavy rainfall.'
    });
    assert(analysisResult.overview && analysisResult.overview.mainTopic, 'Analysis succeeds via fallback');
  });
}

// ============================================================================
// SUITE 3: ERROR CLASSIFICATION & QUOTA DETECTION
// ============================================================================
console.log('\n--- Suite 3: Error Classification & Quota Detection ---');
{
  it('Detects free_tier quota exhaustion message as QUOTA_EXHAUSTED', () => {
    const msg = 'You exceeded your current quota, please check your plan and billing details. Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20';
    assert(isQuotaExhaustionError(429, 'RESOURCE_EXHAUSTED', msg) === true, 'isQuotaExhaustionError returns true');
    assert(classifyGeminiError(429, 'RESOURCE_EXHAUSTED', msg) === 'QUOTA_EXHAUSTED', 'Classifies as QUOTA_EXHAUSTED');
  });

  it('Detects per-day free tier quota limit message as QUOTA_EXHAUSTED', () => {
    const msg = 'Quota exceeded for metric: GenerateRequestsPerDayPerProjectPerModel-FreeTier';
    assert(isQuotaExhaustionError(429, 'RESOURCE_EXHAUSTED', msg) === true, 'isQuotaExhaustionError returns true');
    assert(classifyGeminiError(429, 'RESOURCE_EXHAUSTED', msg) === 'QUOTA_EXHAUSTED', 'Classifies as QUOTA_EXHAUSTED');
  });

  it('Distinguishes temporary concurrency rate limit from quota exhaustion', () => {
    const msg = 'Too Many Requests: Temporary concurrent limit reached. Please slow down.';
    assert(isQuotaExhaustionError(429, 'RESOURCE_EXHAUSTED', msg) === false, 'isQuotaExhaustionError returns false for generic concurrency');
    assert(classifyGeminiError(429, 'RESOURCE_EXHAUSTED', msg) === 'RATE_LIMITED', 'Classifies as RATE_LIMITED');
  });

  it('Classifies HTTP 503 as SERVICE_UNAVAILABLE', () => {
    const msg = 'This model is currently experiencing high demand. Spikes in demand are usually temporary.';
    assert(classifyGeminiError(503, 'UNAVAILABLE', msg) === 'SERVICE_UNAVAILABLE', 'Classifies as SERVICE_UNAVAILABLE');
  });

  it('Classifies authentication and invalid argument errors correctly', () => {
    assert(classifyGeminiError(401, 'UNAUTHENTICATED', 'API key expired') === 'AUTHENTICATION_ERROR');
    assert(classifyGeminiError(403, 'PERMISSION_DENIED', 'Forbidden') === 'AUTHENTICATION_ERROR');
    assert(classifyGeminiError(400, 'INVALID_ARGUMENT', 'Bad field') === 'INVALID_REQUEST');
  });
}

// ============================================================================
// SUITE 4 (CASE A): 429 DAILY QUOTA EXHAUSTION -> IMMEDIATE FALLBACK (0 RETRIES)
// ============================================================================
console.log('\n--- Suite 4 (Case A): 429 Daily Quota Exhaustion -> Immediate Fallback ---');
{
  await itAsync('Case A1: HTTP 429 Quota Exhaustion falls back immediately with ZERO retries', async () => {
    let callCount = 0;
    const mockQuotaFetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({
          error: {
            code: 429,
            message: 'You exceeded your current quota, please check your plan and billing details. Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.8-flash',
            status: 'RESOURCE_EXHAUSTED'
          }
        })
      };
    };

    const provider = new GeminiAIProvider('test-fake-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mockQuotaFetch,
      retries: 3 // Even with retries: 3 requested, quota exhaustion MUST NOT retry
    });

    // Requirement 1 & 2: Must be called EXACTLY ONCE (no repeated retries)
    assert(callCount === 1, `Quota exhaustion must NOT be retried (expected 1 call, got ${callCount})`);

    // Requirement 6: UI/provider metadata must clearly show Provider: DeterministicFallback and Reason: Gemini quota exhausted
    assert(outputs.length === 1, 'Fallback produces output');
    assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Provider is DeterministicFallback');
    assert(outputs[0].metadata.isFallback === true, 'isFallback is true');
    assert(outputs[0].metadata.reason === 'Gemini quota exhausted', 'Reason is Gemini quota exhausted');
  });

  await itAsync('Case A2: Session-level fast-fallback prevents repeat doomed API calls', async () => {
    let callCount = 0;
    const mockQuotaFetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({
          error: {
            code: 429,
            message: 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20',
            status: 'RESOURCE_EXHAUSTED'
          }
        })
      };
    };

    const provider = new GeminiAIProvider('test-fake-key');
    // First call sets session quota exhaustion flag
    await provider.transform(mockRequest, { fetchFn: mockQuotaFetch });
    assert(callCount === 1, 'First call executed once');
    assert(getQuotaExhaustionStatus().isExhausted === true, 'Global quota flag is true');

    // Second call should FAST-FALLBACK without executing fetch at all
    const secondOutputs = await provider.transform(mockRequest, { fetchFn: mockQuotaFetch });
    assert(callCount === 1, 'Second call avoided network and used fast-fallback');
    assert(secondOutputs[0].metadata.provider === 'DeterministicFallback');
    assert(secondOutputs[0].metadata.reason === 'Gemini quota exhausted');
  });

  await itAsync('Case A3: checkGeminiConnection identifies quota exhaustion and flags isQuotaExhausted', async () => {
    const mockQuotaFetch = async () => ({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => JSON.stringify({
        error: {
          code: 429,
          message: 'You exceeded your current quota, please check your plan and billing details.',
          status: 'RESOURCE_EXHAUSTED'
        }
      })
    });

    const diag = await checkGeminiConnection('test-key', { fetchFn: mockQuotaFetch });
    assert(diag.ok === false, 'Diagnostic ok is false');
    assert(diag.status === 429, 'Diagnostic status is 429');
    assert(diag.errorStatus === 'RESOURCE_EXHAUSTED', 'Diagnostic errorStatus is RESOURCE_EXHAUSTED');
    assert(diag.isQuotaExhausted === true, 'isQuotaExhausted is true');
    assert(diag.reason === 'Gemini quota exhausted', 'Reason is Gemini quota exhausted');
  });
}

// ============================================================================
// SUITE 5 (CASES B & C): 429 TEMPORARY RATE LIMITS -> LIMITED RETRY RECOVERY
// ============================================================================
console.log('\n--- Suite 5 (Cases B & C): Transient 429 Rate Limits -> Limited Retry Recovery ---');
{
  await itAsync('Case B: 429 rate_limit_exceeded retries with exponential backoff and succeeds', async () => {
    let callCount = 0;
    const mockTransient429Fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => JSON.stringify({
            error: {
              code: 429,
              message: 'rate_limit_exceeded: Temporary concurrent limit reached. Please slow down.',
              status: 'RESOURCE_EXHAUSTED'
            }
          })
        };
      }
      return {
        ok: true,
        text: async () => JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  outputs: [{ format: 'linkedin', content: { headline: 'Recovered after rate_limit_exceeded' } }]
                })
              }]
            },
            finishReason: 'STOP'
          }]
        })
      };
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mockTransient429Fetch,
      retries: 1,
      retryDelayMs: 10
    });

    // Limited retry executed
    assert(callCount === 2, `Expected 2 calls (1 retry), got ${callCount}`);
    assert(outputs[0].metadata.provider === 'Gemini 3.8 Flash', 'Provider is Gemini 3.8 Flash');
    assert(outputs[0].metadata.isFallback === false, 'isFallback is false');
    assert(outputs[0].content.headline === 'Recovered after rate_limit_exceeded', 'Content recovered');
  });

  await itAsync('Case C: 429 too_many_requests retries with exponential backoff and succeeds', async () => {
    let callCount = 0;
    const mockTransientBurstFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => JSON.stringify({
            error: {
              code: 429,
              message: 'too_many_requests: Short-term request rate reached limit. Try again momentarily.',
              status: 'RATE_LIMITED'
            }
          })
        };
      }
      return {
        ok: true,
        text: async () => JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  outputs: [{ format: 'linkedin', content: { headline: 'Recovered after too_many_requests' } }]
                })
              }]
            },
            finishReason: 'STOP'
          }]
        })
      };
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mockTransientBurstFetch,
      retries: 1,
      retryDelayMs: 10
    });

    assert(callCount === 2, `Expected 2 calls (1 retry), got ${callCount}`);
    assert(outputs[0].metadata.provider === 'Gemini 3.8 Flash', 'Provider is Gemini 3.8 Flash');
    assert(outputs[0].metadata.isFallback === false, 'isFallback is false');
    assert(outputs[0].content.headline === 'Recovered after too_many_requests', 'Content recovered');
  });
}

// ============================================================================
// SUITE 6 (CASE D): HTTP 503 SERVICE_UNAVAILABLE -> LIMITED RETRY & FALLBACK
// ============================================================================
console.log('\n--- Suite 6 (Case D): HTTP 503 -> Limited Retry & Fallback ---');
{
  await itAsync('Case D1: HTTP 503 retries with backoff and succeeds on attempt 2', async () => {
    let callCount = 0;
    const mock503RetryFetch = async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => JSON.stringify({
            error: {
              code: 503,
              message: 'This model is currently experiencing high demand.',
              status: 'UNAVAILABLE'
            }
          })
        };
      }
      return {
        ok: true,
        text: async () => JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  outputs: [{ format: 'linkedin', content: { headline: 'Recovered after 503' } }]
                })
              }]
            },
            finishReason: 'STOP'
          }]
        })
      };
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mock503RetryFetch,
      retries: 1,
      retryDelayMs: 10
    });

    assert(callCount === 2, `Expected 2 calls (1 retry), got ${callCount}`);
    assert(outputs[0].metadata.provider === 'Gemini 3.8 Flash', 'Provider is Gemini 3.8 Flash');
    assert(outputs[0].metadata.isFallback === false, 'isFallback is false');
  });

  await itAsync('Case D2: HTTP 503 exhausted retries falls back cleanly with reason "Gemini unavailable"', async () => {
    let callCount = 0;
    const mockPersistent503Fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => JSON.stringify({
          error: {
            code: 503,
            message: 'This model is currently experiencing high demand.',
            status: 'UNAVAILABLE'
          }
        })
      };
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mockPersistent503Fetch,
      retries: 1,
      retryDelayMs: 10
    });

    assert(callCount === 2, `Expected exactly 2 attempts, got ${callCount}`);
    assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Falls back to DeterministicFallback');
    assert(outputs[0].metadata.isFallback === true, 'isFallback is true');
    assert(outputs[0].metadata.reason === 'Gemini unavailable', 'Reason is Gemini unavailable');
  });

  await itAsync('Case D3: HTTP 503 allows AT MOST 1 retry even if higher retries requested', async () => {
    let callCount = 0;
    const mockMultiRetry503Fetch = async () => {
      callCount++;
      return {
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => JSON.stringify({
          error: {
            code: 503,
            message: 'This model is currently experiencing high demand.',
            status: 'UNAVAILABLE'
          }
        })
      };
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, {
      fetchFn: mockMultiRetry503Fetch,
      retries: 5, // Even with retries: 5, 503 MUST cap at 1 retry (2 calls total)
      retryDelayMs: 10
    });

    assert(callCount === 2, `503 must cap at at most 1 retry (expected 2 calls, got ${callCount})`);
    assert(outputs[0].metadata.provider === 'DeterministicFallback', 'Falls back to DeterministicFallback');
    assert(outputs[0].metadata.reason === 'Gemini unavailable', 'Reason is Gemini unavailable');
  });
}

// ============================================================================
// SUITE 7: MALFORMED RESPONSES, TIMEOUTS & STRUCTURED JSON
// ============================================================================
console.log('\n--- Suite 7: Malformed Responses, Timeouts & Structured JSON ---');
{
  await itAsync('Handles malformed non-JSON server responses gracefully', async () => {
    const mockMalformedFetch = async () => ({
      ok: true,
      text: async () => '<!DOCTYPE html><html><body>502 Bad Gateway</body></html>'
    });

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, { fetchFn: mockMalformedFetch });

    assert(outputs.length === 1, 'Fallback produces output despite malformed server response');
    assert(outputs[0].metadata.isFallback === true, 'Falls back safely on HTML/malformed payload');
  });

  await itAsync('Handles network / request timeout with 0 retries and falls back to deterministic engine', async () => {
    let timeoutCallCount = 0;
    const mockTimeoutFetch = async () => {
      timeoutCallCount++;
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    };

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, { fetchFn: mockTimeoutFetch });

    assert(timeoutCallCount === 1, `Timeout must NOT retry (expected 1 call, got ${timeoutCallCount})`);
    assert(outputs.length === 1, 'Fallback produces output despite timeout');
    assert(outputs[0].metadata.isFallback === true, 'isFallback is true after timeout');
    assert(outputs[0].metadata.reason === 'Gemini timeout', 'Reason is Gemini timeout');
  });

  await itAsync('Parses structured JSON with Markdown code blocks correctly', async () => {
    const mockMarkdownJsonFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: '```json\n{\n  "outputs": [\n    {\n      "format": "linkedin",\n      "content": { "headline": "Parsed with fences" }\n    }\n  ]\n}\n```'
            }]
          },
          finishReason: 'STOP'
        }]
      })
    });

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, { fetchFn: mockMarkdownJsonFetch });

    assert(outputs.length === 1, 'Produces output');
    assert(outputs[0].content.headline === 'Parsed with fences', 'Successfully stripped Markdown fences and parsed JSON');
  });

  await itAsync('Falls back when Gemini returns invalid structured JSON', async () => {
    const mockBadJsonFetch = async () => ({
      ok: true,
      text: async () => JSON.stringify({
        candidates: [{
          content: {
            parts: [{
              text: 'Here is your JSON: { broken json: "incomplete'
            }]
          },
          finishReason: 'STOP'
        }]
      })
    });

    const provider = new GeminiAIProvider('test-key');
    const outputs = await provider.transform(mockRequest, { fetchFn: mockBadJsonFetch });

    assert(outputs.length === 1, 'Produces fallback output');
    assert(outputs[0].metadata.isFallback === true, 'Falls back when JSON is invalid');
  });
}

console.log('\n========================================');
console.log(`GEMINI RESILIENCE SUITE: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
