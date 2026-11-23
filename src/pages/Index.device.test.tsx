import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImageLoaderProps } from '@/components/ImageLoader';
import type { DeviceFrameInfo } from '@/lib/deviceFrame';
import { generateSVG, preloadBackgroundImage } from '@/lib/svgRenderer';
import { createSyntheticBezel } from '@/tests/syntheticBezel';
import type { DeviceFrameAsset } from '@/utils/composeDeviceFrame';
import { findScreenOpening } from '@/utils/screenOpening';
import { downloadBlob } from '@/utils/exportUtils';
import Index from './Index';

const device = vi.hoisted(() => ({
  info: null as DeviceFrameInfo | null,
  load: vi.fn<(info: DeviceFrameInfo) => Promise<DeviceFrameAsset>>(),
}));

vi.mock('@/lib/deviceFrame', () => ({
  get DEVICE_FRAME() { return device.info; },
  loadDeviceFrame: device.load,
}));

vi.mock('@/lib/svgRenderer', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/svgRenderer')>(),
  preloadBackgroundImage: vi.fn(),
}));

vi.mock('@/components/ImageLoader', () => ({
  default: ({ onImageLoad }: ImageLoaderProps) => (
    <>
      <button onClick={() => onImageLoad('data:image/png;base64,bGFuZHNjYXBl', 300, 200)}>Load screenshot</button>
      <button onClick={() => onImageLoad('data:image/png;base64,c2Vjb25k', 300, 200)}>Load another</button>
    </>
  ),
}));

vi.mock('@/utils/exportUtils', () => ({
  downloadBlob: vi.fn(),
  copyOrDownloadBlob: vi.fn(),
}));

const bezel = createSyntheticBezel({ width: 120, height: 240, island: true });
const FRAME: DeviceFrameAsset = {
  data: 'data:image/png;base64,YmV6ZWw=',
  width: bezel.width,
  height: bezel.height,
  screen: findScreenOpening(bezel)!,
};
const EXPORT_BUTTONS = ['Copy', 'PNG', '4K', 'SVG'];

function screenImage(container: HTMLElement): Element {
  return container.querySelector('image[clip-path]')!;
}

async function openIphoneLayout() {
  const view = render(<Index />);
  fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
  fireEvent.click(screen.getByRole('button', { name: 'iPhone' }));
  await screen.findByRole('group', { name: 'Screenshot position on the iPhone screen' });
  return view;
}

beforeEach(() => {
  vi.mocked(preloadBackgroundImage).mockResolvedValue(undefined);
  device.info = { model: 'iPhone Test', version: 'abc' };
  device.load.mockResolvedValue(FRAME);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(preloadBackgroundImage).mockReset();
  device.load.mockReset();
  localStorage.clear();
});

describe('without a bundled bezel', () => {
  it('hides the iPhone layout, ignores a saved choice and keeps the existing output', async () => {
    device.info = null;
    localStorage.setItem('screenshot-styler-layout', 'iphone');
    const { container } = render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled());
    expect(screen.queryByRole('group', { name: 'Layout' })).not.toBeInTheDocument();
    expect(screen.queryByText(/trademark of Apple/)).not.toBeInTheDocument();
    expect(device.load).not.toHaveBeenCalled();
    expect(container.querySelector('image[clip-path="url(#rounded-clip)"]')).toBeInTheDocument();

    const created = vi.spyOn(globalThis, 'Blob');
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    expect((created.mock.calls.at(-1)?.[0] as BlobPart[])[0]).toBe(
      generateSVG({ variant: 'light', imageData: 'data:image/png;base64,bGFuZHNjYXBl', imageWidth: 300, imageHeight: 200 }),
    );
  });
});

describe('with a bundled bezel', () => {
  it('offers the layout, shows the trademark notice and does not load the bezel until chosen', async () => {
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled());
    expect(screen.getByRole('button', { name: 'Screenshot' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'iPhone' })).toHaveAttribute('title', 'Screenshot inside an iPhone Test frame');
    expect(screen.getByText('iPhone is a trademark of Apple Inc., registered in the U.S. and other countries and regions.')).toBeInTheDocument();
    expect(device.load).not.toHaveBeenCalled();
  });

  it('frames the screenshot, saves the layout and exports the framed SVG', async () => {
    const { container } = await openIphoneLayout();
    expect(localStorage.getItem('screenshot-styler-layout')).toBe('iphone');
    expect(device.load).toHaveBeenCalledWith({ model: 'iPhone Test', version: 'abc' });
    const hrefs = [...container.querySelectorAll('section svg image')].map((image) => image.getAttribute('href'));
    expect(hrefs.slice(1)).toEqual(['data:image/png;base64,bGFuZHNjYXBl', FRAME.data]);
    expect(container.querySelector('[data-testid="crop-overflow"]')).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled());
    const created = vi.spyOn(globalThis, 'Blob');
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
    const svg = String((created.mock.calls.at(-1)?.[0] as BlobPart[])[0]);
    expect(svg).toContain(`href="${FRAME.data}"`);
    expect(svg).toContain('clip-path="url(#device-screen-clip)"');
    expect(svg).not.toContain('opacity');
  });

  it('restores the saved layout on the next visit', async () => {
    localStorage.setItem('screenshot-styler-layout', 'iphone');
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
    expect(await screen.findByRole('group', { name: 'Screenshot position on the iPhone screen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'iPhone' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('pans with the keyboard and drag, zooms, and centers again', async () => {
    const { container } = await openIphoneLayout();
    const surface = screen.getByRole('group', { name: 'Screenshot position on the iPhone screen' });
    const startX = Number(screenImage(container).getAttribute('x'));

    fireEvent.keyDown(surface, { key: 'ArrowRight' });
    const afterKey = Number(screenImage(container).getAttribute('x'));
    expect(afterKey).toBeGreaterThan(startX);

    fireEvent.pointerDown(surface, { pointerId: 1, clientX: 100, clientY: 100, button: 0, pointerType: 'mouse' });
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 90, clientY: 100, pointerType: 'mouse' });
    fireEvent.pointerUp(surface, { pointerId: 1, pointerType: 'mouse' });
    expect(Number(screenImage(container).getAttribute('x'))).toBeCloseTo(afterKey - 10);

    const zoom = screen.getByRole('slider', { name: 'Zoom' });
    fireEvent.change(zoom, { target: { value: '9' } });
    expect(zoom).toHaveValue('4');
    expect(screen.getByText('4.0×')).toBeInTheDocument();
    fireEvent.keyDown(surface, { key: '-' });
    expect(Number((zoom as HTMLInputElement).value)).toBeCloseTo(4 / 1.1);

    fireEvent.click(screen.getByRole('button', { name: 'Center' }));
    fireEvent.change(zoom, { target: { value: '1' } });
    expect(Number(screenImage(container).getAttribute('x'))).toBeCloseTo(startX);
  });

  it('zooms with a pinch', async () => {
    await openIphoneLayout();
    const surface = screen.getByRole('group', { name: 'Screenshot position on the iPhone screen' });
    fireEvent.pointerDown(surface, { pointerId: 1, clientX: 100, clientY: 100, pointerType: 'touch' });
    fireEvent.pointerDown(surface, { pointerId: 2, clientX: 200, clientY: 100, pointerType: 'touch' });
    fireEvent.pointerMove(surface, { pointerId: 2, clientX: 300, clientY: 100, pointerType: 'touch' });
    expect(Number((screen.getByRole('slider', { name: 'Zoom' }) as HTMLInputElement).value)).toBeCloseTo(2);
  });

  it('shows the cut-off parts only while adjusting', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { container } = await openIphoneLayout();
      const surface = screen.getByRole('group', { name: 'Screenshot position on the iPhone screen' });
      const overflow = () => container.querySelector('[data-testid="crop-overflow"]');

      fireEvent.pointerDown(surface, { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: 'mouse' });
      expect(overflow()).toBeInTheDocument();
      fireEvent.pointerUp(surface, { pointerId: 1, pointerType: 'mouse' });
      expect(overflow()).not.toBeInTheDocument();

      fireEvent.keyDown(surface, { key: 'ArrowLeft' });
      expect(overflow()).toBeInTheDocument();
      await act(async () => { vi.advanceTimersByTime(700); });
      expect(overflow()).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('resets pan and zoom for a new image', async () => {
    const { container } = await openIphoneLayout();
    const surface = screen.getByRole('group', { name: 'Screenshot position on the iPhone screen' });
    const startX = screenImage(container).getAttribute('x');
    fireEvent.keyDown(surface, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(surface, { key: '+' });
    expect(screenImage(container).getAttribute('x')).not.toBe(startX);
    fireEvent.click(screen.getByRole('button', { name: 'Load another' }));
    expect(screenImage(container).getAttribute('x')).toBe(startX);
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveValue('1');
  });

  it('keeps exports disabled until the bezel loads and offers a retry when it fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    device.load.mockRejectedValueOnce(new Error('Missing'));
    render(<Index />);
    fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
    fireEvent.click(screen.getByRole('button', { name: 'iPhone' }));
    await screen.findByText(/The iPhone frame couldn’t load/);
    for (const name of EXPORT_BUTTONS) expect(screen.getByRole('button', { name })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Retry frame' }));
    await screen.findByRole('group', { name: 'Screenshot position on the iPhone screen' });
    await waitFor(() => {
      for (const name of EXPORT_BUTTONS) expect(screen.getByRole('button', { name })).toBeEnabled();
    });
    expect(device.load).toHaveBeenCalledTimes(2);
  });
});
