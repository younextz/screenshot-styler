export interface Palette {
  id: string;
  label: string;
  swatches: string[];
}

export const palettes: Palette[] = [
  // Most versatile palettes first (work well with all preset types)
  {
    id: 'sunset-warm',
    label: 'Sunset Warm',
    swatches: ['#2D1B2E', '#5C2E46', '#E63946', '#F77F00', '#FCBF49'],
  },
  {
    id: 'ocean-blue',
    label: 'Ocean Blue',
    swatches: ['#0A1128', '#1F2D5C', '#3D5A80', '#98C1D9', '#E0FBFC'],
  },
  {
    id: 'neon-purple',
    label: 'Neon Purple',
    swatches: ['#1A0B2E', '#3C096C', '#7209B7', '#B24BF3', '#F72585'],
  },
  {
    id: 'soft-pastel',
    label: 'Soft Pastel',
    swatches: ['#F8F9FA', '#E9ECEF', '#FFB3C6', '#BFACE2', '#A8E6CF'],
  },
  {
    id: 'minimal-gray',
    label: 'Minimal Gray',
    swatches: ['#0F0F0F', '#1A1A1A', '#333333', '#666666', '#CCCCCC'],
  },
  // New palettes optimized for new gradient styles
  {
    id: 'aurora-nights',
    label: 'Aurora Nights',
    swatches: ['#0D1321', '#1D2D44', '#3E5C76', '#748CAB', '#F0EBD8'],
  },
  {
    id: 'rose-quartz',
    label: 'Rose Quartz',
    swatches: ['#2B2024', '#6B4E5B', '#C08497', '#F3D5C0', '#F9F1F0'],
  },
  {
    id: 'tropical-vibes',
    label: 'Tropical Vibes',
    swatches: ['#1A2238', '#2B4570', '#00B4D8', '#FF6B6B', '#FFE66D'],
  },
  // Vibrant accent palettes
  {
    id: 'cyber-pink',
    label: 'Cyber Pink',
    swatches: ['#0D0221', '#190B28', '#FF00FF', '#FF006E', '#00F5FF'],
  },
  {
    id: 'retro-wave',
    label: 'Retro Wave',
    swatches: ['#120458', '#4D089A', '#F000FF', '#00D9FF', '#FFED4E'],
  },
  {
    id: 'midnight-blue',
    label: 'Midnight Blue',
    swatches: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
  },
  {
    id: 'electric-blue',
    label: 'Electric Blue',
    swatches: ['#001021', '#002147', '#0047AB', '#4169E1', '#00BFFF'],
  },
  // Nature-inspired palettes
  {
    id: 'forest-green',
    label: 'Forest Green',
    swatches: ['#1B2A1F', '#2D5016', '#52734D', '#91C788', '#DDFFBC'],
  },
  {
    id: 'arctic-blue',
    label: 'Arctic Blue',
    swatches: ['#0B1E3D', '#1A4D7C', '#2B7A9B', '#89C2D9', '#DEEDFF'],
  },
  {
    id: 'autumn-leaves',
    label: 'Autumn Leaves',
    swatches: ['#2C1810', '#5E3023', '#9D5C3E', '#D4A574', '#F4E4C1'],
  },
  // Specialty palettes
  {
    id: 'jetbrains-dark',
    label: 'JetBrains Dark',
    swatches: ['#0E0E0E', '#1A1A1A', '#00E2FF', '#FF318C', '#FFD600'],
  },
  {
    id: 'candy-pop',
    label: 'Candy Pop',
    swatches: ['#FFE5EC', '#FFB3C6', '#FF8FAB', '#FB6F92', '#C9184A'],
  },
  {
    id: 'toxic-green',
    label: 'Toxic Green',
    swatches: ['#0A1F0F', '#1E3A20', '#39FF14', '#7FFF00', '#CCFF00'],
  },
  {
    id: 'lava-red',
    label: 'Lava Red',
    swatches: ['#1A0000', '#330000', '#8B0000', '#FF4500', '#FFD700'],
  },
  {
    id: 'mocha-brown',
    label: 'Mocha Brown',
    swatches: ['#2B1700', '#4A2800', '#6F4E37', '#A67B5B', '#D4C5B9'],
  },
];
