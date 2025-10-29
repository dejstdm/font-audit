// Font Workflow Test Script
// Run this in browser console to test the complete font workflow

async function clearIndexedDB() {
  console.log('🧹 Clearing IndexedDB...')
  return new Promise((resolve) => {
    const deleteReq = indexedDB.deleteDatabase('glyph-globe')
    deleteReq.onsuccess = () => {
      console.log('✅ IndexedDB cleared successfully')
      resolve(true)
    }
    deleteReq.onerror = () => {
      console.log('❌ Error clearing IndexedDB')
      resolve(false)
    }
  })
}

async function testFontWorkflow() {
  console.log('🚀 Starting Font Workflow Test')
  console.log('================================')
  
  // Step 1: Clear IndexedDB
  console.log('\n📋 Step 1: Clear IndexedDB')
  await clearIndexedDB()
  
  // Step 2: Check current state
  console.log('\n📋 Step 2: Check initial state')
  const initialFonts = document.fonts.size
  console.log(`📊 Initial fonts loaded: ${initialFonts}`)
  
  // Step 3: Instructions for manual testing
  console.log('\n📋 Step 3: Manual Testing Instructions')
  console.log('👆 Please manually:')
  console.log('   1. Go to /languages page')
  console.log('   2. Select English language')
  console.log('   3. Go to /fonts page')
  console.log('   4. Upload Array-Semibold.woff2 font')
  console.log('   5. Go to /preview page')
  console.log('   6. Click "Font Test" tab')
  console.log('   7. Click "Run Font Tests" button')
  console.log('   8. Reload the preview page (F5)')
  console.log('   9. Click "Font Test" tab again')
  console.log('   10. Click "Run Font Tests" button again')
  console.log('\n🔍 Expected results:')
  console.log('   - Before reload: Font should show "✅ Applied"')
  console.log('   - After reload: Font should still show "✅ Applied"')
  console.log('   - If it shows "⚠️ Loaded but not applied" = BUG!')
  
  return true
}

// Helper function to check font state
function checkFontState() {
  console.log('\n🔍 Current Font State:')
  console.log('======================')
  
  const fonts = Array.from(document.fonts)
  console.log(`📊 Total fonts loaded: ${fonts.length}`)
  
  fonts.forEach(font => {
    console.log(`📝 ${font.family} (${font.style}, ${font.weight})`)
  })
  
  // Check if Array font is loaded
  const arrayFonts = fonts.filter(font => 
    font.family.toLowerCase().includes('array')
  )
  
  if (arrayFonts.length > 0) {
    console.log('\n✅ Array fonts found:')
    arrayFonts.forEach(font => {
      console.log(`   📝 ${font.family} (${font.style}, ${font.weight})`)
    })
  } else {
    console.log('\n❌ No Array fonts found')
  }
}

// Helper function to test font rendering
async function testFontRendering() {
  console.log('\n🧪 Testing Font Rendering:')
  console.log('==========================')
  
  const testElement = document.createElement('div')
  testElement.style.fontFamily = '"Array-Semibold.woff2", sans-serif'
  testElement.style.fontSize = '16px'
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.style.top = '-9999px'
  testElement.style.visibility = 'hidden'
  testElement.textContent = 'The quick brown fox jumps over the lazy dog.'
  
  document.body.appendChild(testElement)
  
  // Wait for font to potentially load
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const computedStyle = window.getComputedStyle(testElement)
  const fontFamily = computedStyle.fontFamily
  const actualFont = fontFamily.split(',')[0].replace(/['"]/g, '')
  
  console.log(`📝 Expected font: Array-Semibold.woff2`)
  console.log(`📝 Computed font-family: ${fontFamily}`)
  console.log(`📝 Actual font used: ${actualFont}`)
  
  const isApplied = actualFont.toLowerCase().includes('array')
  console.log(`🎯 Font correctly applied: ${isApplied ? '✅ YES' : '❌ NO'}`)
  
  document.body.removeChild(testElement)
  
  return isApplied
}

// Export functions for use in console
window.clearIndexedDB = clearIndexedDB
window.testFontWorkflow = testFontWorkflow
window.checkFontState = checkFontState
window.testFontRendering = testFontRendering

console.log('🎯 Font Workflow Test Script Loaded!')
console.log('Available functions:')
console.log('  - testFontWorkflow() - Run complete test workflow')
console.log('  - clearIndexedDB() - Clear IndexedDB')
console.log('  - checkFontState() - Check current font state')
console.log('  - testFontRendering() - Test if fonts are applied correctly')
console.log('\n💡 Run testFontWorkflow() to start!')
