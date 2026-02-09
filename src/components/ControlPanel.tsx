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
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="section-label">
          Title Bar
          {!supportsTitleBar && (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/60">
              (not available)
            </span>
          )}
        </label>
        <div className="flex gap-2">
          {titleBarOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTitleBarChange(option.value)}
              disabled={!supportsTitleBar && option.value !== 'none'}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                titleBar === option.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="section-label">Aspect Ratio</label>
        <div className="flex gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onAspectRatioChange(option.value)}
              className={cn(
                'flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                aspectRatio === option.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
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
