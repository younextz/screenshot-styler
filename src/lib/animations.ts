/**
 * Animation system for dynamic SVG background gradients
 * Provides type-safe animation configurations and utilities for generating
 * SVG <animate> and <animateTransform> elements
 */

// Animation type definitions
export type AnimationType = 'flow' | 'pulse' | 'rotate' | 'wave' | 'shimmer';
export type AnimationSpeed = 'slow' | 'medium' | 'fast';

/**
 * Configuration for animations on presets
 */
export interface AnimationConfig {
  type: AnimationType;
  speed: AnimationSpeed;
  enabled: boolean;
}

/**
 * Timing configuration for animation speeds
 */
export interface AnimationTiming {
  duration: string;
  durationMs: number;
}

/**
 * Parameters for generating SVG animate elements
 */
export interface AnimateParams {
  attributeName: string;
  values: string;
  dur: string;
  repeatCount?: string;
  calcMode?: 'linear' | 'discrete' | 'paced' | 'spline';
  keyTimes?: string;
  keySplines?: string;
  begin?: string;
}

/**
 * Parameters for SVG animateTransform elements
 */
export interface AnimateTransformParams {
  attributeName: 'transform';
  type: 'translate' | 'scale' | 'rotate' | 'skewX' | 'skewY';
  values: string;
  dur: string;
  repeatCount?: string;
  calcMode?: 'linear' | 'discrete' | 'paced' | 'spline';
  keyTimes?: string;
  keySplines?: string;
  begin?: string;
}

/**
 * Animation timing presets mapped to durations
 */
export const ANIMATION_TIMINGS: Record<AnimationSpeed, AnimationTiming> = {
  slow: { duration: '10s', durationMs: 10000 },
  medium: { duration: '6s', durationMs: 6000 },
  fast: { duration: '3s', durationMs: 3000 },
};

/**
 * Default animation presets for different animation types
 */
export const ANIMATION_PRESETS: Record<
  AnimationType,
  { description: string; defaultSpeed: AnimationSpeed }
> = {
  flow: {
    description: 'Gradient flows smoothly across the canvas',
    defaultSpeed: 'medium',
  },
  pulse: {
    description: 'Gentle pulsing opacity or scale effect',
    defaultSpeed: 'slow',
  },
  rotate: {
    description: 'Continuous rotation around center point',
    defaultSpeed: 'slow',
  },
  wave: {
    description: 'Sinusoidal wave-like movement',
    defaultSpeed: 'medium',
  },
  shimmer: {
    description: 'Quick highlight pass effect',
    defaultSpeed: 'fast',
  },
};

/**
 * Generates SVG <animate> element string
 */
export function createAnimateElement(params: AnimateParams): string {
  const {
    attributeName,
    values,
    dur,
    repeatCount = 'indefinite',
    calcMode = 'linear',
    keyTimes,
    keySplines,
    begin,
  } = params;

  const attrs: string[] = [
    `attributeName="${attributeName}"`,
    `values="${values}"`,
    `dur="${dur}"`,
    `repeatCount="${repeatCount}"`,
    `calcMode="${calcMode}"`,
  ];

  if (keyTimes) attrs.push(`keyTimes="${keyTimes}"`);
  if (keySplines) attrs.push(`keySplines="${keySplines}"`);
  if (begin) attrs.push(`begin="${begin}"`);

  return `<animate ${attrs.join(' ')} />`;
}

/**
 * Generates SVG <animateTransform> element string
 */
export function createAnimateTransformElement(
  params: AnimateTransformParams
): string {
  const {
    attributeName,
    type,
    values,
    dur,
    repeatCount = 'indefinite',
    calcMode = 'linear',
    keyTimes,
    keySplines,
    begin,
  } = params;

  const attrs: string[] = [
    `attributeName="${attributeName}"`,
    `type="${type}"`,
    `values="${values}"`,
    `dur="${dur}"`,
    `repeatCount="${repeatCount}"`,
    `calcMode="${calcMode}"`,
  ];

  if (keyTimes) attrs.push(`keyTimes="${keyTimes}"`);
  if (keySplines) attrs.push(`keySplines="${keySplines}"`);
  if (begin) attrs.push(`begin="${begin}"`);

  return `<animateTransform ${attrs.join(' ')} />`;
}

/**
 * Gets animation duration for a given speed
 */
export function getAnimationDuration(speed: AnimationSpeed): string {
  return ANIMATION_TIMINGS[speed].duration;
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a default animation configuration
 */
export function createDefaultAnimationConfig(
  type: AnimationType,
  enabled: boolean = true
): AnimationConfig {
  return {
    type,
    speed: ANIMATION_PRESETS[type].defaultSpeed,
    enabled,
  };
}
