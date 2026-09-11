import { composeScreenshot } from '../utils/composeScreenshot';
import { BACKGROUND_IMAGE_URLS, getBackgroundImageDataUrl, preloadBackgroundImage } from './backgroundAssets';
import type { BackgroundVariant } from './backgroundAssets';

export { preloadBackgroundImage };

export interface RenderOptions {
  variant: BackgroundVariant;
  imageData: string;
  imageWidth: number;
  imageHeight: number;
}

export function generateSVG(options: RenderOptions): string {
  return composeScreenshot({
    ...options,
    backgroundData: getBackgroundImageDataUrl(options.variant) ?? BACKGROUND_IMAGE_URLS[options.variant],
  });
}
