import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-3">Palettes</h3>
      <div className="grid grid-cols-4 gap-2">
        {palettes.map((palette, index) => (
          <button
            key={palette.id}
            onClick={() => onChange(palette.id)}
            className={cn(
              'relative group rounded-md border-2 transition-all duration-200 overflow-hidden',
              'hover:border-primary hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              selectedId === palette.id
                ? 'border-primary shadow-md'
                : 'border-border hover:border-border/60'
            )}
            title={palette.label}
          >
            {/* Color Swatches - Very compact */}
            <div className="flex h-8">
              {palette.swatches.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Palette Number */}
            <div className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/60 text-white text-xs font-bold',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              selectedId === palette.id && 'opacity-100'
            )}>
              #{index + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
