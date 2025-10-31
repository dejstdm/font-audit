import { useMemo, useState } from 'react'
import presetsData from '../data/presets.json'
import ar from '../data/languages/ar.json'
import be from '../data/languages/be.json'
import bg from '../data/languages/bg.json'
import bs from '../data/languages/bs.json'
import ca from '../data/languages/ca.json'
import cs from '../data/languages/cs.json'
import cy from '../data/languages/cy.json'
import da from '../data/languages/da.json'
import de from '../data/languages/de.json'
import el from '../data/languages/el.json'
import en from '../data/languages/en.json'
import es from '../data/languages/es.json'
import et from '../data/languages/et.json'
import eu from '../data/languages/eu.json'
import fi from '../data/languages/fi.json'
import fr from '../data/languages/fr.json'
import ga from '../data/languages/ga.json'
import gd from '../data/languages/gd.json'
import he from '../data/languages/he.json'
import hr from '../data/languages/hr.json'
import hu from '../data/languages/hu.json'
import is from '../data/languages/is.json'
import it from '../data/languages/it.json'
import ja from '../data/languages/ja.json'
import lb from '../data/languages/lb.json'
import lt from '../data/languages/lt.json'
import lv from '../data/languages/lv.json'
import mk from '../data/languages/mk.json'
import mo from '../data/languages/mo.json'
import mt from '../data/languages/mt.json'
import nl from '../data/languages/nl.json'
import no from '../data/languages/no.json'
import pl from '../data/languages/pl.json'
import pt from '../data/languages/pt.json'
import ro from '../data/languages/ro.json'
import ru from '../data/languages/ru.json'
import sk from '../data/languages/sk.json'
import sl from '../data/languages/sl.json'
import sq from '../data/languages/sq.json'
import srCyrl from '../data/languages/sr-Cyrl.json'
import srLatn from '../data/languages/sr-Latn.json'
import sv from '../data/languages/sv.json'
import tr from '../data/languages/tr.json'
import uk from '../data/languages/uk.json'
import vls from '../data/languages/vls.json'
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
  sq,
  eu,
  be,
  bs,
  bg,
  ca,
  hr,
  cs,
  da,
  nl,
  et,
  fi,
  vls,
  el,
  hu,
  is,
  ga,
  it,
  lv,
  lt,
  lb,
  mk,
  mt,
  mo,
  no,
  pl,
  pt,
  ro,
  ru,
  gd,
  sk,
  sl,
  sv,
  tr,
  uk,
  cy,
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
