// Test if the detection system is working correctly
// Run this in browser console

console.log('🧪 Testing Detection Method...');

// Method 1: Check if we can see the difference between a font that has a character vs one that doesn't
console.log('Testing detection method:');

// Create a test canvas to see if we can detect differences
const testCanvas = document.createElement('canvas');
testCanvas.width = 100;
testCanvas.height = 50;
const testCtx = testCanvas.getContext('2d');

// Test rendering a German character with different fonts
function testCharacter(fontFamily, character) {
  testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height);
  testCtx.fillStyle = '#000000';
  testCtx.font = `24px ${fontFamily}`;
  testCtx.fillText(character, 10, 25);
  
  // Get image data
  const imageData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height);
  
  // Count non-white pixels
  let pixelCount = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    if (r < 250 || g < 250 || b < 250) { // Not white
      pixelCount++;
    }
  }
  
  return pixelCount;
}

// Test with different characters
const characters = ['A', 'Ä', 'ß', '€'];
const fonts = ['Arial', 'Times New Roman', 'serif'];

console.log('Character rendering test:');
characters.forEach(char => {
  console.log(`Character: ${char}`);
  fonts.forEach(font => {
    const pixels = testCharacter(font, char);
    console.log(`  ${font}: ${pixels} pixels`);
  });
});

// Method 2: Check if the current font actually contains German characters
console.log('\nChecking current font coverage:');

// Look for any elements with the current font
const fontElements = document.querySelectorAll('[style*="font-family"]');
if (fontElements.length > 0) {
  const firstElement = fontElements[0];
  const fontStyle = firstElement.getAttribute('style');
  const fontMatch = fontStyle.match(/font-family:\s*"([^"]*)"/);
  
  if (fontMatch) {
    const currentFont = fontMatch[1];
    console.log(`Current font: ${currentFont}`);
    
    // Test German characters with this font
    const germanChars = ['Ä', 'Ö', 'Ü', 'ẞ', 'ä', 'ö', 'ü', 'ß'];
    console.log('German character test:');
    
    germanChars.forEach(char => {
      const pixels = testCharacter(`"${currentFont}", sans-serif`, char);
      const fallbackPixels = testCharacter('sans-serif', char);
      const diff = Math.abs(pixels - fallbackPixels);
      
      console.log(`  ${char}: custom=${pixels}, fallback=${fallbackPixels}, diff=${diff}`);
      
      if (diff < 5) {
        console.log(`    → ${char} might be missing (very similar rendering)`);
      } else {
        console.log(`    → ${char} appears to be present (different rendering)`);
      }
    });
  }
}

console.log('\n💡 If all characters show "present", the font might actually contain all German characters correctly.');
console.log('💡 Try with a font that you know is missing German characters to test the detection.');
