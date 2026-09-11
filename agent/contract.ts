import { compositionSize, exportSize } from '../src/utils/composeScreenshot';

export const LIMITS = {
  inputBytes: 10 * 1024 * 1024,
  sourceSide: 8192,
  sourcePixels: 16_000_000,
  outputPixels: 24_000_000,
  outputBytes: 32 * 1024 * 1024,
  downloadMs: 15_000,
  renderMs: 30_000,
  cacheBytes: 100 * 1024 * 1024,
} as const;

export type ErrorCode = 'INVALID_ARGUMENT' | 'UNSUPPORTED_IMAGE' | 'INPUT_TOO_LARGE' |
  'PIXEL_LIMIT_EXCEEDED' | 'FETCH_FAILED' | 'FETCH_TIMEOUT' | 'ASSET_UNAVAILABLE' |
  'ASSET_INTEGRITY_FAILED' | 'RUNTIME_MISSING' | 'RENDER_FAILED' | 'OUTPUT_TOO_LARGE' | 'OUTPUT_EXISTS';

export class HelperError extends Error {
  constructor(public readonly code: ErrorCode, message: string) {
    super(message);
  }
}

export interface RenderArguments {
  input?: string;
  url?: string;
  background: 'light' | 'dark';
  output: string;
  format: 'png' | 'svg';
  size: 'native' | '4k';
  force: boolean;
  offline: boolean;
}

export function validateDimensions(width: number, height: number, size: 'native' | '4k') {
  if (![width, height].every((value) => Number.isSafeInteger(value) && value > 0) ||
    Math.max(width, height) > LIMITS.sourceSide || width * height > LIMITS.sourcePixels) {
    throw new HelperError('PIXEL_LIMIT_EXCEEDED', 'Input exceeds 8192 px per side or 16 million pixels.');
  }
  const composed = compositionSize(width, height);
  const output = exportSize(composed, size === '4k' ? 3840 : undefined);
  // The intermediate SVG is also bounded, even when the final PNG is smaller.
  if (composed.width * composed.height > LIMITS.outputPixels || output.width * output.height > LIMITS.outputPixels) {
    throw new HelperError('PIXEL_LIMIT_EXCEEDED', 'Composed image exceeds 24 million pixels.');
  }
  return output;
}
