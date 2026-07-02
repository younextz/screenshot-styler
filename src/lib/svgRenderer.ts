import {
  BACKGROUND_IMAGE_URLS,
  getBackgroundImageDataUrl,
  preloadBackgroundImages,
} from './svg/backgroundAssets';
import { getPresetStyle } from './svg/presetStyles';

export { preloadBackgroundImages };

interface RenderOptions {
  presetId: string;
  imageData: string;
  imageWidth: number;
  imageHeight: number;
}

function generateBackgroundPicture(imageUrl: string, width: number, height: number): string {
  return `
    <image
      href="${imageUrl}"
      x="0" y="0"
      width="${width}" height="${height}"
      preserveAspectRatio="xMidYMid slice"
    />
  `;
}

export function generateSVG(options: RenderOptions): string {
  const targetWidthRatio = 0.8;
  const picWidth = Math.ceil(options.imageWidth / targetWidthRatio);
  const horizontalPadding = (picWidth - options.imageWidth) / 2;
  const verticalPadding = horizontalPadding;
  const picHeight = Math.ceil(options.imageHeight + verticalPadding * 2);
  const picFrameX = horizontalPadding;
  const picFrameY = verticalPadding;
  const { cardRadius, shadowFilter } = getPresetStyle(options.presetId);
  const bgDataUrl = getBackgroundImageDataUrl(options.presetId);
  const bgUrl = bgDataUrl || BACKGROUND_IMAGE_URLS[options.presetId as keyof typeof BACKGROUND_IMAGE_URLS];
  const backgroundSVG = generateBackgroundPicture(bgUrl, picWidth, picHeight);
  return `
    <svg width="${picWidth}" height="${picHeight}" viewBox="0 0 ${picWidth} ${picHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${shadowFilter}
        <clipPath id="rounded-clip">
          <rect x="${picFrameX}" y="${picFrameY}" width="${options.imageWidth}" height="${options.imageHeight}" rx="${cardRadius}" />
        </clipPath>
      </defs>
      ${backgroundSVG}
      <g filter="${shadowFilter ? 'url(#shadow)' : ''}">
        <image href="${options.imageData}"
               x="${picFrameX}" y="${picFrameY}"
               width="${options.imageWidth}" height="${options.imageHeight}"
               clip-path="url(#rounded-clip)"
               preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
