import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={cn(
            'px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
            'hover:border-border hover:bg-muted/50',
            selectedId === preset.id
              ? 'border-primary/60 bg-primary/5 text-foreground'
              : 'border-border/60 bg-card text-muted-foreground'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
