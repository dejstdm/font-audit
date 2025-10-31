/**
 * Type declarations for opentype.js
 * opentype.js is a font parser for TTF, OTF, WOFF fonts
 */

declare module 'opentype.js' {
  export interface Font {
    names?: {
      fontFamily?: string
      [key: string]: any
    }
    familyName?: string
    charToGlyph(char: string): Glyph
    stringToGlyphs(str: string): Glyph[]
  }

  export interface Glyph {
    index: number
    path?: Path | null
    [key: string]: any
  }

  export interface Path {
    commands?: any[]
    [key: string]: any
  }

  export function parse(buffer: ArrayBuffer | Uint8Array | Buffer): Font
  export function load(url: string, callback: (err: Error | null, font: Font) => void): void
}

