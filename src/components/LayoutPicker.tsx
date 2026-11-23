import { cn } from '@/lib/utils';
import type { StudioLayout } from '@/lib/storage';

export interface LayoutPickerProps {
  selected: StudioLayout;
  onChange: (layout: StudioLayout) => void;
  /** Device model of the bundled bezel, used in the iPhone option's accessible name. */
  deviceModel: string;
}

export default function LayoutPicker({ selected, onChange, deviceModel }: LayoutPickerProps) {
  const options: { id: StudioLayout; label: string; description: string }[] = [
    { id: 'screenshot', label: 'Screenshot', description: 'Screenshot with rounded corners' },
    { id: 'iphone', label: 'iPhone', description: `Screenshot inside an ${deviceModel} frame` },
  ];
  return (
    <div className="flex shrink-0 gap-1 rounded-lg bg-foreground/5 p-1" role="group" aria-label="Layout">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={selected === option.id}
          title={option.description}
          className={cn(
            'rounded-md border border-transparent px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selected === option.id
              ? 'border-foreground/5 bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-white/40 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
