# Changelog

## [Sprint: Gradient Revamp, UI Redesign & Code Quality] — 2026-07-31

### Features

- **16 new background presets** organized into four categories, replacing the previous 6 generic options:
  - *Gradients (6)*: Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint — multi-stop linear gradients with varied directions
  - *Mesh (4)*: Cosmic, Tropical, Pastel Dream, Neon Glow — overlapping radial gradients for depth-rich aurora effects
  - *Solid (3)*: Slate, Cloud, Subtle — clean minimalist backgrounds with optional soft gradients
  - *Pattern (3)*: Dot Matrix, Grid Lines, Grain — textured SVG-pattern and noise filter backgrounds
- **3 new color palettes** (Aurora Nights, Rose Quartz, Tropical Vibes), bringing the total palette count from 17 to 20; palette order rearranged with the most versatile options first
- **Animation infrastructure** (`src/lib/animations.ts`): five animation types (`flow`, `pulse`, `rotate`, `wave`, `shimmer`), three speed tiers (`slow` 10s / `medium` 6s / `fast` 3s), and SVG `<animate>` element generators — foundational layer for upcoming animated presets
- **Modern UI redesign**: complete visual overhaul across all components achieving a viewport-fit layout (no scrolling) with a blue-tinted design system, multi-layered shadow depth, refined typography hierarchy, and consistent light/dark theme parity

### Improvements

- **SVG renderer modularised**: `src/lib/svgRenderer.ts` responsibilities extracted into focused modules — `src/lib/svg/backgroundAssets.ts`, `src/lib/svg/frameGenerators.ts`, `src/lib/svg/presetStyles.ts` — and a typed `BACKGROUND_RENDERER_REGISTRY` map replaces the large `switch` block; public API unchanged
- **Shared preset metadata**: shadow and radius config deduplicated via typed registry entries; eliminated repeated inline constants across generators
- **Theme provider unified**: removed split between `next-themes` and the custom `useTheme` hook; a single provider now governs app UI and Sonner toasts, reducing state inconsistencies
- **Test coverage expanded**: new cases for animation enabled/disabled paths (regression guard for animation pipeline), image loading edge cases (clipboard permission denied, invalid MIME type, oversized files), and export fallback paths (clipboard write failure → download)
- **`typecheck` script added** (`tsc --noEmit`); included in the pre-merge quality checklist alongside `lint` and `test`
- **Keyboard interactions and ARIA**: segmented controls in `ControlPanel` expose full keyboard interaction and selected-state semantics; all icon/non-text controls have accessible labels or titles
- **Responsive layout**: sidebar and preview panels now degrade gracefully at smaller viewport widths
- **Test fixtures refactored**: typed fixture builders and shared test helpers replace brittle string-heavy setup; Tweet embed fixture moved to `src/tests/fixtures/`
- **README updated** to accurately reflect current preset categories, palette count, and feature set

### Fixes

- Fixed all ESLint errors — `npm run lint` now passes cleanly
- Fixed TypeScript violations in test files: removed `any` casts, corrected invalid mock typings, resolved unnecessary escape sequences
- Fixed animation pipeline mismatch: `animationsEnabled` flag and preset-level `AnimationConfig` are now correctly threaded into `generateSVG`, so toggling animations reliably adds or removes SVG `<animate>` nodes for all animated presets
- Removed unused `@tanstack/react-query` dependency (no active query usage found)
- Removed duplicate toast stack — standardised on Sonner; `react-hot-toast` import removed
- Removed accidental artifact `src/tests/TweetLoader.test.tsx.append` from the test directory
- Removed unused Vite template leftover `src/App.css`
