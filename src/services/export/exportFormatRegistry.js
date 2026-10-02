/**
 * InfoFlip-AI Export Format Registry
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 6: Export & Distribution
 * 
 * Registry architecture allowing extensible format adapters (TXT, JSON, PDF, ZIP Package).
 */

import { EXPORT_FORMATS } from '../../types/export.js';

export const EXPORT_FORMAT_REGISTRY = {
  [EXPORT_FORMATS.TXT]: {
    formatId: EXPORT_FORMATS.TXT,
    label: 'Plain Text (.txt)',
    shortLabel: 'TXT',
    description: 'Human-readable structured text document with complete lineage and audit trail.',
    extension: '.txt',
    mimeType: 'text/plain;charset=utf-8',
    enabled: true
  },
  [EXPORT_FORMATS.JSON]: {
    formatId: EXPORT_FORMATS.JSON,
    label: 'Machine-Readable JSON (.json)',
    shortLabel: 'JSON',
    description: 'Complete structured JSON package preserving upstream lineage and review metadata.',
    extension: '.json',
    mimeType: 'application/json;charset=utf-8',
    enabled: true
  },
  [EXPORT_FORMATS.PDF]: {
    formatId: EXPORT_FORMATS.PDF,
    label: 'Portable Document (.pdf)',
    shortLabel: 'PDF',
    description: 'ISO-compliant PDF 1.4 document formatted for printing and official distribution.',
    extension: '.pdf',
    mimeType: 'application/pdf',
    enabled: true
  },
  [EXPORT_FORMATS.PACKAGE]: {
    formatId: EXPORT_FORMATS.PACKAGE,
    label: 'Complete Distribution Package (.zip)',
    shortLabel: 'ZIP Package',
    description: 'Structured ZIP archive with individual channel files, manifest, and review summary.',
    extension: '.zip',
    mimeType: 'application/zip',
    enabled: true
  }
};

/**
 * Retrieves a format configuration by its ID
 * 
 * @param {string} formatId 
 * @returns {object|null}
 */
export function getExportFormatById(formatId) {
  if (!formatId) return null;
  return EXPORT_FORMAT_REGISTRY[formatId.toLowerCase()] || null;
}

/**
 * Returns all registered export formats
 * 
 * @returns {Array<object>}
 */
export function getAllExportFormats() {
  return Object.values(EXPORT_FORMAT_REGISTRY).filter(f => f.enabled);
}

/**
 * Registers an additional export format dynamically
 * 
 * @param {object} formatConfig 
 */
export function registerExportFormat(formatConfig) {
  if (!formatConfig || !formatConfig.formatId) {
    throw new Error('Invalid format configuration: formatId is required.');
  }
  EXPORT_FORMAT_REGISTRY[formatConfig.formatId.toLowerCase()] = {
    ...formatConfig,
    enabled: formatConfig.enabled ?? true
  };
}

/**
 * Validates if a format ID is supported
 * 
 * @param {string} formatId 
 * @returns {boolean}
 */
export function isExportFormatSupported(formatId) {
  if (!formatId) return false;
  return Boolean(EXPORT_FORMAT_REGISTRY[formatId.toLowerCase()]);
}
