/**
 * Type declarations for wawoff2
 * wawoff2 is a WebAssembly-based WOFF2 decompressor for browsers
 */

declare module 'wawoff2' {
  /**
   * Decompress a WOFF2 font file to TTF format
   * @param input - Uint8Array containing the WOFF2 file data
   * @returns Uint8Array containing the decompressed TTF file data
   */
  export function decompress(input: Uint8Array): Uint8Array
}
