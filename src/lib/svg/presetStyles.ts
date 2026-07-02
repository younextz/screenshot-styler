export interface PresetStyle {
  cardRadius: number;
  shadowFilter: string;
}

const SHADOW_SOFT = '<filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.15"/></filter>';

const PRESET_STYLE_REGISTRY: Record<string, PresetStyle> = {
  'bg-picture-dark': { cardRadius: 24, shadowFilter: SHADOW_SOFT },
  'bg-picture-light': { cardRadius: 24, shadowFilter: SHADOW_SOFT },
};

const DEFAULT_STYLE: PresetStyle = { cardRadius: 0, shadowFilter: '' };

export function getPresetStyle(presetId: string): PresetStyle {
  return PRESET_STYLE_REGISTRY[presetId] ?? DEFAULT_STYLE;
}
