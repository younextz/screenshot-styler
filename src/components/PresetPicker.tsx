import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Preset</label>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs transition-colors',
              'border border-transparent',
              selectedId === preset.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
