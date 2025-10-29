// Force test missing glyph detection by using a non-existent font
// Run this in browser console on Coverage Grid page

console.log('🧪 Force testing missing glyph detection...');

// Find all font elements and temporarily change font to something that doesn't exist
const fontElements = document.querySelectorAll('[style*="font-family"]');

fontElements.forEach((element, index) => {
  if (index < 5) { // Only modify first 5 to see the effect
    const originalStyle = element.getAttribute('style');
    const modifiedStyle = originalStyle.replace(
      /font-family:\s*"[^"]*"/g, 
      'font-family: "NonExistentFontThatWillFallbackToSystemFont"'
    );
    element.setAttribute('style', modifiedStyle);
  }
});

console.log('✅ Modified font styles to force fallback');
console.log('🔄 Now run detection again to see missing glyphs');
console.log('💡 Click "Re-run Detection" button to test');

// Restore original fonts after 10 seconds
setTimeout(() => {
  fontElements.forEach((element, index) => {
    if (index < 5) {
      const modifiedStyle = element.getAttribute('style');
      const restoredStyle = modifiedStyle.replace(
        /font-family:\s*"[^"]*"/g, 
        'font-family: "Array-Semibold.woff2"' // Restore original font
      );
      element.setAttribute('style', restoredStyle);
    }
  });
  console.log('✅ Restored original font styles');
}, 10000);
