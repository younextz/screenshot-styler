# Changelog

All notable changes to Screenshot Styler are recorded here.

---

## [Sprint — 2026-02-17]

### Features

#### Gradient Styles Revamp
- Replaced 6 legacy background presets with **16 new presets** across four categories:
  - **Gradients (6):** Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint — linear gradients with multiple color stops and varied directions
  - **Mesh (4):** Cosmic, Tropical, Pastel Dream, Neon Glow — overlapping radial gradients for aurora-like depth
  - **Solid (3):** Slate, Cloud, Subtle — clean minimalist backgrounds with optional subtle gradients
  - **Pattern (3):** Dot Matrix, Grid Lines, Grain — textured backgrounds using SVG patterns and filters
- Added 3 new color palettes (Aurora Nights, Rose Quartz, Tropical Vibes), bringing the total to 20 palettes
- Reordered palettes so the most versatile appear first

#### Modern UI Redesign
- Viewport-fit layout: all controls are visible without scrolling on desktop (1280×720+)
- Redesigned design system with blue-tinted neutral colors, multi-layered shadows, and varied corner radii
- New accent palette (cyan, pink, amber, violet, orange) used sparingly for emphasis
- Compact ImageLoader: horizontal icon + text layout, reduced height
- Horizontal ExportButtons layout with a clear primary/secondary action hierarchy ("Copy" as primary; PNG, 4K, SVG as secondary ghost buttons)
- Pill-style PresetPicker with flex-wrap layout
- Compact 3-column PalettePicker grid with tooltip-only labels
- Inline segmented ControlPanel toggle controls
- Refined CanvasPreview container with dot-grid overlay and softer drop shadow
- ThemeToggle simplified to a single icon button with aria-labels

### Improvements

- **Animation pipeline:** Wired `animationsEnabled` flag and preset-level animation config correctly into `generateSVG`; verified that disabling animations removes all animated SVG nodes across every animated preset
- **SVG renderer modularization:** Split `src/lib/svgRenderer.ts` into focused modules:
  - `src/lib/svg/backgroundAssets.ts` — background asset loading and cache
  - `src/lib/svg/frameGenerators.ts` — frame generators
  - `src/lib/svg/presetStyles.ts` — preset style registry
  - `BACKGROUND_RENDERER_REGISTRY` — typed preset-to-background renderer map replacing large `switch` blocks
- **Theme provider unified:** Removed the split between `next-themes` and a custom `useTheme`; the app now uses a single theme provider/state flow, including Sonner toasts
- **Dependency cleanup:** Removed `@tanstack/react-query` (unused); removed duplicate toast stack and standardized on Sonner
- **Build tooling:** Added `typecheck` script (`tsc --noEmit`) and included it in the pre-merge checklist
- **Shared test data:** Moved repeated tweet embed HTML fixture into shared test data helpers; replaced brittle string-heavy test setup with typed fixtures and utility builders
- **Responsive layout:** Improved sidebar + preview behavior at smaller viewport widths

### Fixes

- Fixed ESLint errors across the codebase so `npm run lint` passes cleanly
- Fixed TypeScript lint violations in test files (`any` types, invalid mock typing, unnecessary escape sequences)
- Removed accidental artifact file `src/tests/TweetLoader.test.tsx.append`
- Removed unused Vite template file `src/App.css`
- Reconciled README preset and features list with the actual implementation
- Deduplicated repeated shadow/radius configuration via shared preset metadata

### Tests

- Added animation on/off behavior tests to prevent regressions
- Added coverage for image loading edge cases: clipboard permission denied, invalid MIME type, oversized files
- Added coverage for export fallback: clipboard write failure now falls back to download
- Updated ThemeToggle tests to assert aria-label–based accessibility (icon-only button design)
- Updated theme toggle and Sonner toast rendering tests to cover the unified theme flow
- All 6 test suites passing after changes

### Accessibility

- Segmented controls in `ControlPanel` now expose keyboard interaction and selected-state semantics
- All interactive icon and non-text controls confirmed to have accessible labels or titles

---

*Produced by AIR Automations. Name: Screenshot styler notes / Run: https://air.stgn.jetbrains.cloud/org/05cf1a7f-6ab5-713b-abd3-29d0c8a05e2d/automations/d3ea72d2-34a2-4fb8-9bc0-116fa0f7d225?run=90e6c6e7-4e4e-4979-9b5b-cc9c960d63bc*
