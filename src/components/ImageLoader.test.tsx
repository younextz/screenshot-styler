import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ImageLoader } from './ImageLoader';
import { toast } from 'sonner';
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
const mockedToast = toast as unknown as {
  error: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
};
describe('ImageLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('shows an error for unsupported file types', () => {
    const onImageLoad = vi.fn();
    const { container } = render(<ImageLoader onImageLoad={onImageLoad} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockedToast.error).toHaveBeenCalledWith('Please upload a PNG or JPG image');
    expect(onImageLoad).not.toHaveBeenCalled();
  });
  it('shows an error when file size exceeds 10MB', () => {
    const onImageLoad = vi.fn();
    const { container } = render(<ImageLoader onImageLoad={onImageLoad} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.png', {
      type: 'image/png',
    });
    fireEvent.change(input, { target: { files: [oversized] } });
    expect(mockedToast.error).toHaveBeenCalledWith('File size must be less than 10MB');
    expect(onImageLoad).not.toHaveBeenCalled();
  });
  it('shows clipboard guidance when navigator.clipboard.read is unavailable', async () => {
    const onImageLoad = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        read: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });
    render(<ImageLoader onImageLoad={onImageLoad} />);
    const button = screen.getByRole('button', { name: /paste/i });
    await fireEvent.click(button);
    expect(mockedToast.error).toHaveBeenCalledWith(
      'Clipboard not available. Try Ctrl/⌘+V or use file picker.',
    );
  });
});
