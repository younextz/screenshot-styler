# Screenshot Styler

Screenshot Styler is a browser-based tool that frames screenshots on the Air background.
Drop in an image, pick the dark or light background, and export a ready-to-share asset.

## Highlights

- Local-first processing: images stay in your browser.
- Centered “Add some Air” composer: drag and drop, upload PNG/JPG, or paste from clipboard (Ctrl/⌘+V). Files can be up to 10 MB.
- Full-page Air Light artwork with a subtle tint, a responsive layout, and Air display typography.
- Two export backgrounds: dark and light; defaults to Air Light. The website always stays light.
- Export formats: copy PNG to clipboard, download PNG, download 4K PNG, or export SVG.
- Full-size preview: expand the styled picture with a smooth transition, fitted to your viewport without cropping. Close with Escape, the close button, or the backdrop; reduced-motion preferences are respected.
- Persisted choice: your background selection is saved locally.

## Quick Start

### Prerequisites

- Node.js 22.12+ (Node.js 24 recommended for Cloudflare builds)
- npm

### Run locally

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - typecheck and build the production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run test -- --run` - run Vitest suite once
- `npm run test:run` - run Vitest suite once (also excludes local agent worktrees)
- `npm run deploy` - deploy an already-built bundle with the pinned Wrangler version
- `npm run deploy:preview` - upload an already-built preview version

## Deploy to Cloudflare Workers

The app deploys as static assets with SPA fallback configured in `wrangler.jsonc`.
No server-side entry point or runtime secrets are required.

Push the configuration to GitHub before deploying. In Cloudflare Workers & Pages,
import the repository and use these settings:

| Setting | Value |
| --- | --- |
| Project name | `screenshot-styler` |
| Production branch | `main` (automatic builds enabled) |
| Build command | `npm ci && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root |
| Build variable `SKIP_DEPENDENCY_INSTALL` | `true` |
| Build variable `NODE_VERSION` | `24` |

The explicit npm install uses `package-lock.json`. Disable automatic dependency
installation so Cloudflare does not select Bun from the legacy `bun.lockb` file.
Leave Cloudflare Access protection off for a public app. Builds for non-production
branches are optional; leave them enabled if you want preview deployments.

The existing Cloudflare commands can stay unchanged: `npx wrangler` resolves the
exact Wrangler version installed by `npm ci`. `workers_dev` and `preview_urls`
are explicitly enabled. The `allowScripts` entries approve only the reviewed,
pinned SWC, esbuild, and workerd binary-installation scripts. When updating these
dependencies, review their install scripts again and refresh the approvals with
an npm version supporting `npm install-scripts`.

To run lint and tests before every Cloudflare deployment as well as typechecking,
use `npm ci && npm run lint && npm run test:run && npm run build` as the build command.

### Deploy on PR merge

Cloudflare Workers Builds is connected to this GitHub repository. Merge release
PRs into `main`: the resulting push triggers the production build and then
`npx wrangler deploy`, which publishes the built app. Direct pushes to `main`
also trigger this pipeline. No additional GitHub deployment workflow or repository
API token is needed for the connected Cloudflare integration.

Monitor **Workers Builds: screenshot-styler** on the merged commit in GitHub, or
open **Workers & Pages > screenshot-styler > Deployments** in Cloudflare. A failed
build leaves the previous deployment live. To check the trigger settings, use
**Settings > Build > Branch control** and keep `main` as the production branch.

After deployment, test the provided Workers URL using `test.png`, including picture
backgrounds, PNG/SVG exports, and clipboard copying. To attach an unused subdomain,
open the Worker's **Settings > Domains & Routes > Add > Custom Domain**. Cloudflare
creates its DNS record and HTTPS certificate. This configuration serves the app at
the root of that hostname; hosting below a path requires additional configuration.

See Cloudflare's [Workers Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/)
and [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## How It Works

1. Add a screenshot using the central composer (drop, upload, or paste).
2. It is composed onto the Air background: the screenshot spans 80% of the
   output width with rounded corners and a soft shadow, padded evenly on all sides.
3. Switch between the dark and light background variants.
   Select **Full-size view** in the preview to inspect the picture before exporting.
4. Replace the image or select **Start fresh** to begin again.
5. Export PNG/SVG from the live SVG preview. Backgrounds are embedded as data
   URLs so exported files are self-contained.

If background loading fails, select **Retry backgrounds** in the studio. Your
screenshot stays in place; exports become available once loading succeeds.

Only the selected export background is loaded and converted to an embedded PNG;
switching variants loads the other one on demand. The studio's decorative light
background remains visible in either mode. Shared in-flight requests avoid duplicate
conversion work, and exporting waits for the selected background to finish loading.

The 3840×2160 background PNGs are compressed losslessly with OxiPNG, preserving
their pixels and color metadata. `public/.assetsignore` excludes backup files
from Workers deployments. Exports embed PNG data for standalone SVG compatibility.
To optimize a replacement background, use `oxipng -o 4 input.png` and verify its
decoded pixels against the original before publishing.

## Testing Notes

- For manual image checks, upload `test.png` and test both **Dark** and **Light** on desktop and mobile. Resize the window and confirm the full image stays visible.
- **Copy** and **PNG** preserve native screenshot resolution. Air backgrounds use integer padding and sRGB shadow filtering to keep text sharp and source colors intact. **4K** resizes the result; it does not add detail to the original screenshot.
- WebP inputs can be converted to PNG without resizing before upload (on macOS: `sips -s format png input.webp --out input.png`).
- Run lint + typecheck + tests before committing:

```bash
npm run lint
npm run typecheck
TMPDIR=/tmp npm run test -- --run
```

## Design reference

The composer follows the supplied Air UI kit. The Air logo and locally hosted Modul Air display font come from [air.dev](https://air.dev).

## License

MIT - see [LICENSE](./LICENSE).
.
