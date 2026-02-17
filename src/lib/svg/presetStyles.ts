export interface PresetStyle {
  cardRadius: number;
  shadowFilter: string;
}
const SHADOWS = {
  subtle: '<filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/></filter>',
  soft: '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>',
  medium: '<filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.18"/></filter>',
  mediumDark: '<filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.25"/></filter>',
  large: '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.2"/></filter>',
  largeVibrant: '<filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="24" flood-opacity="0.22"/></filter>',
  light: '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="12" flood-opacity="0.1"/></filter>',
  lightMedium: '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="14" flood-opacity="0.12"/></filter>',
  browserMac: '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.2"/></filter>',
  browserWindows: '<filter id="shadow"><feDropShadow dx="0" dy="6" stdDeviation="16" flood-opacity="0.18"/></filter>',
  card: '<filter id="shadow"><feDropShadow dx="0" dy="20" stdDeviation="40" flood-opacity="0.3"/></filter>',
} as const;
export const PRESET_STYLE_REGISTRY: Record<string, PresetStyle> = {
  'gradient-sunset': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'gradient-ocean': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'gradient-aurora': { cardRadius: 28, shadowFilter: SHADOWS.large },
  'gradient-rose': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'gradient-midnight': { cardRadius: 24, shadowFilter: SHADOWS.mediumDark },
  'gradient-mint': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'gradient-wave': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'mesh-cosmic': { cardRadius: 24, shadowFilter: SHADOWS.medium },
  'mesh-tropical': { cardRadius: 24, shadowFilter: SHADOWS.medium },
  'mesh-pastel': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'mesh-neon': { cardRadius: 28, shadowFilter: SHADOWS.largeVibrant },
  'solid-dark': { cardRadius: 20, shadowFilter: SHADOWS.mediumDark },
  'solid-light': { cardRadius: 20, shadowFilter: SHADOWS.light },
  'solid-gradient': { cardRadius: 20, shadowFilter: SHADOWS.lightMedium },
  'pattern-dots': { cardRadius: 16, shadowFilter: SHADOWS.subtle },
  'pattern-grid': { cardRadius: 16, shadowFilter: SHADOWS.subtle },
  'pattern-noise': { cardRadius: 16, shadowFilter: SHADOWS.subtle },
  'bg-picture-dark': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'bg-picture-light': { cardRadius: 24, shadowFilter: SHADOWS.soft },
  'browser-macos': { cardRadius: 12, shadowFilter: SHADOWS.browserMac },
  'browser-windows': { cardRadius: 8, shadowFilter: SHADOWS.browserWindows },
  'device-laptop': { cardRadius: 6, shadowFilter: '' },
  'device-phone': { cardRadius: 8, shadowFilter: '' },
  'card-elevated': { cardRadius: 28, shadowFilter: SHADOWS.card },
  'card-outlined': { cardRadius: 16, shadowFilter: SHADOWS.lightMedium },
};
const DEFAULT_STYLE: PresetStyle = { cardRadius: 0, shadowFilter: '' };
export const PICTURE_BACKGROUND_PRESETS = new Set(['bg-picture-dark', 'bg-picture-light']);
export function getPresetStyle(presetId: string): PresetStyle {
  return PRESET_STYLE_REGISTRY[presetId] ?? DEFAULT_STYLE;
}
export function isPictureBackgroundPreset(presetId: string): boolean {
  return PICTURE_BACKGROUND_PRESETS.has(presetId);
}
