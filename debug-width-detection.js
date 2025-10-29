// Debug the width detection
// Run this in browser console to see what's happening

console.log('🔍 Debugging Width Detection...');

// Check the console logs for width comparisons
console.log('Look for these patterns in the console:');
console.log('1. Characters with identical widths (diff < 0.1) = Missing');
console.log('2. Characters with different widths (diff > 0.1) = Present');
console.log('3. German characters (Ä, Ö, Ü, ẞ, ä, ö, ü, ß) should show different widths if present');

// Check if all characters are being flagged as missing
const missingElements = document.querySelectorAll('.missing');
console.log(`Currently ${missingElements.length} characters flagged as missing`);

if (missingElements.length > 50) {
  console.log('⚠️ Too many characters flagged as missing - detection algorithm needs adjustment');
} else if (missingElements.length === 0) {
  console.log('ℹ️ No characters flagged as missing - font might be complete');
} else {
  console.log('✅ Reasonable number of missing characters detected');
}

// Show which characters are flagged as missing
const missingChars = Array.from(missingElements).map(el => el.textContent.trim()).slice(0, 10);
console.log('First 10 missing characters:', missingChars);

console.log('🔍 Debug complete');
