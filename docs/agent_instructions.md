
# Lovable Agent Build Instructions — “Screenshot Styler” (v1)

A focused web tool that lets a user **paste or upload a screenshot**, **apply a preset style**, pick a **color palette**, optionally **toggle a Windows/macOS title bar**, choose an **aspect ratio**, and **export PNG** (copy to clipboard or download). **No storage, no auth, no analytics.**

---

## 0) Frozen Decisions (Scope Lock)

**Inputs**
- Accept **PNG, JPG** via **file picker** or **paste from clipboard** (no drag-and-drop in v1).
- Max upload **10 MB**.

**Output**
- Show styled result in the editor.
- Export options: **Copy to Clipboard** (image/png) and **Download PNG** only.
- Always export at the **highest resolution available** for the chosen aspect ratio **without upscaling the screenshot**.

**UX controls (minimal)**
- **Preset selector** (12 presets; see §6).
- **Color palette** selector (predefined palettes; includes a JetBrains-inspired option; no free‑form color pickers).
- **OS title bar**: **macOS / Windows / None** (show/hide). No custom text in v1.
- **Aspect ratio**: **Auto (match screenshot)**, **1:1**, **16:9**, **4:3**.

**Rendering approach**
- **Client**: instant preview using **SVG** (rendered in-browser).
- **Server**: final **PNG** render from the same SVG (deterministic) via FastAPI endpoint (synchronous).

**Privacy & storage**
- **No authentication**.
- **Do not retain images** in any store (disk/object storage). Process **in-memory** only and purge buffers after response.
- **No data region** to configure (no persistence).
- **No analytics** in v1.

**Performance & compatibility**
- p95 **server render ≤ 10 s**; initial load ≤ **2 s** on 3G‑Fast.
- **Chromium + Safari** supported (clipboard differences handled).
- **Basic accessibility**: keyboard navigation & visible focus.
- **Rate limit**: 60 requests/min/IP (in‑memory limiter).

**Branding**
- Site UI uses **colors inspired by JetBrains homepage** for the website chrome (not for output images). Preset palettes are not limited to those colors.

**Legal**
- Show **“Don’t upload sensitive data”** disclaimer and **Terms/Privacy** notice.

**Non‑goals (explicitly out)**
- No drag‑and‑drop, background removal, auto-redaction, overlays (text/logo/badges), shareable links, user accounts, galleries, batch mode, or external integrations in v1.

---

## 1) User Stories

1. **Paste flow**: As a PM, I press **⌘/Ctrl + V** (or click *From clipboard*). If the clipboard lacks an image, show error **“Clipboard is empty.”** Otherwise, the screenshot loads in the editor.
2. **File flow**: I select a PNG/JPG (≤10 MB). The editor shows the preview immediately.
3. **Style flow**: I choose a **preset**, a **palette**, **title bar** (macOS/Windows/None), and **aspect ratio**. Preview updates instantly.
4. **Export flow**: I click **Copy** (writes PNG to clipboard) or **Download** (saves PNG). On copy failure (permissions/unsupported), show a toast and surface **Download** as fallback.
5. **Resume flow**: My last UI selections (not the image) **autosave** in localStorage and restore on revisit.

---

## 2) End‑to‑End Flow (Paste → Style → Export)

```text
[User Clipboard/File] 
   ↓
[Frontend Editor] ──(SVG props JSON)──▶ Live <svg> Preview
   │
   └── Export ▶ POST /api/render (JSON + image) ─▶ [FastAPI SVG→PNG rasterize] ─▶ PNG stream
                                        │
                                        └── response headers: Cache-Control: no-store; Content-Type: image/png
```

---

## 3) Architecture & Stack

**Frontend**: **Next.js** (TypeScript) + **Tailwind CSS**; minimal dependencies; Playwright for E2E.  
**Backend**: **FastAPI** (Python 3.11), synchronous; Pillow + resvg/cairosvg for SVG→PNG rasterization.  
**Render model**: **Single source of truth = SVG** constructed from preset + palette + user screenshot. Identical SVG string used for client preview and server render.

**Why SVG**: deterministic, crisp, scalable; easy gradients, shadows, masks, and device/browser frames.

**Process**: Frontend builds an SVG string (or JSON → SVG function) and sends it with the image to the server for final PNG output. The server embeds the image as `<image href="data:image/png;base64,...">` inside the SVG and rasterizes it.

---

## 4) Rendering Rules (No Cropping + Highest Resolution)

Let screenshot dimensions be **ws × hs**. Let chosen aspect ratio be **r = aw/ah**.

- **Contain + generous padding** (no cropping): the screenshot is centered at **1:1 scale** (no upscaling). **Generous whitespace padding** (40% extra space) surrounds the screenshot for beautiful, polished output.
- **Output dimensions** must provide **substantial padding** around the screenshot to create visually appealing results similar to modern design tools:

```
paddingFactor = 1.4  // 40% extra space for beautiful styling
minHeight = max(hs, ceil(ws / r))
minWidth = ceil(minHeight * r)
height = ceil(minHeight * paddingFactor)
width = ceil(minWidth * paddingFactor)
```

This creates generous whitespace around the screenshot, making the background styling (gradients, blobs, etc.) highly visible and visually appealing.  
If ratio is **Auto**, set `width = ws`, `height = hs`.

**Alpha**: preserve source transparency for PNG input.  
**Color**: sRGB; do not color‑manage or transform the screenshot pixels.

---

## 5) API (FastAPI)

### 5.1 OpenAPI Summary

`GET /api/health` → 200 OK `{ "status": "ok" }`  
`POST /api/render` → 200 OK `image/png` stream  
`GET /api/presets` → 200 OK JSON list of presets (ids, labels, default palette)  
`GET /api/palettes` → 200 OK JSON list of palettes (ids, swatches)  
All endpoints send `Cache-Control: no-store`.

### 5.2 `/api/render`

- **Request**: `multipart/form-data`
  - `image`: file (**png** or **jpeg**, ≤10 MB)
  - `payload`: JSON string with:
    ```json
    {
      "presetId": "browser-macos",
      "paletteId": "jetbrains-dark",
      "titleBar": "macos" | "windows" | "none",
      "aspectRatio": "auto" | "1:1" | "16:9" | "4:3"
    }
    ```
- **Response**: `image/png` body; headers: `Cache-Control: no-store`.
- **Errors** (4xx):
  - 400: invalid mime/size; unknown preset/palette/aspect ratio.
  - 413: payload too large.
  - 415: unsupported media type.
- **Limits**: rate‑limit **60 req/min/IP** (in‑memory).

### 5.3 Security Headers
- `Cache-Control: no-store`
- `Content-Security-Policy`: `default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self';`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Content-Type-Options: nosniff`

---

## 6) Presets (12) — ID, Description, Defaults

_All presets share “no cropping; contain+pad; centered”. Title bar is only shown when preset supports a frame._

1. **`gradient-soft`** — subtle 2‑stop diagonal gradient background; rounded card (24px), soft shadow.
2. **`gradient-bold`** — 3‑stop angular gradient; larger radius (28px), stronger shadow.
3. **`mesh-gradient`** — multi‑stop mesh gradient; radius 24px, no border.
4. **`blob-duo`** — two blurred blobs (bg blend mode `screen`), radius 20px.
5. **`blob-trio`** — three blurred blobs, radius 20px.
6. **`dot-grid`** — subtle dot grid pattern (SVG pattern), radius 16px, faint inner shadow.
7. **`browser-macos`** — macOS style title bar (traffic lights); optional title bar on/off; radius 12px.
8. **`browser-windows`** — Windows style title bar; optional title bar on/off; radius 8px.
9. **`device-laptop`** — generic laptop bezel outline; radius 6px within bezel.
10. **`device-phone`** — generic phone outline; radius 8px within bezel.
11. **`card-elevated`** — floating card with large soft shadow; radius 28px.
12. **`card-outlined`** — thin 1px outline + subtle drop; radius 16px.

Each preset defines:
```json
{
  "id": "browser-macos",
  "label": "Browser – macOS",
  "kind": "frame|background|card",
  "bg": { "type": "gradient|mesh|blobs|pattern|solid", "params": {...} },
  "frame": { "type": "browser-macos|browser-windows|device-laptop|device-phone|none" },
  "card": { "radius": 12, "shadow": "md|lg|xl", "border": "none|1px" }
}
```

---

## 7) Palettes (Predefined)

- Provide **at least 16** curated palettes as `palettes.json`, each 3–5 swatches:
  - **`jetbrains-dark`** (JetBrains‑inspired dark UI chrome).
  - neutrals, bold neons, soft pastels, muted pro tones, etc.
- The palette is applied to **backgrounds and accents only** (never the screenshot).

Example structure:
```json
{
  "id": "jetbrains-dark",
  "label": "JetBrains Dark",
  "swatches": ["#0E0E0E", "#1A1A1A", "#00E2FF", "#FF318C", "#FFD600"]
}
```

---

## 8) Frontend Spec (Next.js + Tailwind)

**Pages/Routes**
- `/` → Landing + Editor (single-page).

**Core components**
- `ImageLoader` (File picker, Paste handler, “From clipboard” button).
- `PresetPicker`, `PalettePicker`, `TitleBarToggle`, `AspectRatioPicker`.
- `CanvasPreview` (renders SVG string into `<svg>` for fidelity).
- `ExportButtons` (Copy PNG, Download PNG).
- `Toast` (non-blocking notices).

**Clipboard behaviors**
- **From clipboard** button:
  - Try `navigator.clipboard.read()` → pick first `image/*` item.
  - If no image: show **“Clipboard is empty.”**
  - If unsupported/denied: show **“Clipboard not available. Try ⌘/Ctrl+V or use file picker.”**
- **Copy to clipboard** on export:
  - Try `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`.
  - On failure: toast **“Copy failed. Downloading instead.”**, then auto‑download.

**Autosave (localStorage)**
- Keys: `presetId`, `paletteId`, `titleBar`, `aspectRatio` (never store the image).

**JetBrains‑inspired site theme**
- Define CSS variables for **surface, text, accent** tokens inspired by jetbrains.com main page colors.
- Use **Inter** (Google Font) or system font; high contrast for text.

**Accessibility**
- All controls focusable (`tabindex`), visible focus rings, ESC closes dialogs/menus.
- Contrast for UI text ≥ **WCAG AA**.

---

## 9) Backend Spec (FastAPI)

**Dependencies (minimal)**: `fastapi`, `uvicorn`, `pydantic`, `Pillow`, `cairosvg` (or `resvg`), `limits` (rate limiting), `python-multipart`.

**Flow**
1. Validate file type/size (PNG/JPG, ≤10 MB).
2. Parse `payload` JSON; validate enum values.
3. Decode image and read dimensions (**ws × hs**).
4. Compute output **width×height** per §4.
5. Build **SVG** string using preset + palette + title bar + image `<image>` (with `preserveAspectRatio="xMidYMid meet"`).
6. Rasterize SVG → PNG (in‑memory). Set headers. Return stream.
7. Immediately delete any buffers; do not write to disk.

**Rate limiting**
- Use `limits` with in‑memory storage for `60/minute` per IP; return 429 on exceed.

**Logging**
- Do not log image data. Log only event metadata: time, endpoint, latency, status code (no IP in logs if possible).

---

## 10) Acceptance Criteria (System‑level)

- **A1. Inputs**: Paste and file picker both accept PNG/JPG; 10 MB limit enforced with 413.
- **A2. No cropping**: The screenshot appears pixel‑perfect (1×) centered; background fills to chosen ratio.
- **A3. Export**: Copy works in Chromium; on unsupported/denied, fallback to Download with user notice.
- **A4. Performance**: For a 3000×2000 PNG (≤10 MB), `/api/render` responds p95 ≤ **10 s** on a standard CPU in CI.
- **A5. Privacy**: No images stored on disk; container file system remains clean after 100 renders.
- **A6. Accessibility**: All interactive controls reachable via keyboard; visible focus; basic ARIA labels.
- **A7. Cross‑browser**: Paste & Copy behaviors verified on **Chromium** and **Safari** (with documented fallbacks).
- **A8. Presets/Palettes**: 12 presets and ≥16 palettes exposed by `/api/presets` and `/api/palettes` and working in preview & server render.
- **A9. Title bars**: macOS/Windows styles render correctly and can be toggled off.
- **A10. Rate limit**: Exceeding 60/min/IP on `/api/render` yields 429 with `Retry-After` header.

---

## 11) Test Plan

**Unit (frontend)**:  
- SVG builder functions: given preset/palette/ratio and ws×hs, output SVG with correct viewBox and `<image>` transform.  
- Aspect ratio math per §4 (edge cases: square, tall, wide).

**Unit (backend)**:  
- Validate mime/size; invalid payload → 400/415/413.  
- SVG generation inserts embedded base64 image and palette values.  
- Rasterization produces non‑empty PNG; pixel dimensions match computed width×height.

**Integration**:  
- `/api/render` end‑to‑end with a fixture image (e.g., 1600×900) returns PNG in ≤10 s.

**E2E (Playwright)**:  
- Paste flow: simulate clipboard with image; editor shows preview.  
- Empty clipboard: click *From clipboard* → toast **“Clipboard is empty.”**  
- File flow: upload 9.9 MB JPG → preview.  
- Style toggles: switch presets/palettes/title bars/aspect ratios → preview updates.  
- Export copy (Chromium): clipboard contains PNG; export download fallback when copy denied.  
- Safari run: verify paste via paste event; copy fallback path triggers download.

**Visual regression**:  
- Golden PNGs for each preset + a reference screenshot (stored in repo). Compare with SSIM ≥ 0.99 or pixel diff tolerance ≤ 0.5%.

**Performance tests**:  
- Pytest measures render latency for 1920×1080 and 3000×2000 inputs; fail if p95 > 10 s.

---

## 12) Build Tasks (for Lovable Agent)

**T1 – Repo & Tooling**
- Create monorepo: `frontend/` (Next.js + TS), `backend/` (FastAPI).
- Common `scripts/` for CI tasks; Prettier/ESLint; Ruff/Black for Python.
- **Done when** repos build locally; CI green.

**T2 – Design tokens & Site Theme**
- Implement JetBrains‑inspired site theme (colors, spacing, typography) via Tailwind config & CSS variables.
- **Done when** base UI matches design tokens; contrast AA met.

**T3 – Presets & Palettes JSON**
- Author `presets.json` (12 entries) and `palettes.json` (≥16 entries).
- **Done when** `/api/presets` & `/api/palettes` serve these lists and frontend consumes them.

**T4 – SVG Builder (shared spec)**
- Implement pure functions to produce SVG from: `{preset, palette, titleBar, ws, hs, aspectRatio, imageHref}`.
- **Done when** unit tests cover ratio math & output structure.

**T5 – Frontend Editor**
- Components: ImageLoader, pickers, preview, export buttons, toasts, localStorage.
- Paste handler + “From clipboard” button; empty clipboard error message.
- **Done when** user can paste/upload, style, and preview.

**T6 – Backend Rasterizer**
- FastAPI `/api/render` that embeds image into SVG and rasterizes to PNG via cairosvg/resvg; no disk writes.
- Rate limiting; headers; error handling.
- **Done when** PNG bytes stream with correct dimensions returns; latency within budget on sample images.

**T7 – Export (Copy/Download)**
- Implement client “Copy PNG” via `ClipboardItem`; download fallback on failure.
- **Done when** copy succeeds in Chromium; fallback download triggers on unsupported browsers.

**T8 – Cross‑browser & A11y**
- Safari paste path (paste event), keyboard navigation, focus rings.
- **Done when** Playwright runs pass for Chromium + WebKit; a11y checks pass.

**T9 – Visual Regression & Perf Tests**
- Set up golden images for each preset; SSIM/pixel‑diff CI step. Perf assertions in pytest.
- **Done when** CI fails on visual/perf regressions.

**T10 – Legal & Docs**
- Add Terms/Privacy pages and “Don’t upload sensitive data” banner.
- README with local dev instructions and constraints (no storage, privacy).

---

## 13) Sample Pseudocode (Key Parts)

**Aspect ratio computation with generous padding (JS/Python)**
```python
def output_size(ws, hs, r):  # r = aw/ah (float); 'auto' handled outside
    paddingFactor = 1.4  # 40% extra space for beautiful styling
    minHeight = max(hs, int((ws / r) + 0.9999))  # ceil without math.ceil
    minWidth = int((minHeight * r) + 0.9999)     # ceil
    height = int((minHeight * paddingFactor) + 0.9999)
    width = int((minWidth * paddingFactor) + 0.9999)
    return width, height
```

**SVG image element (contain + pad)**
```xml
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <!-- background (gradient/blobs/pattern) here -->
  <!-- screenshot -->
  <image href="data:image/png;base64,{BASE64}" x="0" y="0"
         width="{ws}" height="{hs}"
         transform="translate({(W-ws)/2},{(H-hs)/2})"
         preserveAspectRatio="xMidYMid meet"/>
  <!-- optional frame/title bar according to preset -->
</svg>
```

**Clipboard (empty) error**
```ts
try {
  const items = await (navigator as any).clipboard?.read?.();
  const imageItem = items?.find((i:any)=> i.types?.some((t:string)=>t.startsWith('image/')));
  if (!imageItem) throw new Error('empty');
  // ...
} catch (e) {
  toast('Clipboard is empty.');
}
```

---

## 14) Release Checklist

- [ ] CI green: unit, integration, E2E, visual, perf.  
- [ ] Manual smoke on Chromium & Safari (paste/copy/export).  
- [ ] Headers verified (`no-store`, CSP).  
- [ ] Limits verified (10 MB, 60 req/min/IP).  
- [ ] Legal pages present; banner visible.  
- [ ] README documents privacy (no retention) and constraints.

---

## 15) Future Backlog (post‑v1, non‑blocking)

- Saved user presets (requires auth & storage).  
- AI palette suggestions (on‑image color extraction).  
- Drag‑and‑drop; CMS integrations.  
- Batch mode; additional frames/devices; custom title text.  
- Background removal & smart padding.

---

### End of file
