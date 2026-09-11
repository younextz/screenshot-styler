import { exportSize, type ImageSize } from './composeScreenshot';

export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode image'));
    image.src = source;
  });
}

export function getSvgSize(svg: string): ImageSize {
  const element = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  const width = Number(element.getAttribute('width'));
  const height = Number(element.getAttribute('height'));
  if (![width, height].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Invalid SVG dimensions');
  }
  return { width, height };
}

export async function svgToBlob(svg: string, targetLongSide?: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = await loadImage(url);
    const { width, height } = exportSize(getSvgSize(svg), targetLongSide);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    context.drawImage(image, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Failed to encode PNG')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
