import { describe, expect, it } from 'vitest';
import { generateSVG } from './svgRenderer';

const BASE_OPTIONS: Parameters<typeof generateSVG>[0] = {
  presetId: 'bg-picture-dark',
  imageData: 'data:image/png;base64,AAA',
  imageWidth: 800,
  imageHeight: 400,
};

describe('generateSVG for picture backgrounds', () => {
  it('produces a valid SVG element', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain('<svg ');
    expect(svg).toContain('</svg>');
  });

  it('embeds the screenshot image', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain(BASE_OPTIONS.imageData);
  });

  it('sizes the canvas wider than the screenshot', () => {
    const svg = generateSVG(BASE_OPTIONS);
    const match = svg.match(/width="(\d+)"/);
    const svgWidth = match ? parseInt(match[1]) : 0;
    expect(svgWidth).toBeGreaterThan(BASE_OPTIONS.imageWidth);
  });

  it('applies rounded corners via clipPath', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain('rounded-clip');
    expect(svg).toContain('rx="24"');
  });

  it('applies a drop shadow filter', () => {
    const svg = generateSVG(BASE_OPTIONS);
    expect(svg).toContain('feDropShadow');
  });
});
