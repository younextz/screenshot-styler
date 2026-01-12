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

### [x] Step: Refine shadcn/ui Button Component
<!-- chat-id: 2f2dc2cd-511c-443c-b9ba-9cd4779beebe -->

Completed. Updated Button component for softer, more refined appearance.

**Changes Made:**
1. Updated `src/components/ui/button.tsx`:
   - Changed `transition-colors` to `transition-all duration-200` for smoother state changes
   - Softened hover states from `/90` to `/85` opacity for default and destructive variants
   - Added `active` states (`/80` and `/70`) for tactile feedback
   - Refined outline variant: `border-border` instead of `border-input`, `bg-transparent`, `hover:bg-accent/50`
   - Added subtle `shadow-sm` to default, destructive, and secondary variants
   - Refined ghost variant with `/50` and `/70` opacity levels
   - Added `hover:text-primary/80` to link variant for subtle hover effect
   - Added `text-xs` to small size variant for better proportion

**Verification:**
- `npm run build` - passed successfully

---

### [x] Step: Update Main Layout (Index Page)
<!-- chat-id: 0b04ad31-0131-468a-9cda-7d9c3054490f -->

Completed. Refined the main page layout for cleaner visual hierarchy and improved spacing.

**Changes Made:**
1. Updated `src/pages/Index.tsx`:
   - Refined header: lighter border (`border-border/60`), reduced padding (`px-8 py-5`), smaller title (`text-xl font-medium`)
   - Updated section headers: sentence case typography, changed from uppercase tracking to `text-sm font-medium text-foreground`
   - Softened empty state: lighter border/background (`border-border/40 bg-card/30`), smaller icon container, refined text hierarchy
   - Adjusted sidebar: lighter border, reduced padding (`py-6`), tighter spacing between sections (`space-y-8`)
   - Refined tweet loader card: lighter styling (`border-border/40 bg-muted/20`)
   - Softened privacy notice: neutral styling instead of accent-colored (`border-border/30 bg-muted/10`)
   - Refined footer: lighter border and text (`border-border/40`, `text-muted-foreground/70`)

**Verification:**
- `npm run build` - passed successfully
- Pre-existing lint errors unrelated to changes

---

### [x] Step: Refine Image Upload Components
<!-- chat-id: 0c88c47e-eb3e-44dd-ae02-5bcde674b4f7 -->

Completed. Refined ImageLoader for a cleaner, minimal drop zone experience.

**Changes Made:**
1. Updated `src/components/ImageLoader.tsx`:
   - Changed from `border-2` to `border` for softer appearance
   - Softened dashed border with `border-border/60` and subtle hover state `hover:border-border`
   - Reduced button height from `h-32` to `h-28` for tighter layout
   - Added subtle background hover effect `hover:bg-muted/30`
   - Changed transition from `transition-colors` to `transition-all duration-200` for smoother feedback
   - Reduced icon size from `w-8 h-8` to `w-6 h-6` with `text-muted-foreground` color
   - Tightened inner gap from `gap-2` to `gap-1.5`
   - Softened helper text with `text-muted-foreground/70`

**Verification:**
- `npm run build` - passed successfully

---

### [x] Step: Refine Control Panel Components
<!-- chat-id: 7993ae6a-6d7d-4eb7-adfb-174d70ba206e -->

Completed. Refined all control panel components for visual consistency and minimal aesthetic.

**Changes Made:**
1. Updated `src/components/PresetPicker.tsx`:
   - Removed redundant label wrapper (handled by parent section)
   - Changed `border-2` to `border` for softer appearance
   - Softened border colors: `border-border/60` default, `border-primary/60` selected
   - Reduced padding from `py-3` to `py-2.5` for tighter layout
   - Changed hover to `hover:border-border hover:bg-muted/50` (neutral instead of primary)
   - Added `transition-all duration-200` for smoother state changes
   - Softened selected state: `bg-primary/5` instead of `bg-primary/10`

2. Updated `src/components/PalettePicker.tsx`:
   - Removed redundant label wrapper
   - Changed gap from `gap-3` to `gap-2` for tighter grid
   - Softened padding from `p-3` to `p-2.5`
   - Changed `border-2` to `border` with `/60` opacity
   - Added `hover:border-border hover:bg-muted/30` for subtle hover effect
   - Reduced swatch height from `h-6` to `h-5`, added `rounded-sm`
   - Tightened swatch margin from `mb-2` to `mb-1.5`
   - Added `text-muted-foreground` to palette label

3. Updated `src/components/ControlPanel.tsx`:
   - Reduced label/button spacing from `space-y-3` to `space-y-2`
   - Changed labels to `text-xs font-medium text-muted-foreground` with sentence case
   - Softened disabled state indicator to `/60` opacity
   - Changed `border-2` to `border` with consistent `/60` opacity
   - Reduced disabled opacity from `/50` to `/40`
   - Updated hover states to neutral `hover:border-border hover:bg-muted/50`
   - Changed aspect ratio grid to `grid-cols-4` for all 4 options in one row

**Verification:**
- `npm run build` - passed successfully

---

### [x] Step: Refine Export and Preview Components
<!-- chat-id: a6f621cd-b9f6-4d33-bf39-af4c187d96cd -->

Completed. Refined export buttons and canvas preview for visual consistency.

**Changes Made:**
1. Updated `src/components/ExportButtons.tsx`:
   - Simplified grid layout to `grid-cols-2` with `gap-2` for tighter spacing
   - Made "Copy PNG" primary action span full width (`col-span-2`)
   - Reduced icon sizes from `w-5 h-5` to `w-4 h-4` for better proportion
   - Changed secondary buttons from `size="lg"` to `size="default"` for visual hierarchy
   - Simplified button labels ("PNG (Original)" → "PNG", "PNG 4K" → "4K")
   - Made "Download SVG" span full width for balanced layout

2. Updated `src/components/CanvasPreview.tsx`:
   - Changed from `rounded-2xl` to `rounded-xl` for consistency with other components
   - Softened border from `border-border` to `border-border/40`
   - Reduced background from `bg-muted/30` to `bg-muted/20`
   - Simplified padding from responsive `px-3 py-6 sm:px-4 sm:py-8` to uniform `p-4`
   - Added `transition-colors duration-200` for smoother theme transitions
   - Reduced drop shadow from `drop-shadow-2xl` to `drop-shadow-xl` for subtler effect

**Verification:**
- `npm run build` - passed successfully

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
