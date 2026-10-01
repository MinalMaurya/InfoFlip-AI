/**
 * InfoFlip-AI Source Data Types & Contracts
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 1: Smart Input & Content Ingestion
 */

export const SOURCE_TYPES = {
  TEXT: 'text',
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  IMAGE: 'image',
  VIDEO: 'video', // roadmap
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_MB = 10;

export const SUPPORTED_EXTENSIONS = [
  'pdf',
  'docx',
  'doc',
  'txt',
  'md',
  'jpg',
  'jpeg',
  'png',
  'webp'
];

export const SUPPORTED_MIME_TYPES = {
  // Documents
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'txt',
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image'
};

/**
 * Creates the clean structured data contract object specified in Module 1 Requirement 16.
 * This structured object is passed to Module 2 (AI Content Understanding).
 */
export function createSourcePayload({
  sourceId,
  sourceType,
  fileName = null,
  fileSize = null,
  mimeType = null,
  rawText = '',
  extractedText = '',
  imageData = null,
  metadata = {}
}) {
  const words = extractedText.trim() ? extractedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = extractedText.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return {
    sourceId: sourceId || `src-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceType,
    fileName,
    fileSize,
    mimeType,
    rawText: rawText || extractedText,
    extractedText,
    imageData,
    metadata: {
      wordCount: metadata.wordCount ?? words,
      characterCount: metadata.characterCount ?? chars,
      pageCount: metadata.pageCount ?? (sourceType === 'pdf' || sourceType === 'docx' ? 1 : undefined),
      readingTimeMinutes: metadata.readingTimeMinutes ?? readingTime,
      dimensions: metadata.dimensions ?? null,
      detectedLanguage: metadata.detectedLanguage || 'English',
      extractedAt: new Date().toISOString(),
      ...metadata
    },
    createdAt: new Date().toISOString()
  };
}
