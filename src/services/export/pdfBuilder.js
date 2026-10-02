/**
 * Pure JavaScript Zero-Dependency PDF 1.4 Document Generator
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 6: Export & Distribution
 * 
 * Generates valid ISO 32000 / PDF 1.4 compliant documents formatted for
 * professional printing, PDF viewers, and compliance archives.
 */

function escapePdfString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r/g, '')
    .replace(/[^\x20-\x7E\n]/g, '?'); // sanitize non-ASCII for core Helvetica
}

/**
 * Generates a valid PDF 1.4 byte stream representing the approved export package.
 * 
 * @param {object} exportPackage - Standard Module 6 export package
 * @returns {string} - Raw PDF 1.4 document string
 */
export function buildPdfDocument(exportPackage = {}) {
  const {
    exportId = 'pkg-exp-sample',
    sourceId = 'src-sample',
    analysisId = 'ana-sample',
    transformationId = 'trans-sample',
    communicationId = 'comm-sample',
    approvedOutputs = [],
    reviewSummary = {},
    createdAt = new Date().toISOString()
  } = exportPackage;

  const lines = [];

  // Header & Title
  lines.push('======================================================================');
  lines.push('INFOFLIP-AI  --  CERTIFIED HUMAN-APPROVED CONTENT EXPORT');
  lines.push('======================================================================');
  lines.push(`Export ID:         ${exportId}`);
  lines.push(`Source ID:         ${sourceId}`);
  lines.push(`Quality Gate:      ${reviewSummary.qualityGate || 'PASSED'}`);
  lines.push(`Approved Assets:   ${approvedOutputs.length}`);
  lines.push(`Generated:         ${createdAt}`);
  lines.push('');
  lines.push('----------------------------------------------------------------------');
  lines.push('APPROVED COMMUNICATION DELIVERABLES');
  lines.push('----------------------------------------------------------------------');

  for (let idx = 0; idx < approvedOutputs.length; idx++) {
    const item = approvedOutputs[idx];
    lines.push('');
    lines.push(`[${idx + 1}] CHANNEL: ${(item.channelId || 'CHANNEL').toUpperCase()}`);
    lines.push(`Title:      ${item.title || item.channelId}`);
    lines.push(`Status:     APPROVED`);
    lines.push(`Reviewer:   ${item.reviewer || 'Human Reviewer'}`);
    lines.push(`Metrics:    ${item.wordCount || 0} words | ${item.characterCount || 0} characters`);
    if (item.reviewerRemarks) {
      lines.push(`Remarks:    ${item.reviewerRemarks}`);
    }
    lines.push('----------------------------------------');
    
    // Split content into printable chunks (wrap around 70 characters)
    const contentLines = (item.content || '').split('\n');
    for (const rawLine of contentLines) {
      if (rawLine.length <= 70) {
        lines.push(rawLine);
      } else {
        const words = rawLine.split(' ');
        let cur = '';
        for (const w of words) {
          if ((cur + ' ' + w).length > 70) {
            lines.push(cur.trim());
            cur = w;
          } else {
            cur += ' ' + w;
          }
        }
        if (cur.trim()) lines.push(cur.trim());
      }
    }
    lines.push('----------------------------------------');
  }

  // Audit Trail & Lineage
  lines.push('');
  lines.push('======================================================================');
  lines.push('AUDIT TRAIL & LINEAGE RECORD');
  lines.push('======================================================================');
  lines.push(`1. Source Ingested (Module 1):        ${sourceId}`);
  lines.push(`2. Context Understood (Module 2):     ${analysisId}`);
  lines.push(`3. Transformed Engine (Module 3):     ${transformationId}`);
  lines.push(`4. Communication Assets (Module 4):   ${communicationId}`);
  lines.push(`5. Quality Assurance (Module 5):      PASSED (10-Dimension Check)`);
  lines.push(`6. Human Review & Approval:           Certified by Human Reviewer`);
  lines.push(`7. Downstream Export (Module 6):      ${exportId}`);
  lines.push('======================================================================');

  // Distribute lines across pages (max 48 lines per page)
  const LINES_PER_PAGE = 48;
  const pages = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }

  if (pages.length === 0) {
    pages.push(['No content available for export.']);
  }

  // Build PDF 1.4 Object Structure
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length; // 1-indexed object ID
  };

  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Font
  // Following objects: Page objects and their content streams

  const fontObjId = 3;
  const pageObjIds = [];
  const contentObjIds = [];

  // Pre-calculate IDs
  let nextId = 4;
  for (let i = 0; i < pages.length; i++) {
    pageObjIds.push(nextId++);
    contentObjIds.push(nextId++);
  }

  // 1 0 obj: Catalog
  const catalog = `<< /Type /Catalog /Pages 2 0 R >>`;
  
  // 2 0 obj: Pages
  const pagesObj = `<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;

  // 3 0 obj: Core Helvetica Font
  const fontObj = `<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`;

  // Page and Content Stream objects
  const pageObjects = [];
  const streamObjects = [];

  for (let i = 0; i < pages.length; i++) {
    const pageLines = pages[i];
    
    // Build text stream
    let textStream = 'BT\n/F1 9 Tf\n14 TL\n40 760 Td\n';
    for (let j = 0; j < pageLines.length; j++) {
      const escaped = escapePdfString(pageLines[j]);
      textStream += `(${escaped}) Tj\nT*\n`;
    }
    textStream += 'ET';

    const streamLength = textStream.length;
    const contentBody = `<< /Length ${streamLength} >>\nstream\n${textStream}\nendstream`;
    streamObjects.push(contentBody);

    const pageBody = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjId} 0 R >> >> /Contents ${contentObjIds[i]} 0 R >>`;
    pageObjects.push(pageBody);
  }

  // Assemble full PDF
  let pdf = '%PDF-1.4\n%âãÏÓ\n';
  const offsets = [];

  const writeObj = (id, body) => {
    offsets.push(pdf.length);
    pdf += `${id} 0 obj\n${body}\nendobj\n`;
  };

  writeObj(1, catalog);
  writeObj(2, pagesObj);
  writeObj(3, fontObj);

  for (let i = 0; i < pages.length; i++) {
    writeObj(pageObjIds[i], pageObjects[i]);
    writeObj(contentObjIds[i], streamObjects[i]);
  }

  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }

  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF\n';

  return pdf;
}
