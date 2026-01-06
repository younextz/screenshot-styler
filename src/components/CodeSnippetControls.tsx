import { codeThemes, CodeTheme } from '@/lib/codeThemes';
import { codeLanguages, CodeLanguage } from '@/lib/codeLanguages';
import { cn } from '@/lib/utils';

interface CodeSnippetControlsProps {
  selectedLanguageId: string;
  selectedThemeId: string;
  onLanguageChange: (language: CodeLanguage) => void;
  onThemeChange: (theme: CodeTheme) => void;
}

export function CodeSnippetControls({
  selectedLanguageId,
  selectedThemeId,
  onLanguageChange,
  onThemeChange,
}: CodeSnippetControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">Language</label>
        <div className="grid grid-cols-3 gap-2">
          {codeLanguages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang)}
              className={cn(
                'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                'hover:border-primary hover:bg-secondary/50',
                selectedLanguageId === lang.id
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground'
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Code Theme</label>
        <div className="grid grid-cols-2 gap-3">
          {codeThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all hover:border-primary',
                selectedThemeId === theme.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <div
                className="h-8 rounded mb-2 flex items-center justify-center"
                style={{ backgroundColor: theme.background }}
              >
                <span
                  className="text-xs font-mono"
                  style={{ color: theme.foreground }}
                >
                  code
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    theme.isDark ? 'bg-slate-700' : 'bg-slate-200'
                  )}
                />
                <span className="text-xs font-medium text-left">{theme.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
