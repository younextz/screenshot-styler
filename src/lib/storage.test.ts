import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSettings, saveSettings } from './storage';

describe('settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('saves only provided settings and preserves false animation values', () => {
    saveSettings({
      presetId: 'gradient-ocean',
      aspectRatio: '16:9',
      animationsEnabled: false,
    });

    expect(localStorage.getItem('screenshot-styler-preset')).toBe(
      'gradient-ocean',
    );
    expect(localStorage.getItem('screenshot-styler-aspect')).toBe('16:9');
    expect(localStorage.getItem('screenshot-styler-animations')).toBe('false');
    expect(localStorage.getItem('screenshot-styler-palette')).toBeNull();
  });

  it('loads settings and parses animation flags from storage', () => {
    localStorage.setItem('screenshot-styler-preset', 'browser-macos');
    localStorage.setItem('screenshot-styler-palette', 'jetbrains-dark');
    localStorage.setItem('screenshot-styler-titlebar', 'macos');
    localStorage.setItem('screenshot-styler-aspect', '4:3');
    localStorage.setItem('screenshot-styler-animations', 'true');

    expect(loadSettings()).toEqual({
      presetId: 'browser-macos',
      paletteId: 'jetbrains-dark',
      titleBar: 'macos',
      aspectRatio: '4:3',
      animationsEnabled: true,
    });
  });

  it('returns an empty object when storage reads fail', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    expect(loadSettings()).toEqual({});
    expect(getItem).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Failed to load settings:',
      expect.any(Error),
    );
  });
});
