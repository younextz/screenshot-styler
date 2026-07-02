const STORAGE_KEY_PRESET = 'screenshot-styler-preset';

export interface StoredSettings {
  presetId: string;
}

export function saveSettings(settings: Partial<StoredSettings>) {
  try {
    if (settings.presetId) {
      localStorage.setItem(STORAGE_KEY_PRESET, settings.presetId);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): Partial<StoredSettings> {
  try {
    return {
      presetId: localStorage.getItem(STORAGE_KEY_PRESET) || undefined,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}
