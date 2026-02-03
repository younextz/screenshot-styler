export interface Preset {
  id: string;
  label: string;
  kind: 'background' | 'frame' | 'card';
  supportsTitle: boolean;
}

export const presets: Preset[] = [
  // Gradient Category (6 presets)
  {
    id: 'gradient-sunset',
    label: 'Sunset',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-ocean',
    label: 'Ocean',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-aurora',
    label: 'Aurora',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-rose',
    label: 'Rose Gold',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-midnight',
    label: 'Midnight',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-mint',
    label: 'Fresh Mint',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-wave',
    label: 'Wave',
    kind: 'background',
    supportsTitle: false,
  },
  // Mesh Category (4 presets)
  {
    id: 'mesh-cosmic',
    label: 'Cosmic',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'mesh-tropical',
    label: 'Tropical',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'mesh-pastel',
    label: 'Pastel Dream',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'mesh-neon',
    label: 'Neon Glow',
    kind: 'background',
    supportsTitle: false,
  },
  // Solid/Minimal Category (3 presets)
  {
    id: 'solid-dark',
    label: 'Slate',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'solid-light',
    label: 'Cloud',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'solid-gradient',
    label: 'Subtle',
    kind: 'background',
    supportsTitle: false,
  },
  // Pattern Category (3 presets)
  {
    id: 'pattern-dots',
    label: 'Dot Matrix',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'pattern-grid',
    label: 'Grid Lines',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'pattern-noise',
    label: 'Grain',
    kind: 'background',
    supportsTitle: false,
  },
  // Frame Presets (unchanged)
  {
    id: 'bg-picture-dark',
    label: 'Picture - Dark',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'bg-picture-light',
    label: 'Picture - Light',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'browser-macos',
    label: 'Browser – macOS',
    kind: 'frame',
    supportsTitle: true,
  },
  {
    id: 'browser-windows',
    label: 'Browser – Windows',
    kind: 'frame',
    supportsTitle: true,
  },
  {
    id: 'device-laptop',
    label: 'Device – Laptop',
    kind: 'frame',
    supportsTitle: false,
  },
  {
    id: 'device-phone',
    label: 'Device – Phone',
    kind: 'frame',
    supportsTitle: false,
  },
  {
    id: 'card-elevated',
    label: 'Card – Elevated',
    kind: 'card',
    supportsTitle: false,
  },
  {
    id: 'card-outlined',
    label: 'Card – Outlined',
    kind: 'card',
    supportsTitle: false,
  },
];
