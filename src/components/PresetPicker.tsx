import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium" htmlFor="preset-picker">Preset Style</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            aria-label={`Preset ${preset.label}`}
            data-testid={`preset-${preset.id}`}
            onClick={() => onChange(preset.id)}
            className={cn(
              'px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all',
              'hover:border-primary hover:bg-secondary/50',
              selectedId === preset.id
                ? 'border-primary bg-primary/10 text-foreground'
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
