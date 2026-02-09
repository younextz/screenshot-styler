import { presets } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface PresetPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export function PresetPicker({ selectedId, onChange }: PresetPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.id)}
          className={cn(
            'rounded-xl px-4 py-3 text-sm font-medium transition-all',
            selectedId === preset.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
