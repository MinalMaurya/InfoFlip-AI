import { EVIDENCE_LEVELS } from '../types/analysis.js';

/**
 * Checks if a phrase or token is verifiably present in the source text
 * @param {string} statement 
 * @param {string} sourceText 
 * @returns {boolean}
 */
export function isStatementGrounded(statement, sourceText) {
  if (!statement || !sourceText) return false;
  
  const cleanSource = sourceText.toLowerCase();
  const cleanStatement = statement.toLowerCase().trim();

  // Direct substring match
  if (cleanSource.includes(cleanStatement)) return true;

  // Significant token overlap match (at least 60% of significant words found in source)
  const stopWords = new Set(['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an', 'is', 'are', 'was', 'were', 'by', 'of']);
  const tokens = cleanStatement
    .split(/[\s,.;:!?'"()-]+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  if (tokens.length === 0) return true;

  const foundTokens = tokens.filter(token => cleanSource.includes(token));
  return (foundTokens.length / tokens.length) >= 0.5;
}

/**
 * Categorizes an extracted element into Detected, Inferred, or Not detected
 * @param {string} item 
 * @param {string} sourceText 
 * @param {boolean} isExplicit 
 * @returns {string} EVIDENCE_LEVELS value
 */
export function determineEvidenceLevel(item, sourceText, isExplicit = false) {
  if (!item || item === 'Not detected' || item === 'Unknown') {
    return EVIDENCE_LEVELS.NOT_DETECTED;
  }

  if (isExplicit || isStatementGrounded(item, sourceText)) {
    return EVIDENCE_LEVELS.DETECTED;
  }

  return EVIDENCE_LEVELS.INFERRED;
}

/**
 * Validates and classifies claims into 'source-stated' vs 'ai-inferred'
 * @param {Array<{ statement: string, type?: string }>} claims 
 * @param {string} sourceText 
 * @returns {Array<{ statement: string, type: 'source-stated' | 'ai-inferred', isGrounded: boolean }>}
 */
export function validateClaims(claims, sourceText) {
  if (!Array.isArray(claims)) return [];

  return claims.map(c => {
    const text = typeof c === 'string' ? c : c.statement;
    const isGrounded = isStatementGrounded(text, sourceText);
    const resolvedType = (c.type === 'source-stated' && isGrounded) 
      ? 'source-stated' 
      : 'ai-inferred';

    return {
      statement: text,
      type: resolvedType,
      isGrounded
    };
  });
}

/**
 * Filters out hallucinated entities that have no occurrence in the source text
 * @param {Array<string>} entities 
 * @param {string} sourceText 
 * @returns {Array<string>}
 */
export function filterGroundedEntities(entities, sourceText) {
  if (!Array.isArray(entities)) return [];
  const lowerSource = sourceText.toLowerCase();

  return entities.filter(entity => {
    if (!entity || typeof entity !== 'string') return false;
    const clean = entity.trim().toLowerCase();
    if (clean.length < 2) return false;
    return lowerSource.includes(clean);
  });
}
