import {
  BACKGROUND_IMAGE_URLS,
  getBackgroundImageDataUrl,
  preloadBackgroundImage,
} from './backgroundAssets';
import type { BackgroundVariant } from './backgroundAssets';

export { preloadBackgroundImage };
export type { BackgroundVariant };

export interface RenderOptions {
  variant: BackgroundVariant;
  imageData: string;
  imageWidth: number;
  imageHeight: number;
}

// The screenshot occupies this fraction of the output width; the remainder
// becomes equal padding on all four sides.
const SCREENSHOT_WIDTH_RATIO = 0.8;
const CARD_RADIUS = 24;
const SHADOW_FILTER =
  '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';

export function generateSVG(options: RenderOptions): string {
  // Integer offsets keep screenshot pixels sharp when exporting at native resolution.
  const padding = Math.ceil((options.imageWidth / SCREENSHOT_WIDTH_RATIO - options.imageWidth) / 2);
  const width = options.imageWidth + padding * 2;
  const height = Math.ceil(options.imageHeight + padding * 2);
  // Prefer the preloaded data URL so exports embed the background; the public
  // URL fallback still renders in the live preview before preloading finishes.
  const backgroundUrl =
    getBackgroundImageDataUrl(options.variant) ?? BACKGROUND_IMAGE_URLS[options.variant];
  // Keep shadow filtering in sRGB to avoid changing the screenshot's colors.
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" color-interpolation-filters="sRGB" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${SHADOW_FILTER}
        <clipPath id="rounded-clip">
          <rect x="${padding}" y="${padding}" width="${options.imageWidth}" height="${options.imageHeight}" rx="${CARD_RADIUS}" />
        </clipPath>
      </defs>
      <image href="${backgroundUrl}"
             x="0" y="0"
             width="${width}" height="${height}"
             preserveAspectRatio="xMidYMid slice" />
      <g filter="url(#shadow)">
        <image href="${options.imageData}"
               x="${padding}" y="${padding}"
               width="${options.imageWidth}" height="${options.imageHeight}"
               clip-path="url(#rounded-clip)"
               preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
