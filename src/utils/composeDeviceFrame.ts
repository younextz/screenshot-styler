import type { ImageSize } from './composeScreenshot';
import type { Rect } from './screenOpening';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

/** Which part of the screenshot fills the device screen. */
export interface CropState {
  /** 1 = the screenshot just covers the screen; up to MAX_ZOOM. */
  zoom: number;
  /** Centre of the visible area, as a fraction of the screenshot width (0–1). */
  centerX: number;
  /** Centre of the visible area, as a fraction of the screenshot height (0–1). */
  centerY: number;
}

export const CENTERED_CROP: CropState = { zoom: 1, centerX: 0.5, centerY: 0.5 };

/** Bezel geometry in the bezel image's own pixels. */
export interface DeviceFrameGeometry extends ImageSize {
  screen: Rect;
}

export interface DeviceFrameAsset extends DeviceFrameGeometry {
  /** The unchanged bezel PNG as a data URL, so exports are self-contained. */
  data: string;
}

/** The visible part of the screenshot, in screenshot pixels, and its scale onto the screen. */
export interface CropWindow extends Rect {
  scale: number;
}

export interface DeviceLayout extends ImageSize {
  frame: Rect;
  screen: Rect;
  /** Where the whole screenshot is drawn; only the part inside `screen` is visible. */
  image: Rect;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finiteOr = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

function assertSize(size: ImageSize, label: string): void {
  if (!(size.width > 0 && size.height > 0 && Number.isFinite(size.width) && Number.isFinite(size.height))) {
    throw new Error(`${label} dimensions must be positive`);
  }
}

/** Clamps zoom to 1–4 and keeps the visible area inside the screenshot, so the screen is never blank. */
export function clampCrop(source: ImageSize, screen: ImageSize, crop: CropState): CropState {
  const zoom = clamp(finiteOr(crop.zoom, MIN_ZOOM), MIN_ZOOM, MAX_ZOOM);
  const visible = cropWindow(source, screen, { zoom, centerX: 0.5, centerY: 0.5 });
  const halfWidth = visible.width / source.width / 2;
  const halfHeight = visible.height / source.height / 2;
  return {
    zoom,
    centerX: clamp(finiteOr(crop.centerX, 0.5), halfWidth, 1 - halfWidth),
    centerY: clamp(finiteOr(crop.centerY, 0.5), halfHeight, 1 - halfHeight),
  };
}

/** The part of the screenshot shown on a screen of the given size. */
export function cropWindow(source: ImageSize, screen: ImageSize, crop: CropState): CropWindow {
  assertSize(source, 'Screenshot');
  assertSize(screen, 'Screen');
  const zoom = clamp(finiteOr(crop.zoom, MIN_ZOOM), MIN_ZOOM, MAX_ZOOM);
  // At zoom 1 the screenshot covers the screen: the screen's aspect ratio decides the crop.
  const scale = Math.max(screen.width / source.width, screen.height / source.height) * zoom;
  const width = Math.min(source.width, screen.width / scale);
  const height = Math.min(source.height, screen.height / scale);
  return {
    scale,
    width,
    height,
    x: clamp(finiteOr(crop.centerX, 0.5) * source.width - width / 2, 0, source.width - width),
    y: clamp(finiteOr(crop.centerY, 0.5) * source.height - height / 2, 0, source.height - height),
  };
}

/** Moves the screenshot by (dx, dy) screen pixels, like dragging it. */
export function panCrop(source: ImageSize, screen: ImageSize, crop: CropState, dx: number, dy: number): CropState {
  const { scale } = cropWindow(source, screen, crop);
  return clampCrop(source, screen, {
    zoom: crop.zoom,
    centerX: crop.centerX - dx / scale / source.width,
    centerY: crop.centerY - dy / scale / source.height,
  });
}

/** Sets the zoom while keeping the centre of the visible area in place. */
export function zoomCrop(source: ImageSize, screen: ImageSize, crop: CropState, zoom: number): CropState {
  return clampCrop(source, screen, { ...crop, zoom });
}

/** Output size: the bezel spans 80% of the picture height with even padding, like the Screenshot layout's 80% width. */
export function deviceCompositionSize(frame: ImageSize): ImageSize & { padding: number } {
  if (![frame.width, frame.height].every((value) => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Device frame dimensions must be positive integers');
  }
  const padding = Math.ceil((frame.height / 0.8 - frame.height) / 2);
  return { width: frame.width + padding * 2, height: frame.height + padding * 2, padding };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

export function deviceLayout(source: ImageSize, frame: DeviceFrameGeometry, crop: CropState): DeviceLayout {
  const { width, height, padding } = deviceCompositionSize(frame);
  const screen = { ...frame.screen, x: frame.screen.x + padding, y: frame.screen.y + padding };
  const visible = cropWindow(source, screen, crop);
  return {
    width,
    height,
    frame: { x: padding, y: padding, width: frame.width, height: frame.height },
    screen,
    image: {
      x: round(screen.x - visible.x * visible.scale),
      y: round(screen.y - visible.y * visible.scale),
      width: round(source.width * visible.scale),
      height: round(source.height * visible.scale),
    },
  };
}

export interface DeviceCompositionOptions {
  imageData: string;
  imageWidth: number;
  imageHeight: number;
  backgroundData: string;
  frame: DeviceFrameAsset;
  crop: CropState;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Composes the screenshot inside the device bezel on the Air background. The bezel
 * is drawn unchanged on top, with no shadow or tilt; the screenshot below it is
 * clipped to the screen opening. `DeviceFramePreview` renders the same layers.
 */
export function composeDeviceFrame(options: DeviceCompositionOptions): string {
  const layout = deviceLayout({ width: options.imageWidth, height: options.imageHeight }, options.frame, options.crop);
  const { screen, image, frame } = layout;
  return `
    <svg width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="device-screen-clip">
          <rect x="${screen.x}" y="${screen.y}" width="${screen.width}" height="${screen.height}" />
        </clipPath>
      </defs>
      <image href="${escapeAttribute(options.backgroundData)}"
             x="0" y="0" width="${layout.width}" height="${layout.height}"
             preserveAspectRatio="xMidYMid slice" />
      <image href="${escapeAttribute(options.imageData)}"
             x="${image.x}" y="${image.y}" width="${image.width}" height="${image.height}"
             clip-path="url(#device-screen-clip)" preserveAspectRatio="none" />
      <image href="${escapeAttribute(options.frame.data)}"
             x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}"
             preserveAspectRatio="none" />
    </svg>
  `.trim();
}
