import { describe, expect, it, vi } from 'vitest';
import {
  createAnimateElement,
  createAnimateTransformElement,
  createDefaultAnimationConfig,
  createPulseOpacityAnimation,
  createPulseRadiusAnimation,
  getAnimationDuration,
  prefersReducedMotion,
} from './animations';

describe('animation utilities', () => {
  it('creates animate elements with defaults and optional timing attributes', () => {
    const svg = createAnimateElement({
      attributeName: 'x1',
      values: '0%;100%;0%',
      dur: '6s',
      keyTimes: '0;0.5;1',
      begin: '250ms',
    });

    expect(svg).toBe(
      '<animate attributeName="x1" values="0%;100%;0%" dur="6s" repeatCount="indefinite" calcMode="linear" keyTimes="0;0.5;1" begin="250ms" />',
    );
  });

  it('creates animateTransform elements with caller-provided modes', () => {
    const svg = createAnimateTransformElement({
      attributeName: 'transform',
      type: 'rotate',
      values: '0 50 50;360 50 50',
      dur: '10s',
      repeatCount: '2',
      calcMode: 'paced',
    });

    expect(svg).toBe(
      '<animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="10s" repeatCount="2" calcMode="paced" />',
    );
  });

  it('uses preset timing and defaults for generated animation configs', () => {
    expect(getAnimationDuration('fast')).toBe('3s');
    expect(createDefaultAnimationConfig('shimmer')).toEqual({
      type: 'shimmer',
      speed: 'fast',
      enabled: true,
    });
    expect(createDefaultAnimationConfig('pulse', false)).toEqual({
      type: 'pulse',
      speed: 'slow',
      enabled: false,
    });
  });

  it('builds pulse animations with caller-provided ranges', () => {
    expect(createPulseOpacityAnimation('slow', 0.35)).toContain(
      'values="1;0.35;1"',
    );
    expect(createPulseOpacityAnimation('slow', 0.35)).toContain('dur="10s"');
    expect(createPulseRadiusAnimation('medium', 24, 80)).toContain(
      'values="80%;24%;80%"',
    );
    expect(createPulseRadiusAnimation('medium', 24, 80)).toContain('dur="6s"');
  });

  it('reads the reduced motion media query', () => {
    vi.mocked(window.matchMedia).mockReturnValueOnce({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    expect(prefersReducedMotion()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)',
    );
  });
});
