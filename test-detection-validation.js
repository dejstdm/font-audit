/**
 * Comprehensive font detection validation test
 * Tests real fonts against known missing glyphs
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Test cases with expected missing glyphs
const TEST_CASES = {
  'Array-Bold.woff2': {
    'de': ['ẞ'],
    'en': []
  },
  'Sharpie-Black.woff2': {
    'de': ['ẞ'],
    'en': []
  },
  'Styro-Bold.woff2': {
    'de': ['ẞ', '.', ',', ';', ':', '!', '?', "'", '(', ')', '-', '–', '—'],
    'en': ['.', ',', ';', ':', '!', '?', "'", '(', ')', '-', '–', '—', '/', '\\', '#', '%', '*', '+', '=']
  }
};

// Language coverage sets
const LANGUAGES = {
  'de': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzäöüÄÖÜßẞ0123456789.,;:!?\'()-–—/\\@#$%&*+=',
  'en': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?\'()-–—/\\@#$%&*+='
};

// Detection algorithm (simplified width-based)
function detectMissingGlyph(canvas, ctx, fontBuffer, character, fontName) {
  const FONT_SIZE = 48;
  
  // Render with test font
  ctx.font = `${FONT_SIZE}px "${fontName}", sans-serif`;
  const testWidth = ctx.measureText(character).width;
  
  // Render with fallback
  ctx.font = `${FONT_SIZE}px sans-serif`;
  const fallbackWidth = ctx.measureText(character).width;
  
  const widthDiff = Math.abs(testWidth - fallbackWidth);
  
  // Decision logic
  let isMissing = false;
  let confidence = 0.5;
  
  if (widthDiff > 1.0) {
    // Significant width difference = font has the character
    isMissing = false;
    confidence = 0.95;
  } else if (widthDiff < 0.1) {
    // Very small width difference = likely missing
    isMissing = true;
    confidence = 0.9;
  } else {
    // Medium width difference = uncertain, default to present
    isMissing = false;
    confidence = 0.6;
  }
  
  return {
    character,
    isMissing,
    confidence,
    testWidth,
    fallbackWidth,
    widthDiff
  };
}

async function runTests() {
  console.log('🧪 Starting Font Detection Validation Tests\n');
  
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const failures = [];
  
  for (const [fontFile, languageTests] of Object.entries(TEST_CASES)) {
    const fontPath = `C:\\Users\\dstankovic\\Sites\\font-audit\\test-fonts\\${fontFile}`;
    
    console.log(`\n📝 Testing: ${fontFile}`);
    console.log('─'.repeat(60));
    
    if (!fs.existsSync(fontPath)) {
      console.log(`❌ Font file not found: ${fontPath}`);
      continue;
    }
    
    const fontBuffer = fs.readFileSync(fontPath);
    const fontName = fontFile.replace('.woff2', '');
    
    // Register font (Node canvas way)
    // Note: In Node canvas, we can't actually load WOFF2 fonts the same way as browsers
    // We'll simulate the detection logic
    
    for (const [langCode, expectedMissing] of Object.entries(languageTests)) {
      console.log(`\n  Language: ${langCode.toUpperCase()}`);
      console.log(`  Expected missing: ${expectedMissing.length === 0 ? 'none' : expectedMissing.join(' ')}`);
      
      const coverage = LANGUAGES[langCode];
      const characters = [...new Set(coverage.split(''))];
      
      const detectedMissing = [];
      const falsePositives = [];
      const falseNegatives = [];
      
      for (const char of characters) {
        totalTests++;
        
        const result = detectMissingGlyph(canvas, ctx, fontBuffer, char, fontName);
        
        const shouldBeMissing = expectedMissing.includes(char);
        const detectedAsMissing = result.isMissing;
        
        if (detectedAsMissing) {
          detectedMissing.push(char);
        }
        
        // Check if detection matches expectation
        if (shouldBeMissing && detectedAsMissing) {
          // Correct: detected as missing and should be missing
          passedTests++;
        } else if (!shouldBeMissing && !detectedAsMissing) {
          // Correct: detected as present and should be present
          passedTests++;
        } else if (!shouldBeMissing && detectedAsMissing) {
          // False positive: detected as missing but should be present
          falsePositives.push({
            char,
            ...result
          });
          failedTests++;
        } else if (shouldBeMissing && !detectedAsMissing) {
          // False negative: detected as present but should be missing
          falseNegatives.push({
            char,
            ...result
          });
          failedTests++;
        }
      }
      
      console.log(`  Detected missing: ${detectedMissing.length === 0 ? 'none' : detectedMissing.join(' ')}`);
      
      if (falsePositives.length > 0) {
        console.log(`  ❌ False positives (${falsePositives.length}): ${falsePositives.map(f => f.char).join(' ')}`);
        falsePositives.forEach(fp => {
          console.log(`     ${fp.char}: test=${fp.testWidth.toFixed(2)}, fallback=${fp.fallbackWidth.toFixed(2)}, diff=${fp.widthDiff.toFixed(2)}`);
        });
        failures.push({ font: fontFile, lang: langCode, type: 'false_positive', items: falsePositives });
      }
      
      if (falseNegatives.length > 0) {
        console.log(`  ❌ False negatives (${falseNegatives.length}): ${falseNegatives.map(f => f.char).join(' ')}`);
        falseNegatives.forEach(fn => {
          console.log(`     ${fn.char}: test=${fn.testWidth.toFixed(2)}, fallback=${fn.fallbackWidth.toFixed(2)}, diff=${fn.widthDiff.toFixed(2)}`);
        });
        failures.push({ font: fontFile, lang: langCode, type: 'false_negative', items: falseNegatives });
      }
      
      if (falsePositives.length === 0 && falseNegatives.length === 0) {
        console.log(`  ✅ All tests passed for ${fontFile} (${langCode.toUpperCase()})`);
      }
    }
  }
  
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  
  if (failures.length > 0) {
    console.log('\n❌ FAILURES DETECTED - Detection algorithm needs adjustment');
    console.log('\nRecommendations:');
    console.log('- If many false positives: increase width threshold (currently 1.0)');
    console.log('- If many false negatives: decrease width threshold or add bitmap comparison');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED!');
    process.exit(0);
  }
}

// Check if canvas is available
try {
  require.resolve('canvas');
  runTests().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
} catch (e) {
  console.log('⚠️  Node canvas not available, cannot run font tests');
  console.log('Install with: npm install canvas');
  console.log('\nNote: This test requires node-canvas which can be tricky on Windows.');
  console.log('Alternative: Run detection in browser environment instead.');
  process.exit(1);
}


