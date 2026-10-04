const fs = require('fs');

// Check that preview-script.js defines all required toolbar elements and handlers
const script = fs.readFileSync('preview-script.js', 'utf8');

const requiredTokens = [
  'tstFontFamily',
  'tstFontSize',
  'tstCustomColorPicker',
  'tstAlignLeft',
  'tstAlignCenter',
  'tstAlignRight',
  'tstAlignJustify',
  'tstBtnBold',
  'tstBtnItalic',
  'tstBtnUnderline',
  'tstBtnReset',
  'applyInlineStyle',
  'applyAlignment',
  'clearSelectionFormatting',
  'restoreSavedSelection',
  'initTextSelectionToolbar'
];

let allFound = true;
requiredTokens.forEach(tok => {
  if (script.includes(tok)) {
    console.log(`PASS: Found ${tok}`);
  } else {
    console.error(`FAIL: Missing ${tok}`);
    allFound = false;
  }
});

// Verify HTML contains all toolbar controls
const html = fs.readFileSync('preview.html', 'utf8');
const requiredHtmlIds = [
  'textSelectionToolbar',
  'tstFontFamily',
  'tstFontSize',
  'tstCustomColorPicker',
  'tstAlignLeft',
  'tstAlignCenter',
  'tstAlignRight',
  'tstAlignJustify',
  'tstBtnBold',
  'tstBtnItalic',
  'tstBtnUnderline',
  'tstBtnReset'
];

requiredHtmlIds.forEach(id => {
  if (html.includes(`id="${id}"`)) {
    console.log(`PASS: HTML contains id="${id}"`);
  } else {
    console.error(`FAIL: HTML missing id="${id}"`);
    allFound = false;
  }
});

if (allFound) {
  console.log('\nALL SELECTION ENGINE COMPONENTS VERIFIED!');
} else {
  process.exit(1);
}
