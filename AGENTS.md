
# AGENTS.md (for AI Code Generation)

## Project

**Name:** Font Testing Tool (PWA)
**Goal:** Upload fonts, select languages, preview sentences & coverage, detect missing glyphs accurately, export reports.
**Constraints:** No backend, offline-first, TypeScript, React+Vite, Tailwind + shadcn/ui.

## Deliverables

* A working PWA SPA with routes: `/languages`, `/fonts`, `/preview`, `/report`.
* IndexedDB storage of fonts and user selections.
* Reliable missing-glyph detection via canvas + worker.
* Exports: JSON, CSV, Markdown, PDF.

## Tech/Libs

* **Build:** Vite + TypeScript
* **UI:** Tailwind + shadcn/ui
* **State:** Zustand
* **PWA:** `vite-plugin-pwa`
* **DB:** `idb-keyval`
* **PDF:** `jspdf`
* **ZIP (optional):** `jszip`

### shadcn/ui Setup

**IMPORTANT:** shadcn/ui is NOT a package dependency. It's a CLI that copies component source code into your project.

1. **Initial setup (already done):**
   ```bash
   npx shadcn@latest init
   ```
   This creates `components.json` and configures paths. You'll NEVER see `"shadcn"` in package.json.

2. **Add components (do this when you need a new UI element):**
   ```bash
   # Single component
   npx shadcn@latest add dialog
   
   # Multiple components at once
   npx shadcn@latest add button card badge input label
   ```
   This copies component files to `src/components/ui/` and installs required `@radix-ui/*` packages.

3. **Workflow for adding new components:**
   - Need a Dialog? → `npx shadcn@latest add dialog` → Import from `./ui/dialog`
   - Need a Select? → `npx shadcn@latest add select` → Import from `./ui/select`
   - Need a Tooltip? → `npx shadcn@latest add tooltip` → Import from `./ui/tooltip`
   - Browse available components: https://ui.shadcn.com/docs/components

4. **What gets installed:**
   - Individual `@radix-ui/react-*` packages (e.g., `@radix-ui/react-slot`, `@radix-ui/react-dropdown-menu`)
   - `tailwindcss-animate` plugin
   - Component source files you own and can modify

5. **You own the code:** Components in `src/components/ui/` are YOUR code. Modify them as needed.

6. **Currently installed components:**
   - Button, Card, Badge, Input, Label, Dropdown Menu

## File Tree (generate exactly)

```
src/
  main.tsx
  app.tsx
  pages/{Languages.tsx,Fonts.tsx,Preview.tsx,Report.tsx}
  components/{FontUploader.tsx,LanguagePicker.tsx,PreviewPane.tsx,CoverageGrid.tsx,ReportTable.tsx,ExportMenu.tsx}
  state/store.ts
  lib/{fonts.ts,detect.ts,storage.ts,export.ts,rtl.ts}
  workers/detector.worker.ts
  data/presets.json
  data/languages/*.json
styles/tailwind.css
public/manifest.webmanifest
index.html
tailwind.config.ts
vite.config.ts
```

## Coding Standards

- **Prefix each component's outermost element with a `component-*` class** (for example `component-language-picker`) so the UI structure is easy to inspect in devtools.
- **ALWAYS use shadcn/ui components when available** instead of native HTML elements:
  - ❌ DON'T: `<button>`, `<input>`, `<label>`, `<select>`, etc.
  - ✅ DO: Import from `./ui/*` → Button, Input, Label, Select, etc.
  - If a component doesn't exist yet: `npx shadcn@latest add <component-name>` (see shadcn/ui Setup section above)
- TypeScript strict mode.
- Keep components small and pure; heavy work in `lib/` and `workers/`.
- No network calls (except optional share/export).
- Accessible UI; respect `dir` per language.

## Key Tasks

1. **Bootstrap** Vite React TS, Tailwind, shadcn/ui, PWA plugin.
2. **Font handling** (`lib/fonts.ts`):

   * Load ArrayBuffer → `FontFace` → `document.fonts.add`.
   * Parse name/style if available (use font metadata if feasible client-side; otherwise name via file and user override).
   * Persist binary + metadata in IndexedDB.
3. **Language data** (`data/languages`): seed ~50 JSONs; presets in `data/presets.json`.
4. **Detection** (`lib/detect.ts`):

   * Direct font file inspection using `opentype.js` - parses font file and queries CMAP table.
   * Given (fontName, character), use `font.charToGlyph(character)` and check if glyph index is not 0 (notdef) and has path data.
   * Return `hasGlyph: boolean` with confidence 1.0. Cache in IndexedDB.
   * Batch-process coverage strings.
   * Supports: TTF, OTF, WOFF formats. WOFF2 files are not currently supported and must be converted to TTF/OTF/WOFF first.
5. **Preview** (`PreviewPane`, `CoverageGrid`):

   * Render sample sentence + coverage.
   * Wrap missing glyphs with `<span class="missing">` (red border, tooltip with `U+XXXX`).
   * Size/weight controls; direction toggles based on language (`rtl.ts`).
6. **Reports** (`ReportTable`, `lib/export.ts`):

   * Aggregate per font/language missing codepoints; export to JSON/CSV/MD/PDF.
   * Optional ZIP of all formats.
7. **Routing & State** (`app.tsx`, `state/store.ts`):

   * Keep selected fonts, languages, UI options.
   * Persist to IndexedDB; hydrate on load.
8. **PWA**: manifest, install prompt, offline caching, version bump strategy.

## Acceptance Tests (Automatable)

* Upload 2 fonts, select 6 languages, preview loads < 5s.
* Inject a font known to lack `đ/Đ`; detection flags them.
* Arabic preview shows RTL correctly; missing glyphs visible.
* Export JSON/MD; files contain the correct codepoints and names.
* Reload restores state; uninstall clears data.

## UX Copy Hints

* Empty state: “Drop fonts here to start testing.”
* Tooltip for missing glyph: “Missing in *{fontName}* — {char} (U+{code})”.
* Report CTA: “Export Coverage Report”.

## Nice-to-Have (If time)

* Side-by-side comparison view.
* Variable font axis sliders when `@font-face` exposes them.
* Import/export custom language sets.

## Risks & Mitigations

* **False positives** in detection → use **dual-compare** (test vs system fallback vs empty font) and bitmap hashing, not width-only.
* **CJK volume** → limit to UI-core sets; chunk work via worker with progress bar.
* **Browser differences** → test in Chromium, Firefox, Safari; feature-detect APIs.


## Execution Policy (One-Step Mode)

- Operate in **One-Step Mode**:
  - Read `TASKS.md` from top to bottom.
  - Execute **exactly one** unchecked task at a time.
  - After each task: 
    - Show: the exact commands you plan to run.
    - WAIT for my confirmation: `continue` or feedback.
    - After running, show: diff summary, files changed, dev server output, and where to check in the browser.
- Never chain multiple tasks. If a task has sub-steps, ask to proceed per sub-step.
- Use this message template before action:
  - **PLAN:** short summary of next task
  - **COMMANDS:** exact commands
  - **IMPACT:** what will change
  - **CHECK:** where/how I verify in the browser
  - **READY:** *Type `continue` to run, or edit instructions*
- Use this message template after action:
  - **RESULT:** success/errors
  - **CHANGES:** list of files added/modified
  - **NEXT:** suggest the next single task from `TASKS.md`
- Never run shell commands without explicit “continue”.
- If a command would overwrite or delete files, ask for confirmation again even after “continue”.
---


### Missing Glyph Detection Strategy (Client-Side, No Backend)

Since there is no standard browser API to query "does this font have glyph X?", 
we must use heuristic comparison based on rendering metrics. Here are the proven 
approaches, ranked by reliability:

#### **Approach 1: Dual Canvas Rendering + Bitmap Comparison (RECOMMENDED for accuracy)**

This is the most robust method, combining multiple signals:

1. **Render the character with test font to Canvas:**
   - Set `ctx.font` to the uploaded font (already loaded via FontFace API)
   - `fillText()` the character to a hidden canvas
   - Capture pixel data with `getImageData()`
   - Compute a **bitmap hash** (e.g., sum of grayscale pixels or perceptual hash)

2. **Render the same character with a fallback (system sans):**
   - Set `ctx.font` to a known fallback (e.g., 'sans-serif')
   - Repeat capture and hash

3. **Render with an intentionally empty font (optional, for extra confidence):**
   - If the test font rendering **exactly matches** the fallback rendering, 
     the browser likely fell back to the fallback font → **missing glyph**.
   - If it **differs** significantly, the test font likely has the glyph → **present**.

**Why this works:**
- Character width alone is unreliable (many fonts use metrics-only fallback).
- Bitmap/pixel comparison catches the actual rendering difference.
- Comparing to both a known font and empty font reduces false positives.

**Implementation Notes:**
- Use Web Worker (`detector.worker.ts`) to avoid blocking the main thread.
- Cache results in a Map (in-memory) and IndexedDB by `(fontName, codepoint)`.
- For performance: batch-process in chunks (e.g., 50 codepoints per tick) with 
  `requestIdleCallback()` to keep UI responsive.
- Use median bitmap hash or Perceptual Imagining Hash (piHash-like) rather than 
  pixel-by-pixel XOR to tolerate minor rendering variations across browsers.

#### **Approach 2: Canvas Width Comparison (FASTER, Less Accurate)**

A lighter alternative if performance is critical:

1. Render character to canvas using **test font**.
2. Measure width with `ctx.measureText(char).width`.
3. Render the same character using a **monospace fallback** (e.g., 'monospace').
4. If widths differ significantly (>5 px tolerance), the test font has the glyph.
5. If widths are identical, assume fallback → **likely missing**.

**Caveats:**
- Some fallback fonts may be proportional, skewing comparison.
- Monospace and proportional fonts can have similar metrics for common characters.
- **Not recommended alone**, but can be a fast pre-check before bitmap comparison.

#### **Approach: Font Table Inspection (IMPLEMENTED - Most Accurate)**

Parse the uploaded font binary (TTF/OTF/WOFF) to inspect the **CMAP** (character-to-glyph mapping) table:

- Uses `opentype.js` library to parse the font file directly.
- Query the CMAP table: `font.charToGlyph(character)` returns the glyph.
- Check if glyph index is not 0 (notdef) and has path data to determine if character exists.
- If glyph exists in CMAP with valid path, the font has the character.

**Advantages:**
- ✅ 100% accurate; directly reflects the font's data structure.
- ✅ No rendering overhead or false positives from similar-looking glyphs.
- ✅ Works with TTF, OTF, WOFF formats. WOFF2 files are fully supported for detection and preview via fontkit. The prior limitation was specific to opentype.js parsing; now, WOFF2 works natively in-browser with Vite.
- ✅ Consistent results across all browsers and platforms.
- ✅ Better bundler compatibility (works well with Vite/ESM).

**Disadvantages:**
- Requires font parsing library (~300–400 KB bundle impact).
- WOFF2 files are not supported due to WebAssembly initialization issues in Vite/browser environments.

**Current Implementation:**
- Direct font file inspection using `opentype.parse(fontBuffer)`.
- WOFF2 files are detected by signature ("wOF2") and rejected with a clear error message instructing users to convert them to TTF/OTF/WOFF.
- `font.charToGlyph(character)` for each character in coverage set.
- Check `glyph.index !== 0 && glyph.path` to determine existence.
- Results cached in IndexedDB to avoid re-parsing.
- Confidence is always 1.0 (100%) since we're reading the font file directly.

---

#### **Canvas Setup for Reliable Detection**
```typescript
// Create a hidden canvas for detection
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 100; // Sufficient for most characters
const ctx = canvas.getContext('2d')!;

// Test rendering with the uploaded font
ctx.font = `${size}px "${fontName}"`;  // fontName must already be loaded via FontFace
ctx.fillText(char, 10, 50);
const testImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const testHash = computeHash(testImageData.data);  // Implement hash function

// Fallback rendering (system sans)
ctx.font = `${size}px sans-serif`;
ctx.clearRect(0, 0, canvas.width, canvas.height);  // Important: clear between renders
ctx.fillText(char, 10, 50);
const fallbackImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const fallbackHash = computeHash(fallbackImageData.data);

// Decision
const hasGlyph = testHash !== fallbackHash;  // If they differ, font has glyph


Key gotchas:

- Always clear the canvas (ctx.clearRect()) between renders to avoid ghost pixels.
- Use consistent size, position, and styling (font size, weight, style) across comparisons.
- Account for browser differences: Safari, Firefox, and Chrome may render slightly
- differently. Use a tolerance threshold (e.g., Hamming distance < 10% on bitmap hashes).
- Emoji and complex scripts: These may render with fallback effects (outline, shadow).
- Use larger canvas and more lenient hash matching.

**End of v1 spec.**
