
# Font Audit -- Manual

This quick manual explains how to use the app and how missing characters are marked in the Preview and Report views.

**Quick links**
- Live app: https://font-audit.vercel.app
- App pages:
   - `https://font-audit.vercel.app/languages` (Languages)
   - `https://font-audit.vercel.app/fonts` (Fonts)
   - `https://font-audit.vercel.app/preview` (Preview)
   - `https://font-audit.vercel.app/report` (Report)
- Repo issues: https://github.com/dejstdm/font-audit/issues
- Screenshot placeholders: `docs/screenshots/` (replace with real captures)

## Quick Steps
- **Upload fonts:** Open `Fonts`, drag-and-drop or pick `.ttf`, `.otf`, `.woff`, or `.woff2` files. Upload every weight/style you want tested.
- **Select languages:** Open `Languages`, choose a preset (e.g., European, RTL) or add individual languages you need to test.
- **Preview:** Open `Preview` to render sample sentences for each language and font. Use the Sample Text or Coverage Grid views.
- **Report:** Open `Report` to see aggregated results and export coverage as JSON, CSV, Markdown, or PDF.
 - **Upload fonts:** Open [Fonts](https://font-audit.vercel.app/fonts), drag-and-drop or pick `.ttf`, `.otf`, `.woff`, or `.woff2` files. Upload every weight/style you want tested.
 - **Select languages:** Open [Languages](https://font-audit.vercel.app/languages), choose a preset (e.g., European, RTL) or add individual languages you need to test.
 - **Preview:** Open [Preview](https://font-audit.vercel.app/preview) to render sample sentences for each language and font. Use the Sample Text or Coverage Grid views.
 - **Report:** Open [Report](https://font-audit.vercel.app/report) to see aggregated results and export coverage as JSON, CSV, Markdown, or PDF.

## What is marked as an error?
- A character is marked as an error when the active font does not contain a glyph for that Unicode code point (the font falls back to the system font).
- In the **Preview** and **Coverage Grid** views, missing characters are flagged visually:
   - They are wrapped with a `missing` indicator (usually a red outline or red highlight).
   - Hovering a missing character shows a tooltip like: `Missing in {fontName} — {char} (U+XXXX)`.
   - The Coverage Grid also summarizes missing counts and allows filtering to “Show Missing Only.”

## How detection works (user-facing summary)
- The app detects missing glyphs by inspecting the uploaded font file and by rendering comparisons. Results are cached per font and language for speed.
- If a glyph is truly not present in the font, it will be listed in the Report exports (with the Unicode `U+` code point).

## Exporting
- Use `Report -> Export Report` to download coverage in the format you need:
   - `JSON` — full machine-readable output (per-font, per-language missing code points).
   - `CSV` — rows for spreadsheets with counts and percentages.
   - `Markdown` — human-friendly report suitable for docs or PR descriptions.
   - `PDF` — printable summary for sign-off.

## Short troubleshooting
- If fonts do not appear after upload, re-check file types and re-upload.
- If detection seems stale after replacing a font file, click **Clear Cache** in the Coverage Grid and re-run detection.
- For very large fonts, detection may take longer — try testing a smaller language set first.

## Where to check in the app
- [Fonts](https://font-audit.vercel.app/fonts) — upload and manage files.
- [Languages](https://font-audit.vercel.app/languages) — pick presets and languages to test.
- [Preview](https://font-audit.vercel.app/preview) — visual rendering and Coverage Grid (where missing glyphs are highlighted).
- [Report](https://font-audit.vercel.app/report) — aggregated results and exports (contains exact `U+XXXX` listings).


