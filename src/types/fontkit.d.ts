/**
 * Type declarations for fontkit
 * fontkit is a font parser for TTF, OTF, WOFF, WOFF2 fonts
 */

declare module 'fontkit' {
  export interface Font {
    glyphForCodePoint(codePoint: number): Glyph
    [key: string]: any
  }

  export interface Glyph {
    id: number
    path?: Path | null
    [key: string]: any
  }

  export interface Path {
    commands?: any[]
    [key: string]: any
  }

  export function create(buffer: ArrayBuffer | Uint8Array): Font
}

