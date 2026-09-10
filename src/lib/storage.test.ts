import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSettings, saveSettings } from './storage';

// The Node-provided global localStorage is non-functional in this test
// environment, so install an in-memory implementation per test.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

function createThrowingStorage(): Storage {
  const throwError = () => {
    throw new Error('storage unavailable');
  };
  return {
    length: 0,
    clear: throwError,
    getItem: throwError,
    key: throwError,
    removeItem: throwError,
    setItem: throwError,
  };
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('saveSettings / loadSettings', () => {
  it('round-trips all settings', () => {
    saveSettings({
      presetId: 'gradient-sunset',
      paletteId: 'ocean-blue',
      titleBar: 'macos',
      aspectRatio: '16:9',
      animationsEnabled: true,
    });
    expect(loadSettings()).toEqual({
      presetId: 'gradient-sunset',
      paletteId: 'ocean-blue',
      titleBar: 'macos',
      aspectRatio: '16:9',
      animationsEnabled: true,
    });
  });

  it('keeps previously saved values on partial save', () => {
    saveSettings({ presetId: 'gradient-sunset', paletteId: 'ocean-blue' });
    saveSettings({ paletteId: 'soft-pastel' });
    const settings = loadSettings();
    expect(settings.presetId).toBe('gradient-sunset');
    expect(settings.paletteId).toBe('soft-pastel');
  });

  it('preserves animationsEnabled=false through the string round-trip', () => {
    saveSettings({ animationsEnabled: false });
    expect(loadSettings().animationsEnabled).toBe(false);
  });

  it('returns undefined fields when storage is empty', () => {
    expect(loadSettings()).toEqual({
      presetId: undefined,
      paletteId: undefined,
      titleBar: undefined,
      aspectRatio: undefined,
      animationsEnabled: undefined,
    });
  });

  it('returns an empty object when localStorage reads throw', () => {
    vi.stubGlobal('localStorage', createThrowingStorage());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(loadSettings()).toEqual({});
  });

  it('does not throw when localStorage writes throw', () => {
    vi.stubGlobal('localStorage', createThrowingStorage());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => saveSettings({ presetId: 'gradient-sunset' })).not.toThrow();
  });
});
