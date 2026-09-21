export const RENDERER_VERSION = '1.1.0';

export const MIN_SCREENSHOT_SCALE = 0.25;

const BASE_CORNER_RADIUS = 24;

export interface ImageSize {
  width: number;
  height: number;
}

export interface CompositionOptions {
  imageData: string;
  imageWidth: number;
  imageHeight: number;
  backgroundData: string;
  screenshotScale?: number;
}

export interface ScreenshotLayout {
  canvasWidth: number;
  canvasHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
}

export function compositionSize(width: number, height: number): ImageSize & { padding: number } {
  if (![width, height].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Image dimensions must be positive integers');
  }
  const padding = Math.ceil((width / 0.8 - width) / 2);
  return { width: width + padding * 2, height: height + padding * 2, padding };
}

export function maxScreenshotScale(imageWidth: number, imageHeight: number): number {
  const { width, height } = compositionSize(imageWidth, imageHeight);
  // The canvas never grows with the scale, so the screenshot may only fill it, not overflow it.
  return Math.min(1.2, width / imageWidth, height / imageHeight);
}

export function clampScreenshotScale(scale: number, imageWidth: number, imageHeight: number): number {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(Math.max(scale, MIN_SCREENSHOT_SCALE), maxScreenshotScale(imageWidth, imageHeight));
}

export function screenshotLayout(imageWidth: number, imageHeight: number, scale = 1): ScreenshotLayout {
  const { width: canvasWidth, height: canvasHeight } = compositionSize(imageWidth, imageHeight);
  const clamped = clampScreenshotScale(scale, imageWidth, imageHeight);
  const width = Math.round(imageWidth * clamped);
  const height = Math.round(imageHeight * clamped);
  return {
    canvasWidth,
    canvasHeight,
    x: Math.round((canvasWidth - width) / 2),
    y: Math.round((canvasHeight - height) / 2),
    width,
    height,
    cornerRadius: Math.max(6, Math.round(BASE_CORNER_RADIUS * clamped)),
  };
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
  const layout = screenshotLayout(options.imageWidth, options.imageHeight, options.screenshotScale ?? 1);
  // Integer offsets and sRGB filtering preserve source alignment and shadow colors.
  // data-screenshot/data-screenshot-clip let the preview mutate the layout live while dragging.
  return `
    <svg width="${layout.canvasWidth}" height="${layout.canvasHeight}" viewBox="0 0 ${layout.canvasWidth} ${layout.canvasHeight}" color-interpolation-filters="sRGB" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>
        <clipPath id="rounded-clip">
          <rect data-screenshot-clip="true" x="${layout.x}" y="${layout.y}" width="${layout.width}" height="${layout.height}" rx="${layout.cornerRadius}" />
        </clipPath>
      </defs>
      <image href="${escapeAttribute(options.backgroundData)}"
             x="0" y="0" width="${layout.canvasWidth}" height="${layout.canvasHeight}"
             preserveAspectRatio="xMidYMid slice" />
      <g filter="url(#shadow)">
        <image data-screenshot="true" href="${escapeAttribute(options.imageData)}"
               x="${layout.x}" y="${layout.y}" width="${layout.width}" height="${layout.height}"
               clip-path="url(#rounded-clip)" preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
