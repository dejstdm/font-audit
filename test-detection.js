// Test script to verify missing glyph detection is working
// Run this in your browser console on the Coverage Grid page

console.log('🧪 Testing Missing Glyph Detection...');

// Check if detection results exist
const checkDetectionResults = () => {
  // Look for detection controls
  const reRunButton = document.querySelector('button:has-text("Re-run Detection")');
  const showMissingButton = document.querySelector('button:has-text("Show Missing Only")');
  
  if (reRunButton && showMissingButton) {
    console.log('✅ Detection controls found');
    
    // Check if any missing glyphs are highlighted
    const missingGlyphs = document.querySelectorAll('.missing');
    console.log(`📊 Found ${missingGlyphs.length} missing glyphs highlighted`);
    
    if (missingGlyphs.length > 0) {
      console.log('✅ Missing glyph detection is working!');
      missingGlyphs.forEach((glyph, index) => {
        if (index < 3) { // Show first 3 as examples
          console.log(`  - Missing: "${glyph.textContent}" (${glyph.title})`);
        }
      });
    } else {
      console.log('ℹ️ No missing glyphs detected - your font might be complete');
      console.log('💡 Try uploading a font with limited character set or different language');
    }
    
    // Test the "Show Missing Only" filter
    console.log('🔄 Testing "Show Missing Only" filter...');
    showMissingButton.click();
    
    setTimeout(() => {
      const filteredGlyphs = document.querySelectorAll('.component-coverage-grid__char');
      console.log(`📊 After filtering: ${filteredGlyphs.length} characters visible`);
      
      // Click again to show all
      showMissingButton.click();
      console.log('✅ Filter test complete');
    }, 1000);
    
  } else {
    console.log('❌ Detection controls not found - detection might not be running');
  }
};

// Check if fonts are loaded
const checkFonts = () => {
  const fontElements = document.querySelectorAll('[style*="font-family"]');
  console.log(`📚 Found ${fontElements.length} elements with custom fonts`);
  
  if (fontElements.length === 0) {
    console.log('❌ No custom fonts found - upload a font first');
    return false;
  }
  return true;
};

// Main test
const runTest = () => {
  console.log('🚀 Starting missing glyph detection test...');
  
  if (!checkFonts()) {
    return;
  }
  
  // Wait a bit for detection to complete
  setTimeout(checkDetectionResults, 2000);
};

// Run the test
runTest();
