# Plan: Dynamic Animated Background Gradients

## Overview

Add dynamic animated background gradients to the Screenshot Styler application. The feature will introduce smooth, mesmerizing gradient animations that enhance the visual appeal of styled screenshots while maintaining the existing architecture and performance standards.

## Current State

- All preset backgrounds are **static SVG gradients**
- No CSS/SVG animations applied to generated backgrounds
- Existing animation infrastructure in `tailwind.config.ts` (fade-in, scale-in, glow)
- SVG-based rendering supports native `<animate>` and `<animateTransform>` elements
- 20 presets organized by type: gradient, mesh, solid, pattern, picture, frame, device, card

## Implementation Plan

### Task 1: Create Animation Configuration System

**Goal:** Define animation types, speeds, and parameters in a reusable configuration.

**Subtasks:**
- [ ] Create `src/lib/animations.ts` with animation type definitions
- [ ] Define animation presets: `flow`, `pulse`, `rotate`, `wave`, `shimmer`
- [ ] Add timing configurations: `slow` (10s), `medium` (6s), `fast` (3s)
- [ ] Create utility functions to generate SVG `<animate>` elements
- [ ] Export TypeScript interfaces for animation parameters

**Files to create/modify:**
- Create: `src/lib/animations.ts`

---

### Task 2: Extend Preset Type Definitions

**Goal:** Update preset system to support animation configuration.

**Subtasks:**
- [ ] Add `animation` optional property to `Preset` interface in `presets.ts`
- [ ] Define `AnimationConfig` type: `{ type: AnimationType; speed: AnimationSpeed; enabled: boolean }`
- [ ] Add default animation configs to existing gradient and mesh presets
- [ ] Ensure backward compatibility (presets without animation work as before)

**Files to modify:**
- `src/lib/presets.ts`

---

### Task 3: Implement SVG Animation Generators

**Goal:** Create functions that inject SVG animation elements into gradient definitions.

**Subtasks:**
- [ ] Create `animateGradientFlow()` - animates gradient position/direction
- [ ] Create `animateGradientColors()` - animates color stop values
- [ ] Create `animateMeshBlobs()` - animates radial gradient positions (cx, cy)
- [ ] Create `animateOpacity()` - subtle pulsing opacity effects
- [ ] Create `animateFilter()` - animates filter parameters (blur, turbulence)
- [ ] Add support for `repeatCount="indefinite"` and smooth `calcMode="spline"`

**Files to modify:**
- `src/lib/svgRenderer.ts` (add animation injection functions)

---

### Task 4: Update Gradient Preset Renderers

**Goal:** Integrate animation generators into existing gradient presets.

**Subtasks:**
- [ ] Update `gradient-sunset` with horizontal flow animation
- [ ] Update `gradient-ocean` with wave-like diagonal animation
- [ ] Update `gradient-aurora` with multi-layer flowing effect
- [ ] Update `gradient-rose` with subtle shimmer animation
- [ ] Update `gradient-midnight` with slow color shift
- [ ] Update `gradient-mint` with gentle pulse effect

**Files to modify:**
- `src/lib/svgRenderer.ts` (gradient generation switch cases)

---

### Task 5: Update Mesh Preset Renderers

**Goal:** Add blob movement animations to mesh presets.

**Subtasks:**
- [ ] Update `mesh-cosmic` with floating blob animations
- [ ] Update `mesh-tropical` with organic movement patterns
- [ ] Update `mesh-pastel` with gentle position shifts
- [ ] Update `mesh-neon` with pulsing glow animation

**Files to modify:**
- `src/lib/svgRenderer.ts` (mesh generation switch cases)

---

### Task 6: Add Animation Toggle UI

**Goal:** Allow users to enable/disable animations per preview.

**Subtasks:**
- [ ] Add `animated` boolean state to `Index.tsx`
- [ ] Create animation toggle switch in `ControlPanel.tsx`
- [ ] Persist animation preference to localStorage via `storage.ts`
- [ ] Pass animation state to `generateSVG()` function
- [ ] Add appropriate ARIA labels for accessibility

**Files to modify:**
- `src/pages/Index.tsx`
- `src/components/ControlPanel.tsx`
- `src/lib/storage.ts`

---

### Task 7: Handle Export with Animations

**Goal:** Ensure animated SVGs export correctly and static PNGs capture a frame.

**Subtasks:**
- [ ] SVG export: Include animation elements (animated SVG file)
- [ ] PNG export: Capture current animation frame (static snapshot)
- [ ] Add tooltip explaining PNG captures static frame
- [ ] Consider adding "Export as GIF" or "Export as WebM" for future (out of scope)

**Files to modify:**
- `src/pages/Index.tsx` (export logic)
- `src/components/ExportButtons.tsx` (tooltip)

---

### Task 8: Performance Optimization

**Goal:** Ensure animations run smoothly without impacting performance.

**Subtasks:**
- [ ] Use `will-change: transform` hints where appropriate
- [ ] Implement `prefers-reduced-motion` media query support
- [ ] Pause animations when tab is not visible (Page Visibility API)
- [ ] Limit animation complexity on mobile devices
- [ ] Profile and optimize animation frame rates

**Files to modify:**
- `src/lib/svgRenderer.ts`
- `src/pages/Index.tsx`
- `src/index.css` (reduced motion styles)

---

### Task 9: Create New Animated-Only Presets

**Goal:** Add presets specifically designed for dynamic animations.

**Subtasks:**
- [ ] Create `animated-plasma` - complex multi-gradient plasma effect
- [ ] Create `animated-lava` - slow-moving lava lamp style
- [ ] Create `animated-holographic` - rainbow shimmer effect
- [ ] Create `animated-nebula` - space-like swirling colors
- [ ] Add new presets to preset picker with "Animated" category label

**Files to modify:**
- `src/lib/presets.ts`
- `src/lib/svgRenderer.ts`
- `src/components/PresetPicker.tsx` (category grouping)

---

### Task 10: Testing & Documentation

**Goal:** Ensure feature quality and document implementation.

**Subtasks:**
- [ ] Test animations across browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test export functionality with animated presets
- [ ] Verify reduced motion preference is respected
- [ ] Test mobile performance on various devices
- [ ] Update README.md with animation feature documentation
- [ ] Add inline code comments for animation logic

**Files to modify:**
- `README.md`
- Various test files if applicable

---

## Technical Notes

### SVG Animation Approach

Using native SVG `<animate>` elements for best performance:

```xml
<linearGradient id="grad1">
  <stop offset="0%" stop-color="#ff6b6b">
    <animate attributeName="stop-color"
             values="#ff6b6b;#feca57;#ff6b6b"
             dur="6s"
             repeatCount="indefinite"/>
  </stop>
</linearGradient>
```

### Animation Types

| Type | Description | Best For |
|------|-------------|----------|
| `flow` | Gradient moves across canvas | Linear gradients |
| `pulse` | Opacity/size oscillation | Mesh blobs, glows |
| `rotate` | Gradient angle rotation | Radial gradients |
| `wave` | Sinusoidal movement | Ocean, aurora effects |
| `shimmer` | Quick highlight pass | Metallic, holographic |

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  svg animate,
  svg animateTransform {
    animation: none;
    animation-duration: 0s;
  }
}
```

## Dependencies

No new dependencies required. Native SVG animations and existing Tailwind infrastructure are sufficient.

## Estimated Effort

| Task | Complexity | Est. Time |
|------|------------|-----------|
| Task 1: Animation Config | Low | 1-2 hours |
| Task 2: Extend Presets | Low | 30 min |
| Task 3: SVG Animation Generators | High | 3-4 hours |
| Task 4: Update Gradients | Medium | 2 hours |
| Task 5: Update Meshes | Medium | 2 hours |
| Task 6: Toggle UI | Low | 1 hour |
| Task 7: Export Handling | Medium | 1-2 hours |
| Task 8: Performance | Medium | 2 hours |
| Task 9: New Presets | Medium | 2-3 hours |
| Task 10: Testing & Docs | Low | 1-2 hours |

**Total Estimated: 16-20 hours**

## Success Criteria

- [ ] At least 6 existing presets have smooth animations
- [ ] At least 4 new animated-only presets created
- [ ] Animation toggle works and persists
- [ ] Exports function correctly (animated SVG, static PNG)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No noticeable performance degradation
- [ ] Feature documented in README
