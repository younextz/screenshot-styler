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
            type="button"
            key={palette.id}
            onClick={() => onChange(palette.id)}
            className={cn(
              'rounded-md border p-1.5 transition-colors',
              selectedId === palette.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border/50 bg-card/50 hover:border-border hover:bg-card',
            )}
            title={palette.label}
            aria-label={`Select ${palette.label} palette`}
          >
            <div className="flex gap-0.5">
              {palette.swatches.slice(0, 5).map((color, index) => (
                <div
                  key={index}
                  className="h-3 flex-1 rounded-sm first:rounded-l last:rounded-r"
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
