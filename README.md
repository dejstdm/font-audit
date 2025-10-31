# Font Testing Tool

A Progressive Web App (PWA) for testing font coverage across languages. Upload fonts, select languages, preview text rendering, and detect missing glyphs - all offline-first with no backend required.

## Features

- ✅ **Font Upload** - Load TTF, OTF, WOFF, and WOFF2 fonts (full support)
- ✅ **Language Coverage** - Test fonts against 46 languages with presets
- ✅ **Missing Glyph Detection** - 100% accurate, offline detection via fontkit (TTF/OTF/WOFF/WOFF2)
- ✅ **Visual Coverage Grid** - See all characters with missing glyphs highlighted
- ✅ **Export Reports** - Export coverage reports in JSON, CSV, Markdown, and PDF formats
- ✅ **Offline-First** - All data stored in IndexedDB
- ✅ **Dark Mode** - Built-in theme support
- ✅ **PWA** - Installable as a web app, works fully offline

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **UI:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand
- **Storage:** IndexedDB (idb-keyval)
- **PWA:** vite-plugin-pwa
- **Icons:** Lucide React

## Browser Requirements

- **Modern browsers** with ES6+ support
- **Chrome/Edge 90+**, **Firefox 88+**, **Safari 14+** recommended
- Requires **WebAssembly** support (for fontkit library)
- **IndexedDB** support required for offline functionality

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deployment

The project builds to a static site that can be deployed to any static hosting service.

**Build output:** `dist/` folder

**Deploy options:**

1. **Netlify** - Drag and drop `dist/` folder or connect your Git repository
2. **Vercel** - Run `vercel --prod` or connect your Git repository
3. **GitHub Pages** - Push `dist/` contents to `gh-pages` branch
4. **Any static host** - Upload `dist/` contents to your hosting service

**Important:** The app uses React Router `BrowserRouter`, which requires server-side configuration to redirect all routes to `index.html`. Most hosting services handle this automatically. For custom servers, ensure all routes serve `index.html` for SPA routing to work.

## About shadcn/ui

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. Unlike traditional component libraries, shadcn/ui components are **copied directly into your project** rather than installed as npm dependencies.

### How It Works

1. **No shadcn package in package.json** - This is by design! shadcn is just a CLI tool that delivers components.
2. **Components live in `src/components/ui/`** - You own the code and can modify it freely.
3. **Dependencies are `@radix-ui/*` packages** - Individual primitives that shadcn components use.

### Adding New Components

```bash
# Add a specific component
npx shadcn@latest add dialog

# Add multiple components
npx shadcn@latest add dialog alert sheet
```

This copies the component source code into `src/components/ui/` and installs required `@radix-ui/*` dependencies.

### Configuration

- `components.json` - shadcn configuration (paths, aliases, style)
- `src/styles/tailwind.css` - CSS variables and design tokens
- `tailwind.config.ts` - Tailwind configuration

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (owned by you)
│   ├── FontUploader.tsx
│   ├── LanguagePicker.tsx
│   ├── mode-toggle.tsx
│   └── theme-provider.tsx
├── data/
│   ├── languages/       # Language definitions (JSON)
│   └── presets.json     # Language preset groups
├── lib/
│   ├── fonts.ts         # Font loading & preview (FontFace); exposes ArrayBuffer
│   ├── detect.ts        # Glyph detection using fontkit (supports WOFF2)
│   ├── export.ts        # Export functionality (JSON, CSV, Markdown, PDF)
│   ├── storage.ts       # IndexedDB persistence
│   └── utils.ts         # Utilities (cn helper)
├── workers/
│   └── detector.worker.js  # Web Worker for font parsing and glyph detection
├── pages/
│   ├── Fonts.tsx
│   ├── Languages.tsx
│   ├── Preview.tsx      # Preview & coverage grid with glyph detection
│   └── Report.tsx       # Coverage reports with export functionality
├── state/
│   └── store.ts         # Zustand state management
└── styles/
    └── tailwind.css     # Global styles + CSS variables
```

## Language Support

Currently includes 46 languages with support for European, Middle Eastern, and Asian scripts:

### European Languages (Latin Script)
- Albanian (sq)
- Basque (eu)
- Bosnian (bs)
- Catalan (ca)
- Croatian (hr)
- Czech (cs)
- Danish (da)
- Dutch (nl)
- English (en)
- Estonian (et)
- Finnish (fi)
- Flemish (vls)
- French (fr)
- German (de)
- Hungarian (hu)
- Icelandic (is)
- Irish (ga)
- Italian (it)
- Latvian (lv)
- Lithuanian (lt)
- Luxembourgish (lb)
- Maltese (mt)
- Moldovan (mo)
- Norwegian (no)
- Polish (pl)
- Portuguese (pt)
- Romanian (ro)
- Serbian Latin (sr-Latn)
- Slovak (sk)
- Slovene (sl)
- Spanish (es)
- Swedish (sv)
- Turkish (tr)
- Welsh (cy)

### European Languages (Cyrillic Script)
- Belarusian (be)
- Bulgarian (bg)
- Macedonian (mk)
- Russian (ru)
- Serbian Cyrillic (sr-Cyrl)
- Ukrainian (uk)

### European Languages (Other Scripts)
- Greek (el)
- Scottish Gaelic (gd)

### Middle Eastern & Asian Languages
- Arabic (ar) - RTL
- Hebrew (he) - RTL
- Japanese (ja)
- Chinese Simplified (zh-Hans)

## Export Formats

The app supports exporting coverage reports in multiple formats:

- **JSON** - Structured data format for programmatic processing
- **CSV** - Spreadsheet-friendly format with one row per font/language combination
- **Markdown** - Human-readable format with formatted tables and sections
- **PDF** - Printable report with formatted pages and complete coverage details

All exports include:
- Metadata (timestamp, app version, font and language counts)
- Complete font information
- Per-font, per-language coverage statistics
- Detailed missing glyph lists with Unicode codepoints

## Usage

1. **Upload Fonts**: Go to the Fonts page and drag & drop or select font files (TTF, OTF, WOFF, WOFF2)
2. **Select Languages**: Navigate to Languages page and choose languages or presets to test
3. **Preview Coverage**: Check the Preview page to see sample text and coverage grid with missing glyphs highlighted
4. **Export Reports**: Visit the Report page to generate and export coverage reports in your preferred format

## Development Roadmap

See [TASKS.md](./TASKS.md) for the development checklist. Core features are complete.

## Contributing

1. Follow coding standards in [AGENTS.md](./AGENTS.md)
2. Use shadcn/ui components (never raw HTML elements)
3. Prefix component root elements with `component-*` classes
4. Keep TypeScript strict mode enabled

## License

MIT - See [LICENSE](./LICENSE) file for details.
