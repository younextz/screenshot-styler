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

### [ ] Step: Update ImageLoader Component
Update `src/components/ImageLoader.tsx`:
- More compact upload buttons
- Refined hover states
- Cleaner border treatment

---

### [ ] Step: Update ExportButtons Component
Update `src/components/ExportButtons.tsx`:
- Horizontal compact layout
- Primary action emphasis
- Refined button styling

---

### [ ] Step: Update Picker Components
Update picker components for compact display:
- `src/components/PresetPicker.tsx`: Compact grid, smaller buttons
- `src/components/PalettePicker.tsx`: Smaller swatches, improved selection
- `src/components/ControlPanel.tsx`: Inline controls, pill-style toggles

---

### [ ] Step: Update Preview and Theme Components
Update remaining components:
- `src/components/CanvasPreview.tsx`: Maximize space, refined styling
- `src/components/ThemeToggle.tsx`: Simplified toggle design

---

### [ ] Step: Verification and Report
- Run lint, build, and tests
- Manual testing across viewport sizes
- Write implementation report to `report.md`
