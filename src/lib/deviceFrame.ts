import type { DeviceFrameAsset } from '@/utils/composeDeviceFrame';
import { findScreenOpening } from '@/utils/screenOpening';

export interface DeviceFrameInfo {
  /** Device model shown to people, e.g. "iPhone 17 Pro". */
  model: string;
  /** Short content hash used to bust caches when the bezel changes. */
  version: string;
}

/**
 * Set at build time from `public/devices/iphone-portrait.png` and its `.json`.
 * Null when the bezel is not in the repository: the iPhone layout is then hidden.
 */
export const DEVICE_FRAME: DeviceFrameInfo | null = __STUDIO_DEVICE_FRAME__;

export function deviceFrameUrl(info: DeviceFrameInfo): string {
  return `${import.meta.env.BASE_URL}devices/iphone-portrait.png?v=${encodeURIComponent(info.version)}`;
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read device frame'));
    reader.readAsDataURL(blob);
  });
}

function decode(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode device frame'));
    image.src = source;
  });
}

async function fetchDeviceFrame(info: DeviceFrameInfo): Promise<DeviceFrameAsset> {
  const response = await fetch(deviceFrameUrl(info));
  if (!response.ok) throw new Error(`Failed to load device frame: HTTP ${response.status}`);
  // Embed the original file bytes so the bezel is exported exactly as supplied.
  const data = await readAsDataUrl(await response.blob());
  const image = await decode(data);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Could not get canvas context');
  context.drawImage(image, 0, 0);
  const screen = findScreenOpening(context.getImageData(0, 0, canvas.width, canvas.height));
  if (!screen) throw new Error('Device frame has no transparent screen opening');
  return { data, width: canvas.width, height: canvas.height, screen };
}

let cached: DeviceFrameAsset | null = null;
let pending: Promise<DeviceFrameAsset> | null = null;

/** Loads the bundled bezel once, finds its screen opening and caches the result. */
export async function loadDeviceFrame(info: DeviceFrameInfo): Promise<DeviceFrameAsset> {
  if (cached) return cached;
  if (!pending) {
    pending = fetchDeviceFrame(info)
      .then((frame) => { cached = frame; return frame; })
      .finally(() => { pending = null; });
  }
  return pending;
}
