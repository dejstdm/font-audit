// Check for Web Worker errors
// Run this in browser console

console.log('🔍 Checking for Web Worker errors...');

// Check if there are any worker-related errors in the console
console.log('1. Look for these error messages in the console:');
console.log('   - "Failed to load worker"');
console.log('   - "Worker error"');
console.log('   - "Cannot resolve module"');
console.log('   - "net::ERR_FILE_NOT_FOUND"');

// Check if the worker file exists by trying to fetch it
fetch('/src/workers/detector.worker.ts')
  .then(response => {
    if (response.ok) {
      console.log('✅ Worker file exists and is accessible');
    } else {
      console.log(`❌ Worker file not accessible: ${response.status}`);
    }
  })
  .catch(error => {
    console.log('❌ Worker file fetch failed:', error.message);
  });

// Check if detection is being triggered
console.log('2. Checking if detection is being triggered...');

// Look for the CoverageGrid component and check if it has detection state
const coverageGrid = document.querySelector('.component-coverage-grid');
if (coverageGrid) {
  console.log('✅ CoverageGrid found');
  
  // Check if there are any React DevTools we can inspect
  console.log('💡 Try this:');
  console.log('   1. Install React DevTools browser extension');
  console.log('   2. Open React DevTools');
  console.log('   3. Find CoverageGrid component');
  console.log('   4. Check if detectionResults state is populated');
} else {
  console.log('❌ CoverageGrid not found');
}

// Check for any network errors
console.log('3. Check Network tab in DevTools for:');
console.log('   - Failed requests to .worker.ts files');
console.log('   - Failed requests to any detection-related files');
console.log('   - Any 404 or 500 errors');

console.log('🔍 Debug complete. Check the results above and share any errors found.');
