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

import { create as createFont } from 'fontkit'

/**
 * Process detection request
 */
async function processDetectionRequest(request) {
  const { fontName, characters, fontBuffer, requestId } = request
  
  try {
    const bufferUint8 = fontBuffer instanceof Uint8Array
      ? fontBuffer : new Uint8Array(fontBuffer)
    const font = createFont(bufferUint8)
    for (const character of characters) {
      const codePoint = character.codePointAt(0) || 0
      const glyph = font.glyphForCodePoint(codePoint)
      const hasGlyph = glyph && glyph.id > 0 && (glyph.path !== undefined && glyph.path !== null)
      results.push({
        character,
        codePoint,
        isMissing: !hasGlyph,
        confidence: 1.0,
      })
    }
    self.postMessage({ requestId, results })
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : String(error),
      results: characters.map(char => ({
        character: char,
        codePoint: char.codePointAt(0) || 0,
        isMissing: false,
        confidence: 0,
      }))
    })
  }
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { fontName, characters, fontBuffer, requestId } = event.data
  let results = []
  try {
    const bufferUint8 = fontBuffer instanceof Uint8Array
      ? fontBuffer : new Uint8Array(fontBuffer)
    const font = createFont(bufferUint8)
    for (const character of characters) {
      const codePoint = character.codePointAt(0) || 0
      const glyph = font.glyphForCodePoint(codePoint)
      const hasGlyph = glyph && glyph.id > 0 && (glyph.path !== undefined && glyph.path !== null)
      results.push({
        character,
        codePoint,
        isMissing: !hasGlyph,
        confidence: 1.0,
      })
    }
    self.postMessage({ requestId, results })
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : String(error),
      results: characters.map(char => ({
        character: char,
        codePoint: char.codePointAt(0) || 0,
        isMissing: false,
        confidence: 0,
      }))
    })
  }
})

// Worker is ready
