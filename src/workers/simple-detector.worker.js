/**
 * Simple Web Worker for detecting missing glyphs
 * Uses a different approach: checks if characters render differently
 */

// Create canvas for rendering
const canvas = new OffscreenCanvas(200, 100)
const ctx = canvas.getContext('2d')

// Font cache
const fontCache = new Map()

/**
 * Load a font from ArrayBuffer into the worker context
 */
async function loadFont(fontName, fontBuffer) {
  if (fontCache.has(fontName)) {
    return fontCache.get(fontName)
  }

  try {
    const fontFace = new FontFace(fontName, fontBuffer)
    await fontFace.load()
    fontCache.set(fontName, fontFace)
    return fontFace
  } catch (error) {
    console.error(`Failed to load font ${fontName}:`, error)
    throw error
  }
}

/**
 * Simple method: check if character renders with different width
 */
function checkCharacterWidth(character, fontFamily) {
  // Clear canvas
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Set font
  ctx.font = `32px ${fontFamily}`
  ctx.fillStyle = '#000000'
  
  // Measure text width
  const metrics = ctx.measureText(character)
  return metrics.width
}

/**
 * Detect missing glyphs using width comparison
 */
async function detectMissingGlyph(character, fontName, fontFace) {
  try {
    // Get width with custom font
    const customWidth = checkCharacterWidth(character, `"${fontName}", sans-serif`)
    
    // Get width with fallback font only
    const fallbackWidth = checkCharacterWidth(character, 'sans-serif')
    
    // If widths are identical or very similar, the glyph might be missing
    const widthDiff = Math.abs(customWidth - fallbackWidth)
    const isMissing = widthDiff < 0.1 // Only flag as missing if widths are almost identical
    
    console.log(`Character ${character}: custom=${customWidth.toFixed(2)}, fallback=${fallbackWidth.toFixed(2)}, diff=${widthDiff.toFixed(2)}, missing=${isMissing}`)
    
    return { 
      isMissing, 
      confidence: isMissing ? 0.8 : 0.2,
      customWidth,
      fallbackWidth,
      widthDiff
    }
  } catch (error) {
    console.error(`Error detecting glyph for ${character}:`, error)
    return { isMissing: false, confidence: 0 }
  }
}

/**
 * Process detection request
 */
async function processDetectionRequest(request) {
  const { fontName, characters, fontBuffer, requestId } = request
  
  try {
    // Load the font
    const fontFace = await loadFont(fontName, fontBuffer)
    
    // Detect missing glyphs for each character
    const results = []
    
    for (const character of characters) {
      const codePoint = character.codePointAt(0) || 0
      const detection = await detectMissingGlyph(character, fontName, fontFace)
      
      results.push({
        character,
        codePoint,
        isMissing: detection.isMissing,
        confidence: detection.confidence
      })
    }
    
    return {
      requestId,
      results
    }
  } catch (error) {
    console.error(`Error processing detection request ${requestId}:`, error)
    
    // Return empty results on error
    return {
      requestId,
      results: characters.map(character => ({
        character,
        codePoint: character.codePointAt(0) || 0,
        isMissing: false,
        confidence: 0
      }))
    }
  }
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const request = event.data
  
  try {
    const result = await processDetectionRequest(request)
    self.postMessage(result)
  } catch (error) {
    console.error('Worker error:', error)
    self.postMessage({
      requestId: request.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: []
    })
  }
})

console.log('Simple detector worker loaded')
