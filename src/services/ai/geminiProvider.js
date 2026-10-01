import { AIProviderInterface } from './aiProviderInterface.js';
import { DeterministicNLPProvider } from './deterministicNLPProvider.js';

export class GeminiAIProvider extends AIProviderInterface {
  constructor(apiKey = null) {
    super('GeminiAIProvider');
    // Read from environment if available in Vite
    this.apiKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null);
    this.fallbackProvider = new DeterministicNLPProvider();
  }

  async isAvailable() {
    return Boolean(this.apiKey);
  }

  async analyze(sourceData, options = {}) {
    // If no API key configured, use deterministic provider gracefully
    if (!this.apiKey) {
      return this.fallbackProvider.analyze(sourceData, options);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('Empty response from Gemini API.');
      }

      const parsed = JSON.parse(candidateText);
      return {
        ...parsed,
        sourceTraceability: {
          sourceId: sourceData.sourceId || 'src-unknown',
          sourceType: sourceData.sourceType || 'text',
          fileName: sourceData.fileName || null,
          analyzedCharacters: (sourceData.extractedText || sourceData.rawText || '').length,
          analyzedWords: (sourceData.extractedText || sourceData.rawText || '').split(/\s+/).filter(Boolean).length
        }
      };
    } catch (err) {
      console.warn('Gemini AI Provider failed or timed out. Falling back to Deterministic NLP Engine:', err.message);
      return this.fallbackProvider.analyze(sourceData, options);
    }
  }
}
