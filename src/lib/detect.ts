/**
 * Glyph Detection API with caching
 * 
 * Provides a high-level API for detecting missing glyphs by directly inspecting
 * the font file's CMAP table using opentype.js, with intelligent caching to avoid redundant work.
 * 
 * Supports: TTF, OTF, WOFF, WOFF2 formats (WOFF2 is decompressed first using wawoff2)
 */

import { getItem, setItem } from './storage'
import { create as createFont } from 'fontkit'

export type GlyphDetectionResult = {
  character: string
  codePoint: number
  isMissing: boolean
  confidence: number
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
    return cached ?? null
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

  // Perform detection by directly inspecting font file
  console.log(`🔍 Detecting missing glyphs for ${characters.length} characters`)
  const results = await performDetection(fontName, fontBuffer, characters)
  
  // Cache results
  await cacheResults(fontName, characters, results)
  
  return results
}

/**
 * Perform detection by directly inspecting the font file's CMAP table
 * Supports: TTF, OTF, WOFF, WOFF2 formats (WOFF2 is decompressed using wawoff2)
 */
async function performDetection(
  fontName: string,
  fontBuffer: ArrayBuffer,
  characters: string[],
): Promise<GlyphDetectionResult[]> {
  try {
    const bufferUint8 = fontBuffer instanceof Uint8Array
      ? fontBuffer : new Uint8Array(fontBuffer)
    let font
    try {
      font = createFont(bufferUint8)
    } catch (fontError) {
      throw new Error(`Failed to parse font file ${fontName}: ${fontError instanceof Error ? fontError.message : String(fontError)}`)
    }
    if (!font) {
      throw new Error(`Font parsing returned null for ${fontName}`)
    }
    const results: GlyphDetectionResult[] = []
    for (const character of characters) {
      const codePoint = character.codePointAt(0) || 0
      const glyph = font.glyphForCodePoint(codePoint)
      // fontkit's glyphs always have .id, likely has a path for real glyphs
      const hasGlyph = glyph && glyph.id > 0 && (glyph.path !== undefined && glyph.path !== null)
      const isMissing = !hasGlyph
      const confidence = 1.0 // 100% confidence
      results.push({
        character,
        codePoint,
        isMissing,
        confidence,
      })
    }
    return results
  } catch (error) {
    throw error
  }
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
  const batchStartTime = performance.now()
  const results = new Map<string, Map<string, GlyphDetectionResult[]>>()
  const totalWork = fonts.length * languages.length
  let completedWork = 0
  
  console.log(`🚀 Starting batch detection for ${fonts.length} fonts and ${languages.length} languages`)
  
  for (const font of fonts) {
    const fontStartTime = performance.now()
    const fontResults = new Map<string, GlyphDetectionResult[]>()
    
    for (const language of languages) {
      const characters = language.coverage.split('').filter((char: string, index: number, arr: string[]) => 
        arr.indexOf(char) === index // Remove duplicates
      )
      
      if (characters.length > 0) {
        try {
          const fontBuffer = await font.blob.arrayBuffer()
          const detectionResults = await detectMissingGlyphs(font.name, fontBuffer, characters, bypassCache)
          fontResults.set(language.id, detectionResults)
          
          completedWork++
          const missingCount = detectionResults.filter(r => r.isMissing).length
          const progress = Math.round((completedWork / totalWork) * 100)
          console.log(`✅ [${progress}%] Detected ${missingCount}/${characters.length} missing glyphs for ${font.name} (${language.id})`)
        } catch (error) {
          completedWork++
          console.error(`❌ Detection failed for ${font.name} (${language.id}):`, error)
          // Set empty results on error
          fontResults.set(language.id, characters.map((char: string) => ({
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
    const fontElapsed = ((performance.now() - fontStartTime) / 1000).toFixed(2)
    console.log(`⏱️  Font ${font.name} completed in ${fontElapsed}s`)
  }
  
  const totalElapsed = ((performance.now() - batchStartTime) / 1000).toFixed(2)
  console.log(`🎉 Batch detection completed in ${totalElapsed}s for ${fonts.length} fonts and ${languages.length} languages`)
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
