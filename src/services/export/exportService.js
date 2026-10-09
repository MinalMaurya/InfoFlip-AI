/**
 * InfoFlip-AI Export Service
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 6: Export & Distribution
 * 
 * Handles validation of Module 5 handoff packages, multi-format deliverable generation,
 * clipboard export, ZIP archive packaging, and strict lineage preservation.
 */

import { 
  createExportPackage, 
  createExportItem, 
  createExportResult, 
  EXPORT_STATUSES, 
  EXPORT_FORMATS 
} from '../../types/export.js';
import { getExportFormatById } from './exportFormatRegistry.js';
import { buildZipArchive } from './zipBuilder.js';
import { buildPdfDocument } from './pdfBuilder.js';

/**
 * Validates an incoming Module 5 export package.
 * Enforces that ONLY human-approved assets with intact lineage can be exported.
 * 
 * @param {object} pkg 
 * @returns {{ isValid: boolean, error?: string, details?: object }}
 */
export function validateExportPackage(pkg) {
  if (!pkg || typeof pkg !== 'object') {
    return {
      isValid: false,
      error: 'Export package is missing or invalid. Please complete human review in Module 5.'
    };
  }

  // Check lineage IDs
  if (!pkg.sourceId) {
    return {
      isValid: false,
      error: 'Lineage failure: Missing sourceId. Content cannot be traced to origin.'
    };
  }

  if (!pkg.communicationId) {
    return {
      isValid: false,
      error: 'Lineage failure: Missing communicationId. Channel generation contract absent.'
    };
  }

  // Check approvedOutputs array
  const approvedOutputs = pkg.approvedOutputs;
  if (!Array.isArray(approvedOutputs) || approvedOutputs.length === 0) {
    return {
      isValid: false,
      error: 'Export blocked: Zero human-approved outputs found. At least one output must be approved in Module 5 before export.'
    };
  }

  // Verify that every output in approvedOutputs is strictly APPROVED
  for (let i = 0; i < approvedOutputs.length; i++) {
    const item = approvedOutputs[i];
    const status = item.approvalStatus || item.status;
    if (status !== 'APPROVED') {
      return {
        isValid: false,
        error: `Export blocked: Output #${i + 1} (${item.channelId || 'channel'}) has status "${status}". Only approved content can be exported.`
      };
    }
  }

  // Verify quality gate
  const qg = pkg.reviewSummary?.qualityGate;
  if (qg === 'FAILED' || (typeof qg === 'object' && qg.passed === false)) {
    return {
      isValid: false,
      error: 'Export blocked: Quality gate is FAILED. Human review must resolve critical issues first.'
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes strings for safe inclusion in filenames
 * 
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeFileName(str) {
  if (!str) return 'asset';
  return String(str)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Predictable filename generator
 * 
 * @param {object} pkg 
 * @param {string} formatId 
 * @param {string|null} channelId 
 * @returns {string}
 */
export function generateFileName(pkg, formatId = 'txt', channelId = null) {
  const exportId = sanitizeFileName(pkg?.exportId || 'export');
  
  if (channelId) {
    const cleanChannel = sanitizeFileName(channelId);
    return `InfoFlip-AI-${cleanChannel}-Approved.txt`;
  }

  const formatConfig = getExportFormatById(formatId);
  const ext = formatConfig?.extension || `.${formatId}`;

  return `InfoFlip-AI-Export-${exportId}${ext}`;
}

/**
 * Standardizes approved outputs into an array of ExportItem objects
 * 
 * @param {object} pkg 
 * @returns {Array<object>}
 */
export function prepareExportItems(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);
  return normalized.approvedOutputs;
}

/**
 * Generates a clean human-readable TXT representation
 * 
 * @param {object} pkg 
 * @returns {string}
 */
export function generateTXT(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);
  const {
    exportId,
    sourceId,
    analysisId,
    transformationId,
    communicationId,
    approvedOutputs,
    reviewSummary,
    config,
    createdAt
  } = normalized;

  const divider = '='.repeat(78);
  const subDivider = '-'.repeat(78);

  const sections = [];

  sections.push(divider);
  sections.push('INFOFLIP-AI  --  CERTIFIED COMMUNICATION EXPORT DELIVERABLE');
  sections.push(divider);
  sections.push('');
  sections.push(`Export ID:           ${exportId}`);
  sections.push(`Source ID:           ${sourceId}`);
  sections.push(`Analysis ID:         ${analysisId}`);
  sections.push(`Transformation ID:   ${transformationId}`);
  sections.push(`Communication ID:    ${communicationId}`);
  sections.push(`Quality Gate:        ${reviewSummary.qualityGate}`);
  sections.push(`Approved Assets:     ${approvedOutputs.length}`);
  sections.push(`Exported At:         ${createdAt}`);
  sections.push('');
  sections.push('CONFIGURATION & TARGET PROFILE:');
  sections.push(`- Target Audience:   ${config.targetAudience || 'General Public'}`);
  sections.push(`- Requested Tone:    ${config.tone || 'Informative'}`);
  sections.push(`- Target Language:   ${config.language || 'English'}`);
  sections.push('');
  sections.push(divider);
  sections.push('APPROVED COMMUNICATION ASSETS');
  sections.push(divider);

  approvedOutputs.forEach((item, index) => {
    sections.push('');
    sections.push(subDivider);
    sections.push(`[${index + 1}] ${item.channelId.toUpperCase()}  --  ${item.title}`);
    sections.push(`Status:        ${item.status}`);
    sections.push(`Verification:  ${item.verificationStatus || 'Source not independently verified'}`);
    sections.push(`Content Flag:  ${item.contentStatusFlag || 'Approved for export'}`);
    sections.push(`Reviewer:      ${item.reviewer} (${new Date(item.reviewedAt).toLocaleString()})`);
    sections.push(`Telemetry:     ${item.wordCount} words | ${item.characterCount} characters`);
    sections.push(`Remarks:       ${item.reviewerRemarks}`);
    sections.push(subDivider);
    sections.push('');
    sections.push('CONTENT:');
    sections.push(item.content);
    sections.push('');
  });

  sections.push(divider);
  sections.push('AUDIT TRAIL & LINEAGE VERIFICATION');
  sections.push(divider);
  sections.push('1. Ingestion (Module 1):        Source Ingested & Normalized [' + sourceId + ']');
  sections.push('2. Understanding (Module 2):    Context & Fact Extraction [' + analysisId + ']');
  sections.push('3. Transformation (Module 3):   Multi-Format Synthesis [' + transformationId + ']');
  sections.push('4. Communication (Module 4):    Channel Adaptation Generated [' + communicationId + ']');
  sections.push('5. Quality Assurance (Mod 5):   10-Dimension Audit Evaluated');
  sections.push('6. Human Approval (Mod 5):      Human Review Completed & Approved for Export');
  sections.push('7. Final Export (Module 6):     Delivered as Approved Package [' + exportId + ']');
  sections.push(divider);

  return sections.join('\n');
}

/**
 * Generates an authoritative machine-readable JSON package
 * 
 * @param {object} pkg 
 * @returns {string}
 */
export function generateJSON(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);

  const exportDocument = {
    product: 'InfoFlip-AI',
    exportId: normalized.exportId,
    createdAt: normalized.createdAt,

    lineage: {
      sourceId: normalized.sourceId,
      analysisId: normalized.analysisId,
      transformationId: normalized.transformationId,
      communicationId: normalized.communicationId
    },

    qualityGate: normalized.reviewSummary.qualityGate,
    approvedCount: normalized.approvedOutputs.length,

    approvedOutputs: normalized.approvedOutputs,

    reviewSummary: normalized.reviewSummary,

    config: normalized.config,

    exportMetadata: {
      exportedAt: new Date().toISOString(),
      format: 'json',
      system: 'InfoFlip-AI SIH 2026',
      generator: 'Module 6 Export Engine'
    }
  };

  return JSON.stringify(exportDocument, null, 2);
}

/**
 * Generates a PDF 1.4 document
 * 
 * @param {object} pkg 
 * @returns {string} - Raw PDF 1.4 document string
 */
export function generatePDF(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);
  return buildPdfDocument(normalized);
}

/**
 * Generates a full structured distribution package (.zip)
 * 
 * @param {object} pkg 
 * @returns {Uint8Array}
 */
export function generatePackage(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);
  const files = [];

  // 1. Manifest JSON
  const manifest = createExportManifest(normalized);
  files.push({
    path: 'InfoFlip-AI-Export/manifest.json',
    content: JSON.stringify(manifest, null, 2)
  });

  // 2. README.txt
  const readme = generateTXT(normalized);
  files.push({
    path: 'InfoFlip-AI-Export/README.txt',
    content: readme
  });

  // 3. Individual approved content files
  normalized.approvedOutputs.forEach(item => {
    const channelName = sanitizeFileName(item.channelId);
    files.push({
      path: `InfoFlip-AI-Export/approved-content/${channelName}.txt`,
      content: item.content
    });
  });

  // 4. Audit review summary
  files.push({
    path: 'InfoFlip-AI-Export/audit/review-summary.json',
    content: JSON.stringify({
      exportId: normalized.exportId,
      qualityGate: normalized.reviewSummary.qualityGate,
      approvedCount: normalized.approvedOutputs.length,
      lineage: {
        sourceId: normalized.sourceId,
        analysisId: normalized.analysisId,
        transformationId: normalized.transformationId,
        communicationId: normalized.communicationId
      },
      reviewSummary: normalized.reviewSummary,
      approvedAssets: normalized.approvedOutputs.map(o => ({
        outputId: o.outputId,
        channelId: o.channelId,
        reviewer: o.reviewer,
        reviewedAt: o.reviewedAt,
        reviewerRemarks: o.reviewerRemarks
      }))
    }, null, 2)
  });

  return buildZipArchive(files);
}

/**
 * Creates export manifest data structure
 * 
 * @param {object} pkg 
 * @returns {object}
 */
export function createExportManifest(pkg) {
  const normalized = createExportPackage(pkg);

  return {
    product: 'InfoFlip-AI',
    version: '1.0.0',
    exportId: normalized.exportId,
    exportedAt: new Date().toISOString(),
    sourceId: normalized.sourceId,
    analysisId: normalized.analysisId,
    transformationId: normalized.transformationId,
    communicationId: normalized.communicationId,
    qualityGate: normalized.reviewSummary.qualityGate,
    approvedCount: normalized.approvedOutputs.length,
    items: normalized.approvedOutputs.map(item => ({
      outputId: item.outputId,
      channelId: item.channelId,
      title: item.title,
      wordCount: item.wordCount,
      characterCount: item.characterCount,
      verificationStatus: item.verificationStatus,
      contentStatusFlag: item.contentStatusFlag,
      hasHumanOverride: item.hasHumanOverride,
      reviewer: item.reviewer,
      reviewedAt: item.reviewedAt
    })),
    config: normalized.config
  };
}

/**
 * Copies all approved outputs concatenated cleanly
 * 
 * @param {object} pkg 
 * @returns {Promise<{ success: boolean, text: string }>}
 */
export async function copyAll(pkg) {
  const validation = validateExportPackage(pkg);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const normalized = createExportPackage(pkg);
  const blocks = normalized.approvedOutputs.map(item => {
    const channelHeader = item.channelId.toLowerCase() === 'twitter' 
      ? 'X / TWITTER' 
      : item.channelId.toUpperCase();
    return `[${channelHeader}]\n${item.content}`;
  });

  const fullText = blocks.join('\n\n---\n\n');

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(fullText);
      return { success: true, text: fullText };
    } catch {
      return { success: false, text: fullText };
    }
  }

  return { success: true, text: fullText };
}

/**
 * Copies a single approved output item
 * 
 * @param {object} item 
 * @returns {Promise<{ success: boolean, text: string }>}
 */
export async function copyItem(item) {
  const content = typeof item?.content === 'string' ? item.content : '';
  if (!content) {
    return { success: false, text: '' };
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return { success: true, text: content };
    } catch {
      return { success: false, text: content };
    }
  }

  return { success: true, text: content };
}

/**
 * Returns high-level summary telemetry for display
 * 
 * @param {object} pkg 
 * @returns {object}
 */
export function getExportSummary(pkg) {
  if (!pkg) return null;
  const normalized = createExportPackage(pkg);

  return {
    exportId: normalized.exportId,
    approvedCount: normalized.approvedOutputs.length,
    qualityGate: normalized.reviewSummary.qualityGate,
    sourceId: normalized.sourceId,
    createdAt: normalized.createdAt,
    channels: normalized.approvedOutputs.map(o => o.channelId)
  };
}

/**
 * Helper to trigger client-side download in web browser
 * 
 * @param {string|Uint8Array} data 
 * @param {string} fileName 
 * @param {string} mimeType 
 */
export function downloadFile(data, fileName, mimeType = 'text/plain;charset=utf-8') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const blob = data instanceof Uint8Array 
    ? new Blob([data], { type: mimeType })
    : new Blob([data], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
