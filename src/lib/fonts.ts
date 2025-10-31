export type LoadedFont = {
  id: string
  name: string
  style: string
  weight: string
  fileName: string
  blob: Blob
  arrayBuffer: ArrayBuffer // NEW: for detection
}

export async function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onabort = () => reject(new Error('File read aborted'))
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.readAsArrayBuffer(file)
  })
}

export function deriveFontId(name: string, weight?: string, style?: string) {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-')
  const parts = [normalizedName]
  if (weight) parts.push(weight)
  if (style && style !== 'normal') parts.push(style)
  return parts.join('-')
}

function sanitizeName(input: string) {
  return input.replace(/\.[^.]+$/, '')
}

export async function loadFontFromArrayBuffer(file: File, buffer: ArrayBuffer) {
  const blob = new Blob([buffer], { type: file.type || 'font/ttf' })
  const url = URL.createObjectURL(blob)
  try {
    const fontFace = new FontFace(file.name, 'url(' + url + ')')
    await fontFace.load()
    document.fonts.add(fontFace)

    const name = fontFace.family || sanitizeName(file.name)
    const weight = String(fontFace.weight || '400')
    const style = fontFace.style || 'normal'

    const metadata: LoadedFont = {
      id: deriveFontId(name, weight, style),
      name,
      weight,
      style,
      fileName: file.name,
      blob,
      arrayBuffer: buffer, // <--- exposed for detection
    }

    return metadata
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function loadFontFromFile(file: File) {
  const buffer = await readFileAsArrayBuffer(file)
  return loadFontFromArrayBuffer(file, buffer)
}
