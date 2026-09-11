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
- Agent support: discoverable Markdown instructions, a downloadable local renderer,
  and an optional skill. Select **Use with an agent** for a copyable prompt.

## Quick Start

### Prerequisites

- Node.js 22.12+ (Node.js 24 recommended for Cloudflare builds)
- npm

### Run locally

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173/ss/](http://localhost:5173/ss/).

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - typecheck and package the production bundle beneath `/ss/`
- `npm run build:preview` - build locally with the same root-to-`/ss/` redirect as Cloudflare feature-branch previews
- `npm run preview` - preview the Workers build at [http://localhost:8787/ss/](http://localhost:8787/ss/)
- `npm run lint` - run ESLint
- `npm run typecheck` - check app and build configuration types, including unused locals and parameters
- `npm run test -- --run` - run Vitest suite once
- `npm run test:run` - run Vitest suite once (also excludes local agent worktrees)
- `npm run validate:agent -- http://localhost:8787` - validate a built helper archive
  against a running local Workers preview, including pixel comparisons with the editor
- `npm run deploy` - deploy an already-built bundle with the pinned Wrangler version
- `npm run deploy:preview` - upload an already-built preview version

## Deploy to Cloudflare Workers

The app deploys as static assets at `/ss/`, configured in `wrangler.jsonc`.
No server-side entry point or runtime secrets are required. The production domain
root and unknown paths return 404; this single-screen app does not need an SPA fallback.
Vite generates URLs with the `/ss/` base, and the build packaging script places
all app files in `dist/ss/`. Cloudflare's control files stay at the asset root.

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

The explicit npm install uses the root `package-lock.json`. The separate
`agent/package-lock.json` pins dependencies for the downloadable helper and is copied
into its archive; the Cloudflare build does not install that second package.
Disable automatic dependency installation to avoid installing twice.
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

After deployment, open `/ss/` on the provided Workers URL and test with `test.png`,
including picture backgrounds, PNG/SVG exports, and clipboard copying.

### Domain and path routing

The studio's public address is [https://nitk.me/ss/](https://nitk.me/ss/).
`public/_redirects` redirects `/ss` to `/ss/` while the request reaches this Worker.
The standalone Workers and preview addresses also serve the app under `/ss/`.
Cloudflare's PR comment links to the preview domain root. For non-`main` Workers
Builds, packaging adds a static 302 redirect from `/` to `/ss/`, so both commit and
branch preview links open the studio. It uses Cloudflare's injected `WORKERS_CI`
and `WORKERS_CI_BRANCH` variables; production builds from `main` keep the root 404.
If the production branch changes, update this condition in the packaging script.
Local builds use production behavior unless built with `npm run build:preview`.
For previews created before this redirect was added, append `/ss/` to their URL.

To test the preview redirect locally, run `npm run build:preview`, then
`npm run preview`, and open [http://localhost:8787/](http://localhost:8787/).
No Worker runtime code or dashboard configuration changes are needed.

See Cloudflare's [build variables](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#environment-variables)
and [static redirects](https://developers.cloudflare.com/workers/static-assets/redirects/).

While the other app is not deployed, keep `nitk.me` as this Worker's Custom Domain.
Cloudflare manages its DNS and HTTPS certificate. With this build, `/` returns 404,
and `/ss/` serves the studio. Keep the existing `nitk.me/ss/*` route as well.

When the other app is ready:

1. Transfer the `nitk.me` Custom Domain to the other app (or configure its hosting
   provider's DNS destination with Cloudflare proxying enabled).
2. Keep the route `nitk.me/ss/*` assigned to `screenshot-styler`.
3. Add a domain Redirect Rule matching hostname `nitk.me` and URI path exactly `/ss`,
   redirecting to `https://nitk.me/ss/` with status 301 and query preservation enabled.
   The `/ss/*` route does not match `/ss` itself, so that redirect must happen before
   requests reach the other app.

Domain assignments and routes are managed in the Cloudflare dashboard, not by this
repository. Do not remove the current root domain assignment before a replacement
DNS/hosting destination is ready.

See Cloudflare's [Workers Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/)
and [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Use with agents

Give your agent the studio URL and a PNG/JPEG screenshot. The editor's **Use with an
agent** panel provides a prompt, the [agent guide](public/agents/guide.md), and an
[optional skill](public/agents/screenshot-styler/SKILL.md). The initial HTML and HTTP
Link header point to the guide without displaying its instructions in the composer.
These are discovery hints: not every bot follows metadata, so the guide also has an
ordinary link inside the panel. No bot detection or JavaScript execution is needed
to read the published Markdown guide.

The helper requires Node.js 22.12+ and its pinned Playwright Chromium installation.
Download and verify the archive advertised by `/ss/agents/manifest.json`, extract it,
then run the guide's `npm ci` and Chromium setup commands in the helper directory.
Example after setup:

```sh
node render.mjs --input /absolute/path/screenshot.png --background light --output /absolute/path/styled.png
node render.mjs --url https://example.com/screenshot.jpg --background dark --output /absolute/path/styled.svg
```

Results are local files with a single JSON status on stdout. Native PNG, 4K PNG, and
self-contained SVG use the same renderer as the editor. Input limits are 10 MiB,
8192 px per side, and 16 million pixels; output is bounded to 24 million pixels and
32 MiB. Remote inputs are public HTTPS images only, with connection-pinned address
checks, bounded downloads, and redirect/deadline limits. See the guide for errors.

The helper downloads only its selected background and verifies its content hash.
Subsequent local-file renders work without network access; `--offline` also enforces
that the input is local and the background is cached. Only public backgrounds are
cached, under `~/.cache/screenshot-styler` by default. Screenshots and generated files
never pass through Cloudflare. This is a local renderer, not a hosted HTTP image API
or webpage screenshot service. Browser-only agents can use the editor's upload and
download controls; HTTP-only agents cannot render.

### Build and validate agent releases

`npm run build` compiles the shared browser renderer and Node helper, creates a
content-addressed ZIP with its own package lock, and emits the manifest and hashed
backgrounds. The production editor uses those same background URLs. Documentation
revalidates; immutable release and background URLs can be cached for a year. All of
these are Workers Static Assets: no Worker entry point, hosted browser, or API quota
is introduced. Cache reuse reduces transferred bytes rather than imposing a global
bandwidth cap.

New development dependencies are Playwright (local rendering and browser validation),
ipaddr.js (IPv4/IPv6 address classification), and fflate (portable ZIP packaging).
Only Playwright and ipaddr.js are runtime dependencies of the downloadable helper.
None are included in the editor's JavaScript bundle. PNG/JPEG header inspection is
bounded and followed by Chromium decoding; other image types are rejected.

To reproduce full local validation:

```sh
npm run lint
npm run test:run
npm run build
npx --no-install playwright install chromium
npm run preview
# In a second terminal:
npm run validate:agent -- http://localhost:8787
```

If 8787 is already occupied, use `npx --no-install wrangler dev --port 8788
--inspector-port 9230` and pass `http://localhost:8788` to validation. The validation
script downloads the local archive, installs it in a fresh temporary directory,
seeds its cache from verified local preview assets, and disables Node DNS/HTTP for
warmed helper runs. It compares editor/helper pixels using the root `test.png`,
checks desktop/mobile keyboard interaction, and writes screenshots and a report to
`test-results/agent-validation/`. The temporary installation is removed afterward.
Remote URL policy and transport limits have separate mocked network tests.

The generated release identity changes whenever bundled code, package lock, guide,
skill, or background content changes. It is never overwritten under an existing
immutable URL. This first release does not provide an archive-retention service;
before replacing a published release, retain its generated release directory and
referenced hashed backgrounds in the next deployment if continued online access is
required. Installed helpers with cached backgrounds continue to work offline.

The [implementation proposal](docs/agent-friendly-implementation.md) also records the
optional hosted API design. That API remains outside this implementation.

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

The [dead-code audit](docs/dead-code-audit.md) records cleanup decisions and
configuration candidates that need workflow context.

## Design reference

The composer follows the supplied Air UI kit. The Air logo and locally hosted Modul Air display font come from [air.dev](https://air.dev).

## License

MIT - see [LICENSE](./LICENSE).
