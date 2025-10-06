import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={cn(
              'px-3 py-2.5 rounded-lg border-2 text-xs font-medium transition-all duration-200',
              'hover:border-primary hover:bg-secondary/50 hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              selectedId === preset.id
                ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
