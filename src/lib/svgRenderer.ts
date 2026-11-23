import { composeDeviceFrame, type CropState, type DeviceFrameAsset } from '../utils/composeDeviceFrame';
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

/** The embeddable background data URL once loaded; its asset URL before that. */
export function backgroundHref(variant: BackgroundVariant): string {
  return getBackgroundImageDataUrl(variant) ?? BACKGROUND_IMAGE_URLS[variant];
}

export interface DeviceRenderOptions extends RenderOptions {
  frame: DeviceFrameAsset;
  crop: CropState;
}

export function generateDeviceSVG(options: DeviceRenderOptions): string {
  const { variant, ...composition } = options;
  return composeDeviceFrame({ ...composition, backgroundData: backgroundHref(variant) });
}
