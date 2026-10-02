/**
 * Pure JavaScript Zero-Dependency ZIP Builder
 * 
 * SIH 2026 - Problem Statement ID 26154
 * Module 6: Export & Distribution
 * 
 * Generates standard PKZip (PK\x03\x04) uncompressed archives compatible with
 * macOS Archive Utility, Windows Explorer, Linux unzip, and browser downloads.
 */

// CRC-32 Lookup Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  CRC_TABLE[i] = c >>> 0;
}

function calculateCRC32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function stringToUTF8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Fallback for older environments
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    }
  }
  return new Uint8Array(utf8);
}

/**
 * Creates a valid ZIP archive containing the specified files.
 * 
 * @param {Array<{ path: string, content: string|Uint8Array }>} files 
 * @returns {Uint8Array} - Valid PKZip binary buffer
 */
export function buildZipArchive(files = []) {
  const fileEntries = [];
  let currentOffset = 0;

  // 1. Process local file entries
  for (const file of files) {
    const nameBytes = stringToUTF8Bytes(file.path.replace(/\\/g, '/'));
    const contentBytes = typeof file.content === 'string' 
      ? stringToUTF8Bytes(file.content) 
      : (file.content instanceof Uint8Array ? file.content : new Uint8Array(0));

    const crc = calculateCRC32(contentBytes);
    const size = contentBytes.length;

    // DOS Date & Time (fixed constant for deterministic builds)
    const dosTime = 0x5000; // 10:00:00 AM
    const dosDate = 0x5CD4; // Oct 2, 2026

    // Local Header: 30 bytes + name length + content length
    const localHeader = new Uint8Array(30 + nameBytes.length + size);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034B50, true);  // Local file header signature (PK\x03\x04)
    view.setUint16(4, 20, true);          // Version needed (2.0)
    view.setUint16(6, 0x0800, true);      // General purpose bit flag (UTF-8 enabled)
    view.setUint16(8, 0, true);           // Compression method (0 = Store)
    view.setUint16(10, dosTime, true);    // Last mod time
    view.setUint16(12, dosDate, true);    // Last mod date
    view.setUint32(14, crc, true);        // CRC-32
    view.setUint32(18, size, true);       // Compressed size
    view.setUint32(22, size, true);       // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);          // Extra field length

    localHeader.set(nameBytes, 30);
    localHeader.set(contentBytes, 30 + nameBytes.length);

    fileEntries.push({
      nameBytes,
      crc,
      size,
      dosTime,
      dosDate,
      offset: currentOffset,
      localHeader
    });

    currentOffset += localHeader.length;
  }

  // 2. Central directory entries
  const centralDirStart = currentOffset;
  const centralDirEntries = [];

  for (const entry of fileEntries) {
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014B50, true);  // Central directory header signature (PK\x01\x02)
    view.setUint16(4, 20, true);          // Version made by
    view.setUint16(6, 20, true);          // Version needed
    view.setUint16(8, 0x0800, true);      // Flags (UTF-8)
    view.setUint16(10, 0, true);          // Compression method (0 = Store)
    view.setUint16(12, entry.dosTime, true);
    view.setUint16(14, entry.dosDate, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);          // Extra field length
    view.setUint16(32, 0, true);          // File comment length
    view.setUint16(34, 0, true);          // Disk number start
    view.setUint16(36, 0, true);          // Internal file attributes
    view.setUint32(38, 0, true);          // External file attributes
    view.setUint32(42, entry.offset, true); // Relative offset of local header

    cdHeader.set(entry.nameBytes, 46);
    centralDirEntries.push(cdHeader);
    currentOffset += cdHeader.length;
  }

  const centralDirSize = currentOffset - centralDirStart;

  // 3. End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054B50, true); // End of central dir signature (PK\x05\x06)
  eocdView.setUint16(4, 0, true);         // Disk number
  eocdView.setUint16(6, 0, true);         // Disk with central dir
  eocdView.setUint16(8, fileEntries.length, true);  // Total entries on this disk
  eocdView.setUint16(10, fileEntries.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, centralDirStart, true);    // Offset of central directory
  eocdView.setUint16(20, 0, true);        // Comment length

  // 4. Concatenate all segments into single Uint8Array
  const totalLength = currentOffset + 22;
  const resultZip = new Uint8Array(totalLength);
  let writeOffset = 0;

  for (const entry of fileEntries) {
    resultZip.set(entry.localHeader, writeOffset);
    writeOffset += entry.localHeader.length;
  }

  for (const cd of centralDirEntries) {
    resultZip.set(cd, writeOffset);
    writeOffset += cd.length;
  }

  resultZip.set(eocd, writeOffset);

  return resultZip;
}
