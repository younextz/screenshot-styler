# Technical Specification: UI Aesthetics Revamp

## Task Difficulty: Medium

The task involves updating the visual design across multiple UI components while maintaining existing functionality. It requires careful attention to design consistency, shadcn best practices, and ensuring the changes work harmoniously across both light and dark themes.

---

## Technical Context

### Language & Framework
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS v3** with CSS custom properties for theming
- **shadcn/ui** component library (default style, CSS variables enabled)

### Key Dependencies
- `@radix-ui/react-*` primitives for accessible components
- `class-variance-authority` for variant styling
- `tailwind-merge` for class composition
- `lucide-react` for iconography
- `tailwindcss-animate` for animations

### Current Architecture
- Single-page application with sidebar/main content layout
- Theme system using `data-theme` attribute on `:root`
- CSS custom properties for all design tokens (HSL format)
- Existing shadcn/ui components: Button, Input, Switch, Toast, Tooltip

---

## Current UI Assessment

### Issues Identified
1. **Inconsistent spacing** - Mixed use of spacing values across components
2. **Heavy visual weight** - Dense layouts with insufficient breathing room
3. **Overly complex color usage** - JetBrains-inspired palette feels busy
4. **Border treatments** - `border-2` throughout creates visual heaviness
5. **Typography hierarchy** - Section headers using uppercase tracking feels dated
6. **TweetCard component** - Uses hardcoded Tailwind classes instead of design tokens
7. **App.css** - Contains unused Vite boilerplate styles
8. **Animation usage** - Existing keyframes not fully utilized

### What's Working Well
- Solid foundation with CSS custom properties
- Properly configured shadcn/ui setup
- Good component separation
- Working light/dark theme toggle

---

## Implementation Approach

### Design Philosophy (shadcn best practices)
1. **Minimalism** - Clean, uncluttered interfaces with generous whitespace
2. **Subtle borders** - Use `border` (1px) instead of `border-2`
3. **Softer backgrounds** - Muted backgrounds with low opacity variants
4. **Refined typography** - Sentence case headers, tighter tracking
5. **Consistent spacing** - Use Tailwind's spacing scale systematically
6. **Smooth transitions** - Subtle animations for state changes
7. **Focus on content** - UI should recede, content should shine

### Color Strategy Refinements
- Simplify primary palette for cleaner aesthetic
- Softer accent colors that don't compete with content
- Better contrast ratios in both themes
- Reduce use of colored borders and backgrounds

---

## Source Code Structure Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Refine CSS custom properties, softer color palette, updated shadows |
| `src/pages/Index.tsx` | Refined layout, improved spacing, softer section styling |
| `src/components/ControlPanel.tsx` | Lighter button styling, refined grid, subtle borders |
| `src/components/PresetPicker.tsx` | Cleaner card-style buttons, better visual hierarchy |
| `src/components/PalettePicker.tsx` | Refined swatch display, softer selection states |
| `src/components/ImageLoader.tsx` | Lighter drop zones, refined iconography |
| `src/components/ExportButtons.tsx` | Refined button group styling |
| `src/components/CanvasPreview.tsx` | Cleaner container styling |
| `src/components/ThemeToggle.tsx` | Refined toggle appearance |
| `src/components/TweetLoader.tsx` | Align with design system |
| `src/components/TweetCard.tsx` | Replace hardcoded colors with design tokens |
| `src/components/ui/button.tsx` | Refine variants for softer appearance |
| `src/App.css` | Remove unused Vite boilerplate |
| `tailwind.config.ts` | Add any additional utility animations |

### No New Files Required
All changes will be made to existing files following shadcn patterns.

---

## Data Model / API / Interface Changes

None required. This is a purely visual refactoring task.

---

## Verification Approach

### Automated
```bash
npm run lint      # Ensure no ESLint errors
npm run test      # Run existing Vitest suite
npm run build     # Verify production build succeeds
```

### Manual Testing Checklist
- [ ] Light theme appearance is clean and minimal
- [ ] Dark theme appearance is clean and minimal
- [ ] Theme toggle works smoothly
- [ ] All interactive elements have proper hover/focus states
- [ ] Image upload flow works correctly
- [ ] Export buttons function properly
- [ ] Preset/palette pickers are visually consistent
- [ ] No visual regressions in component functionality
- [ ] Responsive behavior on different screen sizes

---

## Key Design Decisions

1. **Border weight**: Change from `border-2` to `border` throughout
2. **Section headers**: Switch from uppercase tracking to sentence case with medium weight
3. **Button states**: Softer backgrounds for selected state (5-10% opacity vs 10%)
4. **Container backgrounds**: Use `bg-muted/5` or `bg-card/40` for subtle depth
5. **Spacing rhythm**: Use `space-y-6` or `space-y-8` for section spacing
6. **Shadow usage**: Subtle shadows for depth, avoid heavy drop shadows on UI elements
7. **Animation**: Add subtle transitions on interactive elements

---

## Risk Assessment

**Low Risk**:
- Changes are cosmetic only
- Existing functionality remains unchanged
- All changes can be verified visually and with existing tests

**Mitigation**:
- Incremental changes per component
- Test light/dark themes after each major change
- Run lint and build after each file modification
