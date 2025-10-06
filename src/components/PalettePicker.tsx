import { palettes } from '@/lib/palettes';
import { cn } from '@/lib/utils';

interface PalettePickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PalettePicker({ selectedId, onChange }: PalettePickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {palettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => onChange(palette.id)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all duration-200 group',
              'hover:border-primary hover:bg-primary/5 hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              selectedId === palette.id
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                : 'border-border bg-card hover:shadow-sm'
            )}
          >
            {/* Color Swatches - Larger and more prominent */}
            <div className="flex gap-1 mb-3 overflow-hidden rounded-md">
              {palette.swatches.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-8 transition-all duration-200',
                    'group-hover:h-9',
                    selectedId === palette.id && 'h-9'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Palette Label */}
            <div className={cn(
              'text-xs font-medium text-left transition-colors',
              selectedId === palette.id 
                ? 'text-primary' 
                : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {palette.label}
            </div>

            {/* Selected indicator */}
            {selectedId === palette.id && (
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-primary font-medium">Selected</span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Quick palette preview - shows current selection prominently */}
      <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-xs font-medium text-accent mb-2">Current Selection</div>
        <div className="flex gap-1 rounded-md overflow-hidden">
          {palettes.find(p => p.id === selectedId)?.swatches.map((color, i) => (
            <div
              key={i}
              className="flex-1 h-6"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {palettes.find(p => p.id === selectedId)?.label}
        </div>
      </div>
    </div>
  );
}
