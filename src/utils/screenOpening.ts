export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** RGBA pixels in the same layout as the DOM `ImageData`. */
export interface RgbaPixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

export interface ScreenOpeningOptions {
  /** Pixels with alpha below this value count as transparent screen. */
  alphaThreshold?: number;
  /** Extra pixels added on every side so the screenshot also fills the bezel's anti-aliased inner edge. */
  bleed?: number;
  /** Smallest share of the image the opening may cover; smaller holes are not a screen. */
  minAreaRatio?: number;
}

const SEED_POSITIONS = [0.5, 0.4, 0.6, 0.3, 0.7];

/**
 * Finds the transparent screen opening of a device bezel: the transparent region
 * enclosed by the bezel around the image centre. Returns its bounding box, or
 * null when the centre is opaque, the region reaches the image edge (it is the
 * outside of the device, not a screen) or the region is too small.
 */
export function findScreenOpening(pixels: RgbaPixels, options: ScreenOpeningOptions = {}): Rect | null {
  const { width, height, data } = pixels;
  const alphaThreshold = options.alphaThreshold ?? 128;
  const bleed = options.bleed ?? 2;
  const minAreaRatio = options.minAreaRatio ?? 0.1;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 3 || height < 3) return null;
  if (data.length < width * height * 4) return null;

  const isTransparent = (index: number) => data[index * 4 + 3] < alphaThreshold;
  const centreX = Math.floor(width / 2);
  const seed = SEED_POSITIONS
    .map((position) => Math.floor(height * position) * width + centreX)
    .find(isTransparent);
  if (seed === undefined) return null;

  // Iterative 4-connected flood fill; a typed-array stack keeps large bezels fast.
  const visited = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let top = 0;
  stack[top++] = seed;
  visited[seed] = 1;
  let area = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  while (top > 0) {
    const index = stack[--top];
    const x = index % width;
    const y = (index - x) / width;
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) return null;
    area += 1;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    for (const next of [index - 1, index + 1, index - width, index + width]) {
      if (!visited[next] && isTransparent(next)) {
        visited[next] = 1;
        stack[top++] = next;
      }
    }
  }

  if (area < width * height * minAreaRatio) return null;
  const x = Math.max(0, minX - bleed);
  const y = Math.max(0, minY - bleed);
  return {
    x,
    y,
    width: Math.min(width, maxX + 1 + bleed) - x,
    height: Math.min(height, maxY + 1 + bleed) - y,
  };
}
