import { describe, expect, it, vi } from 'vitest';
import { copyOrDownloadBlob } from './exportUtils';
describe('copyOrDownloadBlob', () => {
  it('returns copied when clipboard write succeeds', async () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const writeClipboard = vi.fn().mockResolvedValue(undefined);
    const createClipboardItem = vi.fn().mockReturnValue({ id: 'clipboard-item' });
    const download = vi.fn();
    const result = await copyOrDownloadBlob(blob, {
      filename: 'image.png',
      writeClipboard,
      createClipboardItem,
      download,
    });
    expect(result).toBe('copied');
    expect(createClipboardItem).toHaveBeenCalledWith(blob);
    expect(writeClipboard).toHaveBeenCalledWith([{ id: 'clipboard-item' }]);
    expect(download).not.toHaveBeenCalled();
  });
  it('falls back to download when clipboard write fails', async () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    const writeClipboard = vi.fn().mockRejectedValue(new Error('denied'));
    const createClipboardItem = vi.fn().mockReturnValue({ id: 'clipboard-item' });
    const download = vi.fn();
    const result = await copyOrDownloadBlob(blob, {
      filename: 'image.png',
      writeClipboard,
      createClipboardItem,
      download,
    });
    expect(result).toBe('downloaded');
    expect(download).toHaveBeenCalledWith(blob, 'image.png');
  });
});
