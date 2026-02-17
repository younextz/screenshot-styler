import { Palette } from './palettes';
import {
  AnimationConfig,
  createAnimateElement,
  getAnimationDuration,
  prefersReducedMotion,
  createPulseOpacityAnimation,
  AnimationSpeed,
} from './animations';
import {
  BACKGROUND_IMAGE_URLS,
  getBackgroundImageDataUrl,
  preloadBackgroundImages,
} from './svg/backgroundAssets';
import {
  generateLaptopFrame,
  generateMacOSTitleBar,
  generatePhoneFrame,
  generateWindowsTitleBar,
} from './svg/frameGenerators';
import { getPresetStyle, isPictureBackgroundPreset } from './svg/presetStyles';

export { preloadBackgroundImages, getBackgroundImageDataUrl };

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
  animation?: AnimationConfig;
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

/**
 * Creates a shimmer animation effect by animating a moving highlight across the canvas
 * The highlight passes from top-left to bottom-right with a quick, smooth motion
 */
function createShimmerAnimation(baseId: string, speed: 'slow' | 'medium' | 'fast' = 'fast'): string {
  const duration = getAnimationDuration(speed);

  return `
    <defs>
      <radialGradient id="${baseId}-shimmer-animated" cx="0%" cy="0%" r="35%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
        <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
    </defs>
    <g>
      <circle cx="-50%" cy="-50%" r="200" fill="url(#${baseId}-shimmer-animated)" opacity="0.8">
        ${createAnimateElement({
          attributeName: 'cx',
          values: '-50%;150%',
          dur: duration,
          calcMode: 'spline',
          keySplines: '0.42 0 0.58 1',
        })}
        ${createAnimateElement({
          attributeName: 'cy',
          values: '-50%;150%',
          dur: duration,
          calcMode: 'spline',
          keySplines: '0.42 0 0.58 1',
        })}
      </circle>
    </g>
  `;
}

// ===========================================
// ANIMATION GENERATORS
// ===========================================

/**
 * Generates SVG animate elements for flow animation on linear gradients.
 * Flow animation shifts the gradient position smoothly across the canvas.
 */
function createFlowAnimation(animationConfig: AnimationConfig): string {
  if (!animationConfig.enabled || prefersReducedMotion()) {
    return '';
  }

  const duration = getAnimationDuration(animationConfig.speed);

  // Create smooth flow animation by animating x1, x2, y1, y2 coordinates
  // This creates a horizontal flow effect
  const animateX1 = createAnimateElement({
    attributeName: 'x1',
    values: '0%;100%;0%',
    dur: duration,
    calcMode: 'linear',
  });

  const animateX2 = createAnimateElement({
    attributeName: 'x2',
    values: '100%;200%;100%',
    dur: duration,
    calcMode: 'linear',
  });

  return `${animateX1}${animateX2}`;
}

/**
 * Generates SVG animate elements for diagonal flow animation.
 * Used for gradients like Ocean that benefit from diagonal movement.
 */
function createDiagonalFlowAnimation(animationConfig: AnimationConfig): string {
  if (!animationConfig.enabled || prefersReducedMotion()) {
    return '';
  }

  const duration = getAnimationDuration(animationConfig.speed);

  // Animate diagonal gradient coordinates
  const animateX1 = createAnimateElement({
    attributeName: 'x1',
    values: '0%;50%;0%',
    dur: duration,
    calcMode: 'linear',
  });

  const animateY1 = createAnimateElement({
    attributeName: 'y1',
    values: '0%;50%;0%',
    dur: duration,
    calcMode: 'linear',
  });

  const animateX2 = createAnimateElement({
    attributeName: 'x2',
    values: '100%;150%;100%',
    dur: duration,
    calcMode: 'linear',
  });

  const animateY2 = createAnimateElement({
    attributeName: 'y2',
    values: '100%;150%;100%',
    dur: duration,
    calcMode: 'linear',
  });

  return `${animateX1}${animateY1}${animateX2}${animateY2}`;
}

/**
 * Generates SVG animate elements for radial gradient position animation.
 * Used for mesh gradients with multiple radial gradients.
 */
function createRadialFlowAnimation(
  animationConfig: AnimationConfig,
  gradientIndex: number,
  totalGradients: number
): string {
  if (!animationConfig.enabled || prefersReducedMotion()) {
    return '';
  }

  const duration = getAnimationDuration(animationConfig.speed);

  // Offset each radial gradient's animation slightly for a flowing effect
  const delayRatio = (gradientIndex / totalGradients) * 0.5;
  const begin = `${delayRatio}s`;

  // Define different animation paths for each blob to create organic movement
  const cxValues = ['25%', '35%', '20%'];
  const cyValues = ['30%', '35%', '25%'];

  if (gradientIndex % 2 === 1) {
    cxValues.reverse();
  }

  const animateCx = createAnimateElement({
    attributeName: 'cx',
    values: cxValues.join(';'),
    dur: duration,
    calcMode: 'spline',
    keySplines: '0.42 0 0.58 1; 0.42 0 0.58 1',
    begin,
  });

  const animateCy = createAnimateElement({
    attributeName: 'cy',
    values: cyValues.join(';'),
    dur: duration,
    calcMode: 'spline',
    keySplines: '0.42 0 0.58 1; 0.42 0 0.58 1',
    begin,
  });

  return `${animateCx}${animateCy}`;
}

// ===========================================
// ANIMATION UTILITIES
// ===========================================

/**
 * Applies pulse animation to gradient stops
 */
function applyPulseAnimation(
  animationsEnabled: boolean,
  speed: AnimationSpeed = 'slow'
): string {
  if (!animationsEnabled) return '';
  return createPulseOpacityAnimation(speed, 0.8);
}

// ===========================================
// GRADIENT GENERATORS (6 presets)
// ===========================================

function generateGradientSunset(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-sunset';
  // Warm orange → pink → soft purple horizontal gradient
  const animationElements = animation ? createFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[3] || palette.swatches[1]}" />
        ${animationElements}
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientOcean(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-ocean';
  // Cool blue → teal diagonal gradient
  const animationElements = animation ? createDiagonalFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[3] || palette.swatches[1]}" />
        ${animationElements}
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientAurora(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-aurora';
  // Multi-color flowing gradient with wave effect
  const animationElements = animation ? createDiagonalFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}-base" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="35%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="65%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[3] || palette.swatches[2] || palette.swatches[0]}" />
        ${animationElements}
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

function generateGradientRose(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-rose';
  // Soft pink-peach gradient with shimmer animation effect
  const animationElements = animation ? createDiagonalFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="60%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
        ${animationElements}
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${createShimmerAnimation(id, 'fast')}
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientMidnight(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-midnight';
  // Deep purple-blue dark gradient
  const animationElements = animation ? createFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
        ${animationElements}
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

function generateGradientMint(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-mint';
  // Green-teal light gradient with flow animation
  const animationElements = animation ? createDiagonalFlowAnimation(animation) : '';
  return `
    <defs>
      <linearGradient id="${id}" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="50%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="100%" stop-color="${palette.swatches[2] || palette.swatches[1] || palette.swatches[0]}" />
        ${animationElements}
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id})" />
    ${softOverlays(width, height, id)}
  `;
}

function generateGradientWave(
  palette: Palette,
  width: number,
  height: number,
  animation?: AnimationConfig
): string {
  const id = 'grad-wave';
  const isAnimated = Boolean(animation?.enabled) && !prefersReducedMotion();
  const duration = getAnimationDuration(animation?.speed ?? 'medium');
  return `
    <defs>
      <linearGradient id="${id}-base" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.swatches[0]}" />
        <stop offset="33%" stop-color="${palette.swatches[1] || palette.swatches[0]}" />
        <stop offset="66%" stop-color="${palette.swatches[2] || palette.swatches[1]}" />
        <stop offset="100%" stop-color="${palette.swatches[3] || palette.swatches[2] || palette.swatches[1]}" />
      </linearGradient>
      <linearGradient id="${id}-wave" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="${palette.swatches[2] || palette.swatches[0]}" stop-opacity="0.3">
          ${isAnimated ? `<animate attributeName="stop-color" values="${palette.swatches[2] || palette.swatches[0]};${palette.swatches[3] || palette.swatches[1]};${palette.swatches[4] || palette.swatches[2]};${palette.swatches[2] || palette.swatches[0]}" dur="${duration}" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"/>` : ''}
        </stop>
        <stop offset="50%" stop-color="${palette.swatches[3] || palette.swatches[1]}" stop-opacity="0.4">
          ${isAnimated ? `<animate attributeName="stop-color" values="${palette.swatches[3] || palette.swatches[1]};${palette.swatches[4] || palette.swatches[2]};${palette.swatches[2] || palette.swatches[0]};${palette.swatches[3] || palette.swatches[1]}" dur="${duration}" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"/>` : ''}
        </stop>
        <stop offset="100%" stop-color="${palette.swatches[4] || palette.swatches[2]}" stop-opacity="0.35">
          ${isAnimated ? `<animate attributeName="stop-color" values="${palette.swatches[4] || palette.swatches[2]};${palette.swatches[2] || palette.swatches[0]};${palette.swatches[3] || palette.swatches[1]};${palette.swatches[4] || palette.swatches[2]}" dur="${duration}" repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"/>` : ''}
        </stop>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#${id}-base)" />
    <rect width="${width}" height="${height}" fill="url(#${id}-wave)" />
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

type BackgroundRenderer = (
  options: RenderOptions,
  width: number,
  height: number,
) => string;
const BACKGROUND_RENDERER_REGISTRY: Record<string, BackgroundRenderer> = {
  'gradient-sunset': (options, width, height) =>
    generateGradientSunset(options.palette, width, height, options.animation),
  'gradient-ocean': (options, width, height) =>
    generateGradientOcean(options.palette, width, height, options.animation),
  'gradient-aurora': (options, width, height) =>
    generateGradientAurora(options.palette, width, height, options.animation),
  'gradient-rose': (options, width, height) =>
    generateGradientRose(options.palette, width, height, options.animation),
  'gradient-midnight': (options, width, height) =>
    generateGradientMidnight(options.palette, width, height, options.animation),
  'gradient-mint': (options, width, height) =>
    generateGradientMint(options.palette, width, height, options.animation),
  'gradient-wave': (options, width, height) =>
    generateGradientWave(options.palette, width, height, options.animation),
  'mesh-cosmic': (options, width, height) =>
    generateMeshCosmic(options.palette, width, height),
  'mesh-tropical': (options, width, height) =>
    generateMeshTropical(options.palette, width, height),
  'mesh-pastel': (options, width, height) =>
    generateMeshPastel(options.palette, width, height),
  'mesh-neon': (options, width, height) =>
    generateMeshNeon(options.palette, width, height),
  'solid-dark': (options, width, height) =>
    generateSolidDark(options.palette, width, height),
  'solid-light': (options, width, height) =>
    generateSolidLight(options.palette, width, height),
  'solid-gradient': (options, width, height) =>
    generateSolidGradient(options.palette, width, height),
  'pattern-dots': (options, width, height) =>
    generatePatternDots(options.palette, width, height),
  'pattern-grid': (options, width, height) =>
    generatePatternGrid(options.palette, width, height),
  'pattern-noise': (options, width, height) =>
    generatePatternNoise(options.palette, width, height),
};
function generateSolidBackground(options: RenderOptions, width: number, height: number): string {
  return `<rect width="${width}" height="${height}" fill="${options.palette.swatches[0]}" />`;
}
export function generateSVG(options: RenderOptions): string {
  const hasMacTitleBar = options.presetId === 'browser-macos' && options.titleBar === 'macos';
  const hasWindowsTitleBar = options.presetId === 'browser-windows' && options.titleBar === 'windows';
  const titleBarHeight = hasMacTitleBar ? 48 : hasWindowsTitleBar ? 36 : 0;
  const contentHeight = options.imageHeight + titleBarHeight;
  const { width, height } = calculateOutputSize(
    options.imageWidth,
    contentHeight,
    options.aspectRatio,
  );
  const frameX = (width - options.imageWidth) / 2;
  const contentTop = (height - contentHeight) / 2;
  const imageY = contentTop + titleBarHeight;
  const style = getPresetStyle(options.presetId);
  const cardRadius = style.cardRadius;
  const shadowFilter = style.shadowFilter;
  const backgroundRenderer = BACKGROUND_RENDERER_REGISTRY[options.presetId];
  const backgroundSVG = backgroundRenderer
    ? backgroundRenderer(options, width, height)
    : generateSolidBackground(options, width, height);
  let frameSVG = '';
  if (options.presetId === 'browser-macos' && options.titleBar === 'macos') {
    frameSVG = generateMacOSTitleBar(options.palette, frameX, contentTop, options.imageWidth);
  } else if (options.presetId === 'browser-windows' && options.titleBar === 'windows') {
    frameSVG = generateWindowsTitleBar(options.palette, frameX, contentTop, options.imageWidth);
  } else if (options.presetId === 'device-laptop') {
    frameSVG = generateLaptopFrame(
      options.palette,
      frameX,
      contentTop,
      options.imageWidth,
      options.imageHeight,
    );
  } else if (options.presetId === 'device-phone') {
    frameSVG = generatePhoneFrame(
      options.palette,
      frameX,
      contentTop,
      options.imageWidth,
      options.imageHeight,
      width,
    );
  }
  if (isPictureBackgroundPreset(options.presetId)) {
    const targetWidthRatio = 0.8;
    const picWidth = Math.ceil(options.imageWidth / targetWidthRatio);
    const horizontalPadding = (picWidth - options.imageWidth) / 2;
    const verticalPadding = horizontalPadding;
    const picHeight = Math.ceil(options.imageHeight + verticalPadding * 2);
    const picFrameX = horizontalPadding;
    const picFrameY = verticalPadding;
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
