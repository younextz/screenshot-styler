# Screenshot Studio agent guide

Use [Screenshot Studio](https://nitk.me/ss/) to style an existing PNG/JPEG screenshot with
the light or dark Air background. Rendering happens locally. The studio hosts public
instructions and background assets; it does not receive your screenshot or generated image.
A direct image URL is downloaded by the helper on your machine. Webpage capture and
an HTTP rendering API are not supported.

## One-time setup

Requires Node.js 22.12+, npm, and a supported Playwright Chromium platform. Read the
[release manifest](https://nitk.me/ss/agents/manifest.json), download its `helper.url`,
and compare the archive's SHA-256 checksum with `helper.sha256` before extracting it
to a persistent directory. These checksums detect corruption; they are delivered by
the same publisher as the archive, not an independent signature.

The archive contains a `screenshot-styler-helper` directory. In that directory run:

```sh
npm ci
npx --no-install playwright install chromium
```

On Linux, Chromium may also require OS libraries; follow the Playwright installer
diagnostics. These are explicit setup operations subject to your environment's usual
permissions. Rendering does not install dependencies or automatically update the helper.
Reuse the installed directory for later images. The lockfile pins the helper dependencies.

## Render

Run from the extracted helper directory, using absolute input/output paths if necessary:

```sh
node render.mjs --input /absolute/path/screenshot.png --background light --output /absolute/path/styled.png
node render.mjs --url https://example.com/screenshot.jpg --background dark --output /absolute/path/styled.svg
node render.mjs --input /absolute/path/screenshot.png --size 4k --output /absolute/path/styled-4k.png
```

Exactly one of `--input` and `--url` is required. `--output` is required; `.png` or `.svg`
selects the format. `--background` defaults to `light` and also accepts `dark`.
`--size` defaults to `native`; `4k` is PNG-only and resizes the long side to 3840 px,
possibly upscaling. Native export preserves screenshot scale, with integer padding,
rounded corners, and a shadow matching the editor.

Existing outputs are protected. Use `--force` only to intentionally replace a regular
file. The destination directory must exist. `--offline` requires a local input and
an already-cached background. `--help` prints the contract and numeric limits as JSON.

Stdout contains one JSON object. Success has `ok: true`, `output`, `format`, `width`,
`height`, `bytes`, `rendererVersion`, and `release`. Read the file at `output` and
return the artifact to the user. Failure has `ok: false`, `code`, and `message`, and
exits nonzero. Progress, if any, goes to stderr. Source URLs and image data are not logged.

## Limits and caching

- PNG/JPEG input only, at most 10 MiB and 8192 px per side / 16 million pixels.
- Composed output at most 24 million pixels; encoded output at most 32 MiB.
- Remote inputs must be public HTTPS on port 443, without URL credentials.
  Private/reserved addresses are rejected, including DNS results and redirect targets.
- At most 3 redirects and a 15-second download deadline per attempt; streamed bytes
  are bounded even without Content-Length. HTTP content encoding must be identity.
- Chromium startup has a 30-second deadline; rendering has a separate 30-second deadline.
- One image per invocation. Run invocations sequentially to control local memory usage.
- Only the selected public background is downloaded. It is verified against the installed
  release metadata and cached under `~/.cache/screenshot-styler`, with a 100 MiB eviction
  target. Set `SCREENSHOT_STYLER_CACHE_DIR` to choose a different dedicated cache directory.
- Cached backgrounds are verified before each use. Source screenshots and outputs are
  never cached. Warm local-file renders make no network requests and work offline.
- Background downloads retry transient failures at most twice, with backoff. Image URL
  downloads are not automatically retried. Do not add an unbounded outer retry loop.

## Errors

| Code | Action |
| --- | --- |
| `INVALID_ARGUMENT` | Correct arguments or provide a local file instead of a private URL |
| `UNSUPPORTED_IMAGE` | Supply a valid PNG/JPEG rather than HTML, SVG, or truncated image data |
| `INPUT_TOO_LARGE`, `PIXEL_LIMIT_EXCEEDED`, `OUTPUT_TOO_LARGE` | Use a smaller source image; quality is never silently reduced |
| `FETCH_FAILED`, `FETCH_TIMEOUT` | Check the source host; at most one manual retry for a transient source download failure |
| `ASSET_UNAVAILABLE` | Run online once to cache the selected background |
| `ASSET_INTEGRITY_FAILED` | Remove the corrupt cached asset or reinstall a complete verified helper archive |
| `RUNTIME_MISSING` | Complete the explicit dependency/Chromium setup |
| `RENDER_FAILED` | Check image validity, Chromium installation, and destination permissions; do not retry indefinitely |
| `OUTPUT_EXISTS` | Choose another output or intentionally use `--force` |

## Browser-only fallback

An agent with browser automation may open the studio, upload the local screenshot,
choose Light/Dark, and download PNG or SVG. Wait for backgrounds and export controls
to become ready. Retrieve the downloaded artifact rather than taking a screenshot of
the editor. HTTP-only agents cannot render; report the missing local/browser capability.

## Optional skill

The [downloadable SKILL.md](https://nitk.me/ss/agents/screenshot-styler/SKILL.md) contains
reusable instructions and is also included in each release archive. For skill-compatible
agents, place it in a `screenshot-styler` skill directory using that agent's documented
skill installation mechanism. No skill is needed to use this guide or the helper.

## Versions

The manifest advertises a complete immutable release. Updating is an explicit new
archive installation; keep an existing working installation until the new one is ready.
Cached assets let older installed helpers continue working offline. Old online asset
availability is not guaranteed indefinitely: preserve needed backgrounds locally.
