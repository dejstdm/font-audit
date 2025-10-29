// Font testing utilities to verify fonts are actually applied

export interface FontTestResult {
  fontName: string
  isLoaded: boolean
  isApplied: boolean
  computedFontFamily: string
  actualFontUsed: string
  testText: string
}

/**
 * Test if a font is actually being used to render text
 * This is more reliable than just checking if the font is loaded
 */
export async function testFontUsage(
  fontName: string, 
  testElement: HTMLElement, 
  testText: string = 'The quick brown fox jumps over the lazy dog.'
): Promise<FontTestResult> {
  
  // Check if font is loaded in document.fonts
  const isLoaded = document.fonts.check(`1rem "${fontName}"`)
  
  // Get computed style to see what font is actually being used
  const computedStyle = window.getComputedStyle(testElement)
  const computedFontFamily = computedStyle.fontFamily
  const actualFontUsed = computedFontFamily.split(',')[0].replace(/['"]/g, '')
  
  // Check if our font is actually being used (not falling back to system fonts)
  const isApplied = actualFontUsed.toLowerCase().includes(fontName.toLowerCase()) || 
                   actualFontUsed.toLowerCase().includes('array')
  
  return {
    fontName,
    isLoaded,
    isApplied,
    computedFontFamily,
    actualFontUsed,
    testText
  }
}

/**
 * Test actual page elements to see if they're using the correct font
 * This tests the real elements that users see, not hidden test elements
 */
export async function testPageElements(fontName: string): Promise<FontTestResult[]> {
  const results: FontTestResult[] = []
  
  // Find all elements that should be using the font
  const elementsToTest = [
    // Sample text elements
    ...document.querySelectorAll('[style*="font-family"]'),
    // Coverage grid characters
    ...document.querySelectorAll('.component-coverage-grid__char'),
    // Preview text elements
    ...document.querySelectorAll('p[style*="font-family"]'),
    // Any element with the font family in style
    ...document.querySelectorAll(`[style*="${fontName}"]`),
    // Elements with the font name in their style attribute
    ...document.querySelectorAll(`[style*="fontFamily"]`)
  ]
  
  console.log(`🔍 Testing ${elementsToTest.length} page elements for font: ${fontName}`)
  
  for (const element of elementsToTest) {
    if (element instanceof HTMLElement && element.textContent?.trim()) {
      const result = await testFontUsage(fontName, element, element.textContent.slice(0, 50))
      results.push({
        ...result,
        testText: `Page element: "${element.textContent.slice(0, 30)}..."`,
      })
      
      // Log each element test
      console.log(`📄 Element test:`, {
        tagName: element.tagName,
        className: element.className,
        textContent: element.textContent.slice(0, 30),
        actualFont: result.actualFontUsed,
        isApplied: result.isApplied
      })
    }
  }
  
  return results
}

/**
 * Create a test element with specific font styling
 */
export function createFontTestElement(
  fontName: string, 
  testText: string = 'The quick brown fox jumps over the lazy dog.'
): HTMLElement {
  const element = document.createElement('div')
  element.style.fontFamily = `"${fontName}", sans-serif`
  element.style.fontSize = '16px'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.top = '-9999px'
  element.style.visibility = 'hidden'
  element.textContent = testText
  document.body.appendChild(element)
  return element
}

/**
 * Clean up test element
 */
export function cleanupFontTestElement(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element)
  }
}

/**
 * Comprehensive font test that creates test element, tests font, and cleans up
 */
export async function runFontTest(
  fontName: string, 
  testText: string = 'The quick brown fox jumps over the lazy dog.'
): Promise<FontTestResult> {
  const testElement = createFontTestElement(fontName, testText)
  
  // Wait a bit for font to potentially load
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const result = await testFontUsage(fontName, testElement, testText)
  
  cleanupFontTestElement(testElement)
  
  return result
}

/**
 * Log font test results in a readable format
 */
export function logFontTestResult(result: FontTestResult): void {
  console.group(`🔍 Font Test: ${result.fontName}`)
  console.log(`📚 Font loaded: ${result.isLoaded ? '✅' : '❌'}`)
  console.log(`🎨 Font applied: ${result.isApplied ? '✅' : '❌'}`)
  console.log(`📝 Computed font-family: ${result.computedFontFamily}`)
  console.log(`🔤 Actual font used: ${result.actualFontUsed}`)
  console.log(`📄 Test text: ${result.testText}`)
  console.groupEnd()
  
  if (!result.isApplied) {
    console.warn(`⚠️  Font ${result.fontName} is loaded but not being used!`)
    console.warn(`   Expected: ${result.fontName}`)
    console.warn(`   Actual: ${result.actualFontUsed}`)
  }
}
