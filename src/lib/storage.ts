import { TitleBarType, AspectRatio } from './svgRenderer';
import { AppMode } from '@/components/ModeTabs';

const STORAGE_KEYS = {
  PRESET_ID: 'screenshot-styler-preset',
  PALETTE_ID: 'screenshot-styler-palette',
  TITLE_BAR: 'screenshot-styler-titlebar',
  ASPECT_RATIO: 'screenshot-styler-aspect',
  APP_MODE: 'screenshot-styler-mode',
  CODE_LANGUAGE: 'screenshot-styler-code-language',
  CODE_THEME: 'screenshot-styler-code-theme',
  CODE_CONTENT: 'screenshot-styler-code-content',
};

export interface StoredSettings {
  presetId: string;
  paletteId: string;
  titleBar: TitleBarType;
  aspectRatio: AspectRatio;
  appMode: AppMode;
  codeLanguageId: string;
  codeThemeId: string;
  codeContent: string;
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
    if (settings.appMode) {
      localStorage.setItem(STORAGE_KEYS.APP_MODE, settings.appMode);
    }
    if (settings.codeLanguageId) {
      localStorage.setItem(STORAGE_KEYS.CODE_LANGUAGE, settings.codeLanguageId);
    }
    if (settings.codeThemeId) {
      localStorage.setItem(STORAGE_KEYS.CODE_THEME, settings.codeThemeId);
    }
    if (settings.codeContent !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CODE_CONTENT, settings.codeContent);
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
      appMode: (localStorage.getItem(STORAGE_KEYS.APP_MODE) as AppMode) || undefined,
      codeLanguageId: localStorage.getItem(STORAGE_KEYS.CODE_LANGUAGE) || undefined,
      codeThemeId: localStorage.getItem(STORAGE_KEYS.CODE_THEME) || undefined,
      codeContent: localStorage.getItem(STORAGE_KEYS.CODE_CONTENT) || undefined,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}
