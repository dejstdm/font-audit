// Debug script to check why missing glyph detection isn't working
// Run this in browser console on the Coverage Grid page

console.log('🐛 Debugging Missing Glyph Detection...');

// Check if worker is supported
console.log('1. Worker support:', typeof Worker !== 'undefined' ? '✅ Yes' : '❌ No');

// Check if detection results exist in the component state
console.log('2. Checking for detection results...');

// Look for the CoverageGrid component state
const coverageGrid = document.querySelector('.component-coverage-grid');
if (coverageGrid) {
  console.log('✅ CoverageGrid found');
} else {
  console.log('❌ CoverageGrid not found');
}

// Check if detection controls exist
const reRunButton = document.querySelector('button:has-text("Re-run Detection")');
const showMissingButton = document.querySelector('button:has-text("Show Missing Only")');

if (reRunButton && showMissingButton) {
  console.log('✅ Detection controls found');
} else {
  console.log('❌ Detection controls not found');
}

// Check for any elements with .missing class
const missingElements = document.querySelectorAll('.missing');
console.log(`3. Missing elements found: ${missingElements.length}`);

// Check for any red borders
const redBorderElements = document.querySelectorAll('[style*="border-red"]');
console.log(`4. Red border elements found: ${redBorderElements.length}`);

// Check console for detection logs
console.log('5. Check browser console for detection logs:');
console.log('   - Look for "🚀 Starting batch detection"');
console.log('   - Look for "✅ Detected X/Y missing glyphs"');
console.log('   - Look for any error messages');

// Test if we can manually trigger detection
if (reRunButton) {
  console.log('6. Testing manual detection...');
  reRunButton.click();
  console.log('   - Clicked "Re-run Detection" button');
  console.log('   - Wait 5-10 seconds and check for results');
} else {
  console.log('6. Cannot test manual detection - button not found');
}

// Check if fonts are actually loaded
console.log('7. Checking font loading...');
const fontElements = document.querySelectorAll('[style*="font-family"]');
console.log(`   - Found ${fontElements.length} elements with custom fonts`);

fontElements.forEach((element, index) => {
  if (index < 3) { // Check first 3
    const style = element.getAttribute('style');
    const fontMatch = style.match(/font-family:\s*"([^"]*)"/);
    if (fontMatch) {
      console.log(`   - Element ${index}: ${fontMatch[1]}`);
    }
  }
});

console.log('🐛 Debug complete. Check the results above.');
