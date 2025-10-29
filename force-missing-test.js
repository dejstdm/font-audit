// Force test missing glyph styling
// Run this in browser console on Coverage Grid page

console.log('🧪 Testing Missing Glyph Styling...');

// Find all character elements
const charElements = document.querySelectorAll('.component-coverage-grid__char');

console.log(`Found ${charElements.length} character elements`);

// Manually add the missing class to some German characters
const germanChars = ['Ä', 'Ö', 'Ü', 'ẞ', 'ä', 'ö', 'ü', 'ß'];

charElements.forEach(element => {
  const char = element.textContent.trim();
  if (germanChars.includes(char)) {
    // Add the missing class
    element.classList.add('missing');
    element.style.border = '2px solid rgb(239 68 68)';
    element.style.backgroundColor = 'rgb(254 242 242)';
    element.style.color = 'rgb(127 29 29)';
    
    console.log(`✅ Added missing styling to: ${char}`);
  }
});

console.log('🎨 Missing glyph styling test complete');
console.log('💡 You should now see red borders around German characters');
console.log('🔄 Refresh the page to reset the styling');
