/**
 * Review Validator for InfoFlip-AI Module 5
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 5: Review, Quality Assurance & Human Approval
 * 
 * Validates incoming Module 4 contracts and outgoing Module 6 export packages.
 */

/**
 * Validates the incoming payload from Module 4
 * 
 * @param {object} payload 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateReviewInput(payload) {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Review input payload is missing or not an object.' };
  }

  const commContract = payload.communicationResult || payload.communication || payload;
  const outputs = commContract.communicationOutputs || commContract.outputs || payload.communicationOutputs || payload.outputs;

  if (!Array.isArray(outputs) || outputs.length === 0) {
    return { isValid: false, error: 'At least one communication output must be provided for review.' };
  }

  return { isValid: true };
}

export const validateModule4InputContract = validateReviewInput;

/**
 * Validates an individual review item
 * 
 * @param {object} item 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateReviewItem(item) {
  if (!item || typeof item !== 'object') {
    return { isValid: false, error: 'Review item is invalid or not an object.' };
  }
  if (!item.outputId || !item.channelId) {
    return { isValid: false, error: 'Review item must have outputId and channelId.' };
  }
  return { isValid: true };
}

/**
 * Validates an outgoing export handoff package for Module 6
 * 
 * @param {object} pkg 
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateExportPackage(pkg) {
  if (!pkg) {
    return { isValid: false, error: 'Export package is null or missing.' };
  }

  if (!Array.isArray(pkg.approvedOutputs) || pkg.approvedOutputs.length === 0) {
    return { isValid: false, error: 'No approved outputs available for export. At least one output must be approved.' };
  }

  if (!pkg.sourceId || !pkg.communicationId) {
    return { isValid: false, error: 'Export package missing lineage identifiers (sourceId or communicationId).' };
  }

  return { isValid: true };
}
