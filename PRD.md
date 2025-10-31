# Font Testing Tool (font-audit) — Multilingual Font Coverage Tool (PWA)

**Version:** 1.0
**Internal Repo:** `font-audit`
**Public App Name:** `Font Testing Tool` (Short: `FontAudit`)
**Owner:** You (Frontend, agency-internal tool)
**Goal:** Prevent late-stage surprises where a delivered font lacks glyphs for specific languages. Provide a fast, offline-capable PWA to upload one or more font files and test them against real sample content per language, with precise missing-glyph detection and exportable reports.


---

## 1. Problem Statement

Teams frequently discover missing glyphs only after content integration. This delays launches, causes design/QA churn, and creates brand inconsistency when fallback fonts appear. We need a small, **backend-less** tool to:

* Upload font files (OTF/TTF/WOFF/WOFF2).
* Select languages to test from a large predefined list (+ custom additions).
* Render both **real sentences** and **systematic coverage strings**.
* Detect missing glyphs **per font** and **per language**, highlight them **in-context**, and export a report.

---

## 2. Success Metrics

* **Detection accuracy:** ≥ 99% for BMP code points in the curated language sets.
* **Time-to-result:** < 5s for 1 font × 10 languages on a typical laptop.
* **Zero backends:** Fully functional offline after first load.
* **Report utility:** QA can hand the exported JSON/PDF to design/PMs and vendors.

---

## 3. Users & Use Cases

* **Frontend devs / Designers:** Validate font packages before integration.
* **PM/QA:** Share a clear list of missing characters to font vendors.
* **Localization:** Confirm coverage for target locales.

**Primary flow:** Upload font(s) → Pick language set → Preview (sentences + coverage) → See inline highlights → Export report per font/language.

---

## 4. Non-Goals

* No server/storage of fonts beyond browser **IndexedDB**.
* No external font URLs or Google Fonts fetch.
* No account system.
* No advanced typesetting (OpenType feature test is a future nice-to-have).

---

## 5. Platform & Tech Stack

* **TypeScript + React (Vite)** for clear state and modularity.
* **Tailwind CSS + shadcn/ui** for fast, consistent UI.
* **PWA:** Manifest + Service Worker (Vite PWA plugin), fully offline.
* **Data:** Curated JSON for languages (name, ISO code, sample text, coverage set).
* **Storage:** IndexedDB (via `idb-keyval`) for font binaries, user presets.
* **Reports:** Client-side generation (JSON, CSV, Markdown, optional PDF via jsPDF).

> Rationale: You asked for PWA with multiple pages and suggested Tailwind + shadcn. shadcn/ui is React-based; thus we use **React+Vite+TS**. Still zero-backend/offline.

---

## 6. Language Coverage Model

Each language entry in `data/languages/*.json`:

```json
{
  "id": "sr-Latn",
  "name": "Serbian (Latin)",
  "script": "Latin",
  "sample": "Vezba: Čačanski đak žuri po ćevape i uživa u žuboru reke.",
  "coverage": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZčćđšžČĆĐŠŽ –’‚‘“” … !? , . : ; ( ) [ ] { } @ # $ % & * + − / 0 1 2 3 4 5 6 7 8 9"
}
```

* **sample:** natural sentence for visual impression.
* **coverage:** exhaustive characters to verify glyph presence (includes punctuation and common symbols per locale).
* Provide a **default preset** of ~50 languages covering common agency work:

  * Western/Central/Eastern European Latin (en, fr, de, es, it, pt, nl, sv, no, da, fi, pl, cs, sk, sl, hr, ro, hu, tr, sq, bs, sr-Latn, etc.)
  * **Cyrillic** (ru, uk, bg, sr-Cyrl, mk)
  * **Greek** (el)
  * **Turkish** (tr)
  * **Baltics** (lv, lt, et)
  * **Hebrew** (he)
  * **Arabic** (ar) — *right-to-left*
  * **Persian** (fa) — *RTL*
  * **Thai** (th)
  * **Vietnamese** (vi)
  * **Hindi/Marathi** (hi, mr) — *Devanagari baseline*
  * **Bengali** (bn)
  * **Tamil** (ta)
  * **Telugu** (te)
  * **Kannada** (kn)
  * **Malayalam** (ml)
  * **Gujarati** (gu)
  * **Punjabi Gurmukhi** (pa)
  * **Khmer** (km)
  * **Georgian** (ka)
  * **Armenian** (hy)
  * **Chinese** (zh-Hans, zh-Hant) — core sets for UI strings;
  * **Japanese** (ja) — basic kana + common kanji set;
  * **Korean** (ko) — Hangul syllables subset suitable for UI.

> We don’t target *every* codepoint in CJK; we include **core UI glyph sets** (numbers, punctuation, frequent characters). This is adjustable via data files and presets.

---

## 7. Key Features & Requirements

### 7.1 Font Upload & Management

* Drag-and-drop + file input; accept **.ttf, .otf, .woff, .woff2**.
* Read as ArrayBuffer, register using `FontFace` API (`new FontFace(name, data)`), auto-name from internal name when possible.
* Store in IndexedDB for later sessions (with delete controls).
* Show metadata: PostScript name, weight/width/style if extractable.

### 7.2 Language Selection & Presets

* Left pane: searchable multi-select of languages with badges for script.
* Presets: *“EU Core”, “Cyrillic”, “MENA”, “CJK UI”, “All Latin Extended”* etc.
* Add custom language: user provides name, sample, coverage string.

### 7.3 Preview Modes (Both Required)

1. **Natural sentences** (per language) in multiple sizes (12/16/24/32/48 px) and weights.
2. **Coverage grid**: block of all characters in `coverage` with clear spacing.

* **Missing glyphs highlighting:** characters that the font lacks are **wrapped** in a styled span (red box, tooltip with codepoint).
* Provide toggle: *Show as original character* vs *Replace with ▢ and keep original in tooltip.*

### 7.4 Missing Glyph Detection (Client-Only Algorithm)

There’s no standard API for “hasGlyph”, so we implement a robust heuristic:

1. Render the character to a hidden `<canvas>` using the **test font** and measure pixel signature (width + raster hash).
2. Render the same character using a **known fallback** (e.g., a system sans) **and** using a **special fallback that intentionally lacks most glyphs** (we ship a tiny font with only a few glyphs).
3. If the test-font rendering matches the system fallback (within tiny tolerance) **and** differs from the empty font’s tofu box, we infer fallback happened ⇒ **missing glyph**.
4. Cache results per (font, codepoint) to keep performance.

> This dual-compare approach significantly reduces false positives compared to width-only checks.

### 7.5 Reports

* Per font × language: list missing codepoints (U+XXXX) + human characters.
* Export formats: **JSON**, **CSV**, **Markdown**, **PDF**.
* Include font metadata, language list, timestamp, and app version.
* Option: export **bundle** (ZIP) with all selected fonts’ reports.

### 7.6 UI & Navigation (PWA, Multi-Page)

* **Pages**

  * **/languages** – select preset or customize languages.
  * **/fonts** – upload/manage fonts, view metadata.
  * **/preview** – side-by-side previews, toggles, sizes/weights.
  * **/report** – aggregated results and exports.
* **Components** (shadcn/ui): `Tabs`, `Card`, `Table`, `Badge`, `Alert`, `Tooltip`, `Toast`, `Dialog` (confirm delete), `Progress` (processing), `DropdownMenu` (exports).
* **A11y/i18n:** Keyboard nav, ARIA roles, RTL-aware layout for Arabic/Hebrew previews.

### 7.7 Performance

* Incremental analysis: per language chunking to keep UI responsive.
* Web Worker for glyph checks to avoid blocking main thread.
* Cache results and only re-check if fonts or languages changed.

### 7.8 Security & Privacy

* No network for font binaries unless user explicitly exports.
* Service worker scope restricted to app.
* Clear **“Delete All Data”** action wipes IndexedDB + caches.

---

## 8. Architecture & Files

```
font-testing-tool/
├─ public/
│  ├─ favicon.svg
│  ├─ manifest.webmanifest
├─ src/
│  ├─ main.tsx
│  ├─ app.tsx (routes via tiny router or TanStack Router)
│  ├─ components/
│  │  ├─ FontUploader.tsx
│  │  ├─ LanguagePicker.tsx
│  │  ├─ PreviewPane.tsx
│  │  ├─ CoverageGrid.tsx
│  │  ├─ ReportTable.tsx
│  │  └─ ExportMenu.tsx
│  ├─ data/
│  │  ├─ languages/ (JSON per language + presets)
│  │  └─ presets.json
│  ├─ lib/
│  │  ├─ fonts.ts (FontFace load, metadata)
│  │  ├─ detect.ts (canvas/worker detection)
│  │  ├─ storage.ts (idb-keyval wrappers)
│  │  ├─ export.ts (JSON/CSV/MD/PDF)
│  │  └─ rtl.ts (dir handling)
│  ├─ workers/
│  │  └─ detector.worker.ts
│  ├─ state/
│  │  └─ store.ts (Zustand)
│  ├─ styles/
│  │  └─ tailwind.css
│  └─ pages/
│     ├─ Languages.tsx
│     ├─ Fonts.tsx
│     ├─ Preview.tsx
│     └─ Report.tsx
├─ index.html
├─ tailwind.config.ts
├─ tsconfig.json
├─ vite.config.ts (incl. Vite PWA plugin)
└─ package.json
```

---

## 9. Acceptance Criteria (Happy Path)

1. **Upload:** User drops `MyBrand-Regular.woff2` and `MyBrand-Bold.woff2`. They appear in Fonts with detected names and styles.
2. **Languages:** User selects preset “EU Core” then adds **Turkish**, **Greek**, **Arabic**.
3. **Preview:** For each font, the sentences and coverage grids render. Missing glyphs show with red boxes and tooltips (`U+0111 LATIN SMALL LETTER D WITH STROKE`).
4. **Report:** Report screen lists per font/language missing codepoints. User exports a **Markdown** file and a **JSON**.
5. **Offline:** After installation as PWA, the whole flow works with Wi‑Fi off.
6. **Data durability:** On reload, uploaded fonts and selections persist.
7. **Delete:** “Delete all data” clears everything.

---

## 10. Edge Cases

* Fonts with partial RTL support: ensure **dir="rtl"** previews for Arabic/Hebrew and clean bidi handling.
* Large coverage sets (CJK): throttle analysis, show progress.
* Multiple fonts active: let user compare A/B (split view or switcher).
* Fonts sharing same PostScript name: disambiguate with hash suffix.

---

## 11. Future Enhancements (Out of v1 Scope)

* OpenType features toggles (liga, kern, ss01…).
* Variable font axes sliders.
* Diff view between two fonts’ coverage.
* Import/export user presets.
* CLI that generates reports from the same JSON language sets.

---

## 12. Open Questions

* Should we include **per-script** quick toggles (Latin-Ext-A/B, Cyrillic, Greek, Arabic, Devanagari…) in addition to languages?
* Do you want a **side-by-side compare** mode in v1 or v1.1?
* PDF export layout preference (single consolidated vs per font per language pages)?


