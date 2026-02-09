import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => onChange(palette.id)}
          className={cn(
            'rounded-xl p-3 transition-all',
            selectedId === palette.id
              ? 'bg-primary/10 ring-2 ring-primary'
              : 'bg-card hover:bg-secondary'
          )}
        >
          <div className="flex gap-1 mb-2">
            {palette.swatches.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="flex-1 h-5 rounded-md"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-xs font-medium text-left text-foreground">{palette.label}</div>
        </button>
      ))}
    </div>
  );
}
