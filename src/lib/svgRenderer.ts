import { Palette } from './palettes';

const BACKGROUND_IMAGE_URLS = {
  'bg-picture-dark': '/backgrounds/bg-dark-bubbles.png',
  'bg-picture-light': '/backgrounds/bg-light-bubbles.png',
} as const;

// Cache for loaded background images as data URLs
const backgroundImageCache: Record<string, string> = {};

// Load a background image and convert to data URL
async function loadBackgroundImage(url: string): Promise<string> {
  if (backgroundImageCache[url]) {
    return backgroundImageCache[url];
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      backgroundImageCache[url] = dataUrl;
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// Pre-load all background images
export async function preloadBackgroundImages(): Promise<void> {
  const urls = Object.values(BACKGROUND_IMAGE_URLS);
  await Promise.all(urls.map(url => loadBackgroundImage(url)));
}

// Get cached background image data URL
export function getBackgroundImageDataUrl(presetId: string): string | null {
  const url = BACKGROUND_IMAGE_URLS[presetId as keyof typeof BACKGROUND_IMAGE_URLS];
  if (!url) return null;
  return backgroundImageCache[url] || null;
}

export type TitleBarType = 'macos' | 'windows' | 'none';
export type AspectRatio = 'auto' | '1:1' | '16:9' | '4:3';

interface RenderOptions {
  presetId: string;
  palette: Palette;
  titleBar: TitleBarType;
  aspectRatio: AspectRatio;
  imageData: string;
  imageWidth: number;
  imageHeight: number;
}

export function calculateOutputSize(
  ws: number,
  hs: number,
  aspectRatio: AspectRatio
): { width: number; height: number } {
  const padding = 60;
  const baseWidth = Math.ceil(ws + padding * 2);
  const baseHeight = Math.ceil(hs + padding * 2);

  if (aspectRatio === 'auto') {
    return { width: baseWidth, height: baseHeight };
  }

  const ratioMap: Record<string, number> = {
    '1:1': 1,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
  };

  const r = ratioMap[aspectRatio];

  if (!r) {
    return { width: baseWidth, height: baseHeight };
  }

  const widthFromHeight = Math.ceil(baseHeight * r);
  const heightFromWidth = Math.ceil(baseWidth / r);

  if (widthFromHeight >= baseWidth) {
    return { width: widthFromHeight, height: baseHeight };
  }

  return { width: baseWidth, height: heightFromWidth };
}

function softOverlays(width: number, height: number, baseId: string) {
  return `
    <defs>
      <filter id="${baseId}-grain" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2" result="noise" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.06" />
        </feComponentTransfer>
      </filter>
      <radialGradient id="${baseId}-vignette" cx="50%" cy="50%" r="70%">
        <stop offset="60%" stop-color="#1A1A1A" stop-opacity="0"/>
        <stop offset="100%" stop-color="#1A1A1A" stop-opacity="0.18"/>
      </radialGradient>
      <radialGradient id="${baseId}-glow" cx="35%" cy="25%" r="45%">
        <stop offset="0%" stop-color="#E6E6E6" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#E6E6E6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${baseId}-glow)" />
    <rect width="${width}" height="${height}" fill="url(#${baseId}-vignette)" />
    <rect width="${width}" height="${height}" filter="url(#${baseId}-grain)" opacity="0.35" />
  `;
}

// ===========================================
// GRADIENT GENERATORS (6 presets)
// ===========================================

function generateGradientSunset(palette: Palette, width: number, height: number): string {
  const id = 'grad-sunset';
  // Warm orange → pink → soft purple horizontal gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[3] || palette.swatches[1]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientOcean(palette: Palette, width: number, height: number): string {
  const id = 'grad-ocean';
  // Cool blue → teal diagonal gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[3] || palette.swatches[1]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientAurora(palette: Palette, width: number, height: number): string {
  const id = 'grad-aurora';
  // Multi-color flowing gradient with wave effect
  return `
    <defs>
      <linearGradient id="${id}-base" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="35%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="65%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[3] || palette.swatches[2] || palette.swatches[0]}" />
      </linearGradient>
      <radialGradient id="${id}-glow1" cx="20%" cy="80%" r="60%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[2]}" stop-opacity="0.4" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-glow2" cx="80%" cy="30%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[1]}" stop-opacity="0.35" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id}-base)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-glow1)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-glow2)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientRose(palette: Palette, width: number, height: number): string {
  const id = 'grad-rose';
  // Soft pink-peach gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="60%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
      </linearGradient>
      <radialGradient id="${id}-shimmer" cx="70%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    <rect width="${width}" height="${height}" fill="url(#${id}-shimmer)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientMidnight(palette: Palette, width: number, height: number): string {
  const id = 'grad-midnight';
  // Deep purple-blue dark gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
      </linearGradient>
      <radialGradient id="${id}-stars" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[3] || '#FFFFFF'}" stop-opacity="0.08" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    <rect width="${width}" height="${height}" fill="url(#${id}-stars)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientMint(palette: Palette, width: number, height: number): string {
  const id = 'grad-mint';
  // Green-teal light gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

// ===========================================
// MESH GENERATORS (4 presets)
// ===========================================

function generateMeshCosmic(palette: Palette, width: number, height: number): string {
  const id = 'mesh-cosmic';
  // Purple-pink-blue flowing mesh
  return `
    <defs>
      <radialGradient id="${id}-1" cx="25%" cy="25%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[0]}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-2" cx="75%" cy="30%" r="45%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[1]}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-3" cx="50%" cy="75%" r="55%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[2]}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-4" cx="20%" cy="70%" r="40%">
        <stop offset="0%" stop-color="${palette.swatches[1] || palette.swatches[0]}" stop-opacity="0.7" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-1)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-2)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-3)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-4)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateMeshTropical(palette: Palette, width: number, height: number): string {
  const id = 'mesh-tropical';
  // Orange-pink-cyan vibrant mesh
  return `
    <defs>
      <radialGradient id="${id}-1" cx="15%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${palette.swatches[1] || palette.swatches[0]}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-2" cx="85%" cy="25%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[1]}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-3" cx="60%" cy="80%" r="60%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[2]}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-4" cx="30%" cy="90%" r="45%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[3]}" stop-opacity="0.75" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-1)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-2)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-3)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-4)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateMeshPastel(palette: Palette, width: number, height: number): string {
  const id = 'mesh-pastel';
  // Soft pastel multi-color mesh
  return `
    <defs>
      <radialGradient id="${id}-1" cx="30%" cy="20%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[1] || palette.swatches[0]}" stop-opacity="0.7" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-2" cx="70%" cy="35%" r="45%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[1]}" stop-opacity="0.65" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-3" cx="45%" cy="70%" r="55%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[2]}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-4" cx="85%" cy="75%" r="40%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[3]}" stop-opacity="0.55" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-1)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-2)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-3)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-4)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateMeshNeon(palette: Palette, width: number, height: number): string {
  const id = 'mesh-neon';
  // Electric blue-pink-green mesh with glow effect
  return `
    <defs>
      <filter id="${id}-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <radialGradient id="${id}-1" cx="20%" cy="30%" r="55%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[0]}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-2" cx="80%" cy="20%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[1]}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-3" cx="50%" cy="80%" r="60%">
        <stop offset="0%" stop-color="${palette.swatches[4] || palette.swatches[2]}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="${id}-4" cx="75%" cy="65%" r="45%">
        <stop offset="0%" stop-color="${palette.swatches[1] || palette.swatches[0]}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <g filter="url(#${id}-glow)">
      <rect width="${width}" height="${height}" fill="url(#${id}-1)" />
      <rect width="${width}" height="${height}" fill="url(#${id}-2)" />
      <rect width="${width}" height="${height}" fill="url(#${id}-3)" />
      <rect width="${width}" height="${height}" fill="url(#${id}-4)" />
    </g>
    ${softOverlays(width, height, id)}
  `;
}

// ===========================================
// SOLID GENERATORS (3 presets)
// ===========================================

function generateSolidDark(palette: Palette, width: number, height: number): string {
  const id = 'solid-dark';
  // Clean dark gray background
  return `
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    ${softOverlays(width, height, id)}
  `;
}

function generateSolidLight(palette: Palette, width: number, height: number): string {
  const id = 'solid-light';
  // Clean light gray/white background
  return `
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    ${softOverlays(width, height, id)}
  `;
}

function generateSolidGradient(palette: Palette, width: number, height: number): string {
  const id = 'solid-gradient';
  // Very subtle monochrome gradient
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

// ===========================================
// PATTERN GENERATORS (3 presets)
// ===========================================

function generatePatternDots(palette: Palette, width: number, height: number): string {
  const id = 'pattern-dots';
  // Grid of dots on solid background
  return `
    <defs>
      <pattern id="${id}-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="2" fill="${palette.swatches[2] || palette.swatches[1]}" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-pattern)" />
    ${softOverlays(width, height, id)}
  `;
}

function generatePatternGrid(palette: Palette, width: number, height: number): string {
  const id = 'pattern-grid';
  // Subtle grid lines pattern
  return `
    <defs>
      <pattern id="${id}-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="40" y1="0" x2="40" y2="40" stroke="${palette.swatches[2] || palette.swatches[1]}" stroke-width="1" opacity="0.15" />
        <line x1="0" y1="40" x2="40" y2="40" stroke="${palette.swatches[2] || palette.swatches[1]}" stroke-width="1" opacity="0.15" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-pattern)" />
    ${softOverlays(width, height, id)}
  `;
}

function generatePatternNoise(palette: Palette, width: number, height: number): string {
  const id = 'pattern-noise';
  // Textured noise background
  return `
    <defs>
      <filter id="${id}-noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="5" result="noise" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.12" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" mode="overlay" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" filter="url(#${id}-noise)" />
    ${softOverlays(width, height, id)}
  `;
}

function generateBackgroundPicture(
  imageUrl: string,
  width: number,
  height: number
): string {
  return `
    <image
      href="${imageUrl}"
      x="0" y="0"
      width="${width}" height="${height}"
      preserveAspectRatio="xMidYMid slice"
    />
  `;
}

function generateMacOSTitleBar(palette: Palette, x: number, y: number, width: number): string {
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

function generateWindowsTitleBar(palette: Palette, x: number, y: number, width: number): string {
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${width}" height="36" fill="${palette.swatches[1] || '#1A1A1A'}" />
      <line x1="${width - 80}" y1="12" x2="${width - 68}" y2="24" stroke="${palette.swatches[4] || '#FFF'}" stroke-width="2" />
      <rect x="${width - 50}" y="8" width="16" height="2" fill="${palette.swatches[4] || '#FFF'}" />
      <rect x="${width - 22}" y="8" width="14" height="14" fill="none" stroke="${palette.swatches[4] || '#FFF'}" stroke-width="2" />
    </g>
  `;
}

export function generateSVG(options: RenderOptions): string {
  const hasMacTitleBar = options.presetId === 'browser-macos' && options.titleBar === 'macos';
  const hasWindowsTitleBar = options.presetId === 'browser-windows' && options.titleBar === 'windows';
  const titleBarHeight = hasMacTitleBar ? 48 : hasWindowsTitleBar ? 36 : 0;

  const contentHeight = options.imageHeight + titleBarHeight;

  const { width, height } = calculateOutputSize(
    options.imageWidth,
    contentHeight,
    options.aspectRatio
  );

  const frameX = (width - options.imageWidth) / 2;
  const contentTop = (height - contentHeight) / 2;
  const imageY = contentTop + titleBarHeight;

  let backgroundSVG = '';
  let frameSVG = '';
  let cardRadius = 0;
  let shadowFilter = '';

  // Generate background based on preset
  switch (options.presetId) {
    // Gradient presets (6)
    case 'gradient-sunset':
      backgroundSVG = generateGradientSunset(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    case 'gradient-ocean':
      backgroundSVG = generateGradientOcean(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    case 'gradient-aurora':
      backgroundSVG = generateGradientAurora(options.palette, width, height);
      cardRadius = 28;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.2"/></filter>';
      break;
    case 'gradient-rose':
      backgroundSVG = generateGradientRose(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    case 'gradient-midnight':
      backgroundSVG = generateGradientMidnight(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.25"/></filter>';
      break;
    case 'gradient-mint':
      backgroundSVG = generateGradientMint(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    // Mesh presets (4)
    case 'mesh-cosmic':
      backgroundSVG = generateMeshCosmic(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.18"/></filter>';
      break;
    case 'mesh-tropical':
      backgroundSVG = generateMeshTropical(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.18"/></filter>';
      break;
    case 'mesh-pastel':
      backgroundSVG = generateMeshPastel(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.12"/></filter>';
      break;
    case 'mesh-neon':
      backgroundSVG = generateMeshNeon(options.palette, width, height);
      cardRadius = 28;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.22"/></filter>';
      break;
    // Solid presets (3)
    case 'solid-dark':
      backgroundSVG = generateSolidDark(options.palette, width, height);
      cardRadius = 20;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.3"/></filter>';
      break;
    case 'solid-light':
      backgroundSVG = generateSolidLight(options.palette, width, height);
      cardRadius = 20;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="12" flood-opacity="0.1"/></filter>';
      break;
    case 'solid-gradient':
      backgroundSVG = generateSolidGradient(options.palette, width, height);
      cardRadius = 20;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="14" flood-opacity="0.12"/></filter>';
      break;
    // Pattern presets (3)
    case 'pattern-dots':
      backgroundSVG = generatePatternDots(options.palette, width, height);
      cardRadius = 16;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>';
      break;
    case 'bg-picture-dark':
    case 'bg-picture-light': {
      // Background is handled separately in the picture background section below
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    }
    case 'browser-macos':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 12;
      if (options.titleBar === 'macos') {
        frameSVG = generateMacOSTitleBar(options.palette, frameX, contentTop, options.imageWidth);
      }
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.2"/></filter>';
      break;
    case 'browser-windows':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 8;
      if (options.titleBar === 'windows') {
        frameSVG = generateWindowsTitleBar(options.palette, frameX, contentTop, options.imageWidth);
      }
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="16" flood-opacity="0.18"/></filter>';
      break;
    case 'device-laptop':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 6;
      frameSVG = `
        <rect x="${frameX - 10}" y="${contentTop - 10}" width="${options.imageWidth + 20}" height="${options.imageHeight + 20}"
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="8" />
        <rect x="${frameX - 50}" y="${contentTop + options.imageHeight + 12}" width="${options.imageWidth + 100}" height="8"
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="2" />
      `;
      break;
    case 'device-phone':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 8;
      frameSVG = `
        <rect x="${frameX - 12}" y="${contentTop - 40}" width="${options.imageWidth + 24}" height="${options.imageHeight + 80}"
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="24" />
        <circle cx="${width / 2}" cy="${contentTop + options.imageHeight + 50}" r="15"
                fill="${options.palette.swatches[0]}" />
      `;
      break;
    case 'card-elevated':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 28;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="20" stdDeviation="40" flood-opacity="0.3"/></filter>';
      break;
    case 'card-outlined':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 16;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="12" flood-opacity="0.12"/></filter>';
      break;
    default:
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
  }

  // For picture backgrounds, render screenshot at ~80% width with background padding
  const isPictureBackground = options.presetId === 'bg-picture-dark' || options.presetId === 'bg-picture-light';

  if (isPictureBackground) {
    // Calculate dimensions so screenshot fills ~80% of width
    const targetWidthRatio = 0.8;
    const picWidth = Math.ceil(options.imageWidth / targetWidthRatio);
    const horizontalPadding = (picWidth - options.imageWidth) / 2;
    const verticalPadding = horizontalPadding; // Same padding on all sides
    const picHeight = Math.ceil(options.imageHeight + verticalPadding * 2);

    const picFrameX = horizontalPadding;
    const picFrameY = verticalPadding;

    // Use cached data URL if available, otherwise fall back to relative URL
    const bgDataUrl = getBackgroundImageDataUrl(options.presetId);
    const bgUrl = bgDataUrl || BACKGROUND_IMAGE_URLS[options.presetId as keyof typeof BACKGROUND_IMAGE_URLS];
    const picBackgroundSVG = generateBackgroundPicture(bgUrl, picWidth, picHeight);

    return `
      <svg width="${picWidth}" height="${picHeight}" viewBox="0 0 ${picWidth} ${picHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${shadowFilter}
          <clipPath id="rounded-clip">
            <rect x="${picFrameX}" y="${picFrameY}" width="${options.imageWidth}" height="${options.imageHeight}" rx="${cardRadius}" />
          </clipPath>
        </defs>
        ${picBackgroundSVG}
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

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${shadowFilter}
      </defs>
      ${backgroundSVG}
      ${frameSVG}
      <g filter="${shadowFilter ? 'url(#shadow)' : ''}">
        <rect x="${frameX}" y="${imageY}" width="${options.imageWidth}" height="${options.imageHeight}"
              rx="${cardRadius}" fill="white" />
        <image href="${options.imageData}"
               x="${frameX}" y="${imageY}"
               width="${options.imageWidth}" height="${options.imageHeight}"
               clip-path="inset(0 round ${cardRadius}px)"
               preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
