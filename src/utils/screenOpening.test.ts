import { describe, expect, it } from 'vitest';
import { createSyntheticBezel } from '@/tests/syntheticBezel';
import { findScreenOpening } from './screenOpening';

describe('findScreenOpening', () => {
  it('finds the transparent screen and adds bleed under the anti-aliased edge', () => {
    const bezel = createSyntheticBezel();
    expect(findScreenOpening(bezel, { bleed: 0 })).toEqual(bezel.screen);
    expect(findScreenOpening(bezel)).toEqual({
      x: bezel.screen.x - 2,
      y: bezel.screen.y - 2,
      width: bezel.screen.width + 4,
      height: bezel.screen.height + 4,
    });
  });

  it('derives the crop ratio from the bezel rather than a fixed ratio', () => {
    const tall = findScreenOpening(createSyntheticBezel({ width: 100, height: 260 }), { bleed: 0 })!;
    const wide = findScreenOpening(createSyntheticBezel({ width: 160, height: 220 }), { bleed: 0 })!;
    expect(tall.width / tall.height).toBeCloseTo(78 / 238);
    expect(wide.width / wide.height).toBeCloseTo(138 / 198);
  });

  it('flows around an opaque camera cut-out inside the screen', () => {
    const bezel = createSyntheticBezel({ island: true });
    expect(findScreenOpening(bezel, { bleed: 0 })).toEqual(bezel.screen);
  });

  it('rejects bezels whose transparent centre reaches the image edge', () => {
    expect(findScreenOpening(createSyntheticBezel({ open: true }))).toBeNull();
  });

  it('rejects opaque images and holes too small to be a screen', () => {
    const opaque = createSyntheticBezel();
    for (let index = 3; index < opaque.data.length; index += 4) opaque.data[index] = 255;
    expect(findScreenOpening(opaque)).toBeNull();
    expect(findScreenOpening(createSyntheticBezel({ width: 60, height: 60, border: 24, radius: 2 }))).toBeNull();
  });

  it('rejects malformed pixel buffers', () => {
    expect(findScreenOpening({ width: 10, height: 10, data: new Uint8ClampedArray(12) })).toBeNull();
    expect(findScreenOpening({ width: 0, height: 10, data: new Uint8ClampedArray(0) })).toBeNull();
  });
});
