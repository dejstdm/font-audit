/**
 * Web Worker for detecting missing glyphs using fontkit
 * 
 * Implements direct font table inspection:
 * - Parses font file using fontkit
 * - Queries CMAP table for glyph presence
 * - Returns 100% accurate results (confidence: 1.0)
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
