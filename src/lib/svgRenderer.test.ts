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

  it('resizes the screenshot inside an unchanged canvas when screenshotScale is set', () => {
    const svg = generateSVG({ ...BASE_OPTIONS, screenshotScale: 0.5 });
    expect(svg).toContain('width="1000" height="600"');
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const image = document.querySelector('g image')!;
    expect(image.getAttribute('width')).toBe('400');
    expect(image.getAttribute('height')).toBe('200');
    expect(image.getAttribute('x')).toBe('300');
    expect(image.getAttribute('y')).toBe('200');
  });

  it('clamps screenshotScale so the screenshot stays inside the canvas', () => {
    const oversized = generateSVG({ ...BASE_OPTIONS, screenshotScale: 5 });
    const undersized = generateSVG({ ...BASE_OPTIONS, screenshotScale: 0.01 });
    const parse = (svg: string) =>
      new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('g image')!;
    // Max scale is 1.2 for a landscape source; min is 0.25.
    expect(parse(oversized).getAttribute('width')).toBe('960');
    expect(parse(undersized).getAttribute('width')).toBe('200');
  });

  it('embeds the screenshot with rounded clipping and a drop shadow', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain(BASE_OPTIONS.imageData);
    expect(svg).toContain('clip-path="url(#rounded-clip)"');
    expect(svg).toContain('filter="url(#shadow)"');
  });
});
