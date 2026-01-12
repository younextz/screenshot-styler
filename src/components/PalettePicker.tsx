import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => onChange(palette.id)}
          className={cn(
            'p-2.5 rounded-lg border transition-all duration-200 hover:border-border hover:bg-muted/30',
            selectedId === palette.id
              ? 'border-primary/60 bg-primary/5'
              : 'border-border/60 bg-card'
          )}
        >
          <div className="flex gap-1 mb-1.5">
            {palette.swatches.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="flex-1 h-5 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="text-xs font-medium text-left text-muted-foreground">{palette.label}</div>
        </button>
      ))}
    </div>
  );
}
