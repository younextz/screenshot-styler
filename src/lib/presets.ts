export interface Preset {
  id: string;
  label: string;
}

export const presets: Preset[] = [
  { id: 'bg-picture-dark', label: 'Dark' },
  { id: 'bg-picture-light', label: 'Light' },
];
