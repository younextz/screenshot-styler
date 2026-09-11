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

## Deploy to Cloudflare Workers

The app deploys as static assets with SPA fallback configured in `wrangler.jsonc`.
No server-side entry point or runtime secrets are required.

Push the configuration to GitHub before deploying. In Cloudflare Workers & Pages,
import the repository and use these settings:

| Setting | Value |
| --- | --- |
| Project name | `screenshot-styler` |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `true` |
| Build variable `NODE_VERSION` | `24` |

The explicit npm install uses `package-lock.json`. Disable automatic dependency
installation so Cloudflare does not select Bun from the legacy `bun.lockb` file.
Leave Cloudflare Access protection off for a public app. Builds for non-production
branches are optional; leave them enabled if you want preview deployments.

After deployment, test the provided Workers URL using `test.png`, including picture
backgrounds, PNG/SVG exports, and clipboard copying. To attach an unused subdomain,
open the Worker's **Settings > Domains & Routes > Add > Custom Domain**. Cloudflare
creates its DNS record and HTTPS certificate. This configuration serves the app at
the root of that hostname; hosting below a path requires additional configuration.

See Cloudflare's [Workers Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/)
and [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

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
.
