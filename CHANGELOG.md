# Changelog

All notable changes to Screenshot Styler are documented here.

---

## [Unreleased] — Sprint ending 2026-09-07

### Features

#### Background Presets — Complete Overhaul
Replaced 6 generic background presets with **16 new social-media-optimised presets** across four categories, inspired by tools like Pika.style, CleanShot X, Xnapper, and InstantGradient.

| Category | Count | Presets |
|----------|-------|---------|
| **Gradient** | 6 | Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint |
| **Mesh** | 4 | Cosmic, Tropical, Pastel Dream, Neon Glow |
| **Solid** | 3 | Slate, Cloud, Subtle |
| **Pattern** | 3 | Dot Matrix, Grid Lines, Grain |

Each preset uses multi-stop linear or radial gradients, soft overlay effects (grain + vignette), and works with any palette.

#### New Color Palettes
Added **3 new palettes** optimised for the revamped presets, bringing the total from 17 to 20:

- **Aurora Nights** — deep blue-gray tones (pairs with Aurora, Cosmic)
- **Rose Quartz** — soft pink-mauve tones (pairs with Rose Gold, Pastel Dream)
- **Tropical Vibes** — vibrant cyan-coral-yellow (pairs with Tropical, Neon Glow)

Palettes were also reordered to surface the most versatile choices first (Sunset Warm, Ocean Blue, Neon Purple, Soft Pastel, Minimal Gray).

---

### Improvements

#### Modern UI Redesign
Overhauled the main page layout and all control components for a cleaner, more professional appearance that fits within the viewport without scrolling.

**Layout & Design System**
- Switched from pure grayscale to blue-tinted neutrals (`220 15% x%`) for depth and warmth
- Multi-layered shadow system for natural depth perception
- Added `--radius-sm` and `--radius-lg` for varied corner radii
- Compact header (`py-3`) with a logo badge and refined typography
- Fixed-width sidebar (`w-80`) replacing flexible `max-w-xl`
- Full `h-screen` layout — no page scroll on desktop

**Component Updates**

| Component | Change |
|-----------|--------|
| `ImageLoader` | Compact horizontal layout (h-16), smaller icons, softer borders |
| `ExportButtons` | Horizontal layout; filled primary "Copy" + ghost secondary actions (PNG, 4K, SVG) |
| `PresetPicker` | Pill-style buttons with compact `text-xs` labels |
| `PalettePicker` | 3-column grid with smaller swatches (`h-3`) and title tooltips |
| `ControlPanel` | Inline segmented toggle with pill-style buttons |
| `CanvasPreview` | Dot-grid overlay, reduced drop shadow, softer container border |
| `ThemeToggle` | Simplified to a single icon button with proper `aria-label` |

---

### Fixes

- **ThemeToggle accessibility**: Icon-only button now has correct `aria-label` values (`"Switch to dark theme"` / `"Switch to light theme"`), replacing text labels that were removed in the redesign. Tests updated to verify via ARIA role rather than visible text.
- **Pre-existing lint warnings** in `ImageLoader.tsx`, `TweetLoader.tsx`, and UI components were identified but are outside the scope of these tasks; no new warnings were introduced.

---

*Build status: all 6 tests passing; production build successful.*
