import { composeScreenshot } from '../src/utils/composeScreenshot';
import { loadImage, svgToBlob } from '../src/utils/browserRenderer';
import { LIMITS, validateDimensions } from './contract';

export interface BrowserInput {
  imageData: string;
  backgroundData: string;
  width: number;
  height: number;
  format: 'png' | 'svg';
  size: 'native' | '4k';
}

export interface BrowserOutput {
  base64: string;
  width: number;
  height: number;
}

export async function render(input: BrowserInput): Promise<BrowserOutput> {
  const image = await loadImage(input.imageData);
  if (image.naturalWidth !== input.width || image.naturalHeight !== input.height) {
    throw new Error('Decoded dimensions do not match image header');
  }
  const output = validateDimensions(image.naturalWidth, image.naturalHeight, input.size);
  // Normalize the background with the same canvas conversion used by the editor.
  const background = await loadImage(input.backgroundData);
  const canvas = document.createElement('canvas');
  canvas.width = background.naturalWidth;
  canvas.height = background.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  context.drawImage(background, 0, 0);
  const svg = composeScreenshot({
    imageData: input.imageData, imageWidth: image.naturalWidth, imageHeight: image.naturalHeight,
    backgroundData: canvas.toDataURL('image/png'),
  });
  const blob = input.format === 'svg' ? new Blob([svg], { type: 'image/svg+xml' }) :
    await svgToBlob(svg, input.size === '4k' ? 3840 : undefined);
  if (blob.size > LIMITS.outputBytes) throw new Error('OUTPUT_TOO_LARGE');
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read output'));
    reader.readAsDataURL(blob);
  });
  return { base64, ...output };
}

declare global {
  interface Window { ScreenshotStyler: { render: typeof render } }
}
