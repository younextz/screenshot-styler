import type { BackgroundVariant } from './backgroundAssets';

const BACKGROUND_KEY = 'screenshot-styler-background';

export function saveBackgroundVariant(variant: BackgroundVariant): void {
  try {
    localStorage.setItem(BACKGROUND_KEY, variant);
  } catch (error) {
    console.error('Failed to save background variant:', error);
  }
}

export function loadBackgroundVariant(): BackgroundVariant | null {
  try {
    const value = localStorage.getItem(BACKGROUND_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch (error) {
    console.error('Failed to load background variant:', error);
    return null;
  }
}
