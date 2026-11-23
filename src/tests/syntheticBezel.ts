import type { RgbaPixels } from '@/utils/screenOpening';

export interface SyntheticBezelOptions {
  width?: number;
  height?: number;
  /** Thickness of the opaque frame around the screen. */
  border?: number;
  /** Corner radius of the screen opening. */
  radius?: number;
  /** Adds an opaque pill near the top of the screen, like a camera cut-out. */
  island?: boolean;
  /** Breaks the frame on the left so the screen is not enclosed. */
  open?: boolean;
}

export interface SyntheticBezel extends RgbaPixels {
  data: Uint8ClampedArray;
  /** The fully transparent screen area. */
  screen: { x: number; y: number; width: number; height: number };
}

const insideRoundedRect = (x: number, y: number, left: number, top: number, right: number, bottom: number, radius: number) => {
  if (x < left || x >= right || y < top || y >= bottom) return false;
  const cx = Math.min(Math.max(x + 0.5, left + radius), right - radius);
  const cy = Math.min(Math.max(y + 0.5, top + radius), bottom - radius);
  return Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius;
};

/**
 * Draws a phone-like bezel in memory: transparent outside the device, an opaque
 * frame, a semi-transparent anti-aliased inner edge and a transparent screen.
 * No Apple artwork is needed to test screen detection and composition.
 */
export function createSyntheticBezel(options: SyntheticBezelOptions = {}): SyntheticBezel {
  const width = options.width ?? 120;
  const height = options.height ?? 240;
  const border = options.border ?? 10;
  const radius = options.radius ?? 12;
  const data = new Uint8ClampedArray(width * height * 4);
  const screen = { x: border, y: border, width: width - border * 2, height: height - border * 2 };
  const set = (x: number, y: number, alpha: number) => {
    const index = (y * width + x) * 4;
    data[index] = 20;
    data[index + 1] = 20;
    data[index + 2] = 24;
    data[index + 3] = alpha;
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!insideRoundedRect(x, y, 1, 1, width - 1, height - 1, radius + border)) continue;
      if (insideRoundedRect(x, y, screen.x, screen.y, screen.x + screen.width, screen.y + screen.height, radius)) {
        const edge = x === screen.x || y === screen.y || x === screen.x + screen.width - 1 || y === screen.y + screen.height - 1;
        set(x, y, edge ? 160 : 0);
      } else {
        set(x, y, 255);
      }
    }
  }
  if (options.island) {
    const top = screen.y + 6;
    const left = Math.floor(width / 2) - 12;
    for (let y = top; y < top + 6; y += 1) for (let x = left; x < left + 24; x += 1) set(x, y, 255);
  }
  if (options.open) {
    const middle = Math.floor(height / 2);
    for (let x = 0; x <= border; x += 1) set(x, middle, 0);
  }
  // The anti-aliased edge row is semi-opaque, so the fully transparent screen starts one pixel in.
  return { width, height, data, screen: { x: screen.x + 1, y: screen.y + 1, width: screen.width - 2, height: screen.height - 2 } };
}
