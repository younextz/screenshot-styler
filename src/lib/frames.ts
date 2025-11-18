export type FrameStyleId =
  | 'stack-light'
  | 'stack-dark'
  | 'arc'
  | 'macos-light'
  | 'macos-dark'
  | 'none';

export interface FrameStyleOption {
  id: FrameStyleId;
  label: string;
  description: string;
  badge?: string;
}

export const frameStyles: FrameStyleOption[] = [
  {
    id: 'stack-light',
    label: 'Stack Light',
    description: 'Layered pastel cards with a soft glow.',
    badge: 'Popular',
  },
  {
    id: 'stack-dark',
    label: 'Stack Dark',
    description: 'Offset dark cards with chrome edges.',
  },
  {
    id: 'arc',
    label: 'Arc',
    description: 'Curved chrome halo inspired by Arc browser.',
    badge: 'New',
  },
  {
    id: 'macos-light',
    label: 'macOS Light',
    description: 'Classic macOS window with light chrome.',
  },
  {
    id: 'macos-dark',
    label: 'macOS Dark',
    description: 'macOS frame with slate background.',
  },
  {
    id: 'none',
    label: 'None',
    description: 'Use the raw screenshot without a frame.',
  },
];
