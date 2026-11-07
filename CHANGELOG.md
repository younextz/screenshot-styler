# Changelog

All notable changes to Screenshot Styler are documented here.

---

## Sprint: Week of 2026-11-07

**No new tasks were completed in this sprint (Oct 31 – Nov 7, 2026).**

Active planning is in progress for the next feature: *Dynamic Animated Background Gradients* (see `plan.md`). Implementation has not yet begun.

---

## Sprint: Week of 2026-09-11

This sprint delivered the major `feature/agent-friendly-studio` milestone via [PR #50](https://github.com/younextz/screenshot-styler/pull/50), completing two substantial tasks.

---

### Features

#### Agent-Friendly Local Rendering

Made Screenshot Studio accessible to AI agents without browser automation:

- Added a versioned, downloadable Node.js helper that renders screenshots locally using the same composition logic as the web editor
- Published machine-readable agent instructions at `public/agents/guide.md` and a Claude-compatible skill at `public/agents/screenshot-styler/SKILL.md`
- Added a Dockerfile and `docker-compose.yml` for reproducible rendering environments
- Shared composition code between browser and CLI paths via an extracted pure function (no browser globals, no Vite env vars, no localStorage)
- Release validation script (`npm run validate:agent`) confirms helper integrity against a manifest before shipping
- Chromium startup and rendering each have a 30-second deadline; asset cache capped at 100 MiB

#### Gradient Styles Revamp

Replaced 6 generic background presets with 16 professionally designed ones, organized into 4 categories:

| Category | Presets |
|---|---|
| **Gradients (6)** | Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint |
| **Mesh (4)** | Cosmic, Tropical, Pastel Dream, Neon Glow |
| **Solid (3)** | Slate, Cloud, Subtle |
| **Pattern (3)** | Dot Matrix, Grid Lines, Grain |

Frame (4) and card (2) presets are unchanged.

Added 3 new color palettes: **Aurora Nights**, **Rose Quartz**, and **Tropical Vibes**, bringing the total to 20. Palettes are now ordered with the most versatile first.

---

### Improvements

#### Modern UI Redesign

Redesigned the entire studio interface to fit in a single viewport without scrolling:

- Replaced pure-grayscale tokens with blue-tinted neutrals for depth; updated accent palette to cyan, pink, amber, violet, and orange
- Multi-layered shadow system for natural depth; inner shadow variable for recessed elements
- Fixed-width sidebar (`w-80`) replacing flexible layout; full-height layout (`h-screen`) eliminating page scroll
- **ImageLoader**: Compact horizontal layout (button height halved from `h-32` to `h-16`), smaller icons with muted foreground
- **ExportButtons**: Horizontal flex with primary Copy action (filled) and secondary PNG / 4K / SVG actions (ghost)
- **PresetPicker**: Pill-style toggle buttons with `text-xs` compact labels
- **PalettePicker**: 3-column compact grid; label replaced by `title` tooltip; subtle ring on selection
- **ControlPanel**: Inline segmented toggle with `bg-background` shadow on selection
- **CanvasPreview**: Dot-grid pattern overlay, softer border, reduced drop shadow
- **ThemeToggle**: Simplified to single icon button with aria-label; removed Switch component and text label

#### Background Asset Improvements

- Mesh presets now use 4 overlapping radial gradients with varied positions and opacities for aurora-like depth
- All presets include `softOverlays()` for consistent grain and vignette effects
- Pattern backgrounds use SVG `<filter>` for noise/grain texture generation

---

### Fixes

- Updated `ThemeToggle` tests to match icon-only button (changed from text assertions to `getByRole('button', { name: 'Switch to dark/light theme' })`)
- Resolved test failures caused by outdated `Switch` component assertions
- All 6 test suites pass after UI redesign

---

*Produced by Air Automations. Name: Screenshot styler notes / Run: https://air.stgn.jetbrains.cloud/org/05cf1a7f-6ab5-713b-abd3-29d0c8a05e2d/automations/d3ea72d2-34a2-4fb8-9bc0-116fa0f7d225?run=f2111c52-802d-4559-84ca-c52b2eb6d636*
