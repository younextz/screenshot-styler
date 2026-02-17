# Screenshot Styler

Screenshot Styler is a browser-based tool for turning plain screenshots into polished visuals.
Drop in an image (or fetch a tweet), apply a preset + palette, tweak framing controls, and export ready-to-share assets.

## Highlights

- Local-first processing: images stay in your browser.
- Flexible input: upload PNG/JPG, paste from clipboard, or fetch tweet content via oEmbed.
- Broad styling set: gradients, mesh, solids, patterns, picture backgrounds, browser/device frames, and card layouts.
- Theme-aware UI: dark/light mode with persistent preference.
- Export formats: copy PNG to clipboard, download PNG, download 4K PNG, or export SVG.
- Persisted controls: preset, palette, title bar mode, aspect ratio, and animation toggle are saved locally.

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

1. Import an image (upload/paste) or fetch tweet content.
2. Pick a style preset and color palette.
3. Adjust title bar, aspect ratio, and animation options.
4. Export PNG/SVG from the live SVG preview.

## Presets and Palettes

- 25 presets across background, frame, and card categories.
- 20+ curated palettes for dark, light, vibrant, and minimal looks.

## Testing Notes

- Run lint + typecheck + tests before committing:

```bash
npm run lint
npm run typecheck
TMPDIR=/tmp npm run test -- --run
```

## License

MIT - see [LICENSE](./LICENSE).
