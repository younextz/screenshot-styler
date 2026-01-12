# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: 172caa9d-bed8-466f-af3d-7f50da181f19 -->

**Completed:** Created technical specification in `spec.md` with:
- Task assessed as **medium** difficulty
- Detailed implementation approach for modern, non-AI-generated design
- Layout strategy for viewport-fit (no scrolling)
- All source files identified for modification
- Verification approach defined

---

### [x] Step: Update Design System
<!-- chat-id: 092ccaa7-203d-46d0-abbf-dd3b03504664 -->
Update `src/index.css` with refined CSS variables for a modern look:
- Softer shadows and subtle gradients
- Refined color variables for better contrast
- Modern border radius values

**Completed:** Updated design system with:
- Moved from pure grayscale (0 0% x%) to blue-tinted neutrals (220 15% x%) for depth
- Softer, desaturated accent colors (200 85% vs 189 100%)
- Multi-layered shadows for natural depth
- Added --radius-sm and --radius-lg for varied corner radii
- Subtle gradient backgrounds for surfaces
- New accent color palette (cyan, pink, amber, violet, orange)
- Inner shadow variable for recessed elements
- Consistent light/dark theme parity

---

### [x] Step: Redesign Main Page Layout
<!-- chat-id: 718b096b-b7d4-4391-9928-40b33fb2b008 -->
Update `src/pages/Index.tsx` for viewport-fit design:
- Compact header (reduce vertical padding)
- Narrower fixed-width sidebar (w-80)
- Remove sidebar scrolling - all content must fit
- Modernize empty state design
- Improve typography (remove aggressive uppercase tracking)
- Reduce section spacing for compact display

**Completed:** Redesigned main page layout with:
- Compact header (py-3) with logo badge and refined typography
- Fixed-width sidebar (w-80) with optimized content area
- Modernized empty state with cleaner styling and softer borders
- Replaced aggressive uppercase tracking with subtle font-medium headers
- Reduced section spacing (gap-4 vs space-y-10) for compact display
- Integrated privacy notice into compact footer
- Ensured viewport-fit layout with overflow-hidden and min-h-0

---

### [x] Step: Update ImageLoader Component
<!-- chat-id: dd8588e9-74d7-412e-a383-9b1b80a5adc5 -->
Update `src/components/ImageLoader.tsx`:
- More compact upload buttons
- Refined hover states
- Cleaner border treatment

**Completed:** Updated ImageLoader with:
- Reduced button height from h-32 to h-16 for compact display
- Horizontal layout with icon + text side-by-side instead of stacked
- Smaller icons (w-5 h-5) with muted foreground color
- Softer border treatment (border-border/60) with subtle hover states
- Refined hover: border-primary/50 and bg-primary/5 for subtle feedback
- Tighter spacing (gap-2 between buttons, gap-0.5 for text)
- Condensed labels ("Upload" / "Paste") with smaller helper text (11px)

---

### [x] Step: Update ExportButtons Component
<!-- chat-id: d5f846c5-3f03-4128-80f8-54b31e9a59f4 -->
Update `src/components/ExportButtons.tsx`:
- Horizontal compact layout
- Primary action emphasis
- Refined button styling

**Completed:** Updated ExportButtons with:
- Horizontal flex layout replacing the grid structure
- Primary "Copy" action with filled button style (default variant, size="sm")
- Secondary download actions (PNG, 4K, SVG) using ghost variant with muted colors
- Visual separator (border-l) between primary and secondary actions
- Compact button sizing with smaller icons (w-4 h-4) and tighter padding
- Simplified labels ("Copy", "PNG", "4K", "SVG") for cleaner appearance
- Hover states transition text from muted-foreground to foreground

---

### [x] Step: Update Picker Components
<!-- chat-id: 54019be9-deac-49b5-aaa0-3f3b13b4296d -->
Update picker components for compact display:
- `src/components/PresetPicker.tsx`: Compact grid, smaller buttons
- `src/components/PalettePicker.tsx`: Smaller swatches, improved selection
- `src/components/ControlPanel.tsx`: Inline controls, pill-style toggles

**Completed:** Updated all picker components with:
- **PresetPicker**: Flex-wrap layout with pill-style buttons (px-2.5 py-1), smaller text (text-xs), selected state uses filled primary background
- **PalettePicker**: 3-column compact grid, smaller swatches (h-3), removed labels in favor of title tooltip, subtle ring on selection
- **ControlPanel**: Inline flex layout with segmented toggle controls, pill-style buttons in bg-secondary/50 container, selected state uses bg-background with shadow

---

### [x] Step: Update Preview and Theme Components
<!-- chat-id: 936376af-b371-46ce-ae2c-d79fbfeeba19 -->
Update remaining components:
- `src/components/CanvasPreview.tsx`: Maximize space, refined styling
- `src/components/ThemeToggle.tsx`: Simplified toggle design

**Completed:** Updated preview and theme components with:
- **CanvasPreview**: Refined container with softer border (border-border/50), subtle background (bg-secondary/30), dot-grid pattern overlay for visual interest, constrained SVG sizing with proper padding, reduced drop shadow (drop-shadow-lg vs drop-shadow-2xl)
- **ThemeToggle**: Simplified to single icon button (h-8 w-8), removed Switch component and text label, muted icon color with hover state, clean focus-visible ring styling

---

### [x] Step: Verification and Report
<!-- chat-id: b8f55bf1-682a-44d9-901a-b74eb519f600 -->
- Run lint, build, and tests
- Manual testing across viewport sizes
- Write implementation report to `report.md`

**Completed:** Verification and report completed:
- **Lint**: Pre-existing warnings only (not related to this task)
- **Build**: Successful (dist/index.html, CSS 27.47KB, JS 338.33KB)
- **Tests**: All 6 tests passing (updated ThemeToggle tests to match new icon-only design)
- **Report**: Written to `report.md` with full implementation details
