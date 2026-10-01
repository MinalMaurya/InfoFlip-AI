import { 
  MAX_FILE_SIZE_BYTES, 
  MAX_FILE_SIZE_MB, 
  SUPPORTED_EXTENSIONS, 
  SUPPORTED_MIME_TYPES 
} from '../types/source.js';

/**
 * Format bytes into human readable string (KB, MB)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename = '') {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop().toLowerCase();
}

/**
 * Validate an uploaded file according to Module 1 standards
 * @param {File} file 
 * @returns {{ isValid: boolean, error?: string, fileType?: string, extension?: string, formattedSize?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: 'No file was selected. Please select a valid file to continue.'
    };
  }

  const extension = getFileExtension(file.name);
  const formattedSize = formatFileSize(file.size);

  // 1. Check for empty file
  if (file.size === 0) {
    return {
      isValid: false,
      error: `The file "${file.name}" is empty (0 bytes). Please upload a document with valid content.`,
      extension,
      formattedSize
    };
  }

  // 2. Check file size against 10MB limit
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `This file is larger than ${MAX_FILE_SIZE_MB} MB (${formattedSize}). Please upload a smaller file.`,
      extension,
      formattedSize
    };
  }

  // 3. Check file extension and MIME type
  const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(extension);
  const isMimeSupported = Object.keys(SUPPORTED_MIME_TYPES).includes(file.type);

  if (!isExtensionSupported && !isMimeSupported) {
    const extLabel = extension ? `(.${extension})` : '';
    return {
      isValid: false,
      error: `Unsupported file type ${extLabel}. Please upload PDF, DOCX, TXT, JPG or PNG.`,
      extension,
      formattedSize
    };
  }

  // Determine standard source type
  let resolvedType = 'txt';
  if (extension === 'pdf' || file.type === 'application/pdf') {
    resolvedType = 'pdf';
  } else if (extension === 'docx' || extension === 'doc' || file.type.includes('word')) {
    resolvedType = 'docx';
  } else if (['jpg', 'jpeg', 'png', 'webp'].includes(extension) || file.type.startsWith('image/')) {
    resolvedType = 'image';
  }

  return {
    isValid: true,
    error: null,
    fileType: resolvedType,
    extension,
    formattedSize
  };
}
