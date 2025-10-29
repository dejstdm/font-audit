// Test if the worker loads properly
// Run this in browser console

console.log('🧪 Testing Worker Loading...');

try {
  const worker = new Worker(
    new URL('/src/workers/detector.worker.js', window.location.origin),
    { type: 'module' }
  );
  
  console.log('✅ Worker created successfully');
  
  // Test sending a message
  const testRequest = {
    fontName: 'TestFont',
    characters: ['A', 'B'],
    fontBuffer: new ArrayBuffer(8),
    requestId: 'test-123'
  };
  
  worker.postMessage(testRequest);
  console.log('✅ Test message sent to worker');
  
  // Listen for response
  worker.addEventListener('message', (event) => {
    console.log('✅ Worker responded:', event.data);
    worker.terminate();
  });
  
  // Listen for errors
  worker.addEventListener('error', (error) => {
    console.log('❌ Worker error:', error);
  });
  
} catch (error) {
  console.log('❌ Failed to create worker:', error.message);
}
