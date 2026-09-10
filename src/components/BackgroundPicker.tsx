import { cn } from '@/lib/utils';
import type { BackgroundVariant } from '@/lib/backgroundAssets';

export interface BackgroundPickerProps {
  selected: BackgroundVariant;
  onChange: (variant: BackgroundVariant) => void;
}

const OPTIONS: { id: BackgroundVariant; label: string }[] = [
  { id: 'dark', label: 'Air Dark' },
  { id: 'light', label: 'Air Light' },
];

export function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="Background">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={selected === option.id}
          className={cn(
            'flex-1 rounded-md border border-transparent px-2.5 py-1.5 text-xs transition-colors',
            selected === option.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default BackgroundPicker;
