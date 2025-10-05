import { Palette } from './palettes';

export type TitleBarType = 'macos' | 'windows' | 'none';
export type AspectRatio = 'auto' | '1:1' | '16:9' | '4:3' | '9:16' | '1200x630';

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
  // Add generous padding (40% extra space) for beautiful styling
  const paddingFactor = 1.4;
  
  if (aspectRatio === 'auto') {
    return { 
      width: Math.ceil(ws * paddingFactor), 
      height: Math.ceil(hs * paddingFactor) 
    };
  }

  const ratioMap: Record<string, number> = {
    '1:1': 1,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '9:16': 9 / 16,
    '1200x630': 1200 / 630,
  };

  const r = ratioMap[aspectRatio];
  
  // Calculate minimum container size, then add padding
  const minHeight = Math.max(hs, Math.ceil(ws / r));
  const minWidth = Math.ceil(minHeight * r);
  
  // Apply padding factor to create generous whitespace
  const height = Math.ceil(minHeight * paddingFactor);
  const width = Math.ceil(minWidth * paddingFactor);

  return { width, height };
}

function generateGradientSoft(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <linearGradient id="grad-soft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${palette.swatches[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${palette.swatches[1] || palette.swatches[0]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad-soft)" />
  `;
}

function generateGradientBold(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <linearGradient id="grad-bold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${palette.swatches[2] || palette.swatches[0]};stop-opacity:1" />
        <stop offset="50%" style="stop-color:${palette.swatches[3] || palette.swatches[1]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${palette.swatches[4] || palette.swatches[0]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad-bold)" />
  `;
}

function generateMeshGradient(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <radialGradient id="mesh-1" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:${palette.swatches[2] || palette.swatches[0]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${palette.swatches[0]};stop-opacity:1" />
      </radialGradient>
      <radialGradient id="mesh-2" cx="70%" cy="70%">
        <stop offset="0%" style="stop-color:${palette.swatches[3] || palette.swatches[1]};stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:${palette.swatches[0]};stop-opacity:1" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#mesh-1)" opacity="0.8" />
    <rect width="${width}" height="${height}" fill="url(#mesh-2)" opacity="0.8" />
  `;
}

function generateBlobDuo(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <filter id="blur-duo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <ellipse cx="${width * 0.3}" cy="${height * 0.4}" rx="${width * 0.3}" ry="${height * 0.35}" 
             fill="${palette.swatches[2] || palette.swatches[0]}" filter="url(#blur-duo)" opacity="0.7" />
    <ellipse cx="${width * 0.7}" cy="${height * 0.6}" rx="${width * 0.35}" ry="${height * 0.3}" 
             fill="${palette.swatches[3] || palette.swatches[1]}" filter="url(#blur-duo)" opacity="0.7" />
  `;
}

function generateBlobTrio(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <filter id="blur-trio">
        <feGaussianBlur in="SourceGraphic" stdDeviation="70" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <ellipse cx="${width * 0.25}" cy="${height * 0.35}" rx="${width * 0.25}" ry="${height * 0.3}" 
             fill="${palette.swatches[2] || palette.swatches[0]}" filter="url(#blur-trio)" opacity="0.6" />
    <ellipse cx="${width * 0.75}" cy="${height * 0.45}" rx="${width * 0.3}" ry="${height * 0.25}" 
             fill="${palette.swatches[3] || palette.swatches[1]}" filter="url(#blur-trio)" opacity="0.6" />
    <ellipse cx="${width * 0.5}" cy="${height * 0.75}" rx="${width * 0.35}" ry="${height * 0.28}" 
             fill="${palette.swatches[4] || palette.swatches[2]}" filter="url(#blur-trio)" opacity="0.6" />
  `;
}

function generateDotGrid(palette: Palette, width: number, height: number): string {
  return `
    <defs>
      <pattern id="dot-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="2" fill="${palette.swatches[2] || palette.swatches[1]}" opacity="0.3" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#dot-pattern)" />
  `;
}

function generateMacOSTitleBar(palette: Palette, x: number, y: number, width: number): string {
  // High‑fidelity macOS title bar using vector UI kit primitives
  const h = 56; // bar height
  const bg = palette.swatches[1] || '#1A1A1A';
  const fg = palette.swatches[4] || '#FFFFFF';
  return `
    <g transform="translate(${x}, ${y})">
      <!-- Background with rounded top corners and subtle bottom divider -->
      <rect width="${width}" height="${h}" fill="${bg}" rx="12" ry="12" />
      <rect y="${h - 1}" width="${width}" height="1" fill="rgba(255,255,255,0.06)" />
      <!-- Traffic lights (12px) with fine inner ring -->
      <g transform="translate(16, ${Math.round(h / 2)})">
        <circle cx="0" cy="0" r="7" fill="#FF5F57" />
        <circle cx="24" cy="0" r="7" fill="#FEBE2E" />
        <circle cx="48" cy="0" r="7" fill="#28C840" />
        <circle cx="0" cy="0" r="7" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.5" />
        <circle cx="24" cy="0" r="7" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.5" />
        <circle cx="48" cy="0" r="7" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.5" />
      </g>
      <!-- Centered notch / camera indicator (subtle) -->
      <circle cx="${Math.round(width / 2)}" cy="${Math.round(h / 2)}" r="2" fill="rgba(255,255,255,0.12)" />
    </g>
  `;
}

function generateWindowsTitleBar(palette: Palette, x: number, y: number, width: number): string {
  // High‑fidelity Windows title bar with crisp system icons (min/max/close)
  const h = 46;
  const bg = palette.swatches[1] || '#1A1A1A';
  const fg = palette.swatches[4] || '#FFFFFF';
  const pad = 12;
  const iconY = Math.round(h / 2);
  return `
    <g transform="translate(${x}, ${y})">
      <rect width="${width}" height="${h}" fill="${bg}" />
      <rect y="${h - 1}" width="${width}" height="1" fill="rgba(255,255,255,0.06)" />
      <!-- Window controls on the right: minimize, maximize, close -->
      <g stroke="${fg}" stroke-width="1.5" stroke-linecap="square" fill="none">
        <!-- Minimize -->
        <line x1="${width - pad - 72}" y1="${iconY + 4}" x2="${width - pad - 56}" y2="${iconY + 4}" />
        <!-- Maximize -->
        <rect x="${width - pad - 48}" y="${iconY - 8}" width="14" height="14" />
        <!-- Close (X) -->
        <line x1="${width - pad - 12 - 12}" y1="${iconY - 6}" x2="${width - pad - 12}" y2="${iconY + 6}" />
        <line x1="${width - pad - 12}" y1="${iconY - 6}" x2="${width - pad - 12 - 12}" y2="${iconY + 6}" />
      </g>
    </g>
  `;
}

export function generateSVG(options: RenderOptions): string {
  const { width, height } = calculateOutputSize(
    options.imageWidth,
    options.imageHeight,
    options.aspectRatio
  );

  const centerX = (width - options.imageWidth) / 2;
  const centerY = (height - options.imageHeight) / 2;

  let backgroundSVG = '';
  let frameSVG = '';
  let cardRadius = 0;
  let shadowFilter = '';

  // Generate background based on preset
  switch (options.presetId) {
    case 'gradient-soft':
      backgroundSVG = generateGradientSoft(options.palette, width, height);
      cardRadius = 24;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';
      break;
    case 'gradient-bold':
      backgroundSVG = generateGradientBold(options.palette, width, height);
      cardRadius = 28;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.2"/></filter>';
      break;
    case 'mesh-gradient':
      backgroundSVG = generateMeshGradient(options.palette, width, height);
      cardRadius = 24;
      break;
    case 'blob-duo':
      backgroundSVG = generateBlobDuo(options.palette, width, height);
      cardRadius = 20;
      break;
    case 'blob-trio':
      backgroundSVG = generateBlobTrio(options.palette, width, height);
      cardRadius = 20;
      break;
    case 'dot-grid':
      backgroundSVG = generateDotGrid(options.palette, width, height);
      cardRadius = 16;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>';
      break;
    case 'browser-macos':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 12;
      if (options.titleBar === 'macos') {
        frameSVG = generateMacOSTitleBar(options.palette, centerX, centerY - 56, options.imageWidth);
      }
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.2"/></filter>';
      break;
    case 'browser-windows':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 8;
      if (options.titleBar === 'windows') {
        frameSVG = generateWindowsTitleBar(options.palette, centerX, centerY - 46, options.imageWidth);
      }
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="16" flood-opacity="0.18"/></filter>';
      break;
    case 'device-laptop':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 6;
      frameSVG = `
        <rect x="${centerX - 10}" y="${centerY - 10}" width="${options.imageWidth + 20}" height="${options.imageHeight + 20}" 
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="8" />
        <rect x="${centerX - 50}" y="${centerY + options.imageHeight + 12}" width="${options.imageWidth + 100}" height="8" 
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="2" />
      `;
      break;
    case 'device-phone':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
      cardRadius = 8;
      frameSVG = `
        <rect x="${centerX - 12}" y="${centerY - 40}" width="${options.imageWidth + 24}" height="${options.imageHeight + 80}" 
              fill="${options.palette.swatches[1] || '#1A1A1A'}" rx="24" />
        <circle cx="${width / 2}" cy="${centerY + options.imageHeight + 50}" r="15" 
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

  const titleBarOffset = options.titleBar === 'macos' ? 56 : options.titleBar === 'windows' ? 46 : 0;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${shadowFilter}
      </defs>
      ${backgroundSVG}
      ${frameSVG}
      <g filter="${shadowFilter ? 'url(#shadow)' : ''}">
        <rect x="${centerX}" y="${centerY + titleBarOffset}" width="${options.imageWidth}" height="${options.imageHeight}" 
              rx="${cardRadius}" fill="white" />
        <image href="${options.imageData}" 
               x="${centerX}" y="${centerY + titleBarOffset}" 
               width="${options.imageWidth}" height="${options.imageHeight}"
               clip-path="inset(0 round ${cardRadius}px)"
               preserveAspectRatio="xMidYMid meet" />
      </g>
    </svg>
  `.trim();
}
