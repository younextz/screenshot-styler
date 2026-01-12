# Technical Specification: Gradient Styles Revamp

## Task Difficulty: Medium

This task involves revamping the background presets for the screenshot styler to optimize them for social media sharing. It requires redesigning gradient/background styles based on competitor analysis, updating existing SVG rendering functions, and potentially adding new preset types.

---

## Technical Context

### Language & Framework
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Rendering**: SVG-based (generated via TypeScript functions)

### Dependencies
- No new dependencies required
- All changes are to existing TypeScript/SVG code

---

## Current Implementation Analysis

### Existing Presets (12 total)
Current presets in `src/lib/presets.ts`:

**Background Presets (6):**
1. `gradient-soft` - Basic linear gradient (swatches[0-1])
2. `gradient-bold` - Diagonal gradient (swatches[2-4])
3. `mesh-gradient` - Two overlaid radial gradients
4. `blob-duo` - Two blurred ellipses
5. `blob-trio` - Three blurred ellipses
6. `dot-grid` - Pattern-based with dots

**Frame Presets (4):** `browser-macos`, `browser-windows`, `device-laptop`, `device-phone`

**Card Presets (2):** `card-elevated`, `card-outlined`

### Existing Palettes (17 total)
Located in `src/lib/palettes.ts` - color palettes with 5 swatches each.

### Current Issues
1. **Generic naming** - "Gradient Soft/Bold" don't convey visual appeal
2. **Limited variety** - Only 6 background styles; competitors offer 15-30+
3. **Outdated aesthetics** - Missing trendy styles like liquid/aurora gradients
4. **Flat blob styles** - Current blobs lack depth and dynamism
5. **No solid color option** - Many users prefer clean, minimal backgrounds

---

## Competitive Analysis

Based on research of [Pika.style](https://pika.style), [CleanShot X](https://cleanshot.com), [Xnapper](https://setapp.com/apps/xnapper), [InstantGradient](https://instantgradient.com/), and other screenshot beautifiers:

### Popular Background Categories
1. **Solid colors** - Clean, minimal backgrounds
2. **Linear gradients** - Classic two/three color transitions
3. **Mesh/Aurora gradients** - Soft, flowing color blends
4. **Glassmorphism** - Frosted glass effect with blur
5. **Noise textures** - Grainy, organic feel
6. **Geometric patterns** - Dots, grids, waves

### Trending Color Combinations (2024-2025)
1. **Purple-Pink-Blue** (Instagram/Y2K aesthetic)
2. **Sunset/Aurora** (warm to cool transitions)
3. **Pastel gradients** (soft, dreamy)
4. **Neon/Cyberpunk** (electric blues, pinks, greens)
5. **Dark moody** (deep purples, navies)
6. **Minimal monochrome** (grayscale variations)

### Naming Conventions from Competitors
- Evocative names: "Sunset", "Ocean", "Aurora", "Midnight"
- Color-based: "Rose Gold", "Electric Blue", "Deep Purple"
- Theme-based: "Cosmic", "Tropical", "Nordic"

---

## Implementation Approach

### Strategy: Replace & Enhance

Rather than keeping backward compatibility with old preset IDs, we'll:
1. **Replace all 6 background presets** with new, social-media-optimized designs
2. **Add new preset types** for variety (aurora, glass, solid)
3. **Update palette colors** to complement new presets better
4. **Improve SVG rendering** for richer visual effects

### New Preset List (16 Background Presets)

#### Gradient Category (6 presets)
| ID | Label | Description |
|----|-------|-------------|
| `gradient-sunset` | Sunset | Warm orange-pink-purple horizontal gradient |
| `gradient-ocean` | Ocean | Cool blue-teal diagonal gradient |
| `gradient-aurora` | Aurora | Multi-color flowing gradient (purple-blue-green) |
| `gradient-rose` | Rose Gold | Soft pink-peach gradient |
| `gradient-midnight` | Midnight | Deep purple-blue dark gradient |
| `gradient-mint` | Fresh Mint | Green-teal light gradient |

#### Mesh Category (4 presets)
| ID | Label | Description |
|----|-------|-------------|
| `mesh-cosmic` | Cosmic | Purple-pink-blue flowing mesh |
| `mesh-tropical` | Tropical | Orange-pink-cyan vibrant mesh |
| `mesh-pastel` | Pastel Dream | Soft pastel multi-color mesh |
| `mesh-neon` | Neon Glow | Electric blue-pink-green mesh |

#### Solid/Minimal Category (3 presets)
| ID | Label | Description |
|----|-------|-------------|
| `solid-dark` | Slate | Clean dark gray background |
| `solid-light` | Cloud | Clean light gray/white background |
| `solid-gradient` | Subtle | Very subtle monochrome gradient |

#### Pattern Category (3 presets)
| ID | Label | Description |
|----|-------|-------------|
| `pattern-dots` | Dot Matrix | Grid of dots on solid background |
| `pattern-grid` | Grid Lines | Subtle grid pattern |
| `pattern-noise` | Grain | Textured noise background |

---

## Source Code Structure Changes

### Files to Modify

#### 1. `src/lib/presets.ts`
- Replace existing background preset definitions
- Add new preset IDs and labels
- Total: 16 background presets + 4 frame presets + 2 card presets = 22 presets

#### 2. `src/lib/svgRenderer.ts`
- Remove old generator functions: `generateGradientSoft`, `generateGradientBold`, `generateBlobDuo`, `generateBlobTrio`, `generateMeshGradient`, `generateDotGrid`
- Add new generator functions for each new preset
- Update `generateSVG` switch statement
- Enhance `softOverlays` function for better effects

#### 3. `src/lib/palettes.ts`
- Reorder palettes to put best-matching ones first
- Add 3-4 new palettes optimized for new presets
- Consider renaming some palettes for clarity

#### 4. `src/components/PresetPicker.tsx`
- Add visual preview thumbnails for each preset (optional enhancement)
- Group presets by category for better UX

### Files Unchanged
- `src/components/PalettePicker.tsx` - Works with any palette array
- `src/components/ControlPanel.tsx` - Preset-agnostic
- `src/pages/Index.tsx` - Preset-agnostic
- Storage/export functionality - Preset-agnostic

---

## Data Model / API Changes

### Preset Interface (unchanged)
```typescript
interface Preset {
  id: string;
  label: string;
  kind: 'background' | 'frame' | 'card';
  supportsTitle: boolean;
}
```

### Palette Interface (unchanged)
```typescript
interface Palette {
  id: string;
  label: string;
  swatches: string[]; // 5 hex colors
}
```

### New SVG Generator Function Signatures
```typescript
// Linear gradients
function generateGradientSunset(palette: Palette, width: number, height: number): string
function generateGradientOcean(palette: Palette, width: number, height: number): string
function generateGradientAurora(palette: Palette, width: number, height: number): string
function generateGradientRose(palette: Palette, width: number, height: number): string
function generateGradientMidnight(palette: Palette, width: number, height: number): string
function generateGradientMint(palette: Palette, width: number, height: number): string

// Mesh gradients
function generateMeshCosmic(palette: Palette, width: number, height: number): string
function generateMeshTropical(palette: Palette, width: number, height: number): string
function generateMeshPastel(palette: Palette, width: number, height: number): string
function generateMeshNeon(palette: Palette, width: number, height: number): string

// Solid backgrounds
function generateSolidDark(palette: Palette, width: number, height: number): string
function generateSolidLight(palette: Palette, width: number, height: number): string
function generateSolidGradient(palette: Palette, width: number, height: number): string

// Patterns
function generatePatternDots(palette: Palette, width: number, height: number): string
function generatePatternGrid(palette: Palette, width: number, height: number): string
function generatePatternNoise(palette: Palette, width: number, height: number): string
```

---

## Visual Design Specifications

### Gradient Sunset
```svg
<!-- Horizontal gradient: warm orange → pink → soft purple -->
<linearGradient x1="0%" y1="50%" x2="100%" y2="50%">
  <stop offset="0%" stop-color="#FF6B35" />
  <stop offset="50%" stop-color="#FF4081" />
  <stop offset="100%" stop-color="#7B68EE" />
</linearGradient>
```

### Gradient Ocean
```svg
<!-- Diagonal gradient: deep blue → teal → light cyan -->
<linearGradient x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stop-color="#1A237E" />
  <stop offset="50%" stop-color="#00838F" />
  <stop offset="100%" stop-color="#4DD0E1" />
</linearGradient>
```

### Mesh Cosmic
```svg
<!-- Multiple radial gradients creating aurora-like effect -->
<!-- Uses 3-4 overlapping radial gradients with varying positions -->
<!-- Colors: Purple (#9C27B0), Blue (#2196F3), Pink (#E91E63), Cyan (#00BCD4) -->
```

### Pattern Grid
```svg
<!-- Subtle grid lines on solid background -->
<pattern width="40" height="40">
  <line x1="40" y1="0" x2="40" y2="40" stroke="rgba(255,255,255,0.1)" />
  <line x1="0" y1="40" x2="40" y2="40" stroke="rgba(255,255,255,0.1)" />
</pattern>
```

---

## Verification Approach

### Automated Testing
```bash
# Run existing tests
npm run test

# Run linter
npm run lint

# Build for production (catches TypeScript errors)
npm run build
```

### Manual Verification
1. Start dev server: `npm run dev`
2. Upload a test screenshot
3. Cycle through all 16 new background presets
4. Test with multiple palettes (light and dark)
5. Verify export functionality (PNG, SVG, 4K)
6. Test all aspect ratios (auto, 1:1, 16:9, 4:3)
7. Check frame presets still work correctly

### Visual Quality Checklist
- [ ] Gradients look smooth without banding
- [ ] Mesh gradients have organic, flowing appearance
- [ ] Patterns are not too busy or distracting
- [ ] Solid backgrounds provide good contrast
- [ ] All presets work well with both light and dark palettes
- [ ] Screenshot remains the focal point (not overpowered by background)

---

## Implementation Plan

### Step 1: Update Presets Definition
- Modify `src/lib/presets.ts` with new preset array
- Keep frame and card presets unchanged

### Step 2: Implement New SVG Generators
- Add all new generator functions to `src/lib/svgRenderer.ts`
- Update the switch statement in `generateSVG`
- Remove old unused generator functions

### Step 3: Update Palettes
- Reorder existing palettes for better defaults
- Add new complementary palettes if needed
- Ensure good variety for light/dark themes

### Step 4: Enhance PresetPicker UI (Optional)
- Add category grouping for better organization
- Consider adding small visual previews

### Step 5: Testing & Refinement
- Run build and tests
- Manual visual testing
- Adjust colors/effects as needed

---

## Risk Assessment

### Low Risk
- Preset/palette changes are self-contained
- No changes to core rendering logic
- No external API changes

### Considerations
- **localStorage**: Users with saved preset IDs will fall back to default (acceptable)
- **Browser compatibility**: SVG filters work in all modern browsers
- **Performance**: No significant rendering performance changes expected

---

## Sources & References

- [Pika.style](https://pika.style) - Screenshot editor with presets
- [CleanShot X](https://cleanshot.com/features) - Background tool features
- [Xnapper](https://thesweetbits.com/tools/xnapper-review/) - Social presets
- [InstantGradient](https://instantgradient.com/) - Gradient backgrounds
- [Zanubio Gradient Guide](https://www.zanubio.com/blog/gradient-color-palettes-elevating-design-in-2024) - 2024 gradient trends
- [Enveos Color Trends](https://enveos.com/top-creative-color-gradient-trends-for-2025-a-bold-shift-in-design/) - 2025 gradient trends
