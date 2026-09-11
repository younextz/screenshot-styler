import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Maximize2, X } from 'lucide-react';

export interface FullSizePreviewProps {
  svgContent: string;
  sourceRef: RefObject<HTMLDivElement>;
  disabled?: boolean;
}

export default function FullSizePreview({ svgContent, sourceRef, disabled }: FullSizePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const closingRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (!previewUrl) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      animationRef.current?.cancel();
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const animateImage = (closing: boolean): Animation | undefined => {
    const image = imageRef.current;
    const svg = sourceRef.current?.querySelector('svg');
    if (!image || !svg || !image.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const currentTransform = getComputedStyle(image).transform;
    animationRef.current?.cancel();
    const source = svg.getBoundingClientRect();
    const target = image.getBoundingClientRect();
    const width = Number(svg.getAttribute('width'));
    const height = Number(svg.getAttribute('height'));
    if (!width || !height || !target.width || !target.height) return;
    // The inline SVG includes letterboxing; animate from the picture's actual bounds.
    const scale = Math.min(source.width / width, source.height / height);
    const x = source.left + source.width / 2 - (target.left + target.width / 2);
    const y = source.top + source.height / 2 - (target.top + target.height / 2);
    const small = { transform: `translate(${x}px, ${y}px) scale(${width * scale / target.width})` };
    const full = { transform: closing ? currentTransform : 'translate(0, 0) scale(1)' };
    const animation = image.animate(closing ? [full, small] : [small, full], {
      duration: closing ? 220 : 320,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both',
    });
    animationRef.current = animation;
    return animation;
  };

  const closePreview = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    const animation = animateImage(true);
    if (animation) await animation.finished.catch(() => {});
    dialogRef.current?.close();
    setPreviewUrl(null);
    triggerRef.current?.focus({ preventScroll: true });
    closingRef.current = false;
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        disabled={disabled || !svgContent}
        onClick={() => setPreviewUrl(URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml' })))}
        className="absolute right-2 top-2 z-20 flex min-h-11 items-center gap-2 rounded-lg border border-white/70 bg-white/85 px-3 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 sm:right-3 sm:top-3"
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        Full-size view
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(event) => { event.preventDefault(); void closePreview(); }}
        onKeyDown={(event) => {
          // Close is the only tabbable control in this dialog.
          if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus(); }
        }}
        onClick={(event) => { if (event.target === event.currentTarget) void closePreview(); }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-white outline-none backdrop:bg-black/75 backdrop:backdrop-blur-md backdrop:animate-in backdrop:fade-in backdrop:duration-300 motion-reduce:backdrop:animate-none"
      >
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-4 sm:inset-x-8 sm:top-6">
          <h2 id={titleId} className="text-sm font-medium">Full-size preview</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close full-size preview"
            onClick={() => void closePreview()}
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 top-20 flex items-center justify-center sm:inset-x-8 sm:bottom-8 sm:top-24">
          {previewUrl && (
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Styled screenshot in full-size preview"
              onLoad={() => { if (!closingRef.current) animateImage(false); }}
              className="pointer-events-auto block h-auto max-h-full w-auto max-w-full object-contain shadow-2xl"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
