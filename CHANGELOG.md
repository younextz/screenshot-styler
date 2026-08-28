# Changelog

## Sprint: Cleanup & Refactor — 2026-08-28

This sprint focused on code quality, architecture clean-up, and test coverage across the codebase. All planned tasks were completed and verified (`lint`, `typecheck`, `test`, `build` all pass).

### Features

- **Typecheck script** — Added `npm run typecheck` (`tsc --noEmit`) and included it in the standard pre-merge checklist to catch type errors before they reach CI.
- **Animation pipeline** — Fully wired `animationsEnabled` state and per-preset animation configuration into `generateSVG`. Verified that toggling animations off removes all animated SVG nodes across every affected preset. Added dedicated tests to prevent regressions.

### Fixes

- **ESLint** — Resolved all ESLint errors so `npm run lint` exits cleanly.
- **TypeScript test violations** — Fixed `any` types, invalid mock typings, and unnecessary escape characters in the test suite.
- **Stray artifact** — Removed accidental file `src/tests/TweetLoader.test.tsx.append` left over from a previous edit session.
- **Animation mismatch** — Fixed a bug where `animationsEnabled` and preset-level animation config were not correctly passed through to `generateSVG`, causing animations to appear or disappear at the wrong times.

### Improvements

#### Architecture

- **SVG renderer split** — Broke the monolithic `src/lib/svgRenderer.ts` into focused modules: `src/lib/svg/backgroundAssets.ts` (asset loading and cache), `src/lib/svg/frameGenerators.ts` (frame drawing), and `src/lib/svg/presetStyles.ts` (preset style registry with a `BACKGROUND_RENDERER_REGISTRY` map). Public API remains stable.
- **Preset registry** — Replaced the large `switch` statement for preset dispatch with a typed registry map, making it easier to add or modify presets without touching shared logic.
- **Shared preset metadata** — Deduplicated repeated shadow and border-radius configuration by extracting it into shared preset metadata objects.

#### Dependencies & Cleanup

- **Removed `@tanstack/react-query`** — Audited usage; the library was not needed and has been removed to reduce bundle size and dependency surface.
- **Single toast stack** — Removed the duplicate toast system; the app now uses Sonner exclusively.
- **Unified theme system** — Removed the split between `next-themes` and the custom `useTheme` hook. Theme state now flows from a single provider, keeping UI chrome and Sonner toasts consistent.
- **Removed `src/App.css`** — Deleted unused Vite template CSS leftover.

#### Tests

- **Typed test fixtures** — Moved the repeated tweet embed HTML fixture into `src/tests/fixtures/tweetOembed.ts` and replaced ad-hoc string-heavy setup with typed fixtures and utility builders throughout the test suite.
- **Image loading edge cases** — Added test coverage for: clipboard access denied, invalid MIME types, and oversized file uploads.
- **Export fallback coverage** — Added tests verifying that a clipboard write failure triggers the download fallback as expected.
- **Theme and toast tests** — Updated theme toggle and Sonner toast tests to cover the unified theme flow.

#### Accessibility & UX

- **Keyboard semantics for segmented controls** — `ControlPanel` segmented controls now properly expose keyboard interaction patterns and `aria-selected` state.
- **Icon control labels** — Confirmed that all icon-only and non-text interactive controls carry appropriate accessible names and titles.
- **Responsive layout** — Improved sidebar + preview layout at narrower viewport widths so the UI remains usable without horizontal scrolling.

---

Produced by AIR Automations. Name: Screenshot styler notes / Run: https://air.stgn.jetbrains.cloud/org/05cf1a7f-6ab5-713b-abd3-29d0c8a05e2d/automations/d3ea72d2-34a2-4fb8-9bc0-116fa0f7d225?run=c6c2b2b6-d291-4a0e-ac22-865436179a3e
