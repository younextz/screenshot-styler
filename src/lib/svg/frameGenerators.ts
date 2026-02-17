import type { Palette } from '../palettes';
export function generateMacOSTitleBar(
  palette: Palette,
  x: number,
  y: number,
  width: number,
): string {
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${width}" height="40" fill="${palette.swatches[1] || '#1A1A1A'}" rx="12" ry="12" />
      <rect y="40" width="${width}" height="8" fill="${palette.swatches[1] || '#1A1A1A'}" />
      <circle cx="20" cy="20" r="6" fill="#FF5F56" />
      <circle cx="40" cy="20" r="6" fill="#FFBD2E" />
      <circle cx="60" cy="20" r="6" fill="#27C93F" />
    </g>
  `;
}
export function generateWindowsTitleBar(
  palette: Palette,
  x: number,
  y: number,
  width: number,
): string {
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${width}" height="36" fill="${palette.swatches[1] || '#1A1A1A'}" />
      <line x1="${width - 80}" y1="12" x2="${width - 68}" y2="24" stroke="${palette.swatches[4] || '#FFF'}" stroke-width="2" />
      <rect x="${width - 50}" y="8" width="16" height="2" fill="${palette.swatches[4] || '#FFF'}" />
      <rect x="${width - 22}" y="8" width="14" height="14" fill="none" stroke="${palette.swatches[4] || '#FFF'}" stroke-width="2" />
    </g>
  `;
}
export function generateLaptopFrame(
  palette: Palette,
  frameX: number,
  contentTop: number,
  imageWidth: number,
  imageHeight: number,
): string {
  return `
    <rect x="${frameX - 10}" y="${contentTop - 10}" width="${imageWidth + 20}" height="${imageHeight + 20}"
          fill="${palette.swatches[1] || '#1A1A1A'}" rx="8" />
    <rect x="${frameX - 50}" y="${contentTop + imageHeight + 12}" width="${imageWidth + 100}" height="8"
          fill="${palette.swatches[1] || '#1A1A1A'}" rx="2" />
  `;
}
export function generatePhoneFrame(
  palette: Palette,
  frameX: number,
  contentTop: number,
  imageWidth: number,
  imageHeight: number,
  outputWidth: number,
): string {
  return `
    <rect x="${frameX - 12}" y="${contentTop - 40}" width="${imageWidth + 24}" height="${imageHeight + 80}"
          fill="${palette.swatches[1] || '#1A1A1A'}" rx="24" />
    <circle cx="${outputWidth / 2}" cy="${contentTop + imageHeight + 50}" r="15"
            fill="${palette.swatches[0]}" />
  `;
}
