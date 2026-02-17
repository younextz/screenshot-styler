import { describe, expect, it } from 'vitest';
import { generateSVG } from './svgRenderer';
import { palettes } from './palettes';
const BASE_OPTIONS: Parameters<typeof generateSVG>[0] = {
  presetId: 'gradient-sunset',
  palette: palettes[0],
  titleBar: 'none',
  aspectRatio: 'auto',
  imageData: 'data:image/png;base64,AAA',
  imageWidth: 800,
  imageHeight: 400,
};
describe('generateSVG animation behavior', () => {
  it('includes animate nodes for animated presets when animation is enabled', () => {
    const svg = generateSVG({
      ...BASE_OPTIONS,
      animation: {
        type: 'flow',
        speed: 'medium',
        enabled: true,
      },
    });
    expect(svg).toContain('<animate ');
  });
  it('omits animate nodes when animation is disabled', () => {
    const svg = generateSVG({
      ...BASE_OPTIONS,
      animation: {
        type: 'flow',
        speed: 'medium',
        enabled: false,
      },
    });
    expect(svg).not.toContain('<animate ');
  });
  it('respects animation disable flag for the wave preset', () => {
    const svg = generateSVG({
      ...BASE_OPTIONS,
      presetId: 'gradient-wave',
      animation: {
        type: 'flow',
        speed: 'medium',
        enabled: false,
      },
    });
    expect(svg).not.toContain('<animate ');
  });
});
