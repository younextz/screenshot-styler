import { describe, expect, it } from 'vitest';
import { generateSVG } from './svgRenderer';
import { BACKGROUND_IMAGE_URLS } from './backgroundAssets';

const BASE_OPTIONS: Parameters<typeof generateSVG>[0] = {
  variant: 'dark',
  imageData: 'data:image/png;base64,AAA',
  imageWidth: 800,
  imageHeight: 400,
};

describe('generateSVG', () => {
  it.each(['dark', 'light'] as const)('keeps odd-sized source pixels aligned for %s', (variant) => {
    const svg = generateSVG({ ...BASE_OPTIONS, variant, imageWidth: 1259, imageHeight: 768 });
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = document.documentElement;
    expect(root.getAttribute('color-interpolation-filters')).toBe('sRGB');
    const image = document.querySelector('g image')!;
    const x = Number(image.getAttribute('x'));
    const y = Number(image.getAttribute('y'));
    expect(Number.isInteger(x)).toBe(true);
    expect(Number.isInteger(y)).toBe(true);
    expect(image.getAttribute('width')).toBe('1259');
    expect(image.getAttribute('height')).toBe('768');
    expect(Number(root.getAttribute('width')) - x - 1259).toBe(x);
    expect(Number(root.getAttribute('height')) - y - 768).toBe(y);
  });

  it('sizes the output so the screenshot spans 80% of the width with even padding', () => {
    const svg = generateSVG(BASE_OPTIONS);
    // 800 / 0.8 = 1000 wide, 100 padding on each side, 400 + 200 tall
    expect(svg).toContain('width="1000" height="600"');
    expect(svg).toContain('x="100" y="100"');
  });

  it('renders the background image matching the variant', () => {
    expect(generateSVG(BASE_OPTIONS)).toContain(BACKGROUND_IMAGE_URLS.dark);
    expect(generateSVG({ ...BASE_OPTIONS, variant: 'light' })).toContain(
      BACKGROUND_IMAGE_URLS.light,
    );
  });

  it('embeds the screenshot with rounded clipping and a drop shadow', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain(BASE_OPTIONS.imageData);
    expect(svg).toContain('clip-path="url(#rounded-clip)"');
    expect(svg).toContain('filter="url(#shadow)"');
  });
});
