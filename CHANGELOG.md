# Changelog

## Sprint ending 2026-08-14

### Features

- **16 new background presets** across four categories replacing the previous 6:
  - *Gradients (6)*: Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint — linear gradients with multiple color stops and varied directions.
  - *Mesh (4)*: Cosmic, Tropical, Pastel Dream, Neon Glow — overlapping radial gradients for aurora-like flowing effects.
  - *Solid (3)*: Slate, Cloud, Subtle — clean minimalist backgrounds with optional subtle gradients.
  - *Pattern (3)*: Dot Matrix, Grid Lines, Grain — textured backgrounds using SVG patterns and noise filters.
- **3 new color palettes**: Aurora Nights (deep blue-gray), Rose Quartz (soft pink-mauve), and Tropical Vibes (vibrant cyan-coral-yellow); palettes reordered with most versatile first.
- **Animation toggle**: users can enable/disable preset animations; preference persists to `localStorage`. SVG exports include animation elements; PNG export captures a static frame.
- **Modern UI redesign**: new blue-tinted neutral design system, compact viewport-fit layout (no page scroll on desktop), horizontal export actions (Copy / PNG / 4K / SVG), pill-style preset picker, compact 3-column palette grid, inline segmented controls.
- **`typecheck` script** (`tsc --noEmit`) added and included in the pre-merge checklist.

### Fixes

- Fixed animation pipeline mismatch: `animationsEnabled` flag and per-preset animation config are now correctly wired through `generateSVG`.
- Fixed ESLint errors across the codebase so `npm run lint` passes cleanly.
- Fixed TypeScript lint violations in test files (`any` types, invalid mock typing, unnecessary escapes).
- Removed accidental artifact file `src/tests/TweetLoader.test.tsx.append`.
- Removed split theme sources (`next-themes` vs custom `useTheme`); standardised on a single theme provider for app UI and Sonner toasts.
- Updated theme toggle and toast rendering tests to cover the unified theme flow.

### Improvements

- **SVG renderer refactor**: extracted `src/lib/svgRenderer.ts` into focused modules — `src/lib/svg/backgroundAssets.ts` (asset loading/cache), `src/lib/svg/frameGenerators.ts` (frame generators), `src/lib/svg/presetStyles.ts` (preset style registry). Large `switch` replaced with a typed `BACKGROUND_RENDERER_REGISTRY` map; repeated shadow/radius config deduplicated via shared preset metadata. Public API unchanged.
- **Dependency cleanup**: removed unused `@tanstack/react-query`; consolidated to a single toast stack (Sonner); removed unused Vite template file `src/App.css`.
- **Test quality**: moved tweet embed HTML fixture into shared test data helpers; replaced brittle string-heavy test setup with typed fixtures and utility builders.
- **New test coverage**: animation on/off behaviour; image loading edge cases (clipboard denied, invalid MIME type, oversized files); export fallbacks (clipboard write failure → download fallback).
- **Accessibility**: segmented controls in `ControlPanel` now expose proper keyboard interaction and selected-state semantics; interactive icon controls confirmed to have accessible labels and titles.
- **Responsive layout**: improved sidebar + preview behaviour at smaller viewport widths.
- **README**: reconciled preset/features list with actual implementation; added `typecheck` to the run-before-committing instructions.
