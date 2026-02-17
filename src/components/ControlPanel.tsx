import { TitleBarType, AspectRatio } from '@/lib/svgRenderer';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
interface ControlPanelProps {
  titleBar: TitleBarType;
  aspectRatio: AspectRatio;
  animationsEnabled: boolean;
  onTitleBarChange: (value: TitleBarType) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  onAnimationsChange: (value: boolean) => void;
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
  animationsEnabled,
  onTitleBarChange,
  onAspectRatioChange,
  onAnimationsChange,
  supportsTitleBar,
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Title Bar</span>
        <div
          className={cn('inline-flex rounded-md bg-secondary/50 p-0.5', !supportsTitleBar && 'opacity-50')}
        >
          {titleBarOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onTitleBarChange(option.value)}
              disabled={!supportsTitleBar && option.value !== 'none'}
              aria-label={`Set title bar to ${option.label}`}
              aria-pressed={titleBar === option.value}
              className={cn(
                'rounded px-2 py-0.5 text-xs transition-colors',
                'disabled:cursor-not-allowed',
                titleBar === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Ratio</span>
        <div className="inline-flex rounded-md bg-secondary/50 p-0.5">
          {aspectRatioOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onAspectRatioChange(option.value)}
              aria-label={`Set aspect ratio to ${option.label}`}
              aria-pressed={aspectRatio === option.value}
              className={cn(
                'rounded px-2 py-0.5 text-xs transition-colors',
                aspectRatio === option.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">Animations</span>
        <Switch
          checked={animationsEnabled}
          onCheckedChange={onAnimationsChange}
          aria-label="Toggle animations"
        />
      </div>
    </div>
  );
}
