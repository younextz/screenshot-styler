import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-foreground hover:bg-card/80 transition-all duration-200"
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1.5 focus:outline-none"
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
        title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      >
        {isLight ? (
          <Sun className="h-4 w-4 text-amber-500/80" />
        ) : (
          <Moon className="h-4 w-4 text-primary/70" />
        )}
        <span className="hidden sm:inline text-muted-foreground">{isLight ? 'Light' : 'Dark'}</span>
      </button>
      <Switch checked={isLight} onCheckedChange={toggle} className="ml-0.5" />
    </div>
  );
}
