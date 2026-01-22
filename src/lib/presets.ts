export interface Preset {
  id: string;
  label: string;
  kind: 'background' | 'frame' | 'card';
  supportsTitle: boolean;
}

export const presets: Preset[] = [
  {
    id: 'gradient-soft',
    label: 'Gradient – Soft',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'gradient-bold',
    label: 'Gradient – Bold',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'mesh-gradient',
    label: 'Mesh Gradient',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'blob-duo',
    label: 'Blob – Duo',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'blob-trio',
    label: 'Blob – Trio',
    kind: 'background',
    supportsTitle: false,
  },
  {
    id: 'dot-grid',
    label: 'Dot Grid',
    kind: 'background',
    supportsTitle: false,
  },
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
