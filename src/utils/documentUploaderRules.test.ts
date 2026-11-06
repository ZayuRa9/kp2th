import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectResourceFormat,
  formatByteSize,
  validateResourceFile,
  normalizeVideoEmbedUrl,
  MAX_FILE_SIZE_BYTES,
} from './documentUploaderRules';

test('detectResourceFormat correctly identifies MP4, DOCX, PPTX, and PDF', () => {
  // By extension
  assert.equal(detectResourceFormat('huong_dan_vneid.mp4'), 'mp4');
  assert.equal(detectResourceFormat('bieu_mau_to_khai.docx'), 'docx');
  assert.equal(detectResourceFormat('huong_dan_cu.doc'), 'docx');
  assert.equal(detectResourceFormat('tap_huan_can_bo.pptx'), 'pptx');
  assert.equal(detectResourceFormat('slide_bao_cao.ppt'), 'pptx');
  assert.equal(detectResourceFormat('so_tay_khu_pho.pdf'), 'pdf');

  // Case insensitive
  assert.equal(detectResourceFormat('VIDEO.MP4'), 'mp4');
  assert.equal(detectResourceFormat('DOC.DOCX'), 'docx');
  assert.equal(detectResourceFormat('SLIDES.PPTX'), 'pptx');
  assert.equal(detectResourceFormat('MANUAL.PDF'), 'pdf');

  // By MIME type fallback
  assert.equal(detectResourceFormat('unnamed_file', 'video/mp4'), 'mp4');
  assert.equal(detectResourceFormat('unnamed_file', 'application/pdf'), 'pdf');
  assert.equal(
    detectResourceFormat(
      'unnamed_file',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ),
    'docx'
  );
  assert.equal(
    detectResourceFormat(
      'unnamed_file',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ),
    'pptx'
  );

  // Unsupported formats
  assert.equal(detectResourceFormat('executable.exe'), null);
  assert.equal(detectResourceFormat('script.js'), null);
  assert.equal(detectResourceFormat('archive.zip'), null);
});

test('formatByteSize formats sizes cleanly', () => {
  assert.equal(formatByteSize(0), '0 KB');
  assert.equal(formatByteSize(500), '500 B');
  assert.equal(formatByteSize(1024), '1.0 KB');
  assert.equal(formatByteSize(2048 * 1024), '2.0 MB');
  assert.equal(formatByteSize(15.5 * 1024 * 1024), '15.5 MB');
});

test('validateResourceFile enforces valid formats and size limits', () => {
  // Valid files
  const validMp4 = validateResourceFile({
    name: 'vneid_huong_dan.mp4',
    size: 15 * 1024 * 1024,
    type: 'video/mp4',
  });
  assert.equal(validMp4.valid, true);
  assert.equal(validMp4.format, 'mp4');

  const validDocx = validateResourceFile({
    name: 'bieu_mau.docx',
    size: 250 * 1024,
  });
  assert.equal(validDocx.valid, true);
  assert.equal(validDocx.format, 'docx');

  const validPptx = validateResourceFile({
    name: 'tap_huan.pptx',
    size: 5 * 1024 * 1024,
  });
  assert.equal(validPptx.valid, true);
  assert.equal(validPptx.format, 'pptx');

  const validPdf = validateResourceFile({
    name: 'quy_che.pdf',
    size: 1.2 * 1024 * 1024,
  });
  assert.equal(validPdf.valid, true);
  assert.equal(validPdf.format, 'pdf');

  // Invalid extension
  const invalidExt = validateResourceFile({
    name: 'tro_choi.exe',
    size: 1024,
  });
  assert.equal(invalidExt.valid, false);
  assert.equal(invalidExt.format, null);
  assert.ok(invalidExt.error?.includes('không hợp lệ'));

  // Zero size
  const emptyFile = validateResourceFile({
    name: 'huong_dan.pdf',
    size: 0,
  });
  assert.equal(emptyFile.valid, false);
  assert.ok(emptyFile.error?.includes('rỗng'));

  // Oversized file
  const oversizedFile = validateResourceFile({
    name: 'phim_qua_nang.mp4',
    size: MAX_FILE_SIZE_BYTES + 1024,
  });
  assert.equal(oversizedFile.valid, false);
  assert.ok(oversizedFile.error?.includes('vượt quá'));
});

test('normalizeVideoEmbedUrl transforms YouTube URLs to embed format', () => {
  assert.equal(
    normalizeVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  );
  assert.equal(
    normalizeVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  );
  assert.equal(
    normalizeVideoEmbedUrl('https://example.com/videos/tutorial.mp4'),
    'https://example.com/videos/tutorial.mp4'
  );
  assert.equal(normalizeVideoEmbedUrl(''), '');
});
