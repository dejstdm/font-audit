# Font Audit Tool

A Progressive Web App (PWA) for testing font coverage across languages. Upload fonts, select languages, preview text rendering, and detect missing glyphs - all offline-first with no backend required.

## Features

- 📁 **Font Upload** - Load TTF, OTF, WOFF, WOFF2 fonts
- 🌍 **Language Coverage** - Test fonts against 10+ languages with presets
- 🔍 **Missing Glyph Detection** - Accurate canvas-based detection (coming soon)
- 📊 **Coverage Reports** - Export to JSON, CSV, Markdown, PDF (coming soon)
- 💾 **Offline-First** - All data stored in IndexedDB
- 🎨 **Dark Mode** - Built-in theme support

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **UI:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand
- **Storage:** IndexedDB (idb-keyval)
- **PWA:** vite-plugin-pwa
- **Icons:** Lucide React

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
│   ├── fonts.ts         # Font loading & parsing
│   ├── storage.ts       # IndexedDB persistence
│   └── utils.ts         # Utilities (cn helper)
├── pages/
│   ├── Fonts.tsx
│   ├── Languages.tsx
│   ├── Preview.tsx      # Coming soon
│   └── Report.tsx       # Coming soon
├── state/
│   └── store.ts         # Zustand state management
└── styles/
    └── tailwind.css     # Global styles + CSS variables
```

## Language Support

Currently includes:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Serbian Latin (sr-Latn)
- Serbian Cyrillic (sr-Cyrl)
- Arabic (ar) - RTL
- Hebrew (he) - RTL
- Japanese (ja)
- Chinese Simplified (zh-Hans)

## Development Roadmap

See [TASKS.md](./TASKS.md) for the complete development checklist.

## Contributing

1. Follow coding standards in [AGENTS.md](./AGENTS.md)
2. Use shadcn/ui components (never raw HTML elements)
3. Prefix component root elements with `component-*` classes
4. Keep TypeScript strict mode enabled

## License

MIT
