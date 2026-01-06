import { Palette } from './palettes';
import { AspectRatio, calculateOutputSize } from './svgRenderer';
import { CodeTheme } from './codeThemes';
import { highlightCodeToTokens, HighlightedToken } from './syntaxHighlighter';

interface CodeSnippetRenderOptions {
  presetId: string;
  palette: Palette;
  aspectRatio: AspectRatio;
  code: string;
  codeTheme: CodeTheme;
  languageId: string;
  fontSize: number;
  lineHeight: number;
  padding: number;
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

function generateGradientSoft(palette: Palette, width: number, height: number): string {
  const id = 'grad-soft';
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="70%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientBold(palette: Palette, width: number, height: number): string {
  const id = 'grad-bold';
  return `
    <defs>
      <linearGradient id="${id}" x1="-20%" y1="0%" x2="120%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[0]}" />
        <stop offset="55%" stop-color="${palette.swatches[3] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[0]}" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateMeshGradient(palette: Palette, width: number, height: number): string {
  const id = 'mesh';
  return `
    <defs>
      <radialGradient id="${id}-1" cx="28%" cy="32%" r="45%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[0]}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="1" />
      </radialGradient>
      <radialGradient id="${id}-2" cx="72%" cy="68%" r="50%">
        <stop offset="0%" stop-color="${palette.swatches[3] || palette.swatches[1]}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="${palette.swatches[0]}" stop-opacity="1" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#${id}-1)" opacity="0.9" />
    <rect width="${width}" height="${height}" fill="url(#${id}-2)" opacity="0.9" />
    ${softOverlays(width, height, id)}
  `;
}

function generateBlobDuo(palette: Palette, width: number, height: number): string {
  const id = 'blur-duo';
  return `
    <defs>
      <filter id="${id}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <ellipse cx="${width * 0.3}" cy="${height * 0.4}" rx="${width * 0.3}" ry="${height * 0.35}" 
             fill="${palette.swatches[2] || palette.swatches[0]}" filter="url(#${id})" opacity="0.6" />
    <ellipse cx="${width * 0.7}" cy="${height * 0.6}" rx="${width * 0.35}" ry="${height * 0.3}" 
             fill="${palette.swatches[3] || palette.swatches[1]}" filter="url(#${id})" opacity="0.6" />
    ${softOverlays(width, height, id)}
  `;
}

function generateBlobTrio(palette: Palette, width: number, height: number): string {
  const id = 'blur-trio';
  return `
    <defs>
      <filter id="${id}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="70" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <ellipse cx="${width * 0.25}" cy="${height * 0.35}" rx="${width * 0.25}" ry="${height * 0.3}" 
             fill="${palette.swatches[2] || palette.swatches[0]}" filter="url(#${id})" opacity="0.55" />
    <ellipse cx="${width * 0.75}" cy="${height * 0.45}" rx="${width * 0.3}" ry="${height * 0.25}" 
             fill="${palette.swatches[3] || palette.swatches[1]}" filter="url(#${id})" opacity="0.55" />
    <ellipse cx="${width * 0.5}" cy="${height * 0.75}" rx="${width * 0.35}" ry="${height * 0.28}" 
             fill="${palette.swatches[4] || palette.swatches[2]}" filter="url(#${id})" opacity="0.55" />
    ${softOverlays(width, height, id)}
  `;
}

function generateDotGrid(palette: Palette, width: number, height: number): string {
  const id = 'dot';
  return `
    <defs>
      <pattern id="dot-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="2" fill="${palette.swatches[2] || palette.swatches[1]}" opacity="0.25" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />
    <rect width="${width}" height="${height}" fill="url(#dot-pattern)" />
    ${softOverlays(width, height, id)}
  `;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function preserveWhitespace(text: string): string {
  return text
    .replace(/\t/g, '    ')
    .replace(/ /g, '\u00A0');
}

function generateHighlightedCodeLines(
  code: string,
  languageId: string,
  themeId: string,
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  defaultColor: string
): string {
  const highlightedLines = highlightCodeToTokens(code, languageId, themeId);
  const fontFamily = "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace";

  return highlightedLines
    .map((lineTokens: HighlightedToken[], index: number) => {
      const lineY = y + index * lineHeight;

      if (lineTokens.length === 0 || (lineTokens.length === 1 && lineTokens[0].text === '')) {
        return `<text x="${x}" y="${lineY}" xml:space="preserve" font-family="${fontFamily}" font-size="${fontSize}" fill="${defaultColor}">\u00A0</text>`;
      }

      const tspans = lineTokens
        .map((token: HighlightedToken) => {
          const preservedText = preserveWhitespace(token.text);
          const escapedText = escapeXml(preservedText);
          return `<tspan fill="${token.color}">${escapedText}</tspan>`;
        })
        .join('');

      return `<text x="${x}" y="${lineY}" xml:space="preserve" font-family="${fontFamily}" font-size="${fontSize}">${tspans}</text>`;
    })
    .join('\n');
}

function calculateCodeDimensions(
  code: string,
  fontSize: number,
  lineHeight: number,
  padding: number
): { width: number; height: number } {
  const lines = code.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const charWidth = fontSize * 0.6;
  const width = Math.max(400, maxLineLength * charWidth + padding * 2);
  const height = Math.max(200, lines.length * lineHeight + padding * 2);
  return { width, height };
}

export function generateCodeSnippetSVG(options: CodeSnippetRenderOptions): string {
  const {
    presetId,
    palette,
    aspectRatio,
    code,
    codeTheme,
    languageId,
    fontSize = 14,
    lineHeight = 22,
    padding = 24,
  } = options;

  const codeDimensions = calculateCodeDimensions(code, fontSize, lineHeight, padding);
  const { width, height } = calculateOutputSize(
    codeDimensions.width,
    codeDimensions.height,
    aspectRatio
  );

  const codeBlockX = (width - codeDimensions.width) / 2;
  const codeBlockY = (height - codeDimensions.height) / 2;
  const cardRadius = 12;

  let backgroundSVG = '';
  let shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';

  switch (presetId) {
    case 'gradient-soft':
      backgroundSVG = generateGradientSoft(palette, width, height);
      break;
    case 'gradient-bold':
      backgroundSVG = generateGradientBold(palette, width, height);
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.2"/></filter>';
      break;
    case 'mesh-gradient':
      backgroundSVG = generateMeshGradient(palette, width, height);
      break;
    case 'blob-duo':
      backgroundSVG = generateBlobDuo(palette, width, height);
      break;
    case 'blob-trio':
      backgroundSVG = generateBlobTrio(palette, width, height);
      break;
    case 'dot-grid':
      backgroundSVG = generateDotGrid(palette, width, height);
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>';
      break;
    case 'browser-macos':
    case 'browser-windows':
    case 'device-laptop':
    case 'device-phone':
    case 'card-elevated':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />`;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="20" stdDeviation="40" flood-opacity="0.3"/></filter>';
      break;
    case 'card-outlined':
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />`;
      shadowFilter = '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="12" flood-opacity="0.12"/></filter>';
      break;
    default:
      backgroundSVG = `<rect width="${width}" height="${height}" fill="${palette.swatches[0]}" />`;
  }

  const codeTextX = codeBlockX + padding;
  const codeTextY = codeBlockY + padding + fontSize;
  const codeLines = generateHighlightedCodeLines(code, languageId, codeTheme.id, codeTextX, codeTextY, fontSize, lineHeight, codeTheme.foreground);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${shadowFilter}
      </defs>
      ${backgroundSVG}
      <g filter="url(#shadow)">
        <rect x="${codeBlockX}" y="${codeBlockY}" width="${codeDimensions.width}" height="${codeDimensions.height}"
              rx="${cardRadius}" fill="${codeTheme.background}" />
        ${codeLines}
      </g>
    </svg>
  `.trim();
}
