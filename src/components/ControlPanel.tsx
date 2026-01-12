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
];

export function ControlPanel({
  titleBar,
  aspectRatio,
  onTitleBarChange,
  onAspectRatioChange,
  supportsTitleBar,
}: ControlPanelProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Title bar {!supportsTitleBar && <span className="text-muted-foreground/60">(not available)</span>}
        </label>
        <div className="flex gap-2">
          {titleBarOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTitleBarChange(option.value)}
              disabled={!supportsTitleBar && option.value !== 'none'}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'hover:border-border hover:bg-muted/50',
                titleBar === option.value
                  ? 'border-primary/60 bg-primary/5 text-foreground'
                  : 'border-border/60 bg-card text-muted-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Aspect ratio</label>
        <div className="grid grid-cols-4 gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onAspectRatioChange(option.value)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                'hover:border-border hover:bg-muted/50',
                aspectRatio === option.value
                  ? 'border-primary/60 bg-primary/5 text-foreground'
                  : 'border-border/60 bg-card text-muted-foreground'
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
