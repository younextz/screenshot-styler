import { afterEach, beforeEach, expect, it, vi } from 'vitest';

class MockImage {
  static instances: MockImage[] = [];
  crossOrigin = '';
  src = '';
  naturalWidth = 3840;
  naturalHeight = 2160;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    MockImage.instances.push(this);
  }
}

beforeEach(() => {
  vi.resetModules();
  MockImage.instances = [];
  vi.stubGlobal('Image', MockImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,Ymc=');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('shares in-flight work, embeds PNG data, and leaves the other variant unloaded', async () => {
  const { preloadBackgroundImage, getBackgroundImageDataUrl } = await import('./backgroundAssets');
  const first = preloadBackgroundImage('light');
  const second = preloadBackgroundImage('light');
  expect(MockImage.instances).toHaveLength(1);
  expect(MockImage.instances[0].src).toMatch(/light-bubbles\.png$/);
  MockImage.instances[0].onload?.();
  await Promise.all([first, second]);
  await preloadBackgroundImage('light');
  expect(MockImage.instances).toHaveLength(1);
  expect(getBackgroundImageDataUrl('light')).toBe('data:image/png;base64,Ymc=');
  expect(getBackgroundImageDataUrl('dark')).toBeNull();
});

it('allows retrying after a failed image request', async () => {
  const { preloadBackgroundImage } = await import('./backgroundAssets');
  const failed = preloadBackgroundImage('dark');
  const rejection = expect(failed).rejects.toThrow('Failed to load image');
  MockImage.instances[0].onerror?.();
  await rejection;
  const retry = preloadBackgroundImage('dark');
  expect(MockImage.instances).toHaveLength(2);
  MockImage.instances[1].onload?.();
  await expect(retry).resolves.toBeUndefined();
});

it('rejects canvas conversion failures and allows recovery', async () => {
  const { preloadBackgroundImage } = await import('./backgroundAssets');
  vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementationOnce(() => {
    throw new Error('Conversion failed');
  });
  const failed = preloadBackgroundImage('light');
  const rejection = expect(failed).rejects.toThrow('Conversion failed');
  MockImage.instances[0].onload?.();
  await rejection;
  const retry = preloadBackgroundImage('light');
  MockImage.instances[1].onload?.();
  await expect(retry).resolves.toBeUndefined();
});
