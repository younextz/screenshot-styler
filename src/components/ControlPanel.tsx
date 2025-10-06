import { TitleBarType, AspectRatio } from '@/lib/svgRenderer';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  titleBar: TitleBarType;
  aspectRatio: AspectRatio;
  onTitleBarChange: (value: TitleBarType) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  supportsTitleBar: boolean;
}

const titleBarOptions: { value: TitleBarType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'macos', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
];

const aspectRatioOptions: { value: AspectRatio; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '9:16', label: '9:16' },
  { value: '1200x630', label: 'OG (1200×630)' },
];

export function ControlPanel({
  titleBar,
  aspectRatio,
  onTitleBarChange,
  onAspectRatioChange,
  supportsTitleBar,
}: ControlPanelProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Title Bar {!supportsTitleBar && <span className="text-muted-foreground">(Not available)</span>}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {titleBarOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTitleBarChange(option.value)}
              disabled={!supportsTitleBar && option.value !== 'none'}
              className={cn(
                'px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'hover:border-primary hover:bg-secondary/50 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                titleBar === option.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Aspect Ratio</label>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onAspectRatioChange(option.value)}
              className={cn(
                'px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200',
                'hover:border-primary hover:bg-secondary/50 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                aspectRatio === option.value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
