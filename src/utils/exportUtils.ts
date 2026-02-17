export type ClipboardWriter = (items: unknown[]) => Promise<void>;
export type ClipboardItemFactory = (blob: Blob) => unknown;
interface CopyOrDownloadOptions {
  filename: string;
  writeClipboard?: ClipboardWriter;
  createClipboardItem?: ClipboardItemFactory;
  download?: (blob: Blob, filename: string) => void;
}
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
function defaultClipboardWriter(items: unknown[]): Promise<void> {
  return navigator.clipboard.write(items as ClipboardItem[]);
}
function defaultClipboardItemFactory(blob: Blob): unknown {
  return new ClipboardItem({ 'image/png': blob });
}
export async function copyOrDownloadBlob(
  blob: Blob,
  options: CopyOrDownloadOptions,
): Promise<'copied' | 'downloaded'> {
  const writeClipboard = options.writeClipboard ?? defaultClipboardWriter;
  const createClipboardItem = options.createClipboardItem ?? defaultClipboardItemFactory;
  const download = options.download ?? downloadBlob;
  try {
    await writeClipboard([createClipboardItem(blob)]);
    return 'copied';
  } catch {
    download(blob, options.filename);
    return 'downloaded';
  }
}
