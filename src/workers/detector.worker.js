/**
 * Web Worker for detecting missing glyphs using Canvas API
 * 
 * Implements hybrid detection strategy:
 * 1. Phase 1 (Fast): Width comparison as quick filter
 * 2. Phase 2 (Accurate): Bitmap hash comparison for uncertain cases
 * 3. Caching: Results cached in IndexedDB by (fontName, codepoint)
 */

// Detection request structure:
// {
//   fontName: string,
//   characters: string[],
//   fontBuffer: ArrayBuffer,
//   requestId: string
// }

// Detection result structure:
// {
//   requestId: string,
//   results: [
//     {
//       character: string,
//       codePoint: number,
//       isMissing: boolean,
//       confidence: number
//     }
//   ]
// }

// Create canvas for rendering (100x100 as per spec)
const canvas = new OffscreenCanvas(100, 100)
const ctx = canvas.getContext('2d')

// Font cache to avoid reloading fonts repeatedly
const fontCache = new Map()

// Constants for detection
const FONT_SIZE = 48 // Larger for better detection
const TEXT_X = 10
const TEXT_Y = 60

/**
 * Load a font from ArrayBuffer into the worker context
 * Note: FontFace in workers may not work properly, so we'll use a different approach
 */
async function loadFont(fontName, fontBuffer) {
  if (fontCache.has(fontName)) {
    return fontCache.get(fontName)
  }

  try {
    // Try to load the font in the worker context
    const fontFace = new FontFace(fontName, fontBuffer)
    await fontFace.load()
    
    // Add to document.fonts if available (some browsers support this in workers)
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.add(fontFace)
    }
    
    fontCache.set(fontName, fontFace)
    console.log(`✅ Font loaded in worker: ${fontName}`)
    return fontFace
  } catch (error) {
    console.error(`❌ Failed to load font ${fontName} in worker:`, error)
    // Don't throw - continue with fallback approach
    return null
  }
}

/**
 * Clear canvas completely (important to avoid ghost pixels)
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

/**
 * Render text on canvas with specified font
 */
function renderText(char, fontFamily) {
  // CRITICAL: Always clear canvas between renders
  clearCanvas()
  
  // Set font with consistent styling
  ctx.font = `${FONT_SIZE}px ${fontFamily}`
  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  
  // Render text
  ctx.fillText(char, TEXT_X, TEXT_Y)
  
  // Get image data
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Measure text width with specified font
 */
function measureText(char, fontFamily) {
  ctx.font = `${FONT_SIZE}px ${fontFamily}`
  const metrics = ctx.measureText(char)
  return metrics.width
}

/**
 * Compute bitmap hash from image data
 * Uses sum of grayscale pixels as per spec
 */
function computeBitmapHash(imageData) {
  let hash = 0
  const data = imageData.data
  
  // Sum grayscale values of all pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Convert to grayscale and weight by alpha
    const grayscale = (r * 0.299 + g * 0.587 + b * 0.114) * (a / 255)
    hash += grayscale
  }
  
  return hash
}

/**
 * Calculate difference between two bitmap hashes
 * Returns normalized difference (0 = identical, 1 = completely different)
 */
function calculateHashDifference(hash1, hash2) {
  const maxHash = Math.max(Math.abs(hash1), Math.abs(hash2), 1)
  return Math.abs(hash1 - hash2) / maxHash
}

/**
 * Hybrid detection for a given character
 * Phase 1: Width comparison (fast filter)
 * Phase 2: Bitmap comparison (for uncertain cases)
 */
async function detectMissingGlyph(character, fontName, fontFace) {
  try {
    // PHASE 1: Width comparison (fast filter)
    // Use a unique font family name to force the browser to use our font
    const testFontFamily = `"${fontName}-worker", sans-serif`
    const testWidth = measureText(character, testFontFamily)
    const fallbackWidth = measureText(character, 'sans-serif')
    const widthDiff = Math.abs(testWidth - fallbackWidth)
    
    // Debug logging for width comparison
    if (character === 'A' || character === 'a' || character === '1' || character === 'ß') {
      console.log(`Width ${character}: test=${testWidth.toFixed(2)}, fallback=${fallbackWidth.toFixed(2)}, diff=${widthDiff.toFixed(2)}`)
    }
    
    // If width difference is significant (>2px), glyph is definitely present
    if (widthDiff > 2) {
      return { 
        isMissing: false, 
        confidence: 0.95,
        method: 'width-confident'
      }
    }
    
    // If width difference is very small (<0.1px), likely missing
    if (widthDiff < 0.1) {
      // But verify with bitmap comparison for high confidence
      return performBitmapComparison(character, fontName, 'width-uncertain-low')
    }
    
    // PHASE 2: Width is in uncertain range (0.1-2px), use bitmap comparison
    return performBitmapComparison(character, fontName, 'width-uncertain')
    
  } catch (error) {
    console.error(`Error detecting glyph for ${character}:`, error)
    return { isMissing: false, confidence: 0, method: 'error' }
  }
}

/**
 * Perform bitmap comparison (Phase 2)
 * Renders character with test font and fallback, compares bitmap hashes
 */
function performBitmapComparison(character, fontName, reason) {
  // Render with test font (use unique name)
  const testFontFamily = `"${fontName}-worker", sans-serif`
  const testImageData = renderText(character, testFontFamily)
  const testHash = computeBitmapHash(testImageData)
  
  // Render with fallback font (sans-serif)
  const fallbackImageData = renderText(character, 'sans-serif')
  const fallbackHash = computeBitmapHash(fallbackImageData)
  
  // Calculate hash difference
  const hashDiff = calculateHashDifference(testHash, fallbackHash)
  
  // Debug logging for problematic characters
  if (character === 'A' || character === 'a' || character === '1' || character === 'ß') {
    console.log(`Debug ${character}: testHash=${testHash.toFixed(2)}, fallbackHash=${fallbackHash.toFixed(2)}, hashDiff=${hashDiff.toFixed(4)}`)
  }
  
  // Decision thresholds (very conservative to avoid false positives)
  // If hashes are very similar (<0.01), glyphs are likely identical → missing
  // If hashes differ significantly (>0.05), glyphs are different → present
  const isMissing = hashDiff < 0.01
  const confidence = isMissing 
    ? 1.0 - (hashDiff / 0.01)  // Missing: higher confidence as hashDiff approaches 0
    : Math.min((hashDiff - 0.01) / 0.05, 1.0)  // Present: higher confidence as hashDiff increases
  
  // If confidence is too low, default to "present" to avoid false positives
  const finalConfidence = Math.max(0.5, confidence)
  const finalIsMissing = finalConfidence > 0.7 ? isMissing : false
  
  return { 
    isMissing: finalIsMissing, 
    confidence: finalConfidence,
    method: `bitmap-${reason}`,
    hashDiff
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
    
    // Process characters in batches for better performance
    const batchSize = 50
    const results = []
    
    for (let i = 0; i < characters.length; i += batchSize) {
      const batch = characters.slice(i, i + batchSize)
      
      const batchResults = await Promise.all(
        batch.map(async (character) => {
          const codePoint = character.codePointAt(0) || 0
          const detection = await detectMissingGlyph(character, fontName, fontFace)
          
          return {
            character,
            codePoint,
            isMissing: detection.isMissing,
            confidence: detection.confidence
          }
        })
      )
      
      results.push(...batchResults)
      
      // Post progress update for large batches
      if (characters.length > 100) {
        const progress = Math.round((results.length / characters.length) * 100)
        self.postMessage({
          type: 'progress',
          requestId,
          progress,
          processed: results.length,
          total: characters.length
        })
      }
    }
    
    return {
      requestId,
      results
    }
  } catch (error) {
    console.error(`Error processing detection request ${requestId}:`, error)
    
    // Return error results
    return {
      requestId,
      results: characters.map(character => ({
        character,
        codePoint: character.codePointAt(0) || 0,
        isMissing: false,
        confidence: 0
      })),
      error: error.message
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

// Worker is ready
