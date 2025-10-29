import { useMemo, useState } from 'react'
import presetsData from '../data/presets.json'
import ar from '../data/languages/ar.json'
import de from '../data/languages/de.json'
import en from '../data/languages/en.json'
import es from '../data/languages/es.json'
import fr from '../data/languages/fr.json'
import he from '../data/languages/he.json'
import ja from '../data/languages/ja.json'
import srCyrl from '../data/languages/sr-Cyrl.json'
import srLatn from '../data/languages/sr-Latn.json'
import zhHans from '../data/languages/zh-Hans.json'
import { useFontStore } from '../state/store'
import { X, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'


type LanguageDefinition = {
  id: string
  name: string
  nativeName: string
  sample: string
  coverage: string
  rtl?: boolean
}

type PresetDefinition = {
  id: string
  name: string
  languages: string[]
}

const ALL_LANGUAGES: LanguageDefinition[] = [
  en,
  es,
  fr,
  de,
  srLatn,
  srCyrl,
  ar,
  he,
  ja,
  zhHans,
]

const PRESETS = presetsData as PresetDefinition[]

function toSelection(def: LanguageDefinition) {
  return {
    id: def.id,
    name: def.name,
    nativeName: def.nativeName,
    sample: def.sample,
    coverage: def.coverage,
    rtl: def.rtl,
  }
}

export default function LanguagePicker() {
  const { languages, setLanguages } = useFontStore()
  const [search, setSearch] = useState('')
  const selectedIds = useMemo(() => new Set(languages.map((lang) => lang.id)), [languages])

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_LANGUAGES
    const query = search.trim().toLowerCase()
    return ALL_LANGUAGES.filter((lang) =>
      [lang.name, lang.nativeName, lang.id].some((value) => value.toLowerCase().includes(query)),
    )
  }, [search])

  function toggleLanguage(lang: LanguageDefinition) {
    if (selectedIds.has(lang.id)) {
      setLanguages(languages.filter((item) => item.id !== lang.id))
    } else {
      setLanguages([...languages, toSelection(lang)])
    }
  }

  function applyPreset(preset: PresetDefinition) {
    const mapped = ALL_LANGUAGES.filter((lang) => preset.languages.includes(lang.id)).map(toSelection)
    setLanguages(mapped)
  }

  function clearSelection() {
    setLanguages([])
  }

  return (
    <section className="component-language-picker space-y-6 text-[color:var(--color-foreground)]">
      <div className="component-language-picker__presets flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyPreset(preset)}
          >
            {preset.name}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
          Clear
        </Button>
      </div>
      <div className="component-language-picker__search max-w-md">
        <div className="component-language-picker__search-label flex flex-col gap-2">
          <Label htmlFor="language-search">Search languages</Label>
          <Input
            id="language-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type to filter"
          />
        </div>
      </div>
      <div className="component-language-picker__grid grid gap-3 md:grid-cols-2">
        {filtered.map((lang) => {
          const isSelected = selectedIds.has(lang.id)

          return (
            <Card
              key={lang.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => toggleLanguage(lang)}
              data-language-id={lang.id}
            >
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-base">{lang.name}</div>
                  <Badge variant="outline">{lang.id}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{lang.nativeName}</div>
                {isSelected && (
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p
                  className="rounded bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                  dir={lang.rtl ? 'rtl' : 'ltr'}
                >
                  {lang.sample}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="component-language-picker__selected space-y-2">
        <h2 className="component-language-picker__selected-title text-lg font-semibold">Selected ({languages.length})</h2>
        {languages.length > 0 ? (
          <ul className="component-language-picker__selected-list flex flex-wrap gap-2">
            {languages.map((lang) => (
              <li
                key={lang.id}
                
              >
                <Button
                
                  onClick={() => setLanguages(languages.filter((item) => item.id !== lang.id))}
                  aria-label={`Remove ${lang.name}`}
                  title={`Remove ${lang.name}`}
                >
                  {lang.name}
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="component-language-picker__selected-empty text-sm text-[color:var(--color-muted-foreground)]">
            No languages selected yet.
          </p>
        )}
      </div>
    </section>
  )
}
