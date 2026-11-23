import { describe, expect, it } from 'vitest';
import {
  CENTERED_CROP,
  MAX_ZOOM,
  clampCrop,
  composeDeviceFrame,
  cropWindow,
  deviceCompositionSize,
  deviceLayout,
  panCrop,
  zoomCrop,
  type DeviceFrameAsset,
} from './composeDeviceFrame';

const FRAME: DeviceFrameAsset = {
  data: 'data:image/png;base64,ZnJhbWU=',
  width: 400,
  height: 800,
  screen: { x: 20, y: 30, width: 360, height: 740 },
};
const LANDSCAPE = { width: 2272, height: 1760 };
const PORTRAIT = { width: 1179, height: 2556 };

function covers(layout: ReturnType<typeof deviceLayout>): boolean {
  const { image, screen } = layout;
  const epsilon = 1e-3;
  return image.x <= screen.x + epsilon
    && image.y <= screen.y + epsilon
    && image.x + image.width >= screen.x + screen.width - epsilon
    && image.y + image.height >= screen.y + screen.height - epsilon;
}

describe('crop geometry', () => {
  it('crops to the screen aspect ratio at zoom 1', () => {
    const visible = cropWindow(LANDSCAPE, FRAME.screen, CENTERED_CROP);
    expect(visible.width / visible.height).toBeCloseTo(360 / 740);
    expect(visible.height).toBe(LANDSCAPE.height);
    expect(visible.x).toBeCloseTo((LANDSCAPE.width - visible.width) / 2);
  });

  it('keeps zoom between 1× and 4×', () => {
    expect(zoomCrop(PORTRAIT, FRAME.screen, CENTERED_CROP, 10).zoom).toBe(MAX_ZOOM);
    expect(zoomCrop(PORTRAIT, FRAME.screen, CENTERED_CROP, 0.2).zoom).toBe(1);
    expect(clampCrop(PORTRAIT, FRAME.screen, { zoom: Number.NaN, centerX: Number.NaN, centerY: 0.5 })).toEqual(CENTERED_CROP);
  });

  it('pans like dragging and stops at the screenshot edges', () => {
    const moved = panCrop(LANDSCAPE, FRAME.screen, CENTERED_CROP, 50, 0);
    expect(moved.centerX).toBeLessThan(0.5);
    expect(moved.centerY).toBe(0.5);
    const farLeft = panCrop(LANDSCAPE, FRAME.screen, CENTERED_CROP, 1e6, 1e6);
    const visible = cropWindow(LANDSCAPE, FRAME.screen, farLeft);
    expect(visible.x).toBeCloseTo(0);
    expect(visible.y).toBeCloseTo(0);
    // At zoom 1 a landscape screenshot already fills the screen height: no vertical movement.
    expect(farLeft.centerY).toBe(0.5);
  });

  it('never leaves part of the screen blank', () => {
    for (const source of [LANDSCAPE, PORTRAIT, { width: 1, height: 1 }]) {
      for (const zoom of [1, 1.7, 4]) {
        for (const [dx, dy] of [[0, 0], [1e5, -1e5], [-1e5, 1e5], [37, -12]]) {
          const crop = panCrop(source, FRAME.screen, zoomCrop(source, FRAME.screen, CENTERED_CROP, zoom), dx, dy);
          expect(covers(deviceLayout(source, FRAME, crop))).toBe(true);
        }
      }
    }
  });
});

describe('composeDeviceFrame', () => {
  it('pads the bezel evenly so it spans 80% of the picture height', () => {
    const { width, height, padding } = deviceCompositionSize(FRAME);
    expect(padding).toBe(100);
    expect(height * 0.8).toBe(FRAME.height);
    expect(width).toBe(FRAME.width + 200);
    expect(() => deviceCompositionSize({ width: 0, height: 10 })).toThrow();
  });

  it('draws background, clipped screenshot and the unchanged bezel on top', () => {
    const svg = composeDeviceFrame({
      imageData: 'data:image/png;base64,c2NyZWVu',
      imageWidth: PORTRAIT.width,
      imageHeight: PORTRAIT.height,
      backgroundData: 'data:image/png;base64,Ymc=',
      frame: FRAME,
      crop: CENTERED_CROP,
    });
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = document.documentElement;
    expect(root.getAttribute('width')).toBe('600');
    expect(root.getAttribute('height')).toBe('1000');
    const images = [...document.querySelectorAll('image')];
    expect(images.map((image) => image.getAttribute('href'))).toEqual([
      'data:image/png;base64,Ymc=',
      'data:image/png;base64,c2NyZWVu',
      FRAME.data,
    ]);
    const clip = document.querySelector('clipPath rect')!;
    expect([...clip.attributes].map((attribute) => `${attribute.name}=${attribute.value}`)).toEqual(['x=120', 'y=130', 'width=360', 'height=740']);
    expect(images[1].getAttribute('clip-path')).toBe('url(#device-screen-clip)');
    const bezel = images[2];
    expect(['x', 'y', 'width', 'height'].map((name) => bezel.getAttribute(name))).toEqual(['100', '100', '400', '800']);
    // Apple's guidelines: no shadow, tilt or other effects on the bezel.
    expect(svg).not.toMatch(/filter|transform|opacity/);
  });

  it('escapes attribute values', () => {
    const svg = composeDeviceFrame({
      imageData: 'data:"x"<y>&',
      imageWidth: 10,
      imageHeight: 10,
      backgroundData: 'bg',
      frame: FRAME,
      crop: CENTERED_CROP,
    });
    expect(svg).toContain('href="data:&quot;x&quot;&lt;y&gt;&amp;"');
  });
});
