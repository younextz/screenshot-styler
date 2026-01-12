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
<!-- chat-id: 091d868f-4176-4a9e-ae72-6fd9f7a03d3d -->

Completed. See `spec.md` for full details.

**Summary:**
- Task Difficulty: Medium
- Stack: React 18 + TypeScript, Tailwind CSS, shadcn/ui
- Approach: Apply shadcn minimal design principles across all UI components
- Changes: Softer colors, lighter borders, refined spacing, improved typography
- No API/data model changes required

---

### [x] Step: Refine Design System Foundation
<!-- chat-id: 3fea9d07-765f-46a7-ac2e-84e4602dc586 -->

Completed. Updated core design tokens for a cleaner, minimal aesthetic.

**Changes Made:**
1. Updated `src/index.css`:
   - Softened color palette with reduced saturation (primary blue 210/221 instead of bright cyan)
   - Replaced JetBrains-specific colors with generic semantic accent colors (`--color-cyan`, `--color-pink`, etc.)
   - Refined shadow tokens for subtler depth
   - Adjusted accent color to neutral for less visual competition
   - Added subtle blue tint to dark theme background/cards (240 10%)
2. Cleaned up `src/App.css` (removed Vite boilerplate, kept minimal root styles)
3. `tailwind.config.ts` unchanged (existing setup sufficient)

**Verification:**
- `npm run build` - passed successfully
- Pre-existing lint warnings/errors unrelated to changes

---

### [ ] Step: Refine shadcn/ui Button Component

Update the Button component for a softer, more refined appearance aligned with shadcn best practices.

**Tasks:**
1. Update `src/components/ui/button.tsx`:
   - Soften hover states
   - Refine outline variant border and background
   - Ensure consistent focus ring styling

**Verification:**
- Visual check of all button variants in both themes
- Test export buttons functionality

---

### [ ] Step: Update Main Layout (Index Page)

Refine the main page layout for cleaner visual hierarchy and improved spacing.

**Tasks:**
1. Update `src/pages/Index.tsx`:
   - Refine header styling (lighter border, adjusted spacing)
   - Update section headers (sentence case, refined typography)
   - Soften empty state placeholder styling
   - Adjust sidebar panel styling for subtler appearance
   - Refine footer styling
   - Update privacy notice card styling

**Verification:**
- `npm run lint`
- Visual check: empty state and loaded state in both themes

---

### [ ] Step: Refine Image Upload Components

Update ImageLoader for a cleaner drop zone experience.

**Tasks:**
1. Update `src/components/ImageLoader.tsx`:
   - Change from `border-2` to `border`
   - Soften dashed border appearance
   - Refine icon and text styling

**Verification:**
- Visual check of upload buttons
- Test file upload and paste functionality

---

### [ ] Step: Refine Control Panel Components

Update the preset, palette, and options pickers for visual consistency.

**Tasks:**
1. Update `src/components/PresetPicker.tsx`:
   - Remove redundant label (handled by parent)
   - Soften button borders and selected states
2. Update `src/components/PalettePicker.tsx`:
   - Remove redundant label
   - Refine swatch card styling
3. Update `src/components/ControlPanel.tsx`:
   - Soften toggle button borders
   - Refine selected state appearance

**Verification:**
- Visual check of all picker components
- Test preset/palette/option selection functionality

---

### [ ] Step: Refine Export and Preview Components

Update export buttons and canvas preview for visual consistency.

**Tasks:**
1. Update `src/components/ExportButtons.tsx`:
   - Ensure consistent button spacing
2. Update `src/components/CanvasPreview.tsx`:
   - Refine container border and background

**Verification:**
- Visual check of export button group
- Test all export functions (copy, download, 4K, SVG)

---

### [ ] Step: Refine Theme Toggle and Tweet Components

Update remaining components for design system alignment.

**Tasks:**
1. Update `src/components/ThemeToggle.tsx`:
   - Refine container styling
2. Update `src/components/TweetLoader.tsx`:
   - Align input/button styling with design system
3. Update `src/components/TweetCard.tsx`:
   - Replace hardcoded colors with design tokens

**Verification:**
- Visual check of theme toggle
- Test theme switching
- Visual check of tweet loader

---

### [ ] Step: Final Verification and Cleanup

Run all checks and ensure the revamp is complete.

**Tasks:**
1. Run `npm run lint` and fix any issues
2. Run `npm run test` and ensure all tests pass
3. Run `npm run build` and verify production build
4. Manual visual inspection of entire app in both themes
5. Write implementation report to `report.md`

**Verification:**
- All automated checks pass
- No visual regressions
- Both themes look polished and minimal
