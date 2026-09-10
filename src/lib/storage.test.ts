import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBackgroundVariant, saveBackgroundVariant } from './storage';

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

describe('background variant storage', () => {
  it('round-trips both variants', () => {
    saveBackgroundVariant('dark');
    expect(loadBackgroundVariant()).toBe('dark');
    saveBackgroundVariant('light');
    expect(loadBackgroundVariant()).toBe('light');
  });

  it('returns null when nothing is saved', () => {
    expect(loadBackgroundVariant()).toBeNull();
  });

  it('returns null for unknown stored values', () => {
    localStorage.setItem('screenshot-styler-background', 'neon');
    expect(loadBackgroundVariant()).toBeNull();
  });

  it('returns null when localStorage reads throw', () => {
    vi.stubGlobal('localStorage', createThrowingStorage());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(loadBackgroundVariant()).toBeNull();
  });

  it('does not throw when localStorage writes throw', () => {
    vi.stubGlobal('localStorage', createThrowingStorage());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => saveBackgroundVariant('dark')).not.toThrow();
  });
});
