import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium" htmlFor="palette-picker">Color Palette</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            aria-label={`Palette ${palette.label}`}
            data-testid={`palette-${palette.id}`}
            onClick={() => onChange(palette.id)}
            className={cn(
              'p-3 rounded-lg border-2 transition-all hover:border-primary',
              selectedId === palette.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            )}
          >
            <div className="flex gap-1 mb-2">
              {palette.swatches.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-6 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="text-xs font-medium text-left">{palette.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
