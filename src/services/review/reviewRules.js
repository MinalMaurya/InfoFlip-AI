/**
 * Review Rules Aggregator for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Orchestrates the 10 review dimensions over an individual communication output item.
 */

import { CHECK_STATUSES } from '../../types/review.js';
import { checkFactualConsistency } from './factualConsistencyChecker.js';
import { checkSourceGrounding } from './groundingChecker.js';
import { checkHallucinationRisk } from './hallucinationChecker.js';
import { checkToneConsistency } from './toneChecker.js';
import { checkAudienceFit } from './audienceFitChecker.js';
import { checkReadability } from './readabilityChecker.js';
import { checkLanguageConsistency } from './languageConsistencyChecker.js';
import { checkPlatformCompliance } from './platformComplianceChecker.js';
import { checkDuplication } from './duplicationChecker.js';
import { checkSafetyAndSensitivity } from './safetyChecker.js';

/**
 * Runs all 10 deterministic review checks against a single communication output item.
 * 
 * @param {object} outputItem 
 * @param {object} context 
 * @returns {object} - { checks, overallStatus, summary }
 */
export function evaluateOutputItem(outputItem, context = {}) {
  const checks = {
    factualConsistency: checkFactualConsistency(outputItem, context),
    sourceGrounding: checkSourceGrounding(outputItem, context),
    hallucinationRisk: checkHallucinationRisk(outputItem, context),
    toneConsistency: checkToneConsistency(outputItem, context),
    audienceFit: checkAudienceFit(outputItem, context),
    readability: checkReadability(outputItem, context),
    languageConsistency: checkLanguageConsistency(outputItem, context),
    platformCompliance: checkPlatformCompliance(outputItem, context),
    duplication: checkDuplication(outputItem, context),
    safety: checkSafetyAndSensitivity(outputItem, context)
  };

  let passed = 0;
  let warnings = 0;
  let failed = 0;

  for (const key of Object.keys(checks)) {
    const s = checks[key].status;
    if (s === CHECK_STATUSES.FAIL) failed++;
    else if (s === CHECK_STATUSES.WARNING) warnings++;
    else passed++;
  }

  let overallStatus = CHECK_STATUSES.PASS;
  if (failed > 0) {
    overallStatus = CHECK_STATUSES.FAIL;
  } else if (warnings > 0) {
    overallStatus = CHECK_STATUSES.WARNING;
  }

  return {
    checks,
    overallStatus,
    summary: { passed, warnings, failed }
  };
}
