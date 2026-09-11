import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ImageLoaderProps } from '@/components/ImageLoader';
import { preloadBackgroundImage } from '@/lib/svgRenderer';
import { downloadBlob } from '@/utils/exportUtils';
import Index from './Index';

vi.mock('@/lib/svgRenderer', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/svgRenderer')>(),
  preloadBackgroundImage: vi.fn(),
}));

vi.mock('@/components/ImageLoader', () => ({
  default: ({ onImageLoad }: ImageLoaderProps) => (
    <button onClick={() => onImageLoad('data:image/png;base64,c291cmNl', 80, 60)}>
      Load screenshot
    </button>
  ),
}));

vi.mock('@/utils/exportUtils', () => ({
  downloadBlob: vi.fn(),
  copyOrDownloadBlob: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(preloadBackgroundImage).mockReset();
  localStorage.clear();
});

it('preserves the screenshot through failed retries and enables exports after recovery', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let finishLoading: () => void = () => {};
  const retry = new Promise<void>((resolve) => { finishLoading = resolve; });
  const preload = vi.mocked(preloadBackgroundImage)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockRejectedValueOnce(new Error('Still offline'))
    .mockReturnValueOnce(retry);

  const { container } = render(<Index />);
  expect(preload).toHaveBeenCalledWith('light');
  fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
  await screen.findByText(/Air backgrounds couldn’t load/);

  const source = container.querySelector('svg g image');
  expect(source).toHaveAttribute('href', 'data:image/png;base64,c291cmNl');
  for (const name of ['Copy', 'PNG', '4K', 'SVG']) {
    expect(screen.getByRole('button', { name })).toBeDisabled();
  }

  fireEvent.click(screen.getByRole('button', { name: 'Retry backgrounds' }));
  await screen.findByText(/Air backgrounds couldn’t load/);
  expect(preload).toHaveBeenCalledTimes(2);

  fireEvent.click(screen.getByRole('button', { name: 'Retry backgrounds' }));
  expect(screen.getByRole('status')).toHaveTextContent('Loading Air backgrounds for export…');
  expect(screen.getByRole('button', { name: 'Retry backgrounds' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'SVG' })).toBeDisabled();

  await act(async () => { finishLoading(); });
  await waitFor(() => {
    for (const name of ['Copy', 'PNG', '4K', 'SVG']) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }
  });
  expect(screen.queryByRole('button', { name: 'Retry backgrounds' })).not.toBeInTheDocument();
  expect(container.querySelector('svg g image')).toHaveAttribute('href', source?.getAttribute('href'));
  fireEvent.click(screen.getByRole('button', { name: 'SVG' }));
  await waitFor(() => expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), expect.stringMatching(/\.svg$/)));
});

it('loads only the selected background and ignores stale completion after switching', async () => {
  let finishDark: () => void = () => {};
  let finishLight: () => void = () => {};
  const dark = new Promise<void>((resolve) => { finishDark = resolve; });
  const light = new Promise<void>((resolve) => { finishLight = resolve; });
  const preload = vi.mocked(preloadBackgroundImage)
    .mockResolvedValueOnce(undefined)
    .mockReturnValueOnce(dark)
    .mockReturnValueOnce(light);

  render(<Index />);
  fireEvent.click(screen.getByRole('button', { name: 'Load screenshot' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled());
  expect(preload.mock.calls).toEqual([['light']]);

  fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
  expect(screen.getByRole('button', { name: 'SVG' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Light' }));
  await act(async () => { finishDark(); });
  expect(screen.getByRole('button', { name: 'SVG' })).toBeDisabled();

  await act(async () => { finishLight(); });
  await waitFor(() => expect(screen.getByRole('button', { name: 'SVG' })).toBeEnabled());
  expect(preload.mock.calls).toEqual([['light'], ['dark'], ['light']]);
});
