import { frameStyles, FrameStyleId } from '@/lib/frames';
import { cn } from '@/lib/utils';

interface FrameSelectorProps {
  selectedId: FrameStyleId;
  onChange: (value: FrameStyleId) => void;
}

export function FrameSelector({ selectedId, onChange }: FrameSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {frameStyles.map((frame) => {
          const isSelected = frame.id === selectedId;
          return (
            <button
              type="button"
              key={frame.id}
              onClick={() => onChange(frame.id)}
              className={cn(
                'relative flex h-full flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
                isSelected
                  ? 'border-primary/70 bg-primary/5 shadow-[0_12px_40px_rgba(15,23,42,0.12)]'
                  : 'border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card'
              )}
            >
              {frame.badge && (
                <span className="inline-flex items-center self-start rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  {frame.badge}
                </span>
              )}
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted/30">
                <FramePreview id={frame.id} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{frame.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{frame.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FramePreview({ id }: { id: FrameStyleId }) {
  switch (id) {
    case 'stack-light':
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-3 translate-x-[10px] translate-y-[12px] rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100" />
          <div className="absolute inset-2 translate-x-[4px] translate-y-[6px] rounded-3xl bg-gradient-to-br from-rose-100 to-pink-50 shadow-lg shadow-rose-200/90" />
          <div className="absolute inset-4 rounded-2xl bg-white shadow-[0_6px_24px_rgba(244,114,182,0.35)]" />
        </div>
      );
    case 'stack-dark':
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-3 -translate-x-[6px] translate-y-[12px] rounded-[26px] bg-slate-900 shadow-[0_12px_30px_rgba(2,6,23,0.65)]" />
          <div className="absolute inset-2 translate-x-[4px] translate-y-[4px] rounded-[26px] bg-slate-800 border border-white/10" />
          <div className="absolute inset-5 rounded-2xl bg-slate-700/90 border border-white/10 shadow-[0_4px_20px_rgba(15,23,42,0.45)]" />
        </div>
      );
    case 'arc':
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-slate-900" />
          <div className="absolute -left-8 -right-8 top-1/4 h-1/2 rounded-full bg-gradient-to-r from-emerald-400/30 via-cyan-400/50 to-indigo-500/30 blur-2xl" />
          <div className="absolute inset-4 rounded-[22px] border border-white/15 bg-slate-900/80 shadow-[0_20px_40px_rgba(15,23,42,0.8)]" />
          <div className="absolute inset-6 rounded-xl bg-slate-800" />
        </div>
      );
    case 'macos-light':
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-2 rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(148,163,184,0.35)]" />
          <div className="absolute inset-x-4 top-4 h-4 rounded-full bg-slate-100" />
          <div className="absolute left-6 top-4 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="absolute inset-x-6 bottom-4 top-8 rounded-xl bg-slate-50" />
        </div>
      );
    case 'macos-dark':
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-2 rounded-[26px] border border-slate-700 bg-slate-900 shadow-[0_10px_30px_rgba(1,3,12,0.6)]" />
          <div className="absolute inset-x-4 top-4 h-4 rounded-full bg-slate-800" />
          <div className="absolute left-6 top-4 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="absolute inset-x-6 bottom-4 top-8 rounded-xl bg-slate-800" />
        </div>
      );
    case 'none':
    default:
      return (
        <div className="relative h-full w-full">
          <div className="absolute inset-4 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20" />
        </div>
      );
  }
}
