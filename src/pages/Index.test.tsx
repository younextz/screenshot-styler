import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ImageLoaderProps } from '@/components/ImageLoader';
import { preloadBackgroundImages } from '@/lib/svgRenderer';
import { downloadBlob } from '@/utils/exportUtils';
import Index from './Index';

vi.mock('@/lib/svgRenderer', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/svgRenderer')>(),
  preloadBackgroundImages: vi.fn(),
}));

vi.mock('@/components/ImageLoader', () => ({
  ImageLoader: ({ onImageLoad }: ImageLoaderProps) => (
    <button onClick={() => onImageLoad('data:image/png;base64,c291cmNl', 80, 60)}>
      Load screenshot
    </button>
  ),
}));

vi.mock('@/utils/exportUtils', () => ({
  downloadBlob: vi.fn(),
  copyOrDownloadBlob: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

it('preserves the screenshot through failed retries and enables exports after recovery', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let finishLoading: () => void = () => {};
  const retry = new Promise<void>((resolve) => { finishLoading = resolve; });
  const preload = vi.mocked(preloadBackgroundImages)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockRejectedValueOnce(new Error('Still offline'))
    .mockReturnValueOnce(retry);

  const { container } = render(<Index />);
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
