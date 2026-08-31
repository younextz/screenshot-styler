# Changelog

## Sprint – Week of 2026-08-31

### Features

#### New Background Presets (16 total, replacing 6)
Completely overhauled the preset library with social-media-optimised styles inspired by tools like Pika.style, CleanShot X, and Xnapper. Presets are now organised into four categories:

| Category | Presets |
|----------|---------|
| **Gradient (6)** | Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint |
| **Mesh (4)** | Cosmic, Tropical, Pastel Dream, Neon Glow |
| **Solid (3)** | Slate, Cloud, Subtle |
| **Pattern (3)** | Dot Matrix, Grid Lines, Grain |

Each preset uses evocative naming and palette-aware SVG generation with grain/vignette soft overlays.

#### New Color Palettes
Added three curated palettes to complement the new preset categories (20 total, up from 17):

- **Aurora Nights** – deep blue-gray tones, ideal for Aurora and Cosmic presets
- **Rose Quartz** – soft pink-mauve tones, pairs well with Rose Gold and Pastel Dream
- **Tropical Vibes** – vibrant cyan-coral-yellow, designed for Tropical and Neon Glow

---

### Improvements

#### Modern UI Redesign
Redesigned the main page for a polished, professional appearance with a viewport-fit layout (no scrolling required on desktop).

- **Design system**: moved to blue-tinted neutrals, multi-layered shadow system, varied border radii (`--radius-sm` / `--radius-lg`), and a richer accent colour palette (cyan, pink, amber, violet, orange)
- **Layout**: compact header (`py-3`), fixed-width sidebar (`w-80`), `h-screen` with `overflow-hidden` — all content visible without scrolling
- **Empty state**: cleaner styling with softer borders
- **Typography**: replaced aggressive uppercase tracking with subtle `font-medium` section headers

#### Component Improvements

| Component | Change |
|-----------|--------|
| **ImageLoader** | Horizontal layout (icon + text), reduced height (`h-16`), softer border treatment |
| **ExportButtons** | Horizontal layout; "Copy" as filled primary, secondary downloads (PNG / 4K / SVG) as ghost variants |
| **PresetPicker** | Pill-style flex-wrap buttons (`px-2.5 py-1`, `text-xs`) with filled selected state |
| **PalettePicker** | 3-column compact grid, smaller swatches (`h-3`), title-tooltip labels |
| **ControlPanel** | Inline segmented toggle controls with `bg-background` + shadow on selection |
| **CanvasPreview** | Softer border, dot-grid pattern overlay, reduced drop shadow |
| **ThemeToggle** | Simplified to an icon-only button (`h-8 w-8`) with `aria-label` for accessibility |

---

### Fixes

- Updated `ThemeToggle` tests to assert against `aria-label` values (`"Switch to dark/light theme"`) rather than visible text, matching the new icon-only design. All 6 tests pass.
