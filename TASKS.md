# TASKS � GlyphGlobe / font-audit (One-Step Mode)

- [x] Create Vite app (done)
- [x] Install Tailwind & wire up (done)

## Upcoming
- [x] Install PWA plugin *(completed � remember to update TASKS.md whenever a task finishes)*
  - cmd:
    - npm i -D vite-plugin-pwa
    - Edit vite.config.ts to add VitePWA with minimal manifest
  - accept: Dev server builds, service worker registers (Application > Service Workers in DevTools)

- [x] Add basic routes/pages
  - cmd:
    - Create src/pages/{Languages.tsx,Fonts.tsx,Preview.tsx,Report.tsx}
    - Create a minimal router in src/app.tsx, link from Home
  - accept: Nav works between pages

- [x] Install UI & state libs
  - cmd:
    - npm i zustand idb-keyval jspdf
    - (Optional later) shadcn/ui: init and add Card, Tabs, Table, Tooltip, Dialog
  - accept: App compiles

- [x] Fonts: upload & register
  - cmd:
    - Create src/lib/fonts.ts with FontFace loader from ArrayBuffer
    - Create src/components/FontUploader.tsx
  - accept: Drop .ttf/.woff2 ? listed and usable

- [x] Persist fonts/selections
  - cmd:
    - src/lib/storage.ts using idb-keyval
  - accept: Reload keeps fonts and chosen languages

- [x] Languages data & presets
  - cmd:
    - Create src/data/languages/{en.json,sr-Latn.json,sr-Cyrl.json,...} (seed 8�10 for now)
    - src/data/presets.json ("EU Core", "Cyrillic", "MENA", "CJK UI")
  - accept: Picker shows sets and can add/remove languages ✓ 10 languages + 4 presets working

- [x] Preview & coverage views
  - cmd:
    - src/components/PreviewPane.tsx (samples at 12/16/24/32/48px)
    - src/components/CoverageGrid.tsx (renders coverage string)
  - accept: Text renders in chosen font; RTL languages set dir="rtl" ✓ Tabs UI with preview & coverage

- [x] Missing glyph detection (worker)
  - cmd:
    - src/workers/detector.worker.ts (canvas render & compare)
    - src/lib/detect.ts (API + cache)
    - Highlight missing glyphs with .missing class + tooltip U+XXXX
  - accept: Known missing characters show as highlighted ✓ Web Worker with Canvas API detection, caching, and visual indicators

- [ ] Reports & export
  - cmd:
    - src/components/ReportTable.tsx
    - src/lib/export.ts (JSON, CSV, MD, PDF via jsPDF)
  - accept: Exports download with correct lists per font-language

- [ ] PWA polish
  - cmd:
    - Add icons, offline page, "Delete all data" control
  - accept: Installable; works offline after first load

## Later (optional)
- [ ] Side-by-side font compare
- [ ] Variable font sliders (wght, wdth, opsz)
- [ ] Import/export custom language sets