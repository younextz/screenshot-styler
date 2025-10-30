import { useEffect, useState, useCallback } from 'react';

export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isLight = theme === 'light';
  if (isLight) {
    root.setAttribute('data-theme', 'light');
    root.classList.remove('dark');
  } else {
    root.removeAttribute('data-theme');
    root.classList.add('dark');
  }
}

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved ?? getSystemTheme();
  } catch {
    return getSystemTheme();
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_error) {
      // ignore storage write failures (e.g., privacy mode)
    }
  }, [theme]);

  useEffect(() => {
    // react to system changes only when no explicit preference is saved
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_error) {
      // ignore storage read failures (e.g., privacy mode)
    }
    if (saved) return;

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'light' : 'dark');
    };
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggle } as const;
}
