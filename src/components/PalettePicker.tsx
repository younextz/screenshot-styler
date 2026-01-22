import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Palette</label>
      <div className="grid grid-cols-3 gap-1.5">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => onChange(palette.id)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'border',
              selectedId === palette.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border/50 bg-card/50 hover:border-border hover:bg-card'
            )}
            title={palette.label}
          >
            <div className="flex gap-0.5">
              {palette.swatches.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-3 rounded-sm first:rounded-l last:rounded-r"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
