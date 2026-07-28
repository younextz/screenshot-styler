# Changelog

## Sprint: Cleanup & Refactor Backlog — 2026-02-17

All items completed and shipped in commit `859305c`.

---

### Features

- **Typecheck script** — Added `npm run typecheck` (`tsc --noEmit`) as a first-class script and included it in the pre-merge quality checklist alongside lint and tests.
- **Keyboard-accessible segmented controls** — `ControlPanel` segmented controls now expose full keyboard interaction (arrow-key navigation) and ARIA selected-state semantics, making the aspect-ratio and title-bar toggles fully operable without a mouse.

---

### Fixes

- **ESLint** — Resolved all ESLint errors so `npm run lint` exits cleanly; no pre-existing violations remain.
- **TypeScript lint in tests** — Fixed `any`-typed mocks, invalid mock typing patterns, and unnecessary regex escape sequences across test files.
- **Stale artifact file** — Removed accidentally committed `src/tests/TweetLoader.test.tsx.append` from the repo.
- **Animation pipeline** — Corrected a mismatch where `animationsEnabled` and preset-level animation config were not threaded through to `generateSVG`; animated SVG nodes now reliably disappear when animations are disabled.
- **README accuracy** — Reconciled the preset/feature list in `README.md` with what is actually implemented (preset count, animation toggle, export formats).

---

### Improvements

#### SVG Renderer Refactor
- Split the monolithic `src/lib/svgRenderer.ts` into four focused modules:
  - `src/lib/svg/backgroundAssets.ts` — background asset loading and caching
  - `src/lib/svg/frameGenerators.ts` — frame-overlay generators
  - `src/lib/svg/presetStyles.ts` — per-preset style configuration
  - `BACKGROUND_RENDERER_REGISTRY` map — replaces the large `switch` statement with a typed lookup
- Deduplicated repeated shadow and border-radius config through shared preset metadata; public renderer API is unchanged.

#### Theme
- Removed the dual theme-source split between `next-themes` and the custom `useTheme` hook.
- Standardized the entire app (UI controls, Sonner toasts) on a single theme provider and state flow.
- Updated theme toggle and toast rendering tests to cover the unified flow.

#### Dependencies
- Removed `@tanstack/react-query` (imported but never used).
- Removed the duplicate toast stack; Sonner is now the sole toast provider.
- Deleted the unused Vite template file `src/App.css`.

#### Testing
- Migrated the repeated tweet embed HTML fixture into a shared test-data helper, eliminating copy-paste across test files.
- Replaced brittle inline string setups with typed fixtures and utility builder functions.
- Added edge-case coverage for image loading: clipboard permission denied, invalid MIME type, and oversized files.
- Added coverage for export fallbacks: clipboard write failure now correctly falls back to a file download.
- Added regression tests for animation on/off behavior, verifying that toggling `animationsEnabled` inserts or removes animated SVG nodes across all animated presets.

#### Accessibility
- Audited and confirmed accessible `aria-label` / `title` attributes on all interactive icon-only and non-text controls.

#### Responsive Layout
- Improved sidebar and preview panel behavior at narrower viewport widths to prevent layout overflow.

---

*Produced by Air Automation. Name: Screenshot styler notes / Run: https://air.stgn.jetbrains.cloud/org/05cf1a7f-6ab5-713b-abd3-29d0c8a05e2d/automations/d3ea72d2-34a2-4fb8-9bc0-116fa0f7d225?run=7fb3f400-4a10-4985-a587-bdc6a4dad671*
