import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={cn(
            'px-3 py-2 rounded-md border-2 text-xs font-medium transition-all duration-200',
            'hover:border-primary hover:bg-secondary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            selectedId === preset.id
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-card text-muted-foreground'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
