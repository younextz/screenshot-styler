# Screenshot Styler

Screenshot Styler is a browser-based tool that frames screenshots on the Air background.
Drop in an image, pick the dark or light background, and export a ready-to-share asset.

## Highlights

- Local-first processing: images stay in your browser.
- Flexible input: upload PNG/JPG or paste from clipboard (Ctrl/⌘+V).
- Two Air backgrounds: dark and light; the default follows the UI theme until you pick one.
- Export formats: copy PNG to clipboard, download PNG, download 4K PNG, or export SVG.
- Persisted choice: your background selection is saved locally.

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Run locally

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run test -- --run` - run Vitest suite once

## How It Works

1. Import a screenshot (upload or paste).
2. It is composed onto the Air background: the screenshot spans 80% of the
   output width with rounded corners and a soft shadow, padded evenly on all sides.
3. Switch between the dark and light background variants.
4. Export PNG/SVG from the live SVG preview. Backgrounds are embedded as data
   URLs so exported files are self-contained.

## Testing Notes

- Run lint + typecheck + tests before committing:

```bash
npm run lint
npm run typecheck
TMPDIR=/tmp npm run test -- --run
```

## License

MIT - see [LICENSE](./LICENSE).
