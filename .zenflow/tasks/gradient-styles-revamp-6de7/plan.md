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
<!-- chat-id: 53066259-aabd-4f17-8d1b-c15751f38da9 -->

**Completed**: Created `spec.md` with:
- Task difficulty assessment: **Medium**
- Competitive analysis of Pika.style, CleanShot X, Xnapper, InstantGradient
- New preset design: 16 background presets across 4 categories
- SVG rendering approach for each preset type
- Verification approach using existing test/lint/build commands

---

### [x] Step: Update Presets Definition
<!-- chat-id: 7434bcb0-e1fd-495b-b85a-096c3f419b9b -->

Modify `src/lib/presets.ts` with the new preset array:
- Replace 6 existing background presets with 16 new ones
- Organize into categories: Gradients (6), Mesh (4), Solid (3), Pattern (3)
- Keep frame presets (4) and card presets (2) unchanged
- Update preset labels with evocative names (Sunset, Ocean, Aurora, etc.)

**Verification**: `npm run build` should pass with no TypeScript errors

**Completed**: Updated `src/lib/presets.ts` with 16 new background presets:
- Gradients (6): Sunset, Ocean, Aurora, Rose Gold, Midnight, Fresh Mint
- Mesh (4): Cosmic, Tropical, Pastel Dream, Neon Glow
- Solid (3): Slate, Cloud, Subtle
- Pattern (3): Dot Matrix, Grid Lines, Grain
- Build passes with no TypeScript errors

---

### [x] Step: Implement SVG Generators
<!-- chat-id: ee87beb0-6a53-4598-bcc5-ef0915eb0cb6 -->

Update `src/lib/svgRenderer.ts` with new background generators:

1. **Gradient generators** (6 functions):
   - `generateGradientSunset` - Warm orange-pink-purple horizontal
   - `generateGradientOcean` - Cool blue-teal diagonal
   - `generateGradientAurora` - Multi-color flowing gradient
   - `generateGradientRose` - Soft pink-peach
   - `generateGradientMidnight` - Deep purple-blue dark
   - `generateGradientMint` - Green-teal light

2. **Mesh generators** (4 functions):
   - `generateMeshCosmic` - Purple-pink-blue flowing
   - `generateMeshTropical` - Orange-pink-cyan vibrant
   - `generateMeshPastel` - Soft pastel multi-color
   - `generateMeshNeon` - Electric blue-pink-green

3. **Solid generators** (3 functions):
   - `generateSolidDark` - Clean dark gray
   - `generateSolidLight` - Clean light gray/white
   - `generateSolidGradient` - Subtle monochrome gradient

4. **Pattern generators** (3 functions):
   - `generatePatternDots` - Grid of dots
   - `generatePatternGrid` - Subtle grid lines
   - `generatePatternNoise` - Textured noise

5. Update `generateSVG` switch statement
6. Remove old unused generator functions

**Verification**: `npm run build` and `npm run test`

**Completed**: Updated `src/lib/svgRenderer.ts` with all 16 new background generators:
- Replaced 6 old generator functions with 16 new ones
- Each generator uses palette swatches for color flexibility
- All generators include `softOverlays()` for consistent grain/vignette effects
- Gradient presets: linear gradients with varying directions and multiple stops
- Mesh presets: 4 overlapping radial gradients for flowing aurora-like effects
- Solid presets: clean backgrounds with optional subtle gradients
- Pattern presets: dots, grid lines, and noise textures
- Updated `generateSVG` switch statement with all new preset IDs
- Build passes with no TypeScript errors
- All 6 tests pass

---

### [ ] Step: Update Palettes (Optional Enhancement)

Modify `src/lib/palettes.ts`:
- Reorder palettes to put most versatile ones first
- Add 2-3 new palettes optimized for new gradient styles
- Ensure good variety for both light and dark themes

**Verification**: Visual testing with dev server

---

### [ ] Step: Testing & Refinement

1. Run automated checks:
   - `npm run lint`
   - `npm run test`
   - `npm run build`

2. Manual visual testing:
   - Test all 16 background presets with multiple palettes
   - Verify export functionality (PNG, SVG, 4K)
   - Test all aspect ratios
   - Ensure frame/card presets still work

3. Write completion report to `report.md`

**Verification**: All tests pass, visual quality meets standards
