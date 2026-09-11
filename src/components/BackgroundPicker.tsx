import { cn } from '@/lib/utils';
import type { BackgroundVariant } from '@/lib/backgroundAssets';

export interface BackgroundPickerProps {
  selected: BackgroundVariant;
  onChange: (variant: BackgroundVariant) => void;
}

const OPTIONS: { id: BackgroundVariant; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  return (
    <div className="flex shrink-0 gap-1 rounded-lg bg-foreground/5 p-1" role="group" aria-label="Background">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={selected === option.id}
          className={cn(
            'flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selected === option.id
              ? 'border-foreground/5 bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-white/40 hover:text-foreground',
          )}
        >
          <span aria-hidden="true" className={cn('h-3 w-3 rounded-full border border-foreground/15', option.id === 'light' ? 'bg-white' : 'bg-foreground')} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
