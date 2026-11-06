import test from 'node:test';
import assert from 'node:assert/strict';
import { WORD_STANDARD_STYLES } from './exportReports';

test('WORD_STANDARD_STYLES meets administrative decree standards', () => {
  // A4 portrait
  assert.ok(WORD_STANDARD_STYLES.includes('size: 210mm 297mm;'), 'A4 paper size');
  // Margins: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm
  assert.ok(WORD_STANDARD_STYLES.includes('margin-top: 20mm;'), 'Top margin 2cm');
  assert.ok(WORD_STANDARD_STYLES.includes('margin-bottom: 20mm;'), 'Bottom margin 2cm');
  assert.ok(WORD_STANDARD_STYLES.includes('margin-left: 30mm;'), 'Left margin 3cm');
  assert.ok(WORD_STANDARD_STYLES.includes('margin-right: 20mm;'), 'Right margin 2cm');
  // Font: Times New Roman, Black, 14pt body
  assert.ok(WORD_STANDARD_STYLES.includes("'Times New Roman'"), 'Times New Roman font');
  assert.ok(WORD_STANDARD_STYLES.includes('color: #000000;'), 'Black text color');
  assert.ok(WORD_STANDARD_STYLES.includes('font-size: 14pt;'), '14pt body text');
  // Spacing before/after: 6pt
  assert.ok(WORD_STANDARD_STYLES.includes('margin-top: 6pt;'), 'Spacing before 6pt');
  assert.ok(WORD_STANDARD_STYLES.includes('margin-bottom: 6pt;'), 'Spacing after 6pt');
  // Recipients font size: 12pt, bold, italic
  assert.ok(WORD_STANDARD_STYLES.includes('font-size: 12pt;'), 'Recipients title 12pt');
  assert.ok(WORD_STANDARD_STYLES.includes('font-style: italic;'), 'Recipients italic');
});
