export const RENDERER_VERSION = '1.0.0';

export interface ImageSize {
  width: number;
  height: number;
}

export interface CompositionOptions {
  imageData: string;
  imageWidth: number;
  imageHeight: number;
  backgroundData: string;
}

export function compositionSize(width: number, height: number): ImageSize & { padding: number } {
  if (![width, height].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Image dimensions must be positive integers');
  }
  const padding = Math.ceil((width / 0.8 - width) / 2);
  return { width: width + padding * 2, height: height + padding * 2, padding };
}

export function exportSize(size: ImageSize, targetLongSide?: number): ImageSize {
  if (!targetLongSide) return { width: size.width, height: size.height };
  const scale = targetLongSide / Math.max(size.width, size.height);
  return { width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) };
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function composeScreenshot(options: CompositionOptions): string {
  const { width, height, padding } = compositionSize(options.imageWidth, options.imageHeight);
  // Integer offsets and sRGB filtering preserve source alignment and shadow colors.
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" color-interpolation-filters="sRGB" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>
        <clipPath id="rounded-clip">
          <rect x="${padding}" y="${padding}" width="${options.imageWidth}" height="${options.imageHeight}" rx="24" />
        </clipPath>
      </defs>
      <image href="${escapeAttribute(options.backgroundData)}"
             x="0" y="0" width="${width}" height="${height}"
             preserveAspectRatio="xMidYMid slice" />
      <g filter="url(#shadow)">
        <image href="${escapeAttribute(options.imageData)}"
               x="${padding}" y="${padding}" width="${options.imageWidth}" height="${options.imageHeight}"
               clip-path="url(#rounded-clip)" preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
