/**
 * Glyph Detection API with caching
 * 
 * Provides a high-level API for detecting missing glyphs using the Web Worker,
 * with intelligent caching to avoid redundant work.
 */

import { getItem, setItem } from './storage'

// Import worker types
type DetectionRequest = {
  fontName: string
  characters: string[]
  fontBuffer: ArrayBuffer
  requestId: string
}

type DetectionResult = {
  requestId: string
  results: {
    character: string
    codePoint: number
    isMissing: boolean
    confidence: number
  }[]
  error?: string
}

export type GlyphDetectionResult = {
  character: string
  codePoint: number
  isMissing: boolean
  confidence: number
}

// Worker instance
let worker: Worker | null = null
let requestIdCounter = 0

/**
 * Initialize the detection worker
 */
function initWorker(): Worker {
  if (worker) {
    return worker
  }

  // Create worker with proper TypeScript support
  worker = new Worker(
    new URL('../workers/detector.worker.js', import.meta.url),
    { type: 'module' }
  )

  return worker
}

/**
 * Generate a cache key for detection results
 */
function getCacheKey(fontName: string, characters: string[]): string {
  const sortedChars = [...characters].sort().join('')
  // Use encodeURIComponent instead of btoa to handle Unicode characters
  const encodedChars = encodeURIComponent(sortedChars)
  return `glyph-detection-${fontName}-${encodedChars}`
}

/**
 * Get cached detection results
 */
async function getCachedResults(fontName: string, characters: string[]): Promise<GlyphDetectionResult[] | null> {
  try {
    const cacheKey = getCacheKey(fontName, characters)
    const cached = await getItem<GlyphDetectionResult[]>(cacheKey)
    return cached
  } catch (error) {
    console.warn('Failed to get cached detection results:', error)
    return null
  }
}

/**
 * Cache detection results
 */
async function cacheResults(fontName: string, characters: string[], results: GlyphDetectionResult[]): Promise<void> {
  try {
    const cacheKey = getCacheKey(fontName, characters)
    await setItem(cacheKey, results)
  } catch (error) {
    console.warn('Failed to cache detection results:', error)
  }
}

/**
 * Detect missing glyphs for a single character
 */
export async function detectMissingGlyph(
  fontName: string,
  fontBuffer: ArrayBuffer,
  character: string
): Promise<GlyphDetectionResult> {
  const results = await detectMissingGlyphs(fontName, fontBuffer, [character])
  return results[0]
}

/**
 * Detect missing glyphs for multiple characters
 * Uses caching to avoid redundant work
 */
export async function detectMissingGlyphs(
  fontName: string,
  fontBuffer: ArrayBuffer,
  characters: string[],
  bypassCache: boolean = false
): Promise<GlyphDetectionResult[]> {
  if (characters.length === 0) {
    return []
  }

  // Check cache first (unless bypassing)
  if (!bypassCache) {
    const cached = await getCachedResults(fontName, characters)
    if (cached) {
      console.log(`📋 Using cached detection results for ${characters.length} characters`)
      return cached
    }
  } else {
    console.log(`🚫 Bypassing cache for ${characters.length} characters`)
  }

  // Perform detection using worker
  console.log(`🔍 Detecting missing glyphs for ${characters.length} characters`)
  const results = await performDetection(fontName, fontBuffer, characters)
  
  // Cache results
  await cacheResults(fontName, characters, results)
  
  return results
}

/**
 * Perform detection using main thread (since workers can't access fonts properly)
 */
async function performDetection(
  fontName: string,
  fontBuffer: ArrayBuffer,
  characters: string[]
): Promise<GlyphDetectionResult[]> {
  console.log(`🔍 Running detection in main thread for ${characters.length} characters`)

  try {
    // Use already loaded fonts - don't try to reload
    console.log(`🔍 Using font: ${fontName}`)
    
    // Debug: Check what fonts are available
    const availableFonts = Array.from(document.fonts).map(f => f.family)
    console.log(`📋 Available fonts:`, availableFonts)
    
    // Check if our font is available
    const fontAvailable = document.fonts.check(`16px "${fontName}"`)
    console.log(`🎯 Font ${fontName} available: ${fontAvailable}`)
    
    if (!fontAvailable) {
      console.log(`⚠️ WARNING: Font ${fontName} not found in document.fonts!`)
      console.log(`📋 Available font families:`, availableFonts)
    }
    
    // Create canvas for detection
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!

    const FONT_SIZE = 48
    const TEXT_X = 10
    const TEXT_Y = 60
    
    // Test if font is actually working
    ctx.font = `${FONT_SIZE}px "${fontName}", sans-serif`
    const testA = ctx.measureText('A').width
    ctx.font = `${FONT_SIZE}px sans-serif`
    const fallbackA = ctx.measureText('A').width
    const diffA = Math.abs(testA - fallbackA)
    console.log(`🧪 Font test: A with font=${testA.toFixed(2)}, A with fallback=${fallbackA.toFixed(2)}, diff=${diffA.toFixed(2)}`)
    
    // If no difference, font might not be loading
    if (diffA < 0.1) {
      console.log(`⚠️ WARNING: Font ${fontName} might not be loading properly - no width difference detected`)
      console.log(`🔧 This means the font is not being used for measurements`)
      console.log(`🔧 Available fonts:`, availableFonts)
      console.log(`🔧 Looking for font containing: ${fontName}`)
      
      // Try to find a similar font name
      const similarFont = availableFonts.find(f => f.includes(fontName.split('.')[0]))
      if (similarFont) {
        console.log(`🔧 Found similar font: ${similarFont}`)
      }
    }
    
    const results: GlyphDetectionResult[] = []
    
    for (const character of characters) {
      const codePoint = character.codePointAt(0) || 0
      
      // PHASE 1: Width comparison
      ctx.font = `${FONT_SIZE}px "${fontName}", sans-serif`
      const testWidth = ctx.measureText(character).width
      
      ctx.font = `${FONT_SIZE}px sans-serif`
      const fallbackWidth = ctx.measureText(character).width
      
      const widthDiff = Math.abs(testWidth - fallbackWidth)
      
      // Debug logging for all characters to see what's happening
      console.log(`🔍 ${character}: test=${testWidth.toFixed(2)}, fallback=${fallbackWidth.toFixed(2)}, diff=${widthDiff.toFixed(2)}`)
      
      // Check if font is actually loaded
      const fontFamily = `"${fontName}", sans-serif`
      const isFontLoaded = document.fonts.check(`${FONT_SIZE}px ${fontFamily}`)
      if (character === 'A' || character === 'ß') {
        console.log(`🎯 Font check for ${character}: fontName="${fontName}", isLoaded=${isFontLoaded}`)
      }
      
      let isMissing = false
      let confidence = 0.5
      
      // PHASE 2: Bitmap comparison (required for accurate detection)
      // Width-only comparison is unreliable because:
      // - Some fonts render TOFU glyphs with different widths than fallback
      // - Width difference doesn't tell us if the glyph is actually rendered
      
      // Render test font to canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${FONT_SIZE}px "${fontName}", sans-serif`
      ctx.fillStyle = '#000'
      ctx.fillText(character, TEXT_X, TEXT_Y)
      const testImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const testHash = computeBitmapHash(testImageData)
      
      // Render fallback to canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${FONT_SIZE}px sans-serif`
      ctx.fillStyle = '#000'
      ctx.fillText(character, TEXT_X, TEXT_Y)
      const fallbackImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const fallbackHash = computeBitmapHash(fallbackImageData)
      
      // Compare bitmap hashes
      const hashDiff = calculateHashDifference(testHash, fallbackHash)
      
      // Decision logic based on bitmap comparison
      if (hashDiff < 0.001) {
        // Identical rendering = font doesn't have the character
        isMissing = true
        confidence = 0.95
      } else if (hashDiff > 0.05) {
        // Significantly different rendering = font has the character
        isMissing = false
        confidence = 0.95
      } else {
        // Small difference = uncertain, use width as tiebreaker
        if (widthDiff > 1.0) {
          isMissing = false
          confidence = 0.7
        } else {
          isMissing = true
          confidence = 0.7
        }
      }
      
      // Comprehensive debug logging for all characters
      console.log(`🔍 ${character}: widthDiff=${widthDiff.toFixed(2)}, hashDiff=${hashDiff.toFixed(4)}, isMissing=${isMissing}, confidence=${confidence.toFixed(2)}`)
      
      // Special debug for punctuation
      if (character === '.' || character === ',' || character === ';' || character === ':' || 
          character === '!' || character === '?' || character === "'" || character === '(' || 
          character === ')' || character === '-' || character === '–' || character === '—') {
        console.log(`🎯 PUNCTUATION ${character}: widthDiff=${widthDiff.toFixed(2)}, hashDiff=${hashDiff.toFixed(4)}, isMissing=${isMissing}`)
      }
      
      results.push({
        character,
        codePoint,
        isMissing,
        confidence: Math.max(0.5, confidence)
      })
    }
    
    // Summary of results
    const missingCount = results.filter(r => r.isMissing).length
    const missingChars = results.filter(r => r.isMissing).map(r => r.character).join(', ')
    console.log(`📊 DETECTION SUMMARY: ${missingCount}/${results.length} missing characters: [${missingChars}]`)
    
    return results
  } catch (error) {
    console.error('Detection failed:', error)
    throw error
  }
}

/**
 * Render text to canvas and return image data
 */
function renderTextToCanvas(
  ctx: CanvasRenderingContext2D,
  char: string,
  fontFamily: string,
  fontSize: number,
  x: number,
  y: number
): ImageData {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
  // Set font and render
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = '#000000'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText(char, x, y)
  
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
}

/**
 * Compute bitmap hash from image data
 */
function computeBitmapHash(imageData: ImageData): number {
  let hash = 0
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    const grayscale = (r * 0.299 + g * 0.587 + b * 0.114) * (a / 255)
    hash += grayscale
  }
  
  return hash
}

/**
 * Calculate hash difference
 */
function calculateHashDifference(hash1: number, hash2: number): number {
  const maxHash = Math.max(Math.abs(hash1), Math.abs(hash2), 1)
  return Math.abs(hash1 - hash2) / maxHash
}

/**
 * Batch detect missing glyphs for multiple fonts and languages
 * This is the main API function used by the UI
 */
export async function batchDetectMissingGlyphs(
  fonts: Array<{ name: string; blob: Blob }>,
  languages: Array<{ id: string; coverage: string }>,
  bypassCache: boolean = false
): Promise<Map<string, Map<string, GlyphDetectionResult[]>>> {
  const results = new Map<string, Map<string, GlyphDetectionResult[]>>()
  
  console.log(`🚀 Starting batch detection for ${fonts.length} fonts and ${languages.length} languages`)
  
  for (const font of fonts) {
    const fontResults = new Map<string, GlyphDetectionResult[]>()
    
    for (const language of languages) {
      const characters = language.coverage.split('').filter((char, index, arr) => 
        arr.indexOf(char) === index // Remove duplicates
      )
      
      if (characters.length > 0) {
        try {
          const fontBuffer = await font.blob.arrayBuffer()
          const detectionResults = await detectMissingGlyphs(font.name, fontBuffer, characters, bypassCache)
          fontResults.set(language.id, detectionResults)
          
          const missingCount = detectionResults.filter(r => r.isMissing).length
          console.log(`✅ Detected ${missingCount}/${characters.length} missing glyphs for ${font.name} (${language.id})`)
        } catch (error) {
          console.error(`❌ Detection failed for ${font.name} (${language.id}):`, error)
          // Set empty results on error
          fontResults.set(language.id, characters.map(char => ({
            character: char,
            codePoint: char.codePointAt(0) || 0,
            isMissing: false,
            confidence: 0
          })))
        }
      } else {
        fontResults.set(language.id, [])
      }
    }
    
    results.set(font.name, fontResults)
  }
  
  console.log(`🎉 Batch detection completed`)
  return results
}

/**
 * Clear detection cache
 */
export async function clearDetectionCache(): Promise<void> {
  try {
    // Get all keys and filter for detection cache
    const allKeys = await getItem<string[]>('_cache_keys') || []
    const detectionKeys = allKeys.filter(key => key.startsWith('glyph-detection-'))
    
    console.log('🔍 All cache keys:', allKeys)
    console.log('🔍 Detection keys to clear:', detectionKeys)
    
    for (const key of detectionKeys) {
      await setItem(key, null) // Remove from cache
    }
    
    // Also try to clear any keys that might exist without being in _cache_keys
    // This is a more aggressive approach
    const aggressiveKeys = allKeys.filter(key => 
      key.includes('glyph-detection') || 
      key.includes('detection') ||
      key.includes('Styro')
    )
    
    console.log('🔍 Aggressive keys to clear:', aggressiveKeys)
    
    for (const key of aggressiveKeys) {
      await setItem(key, null)
    }
    
    console.log(`🗑️ Cleared ${detectionKeys.length} cached detection results`)
    console.log(`🗑️ Aggressively cleared ${aggressiveKeys.length} additional keys`)
    
    // Nuclear option: clear the entire IndexedDB database
    console.log('💥 Nuclear option: clearing entire IndexedDB...')
    try {
      // Get all keys from IndexedDB and clear them
      const db = await import('idb-keyval')
      const allDbKeys = await db.keys()
      console.log('🔍 All IndexedDB keys:', allDbKeys)
      
      // Clear all keys that might be related to detection
      for (const key of allDbKeys) {
        if (key.toString().includes('glyph-detection') || 
            key.toString().includes('detection') ||
            key.toString().includes('Styro') ||
            key.toString().includes('font')) {
          await db.del(key)
          console.log('🗑️ Cleared key:', key)
        }
      }
    } catch (dbError) {
      console.log('⚠️ Could not clear IndexedDB directly:', dbError)
    }
    
  } catch (error) {
    console.error('Failed to clear detection cache:', error)
  }
}

/**
 * Get detection statistics
 */
export async function getDetectionStats(): Promise<{
  cachedResults: number
  totalCacheSize: number
}> {
  try {
    const allKeys = await getItem<string[]>('_cache_keys') || []
    const detectionKeys = allKeys.filter(key => key.startsWith('glyph-detection-'))
    
    let totalSize = 0
    for (const key of detectionKeys) {
      const data = await getItem(key)
      if (data) {
        totalSize += JSON.stringify(data).length
      }
    }
    
    return {
      cachedResults: detectionKeys.length,
      totalCacheSize: totalSize
    }
  } catch (error) {
    console.error('Failed to get detection stats:', error)
    return { cachedResults: 0, totalCacheSize: 0 }
  }
}
