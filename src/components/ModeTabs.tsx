import { cn } from '@/lib/utils';

export type AppMode = 'screenshot' | 'code-snippet';

interface ModeTabsProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const tabs: { value: AppMode; label: string }[] = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'code-snippet', label: 'Code Snippet' },
];

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
