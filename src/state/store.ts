import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { loadFontFromFile, type LoadedFont } from '../lib/fonts'
import { clearStore, getItem, setItem, deleteItem } from '../lib/storage'

// Font storage functions that handle Blobs
async function saveFonts(fonts: LoadedFont[]) {
  try {
    const fontData = await Promise.all(
      fonts.map(async (font) => ({
        ...font,
        blobData: await font.blob.arrayBuffer(),
        blobType: font.blob.type,
      }))
    )
    await setItem('fonts', fontData)
  } catch (error) {
    console.error('Error saving fonts:', error)
  }
}

async function loadFonts(): Promise<LoadedFont[]> {
  try {
    const fontData = await getItem<any[]>('fonts')
    if (!fontData) {
      return []
    }
    
    const reconstructedFonts = fontData.map((font: any) => ({
      ...font,
      blob: new Blob([font.blobData], { type: font.blobType }),
      blobData: undefined,
      blobType: undefined,
    }))
    return reconstructedFonts
  } catch (error) {
    console.error('Error loading fonts:', error)
    return []
  }
}

export type LanguageSelection = {
  id: string
  name: string
  nativeName: string
  sample: string
  coverage: string
  rtl?: boolean
}

type FontState = {
  fonts: LoadedFont[]
  languages: LanguageSelection[]
  isHydrated: boolean
  addFonts: (files: FileList | File[]) => Promise<void>
  removeFont: (id: string) => void
  setLanguages: (languages: LanguageSelection[]) => void
  clearAll: () => Promise<void>
}

export const useFontStore = create<FontState>()(
  persist(
    (set, get) => ({
      fonts: [],
      languages: [],
      isHydrated: false,
      addFonts: async (files) => {
        const fileList = Array.isArray(files) ? files : Array.from(files)
        const loadedFonts: LoadedFont[] = []
        for (const file of fileList) {
          const metadata = await loadFontFromFile(file)
          loadedFonts.push(metadata)
        }
        const newFonts = [...get().fonts, ...loadedFonts]
        set({ fonts: newFonts })
        await saveFonts(newFonts)
      },
      removeFont: async (id) => {
        const newFonts = get().fonts.filter((font) => font.id !== id)
        set({ fonts: newFonts })
        await saveFonts(newFonts)
      },
      setLanguages: (languages) => set({ languages }),
      clearAll: async () => {
        await clearStore()
        set({ fonts: [], languages: [] })
      },
    }),
    {
      name: 'glyph-globe-state',
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const value = await getItem<string>(key)
          return value ?? null
        },
        setItem: async (key, value) => {
          await setItem(key, value)
        },
        removeItem: async (key) => {
          await deleteItem(key)
        },
      })),
      // Only persist languages, not fonts
      partialize: (state) => ({
        languages: state.languages,
        isHydrated: false,
      }),
      onRehydrateStorage: () => async (state) => {
        // Load fonts from separate storage
        const fonts = await loadFonts()
        if (state) {
          state.fonts = fonts
          state.isHydrated = true
        }
      },
    },
  ),
)

export function useHydratedFonts() {
  const { fonts, isHydrated } = useFontStore()
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    // If not hydrated yet, try to load fonts from storage
    if (!isHydrated && fonts.length === 0) {
      loadFonts().then((storedFonts) => {
        if (storedFonts.length > 0) {
          useFontStore.setState({ fonts: storedFonts, isHydrated: true })
        } else {
          setFontsReady(true)
        }
      })
      return
    }

    if (fonts.length === 0) {
      setFontsReady(true)
      return
    }

    setFontsReady(false)

    const promises = fonts.map((font) => {
      return font.blob
        .arrayBuffer()
        .then((buffer) => {
          const fontFace = new FontFace(font.name, buffer)
          return fontFace.load().then((loaded) => {
            document.fonts.add(loaded)
          })
        })
        .catch((err) => {
          console.error('Error loading font:', font.name, err)
        })
    })

    Promise.all(promises).then(() => {
      setFontsReady(true)
    })
  }, [fonts, isHydrated])

  return fontsReady
}
