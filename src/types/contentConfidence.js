/**
 * InfoFlip-AI Content Confidence & Verification Data Types & Helpers
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Safety & Transparency Architecture:
 * - Content Status Flags (AI-generated, Rule-based fallback, Verification required, Potential issue detected, Human reviewed, Approved for export)
 * - Claim-Level Traceability (Extracted from source, Independently verified, Inferred, Unknown)
 * - High-Risk & Time-Sensitive Claim Identification
 * - Qualitative Confidence & Disclaimers
 */

export const CONTENT_STATUS_FLAGS = {
  AI_GENERATED: 'AI-generated',
  RULE_BASED_FALLBACK: 'Rule-based fallback',
  VERIFICATION_REQUIRED: 'Verification required',
  POTENTIAL_ISSUE_DETECTED: 'Potential issue detected',
  HUMAN_REVIEWED: 'Human reviewed',
  APPROVED_FOR_EXPORT: 'Approved for export'
};

export const CLAIM_VERIFICATION_STATUSES = {
  EXTRACTED_FROM_SOURCE: 'Extracted from source',
  INDEPENDENTLY_VERIFIED: 'Independently verified',
  INFERRED: 'Inferred',
  UNKNOWN: 'Unknown'
};

export const CLAIM_ORIGINS = {
  SOURCE_EXTRACTED: 'source-extracted',
  AI_INFERRED: 'AI-inferred',
  EXTERNALLY_RETRIEVED: 'externally retrieved',
  UNKNOWN: 'unknown'
};

export const CLAIM_VERIFICATION_STATES = {
  NOT_CHECKED: 'not checked',
  VERIFICATION_REQUIRED: 'verification required',
  VERIFIED: 'verified',
  CONTRADICTED: 'contradicted',
  UNABLE_TO_VERIFY: 'unable to verify'
};

export const CLAIM_RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const GENERAL_DISCLAIMER_TEXT =
  'AI-generated content may contain errors or outdated information. Verify important facts and sources before relying on or publishing this content.';

export const UNVERIFIED_SOURCE_NOTICE = 'Source not independently verified.';

export const HIGH_RISK_CLAIM_WARNING =
  'Verification required — this high-impact claim was extracted from the provided source but has not been independently verified.';

export const EMERGENCY_ADVISORY_NOTICE =
  'For active emergency or severe weather situations, consult current official local advisories and authorized emergency broadcasts.';


/**
 * Regex patterns identifying high-risk and time-sensitive factual domains:
 * - Weather alerts, forecasts, affected locations, warning levels
 * - Emergency-response deployments and evacuation instructions
 * - Medical, health, legal, financial claims
 * - Specific dates, deadlines, phone numbers/helplines, and quantitative statistics
 */
const HIGH_RISK_PATTERNS = [
  // Weather & Disaster
  /\b(?:weather|forecast|cyclone|hurricane|typhoon|storm|flood|rainfall|rain|precipitation|landslide|earthquake|tsunami|heatwave|cold\s*wave|wind\s*speeds?|gust|alert\s*level|red\s*alert|orange\s*alert|yellow\s*alert|imd|meteorological|landfall)\b/i,
  // Emergency & Deployments
  /\b(?:emergency|evacuate|evacuation|evacuating|ndrf|sdrf|coast\s*guard|rescue|shelter|relief\s*camp|deployment|deployed|curfew|quarantine|helpline|control\s*room)\b/i,
  // Medical & Casualties
  /\b(?:casualt(?:y|ies)|death|fatalit(?:y|ies)|injur(?:y|ed|ies)|hospital|icu|medical|medic(?:ine|ation)|infect(?:ion|ed)|disease|doctor|patient)\b/i,
  // Financial & High-Impact Economics
  /\b(?:crore|lakh|million|billion|funding|budget|loss(?:es)?|damage\s*cost|rs\.?|inr|\$|fiscal|fine|penalty)\b/i,
  // Legal & Compliance
  /\b(?:section\s+\d+|penal\s*code|statut(?:e|ory)|ordinance|court\s*order|curfew\s*order|banned|mandatory)\b/i,
  // Contact numbers & Helplines
  /\b(?:112|911|100|101|108|1091|helpline\s*(?:number|no|:))\b/i
];

/**
 * Checks whether a given claim or statement is high-risk or time-sensitive.
 * 
 * @param {string|object} claim - Claim text or claim object
 * @returns {boolean}
 */
export function isHighRiskClaim(claim) {
  if (!claim) return false;
  const text = typeof claim === 'string' ? claim : (claim.statement || claim.claim || claim.text || '');
  if (!text || typeof text !== 'string') return false;

  return HIGH_RISK_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Classifies claim-level origin and verification status:
 * 1. Independently verified: only if actual independent verification records exist.
 * 2. Extracted from source: grounded in source document text.
 * 3. Inferred: semantic inference by model.
 * 4. Unknown: cannot be established.
 * 
 * @param {string|object} claim - Claim statement or object
 * @param {string} sourceText - Raw/extracted source text
 * @returns {string} - One of CLAIM_VERIFICATION_STATUSES
 */
export function classifyClaimOrigin(claim, sourceText = '') {
  const claimObj = typeof claim === 'object' && claim !== null ? claim : { statement: String(claim || '') };
  const text = (claimObj.statement || claimObj.claim || claimObj.text || '').trim();
  const rawSource = (typeof sourceText === 'string' ? sourceText : '').toLowerCase();

  // 1. Independently verified: ONLY if an actual verification process checked an authoritative source
  // We NEVER mark something independently verified without explicit verification proof
  if (
    claimObj.independentlyVerified === true ||
    claimObj.isIndependentlyVerified === true ||
    (claimObj.verificationResult && claimObj.verificationResult.verified === true && claimObj.verificationResult.verifier)
  ) {
    return CLAIM_VERIFICATION_STATUSES.INDEPENDENTLY_VERIFIED;
  }

  // 2. If source text is empty or missing, claim origin is unknown unless explicitly marked inferred
  if (!rawSource || rawSource.length === 0) {
    if (claimObj.type === 'ai-inferred' || claimObj.evidenceLevel === 'Inferred') {
      return CLAIM_VERIFICATION_STATUSES.INFERRED;
    }
    return CLAIM_VERIFICATION_STATUSES.UNKNOWN;
  }

  const lowerText = text.toLowerCase();

  // 3. Extracted from source: substring or substantive keyword overlap
  if (lowerText.length > 5 && rawSource.includes(lowerText)) {
    return CLAIM_VERIFICATION_STATUSES.EXTRACTED_FROM_SOURCE;
  }

  // Token-level containment check for short phrases
  const tokens = lowerText.split(/\s+/).filter(t => t.length > 3);
  if (tokens.length >= 2) {
    const matchedTokens = tokens.filter(t => rawSource.includes(t));
    if (matchedTokens.length / tokens.length >= 0.75) {
      return CLAIM_VERIFICATION_STATUSES.EXTRACTED_FROM_SOURCE;
    }
  }

  // 4. Inferred: model inference
  if (claimObj.type === 'ai-inferred' || claimObj.evidenceLevel === 'Inferred') {
    return CLAIM_VERIFICATION_STATUSES.INFERRED;
  }

  // 5. Default: If not found in source and not explicitly inferred
  return CLAIM_VERIFICATION_STATUSES.UNKNOWN;
}

/**
 * Returns qualitative label for model confidence score.
 * Never displays "100% accurate", "100% verified", or misleading percentages.
 * 
 * @param {number|null|undefined} score - Float between 0 and 1
 * @returns {{ label: string, isCalibrated: boolean, note: string }}
 */
export function getQualitativeConfidenceLabel(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return {
      label: 'Confidence Metric Not Available',
      isCalibrated: false,
      note: 'Model confidence was not computed.'
    };
  }

  const clamped = Math.max(0, Math.min(1, score));

  if (clamped >= 0.8) {
    return {
      label: 'High Model Inference Confidence',
      isCalibrated: false,
      note: 'Language model generation probability score — does NOT represent factual verification.'
    };
  }
  if (clamped >= 0.5) {
    return {
      label: 'Moderate Model Inference Confidence',
      isCalibrated: false,
      note: 'Standard generation confidence — source cross-checking recommended.'
    };
  }
  return {
    label: 'Low Model Inference Confidence',
    isCalibrated: false,
    note: 'Elevated uncertainty detected — careful human verification strongly recommended.'
  };
}

/**
 * Creates or normalizes a structured claim object adhering to Module 2 claim metadata requirements:
 * - Claim text
 * - Source reference or source excerpt
 * - Origin: source-extracted, AI-inferred, externally retrieved, or unknown
 * - Risk level: low, medium, or high
 * - Verification status: not checked, verification required, verified, contradicted, or unable to verify
 * - Verification evidence, timestamp, and method ONLY when genuinely available (never fabricated)
 * 
 * @param {string|object} claimInput 
 * @param {string} sourceText 
 * @param {object} options 
 * @returns {object} Structured claim object
 */
export function createStructuredClaim(claimInput, sourceText = '', options = {}) {
  const rawText = typeof claimInput === 'string'
    ? claimInput
    : (claimInput?.claimText || claimInput?.statement || claimInput?.text || claimInput?.claim || '');
  const cleanClaimText = String(rawText || '').trim();

  // 1. Risk Level Determination
  const isHighRisk = isHighRiskClaim(cleanClaimText) || Boolean(options.riskLevel === 'high' || claimInput?.riskLevel === 'high');
  const riskLevel = isHighRisk
    ? CLAIM_RISK_LEVELS.HIGH
    : (options.riskLevel || claimInput?.riskLevel || CLAIM_RISK_LEVELS.LOW);

  // 2. Grounding & Origin
  const rawSource = typeof sourceText === 'string' ? sourceText : '';
  const lowerSource = rawSource.toLowerCase();
  const lowerClaim = cleanClaimText.toLowerCase();

  let origin = CLAIM_ORIGINS.UNKNOWN;
  let sourceExcerpt = null;

  if (claimInput?.origin && Object.values(CLAIM_ORIGINS).includes(claimInput.origin)) {
    origin = claimInput.origin;
    sourceExcerpt = claimInput.sourceExcerpt || null;
  } else if (claimInput?.isGrounded === false || claimInput?.type === 'ai-inferred' || claimInput?.evidenceLevel === 'Inferred') {
    origin = CLAIM_ORIGINS.AI_INFERRED;
  } else if (rawSource && cleanClaimText.length > 3 && lowerSource.includes(lowerClaim)) {
    origin = CLAIM_ORIGINS.SOURCE_EXTRACTED;
    sourceExcerpt = cleanClaimText;
  } else if (rawSource && cleanClaimText.length > 5) {
    const tokens = lowerClaim.split(/\s+/).filter(t => t.length > 3);
    const matched = tokens.filter(t => lowerSource.includes(t));
    if (tokens.length > 0 && matched.length / tokens.length >= 0.6) {
      origin = CLAIM_ORIGINS.SOURCE_EXTRACTED;
      const sentences = rawSource.split(/(?<=[.?!])\s+|\n+/);
      const matchedSent = sentences.find(s => matched.some(m => s.toLowerCase().includes(m)));
      sourceExcerpt = matchedSent ? matchedSent.trim() : cleanClaimText;
    } else if (claimInput?.type === 'source-stated' || options.isGrounded) {
      origin = CLAIM_ORIGINS.SOURCE_EXTRACTED;
    } else {
      origin = (claimInput?.type === 'ai-inferred' || options.inferred)
        ? CLAIM_ORIGINS.AI_INFERRED
        : CLAIM_ORIGINS.UNKNOWN;
    }
  } else if (claimInput?.type === 'source-stated' || options.isGrounded) {
    origin = CLAIM_ORIGINS.SOURCE_EXTRACTED;
  }

  // 3. Independent Verification Proof
  // STRICT RULE: Only "verified" when an actual verification process ran and its evidence was recorded.
  // Never fabricate citations, URLs, verification timestamps, or verification outcomes.
  const evidence = options.verificationEvidence || claimInput?.verificationEvidence || (claimInput?.verificationResult?.verified ? claimInput.verificationResult.verifier : null);
  const hasAuthProof = Boolean(
    evidence &&
    (options.isIndependentlyVerified || claimInput?.isIndependentlyVerified || claimInput?.independentlyVerified || claimInput?.verificationResult?.verified)
  );

  let verificationStatus = CLAIM_VERIFICATION_STATES.NOT_CHECKED;
  if (hasAuthProof) {
    verificationStatus = CLAIM_VERIFICATION_STATES.VERIFIED;
  } else if (claimInput?.verificationStatus === CLAIM_VERIFICATION_STATES.CONTRADICTED) {
    verificationStatus = CLAIM_VERIFICATION_STATES.CONTRADICTED;
  } else if (origin === CLAIM_ORIGINS.UNKNOWN && isHighRisk) {
    verificationStatus = CLAIM_VERIFICATION_STATES.UNABLE_TO_VERIFY;
  } else if (isHighRisk) {
    verificationStatus = CLAIM_VERIFICATION_STATES.VERIFICATION_REQUIRED;
  } else {
    const statusCandidate = claimInput?.verificationStatus;
    if (statusCandidate === CLAIM_VERIFICATION_STATES.VERIFIED || statusCandidate === 'Verified') {
      verificationStatus = CLAIM_VERIFICATION_STATES.VERIFICATION_REQUIRED;
    } else {
      verificationStatus = statusCandidate || CLAIM_VERIFICATION_STATES.NOT_CHECKED;
    }
  }

  const warningNotice = (isHighRisk && verificationStatus !== CLAIM_VERIFICATION_STATES.VERIFIED)
    ? HIGH_RISK_CLAIM_WARNING
    : null;

  return {
    claimText: cleanClaimText,
    statement: cleanClaimText, // Backwards compatibility
    sourceExcerpt: sourceExcerpt || options.sourceExcerpt || claimInput?.sourceExcerpt || null,
    sourceReference: options.sourceReference || claimInput?.sourceReference || null,
    origin,
    riskLevel,
    verificationStatus,
    verificationEvidence: hasAuthProof ? evidence : null,
    verificationTimestamp: hasAuthProof ? (options.verificationTimestamp || claimInput?.verificationTimestamp || null) : null,
    verificationMethod: hasAuthProof ? (options.verificationMethod || claimInput?.verificationMethod || null) : null,
    isIndependentlyVerified: hasAuthProof,
    isGrounded: origin === CLAIM_ORIGINS.SOURCE_EXTRACTED,
    isHighRisk,
    warningNotice,
    type: origin === CLAIM_ORIGINS.SOURCE_EXTRACTED ? 'source-stated' : 'ai-inferred'
  };
}
