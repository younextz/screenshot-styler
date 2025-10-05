import { TitleBarType, AspectRatio } from './svgRenderer';

const STORAGE_KEYS = {
  PRESET_ID: 'screenshot-styler-preset',
  PALETTE_ID: 'screenshot-styler-palette',
  TITLE_BAR: 'screenshot-styler-titlebar',
  ASPECT_RATIO: 'screenshot-styler-aspect',
};

export interface StoredSettings {
  presetId: string;
  paletteId: string;
  titleBar: TitleBarType;
  aspectRatio: AspectRatio;
}

export function saveSettings(settings: Partial<StoredSettings>) {
  try {
    if (settings.presetId) {
      localStorage.setItem(STORAGE_KEYS.PRESET_ID, settings.presetId);
    }
    if (settings.paletteId) {
      localStorage.setItem(STORAGE_KEYS.PALETTE_ID, settings.paletteId);
    }
    if (settings.titleBar) {
      localStorage.setItem(STORAGE_KEYS.TITLE_BAR, settings.titleBar);
    }
    if (settings.aspectRatio) {
      localStorage.setItem(STORAGE_KEYS.ASPECT_RATIO, settings.aspectRatio);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): Partial<StoredSettings> {
  try {
    return {
      presetId: localStorage.getItem(STORAGE_KEYS.PRESET_ID) || undefined,
      paletteId: localStorage.getItem(STORAGE_KEYS.PALETTE_ID) || undefined,
      titleBar: (localStorage.getItem(STORAGE_KEYS.TITLE_BAR) as TitleBarType) || undefined,
      aspectRatio: (localStorage.getItem(STORAGE_KEYS.ASPECT_RATIO) as AspectRatio) || undefined,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}
