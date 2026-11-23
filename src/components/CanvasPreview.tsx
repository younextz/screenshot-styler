import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import FullSizePreview from './FullSizePreview';

interface CanvasPreviewProps {
  svgContent: string;
  className?: string;
  canExpand?: boolean;
  /** A React-rendered SVG to show instead of the `svgContent` markup. */
  children?: ReactNode;
  /** Interactive layer placed over the picture. */
  overlay?: ReactNode;
}

export default function CanvasPreview({ svgContent, className, canExpand = false, children, overlay }: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const usesMarkup = !children;

  useEffect(() => {
    if (usesMarkup && containerRef.current) {
      containerRef.current.innerHTML = svgContent || '';
    }
  }, [svgContent, usesMarkup]);

  const containerClassName = 'absolute inset-4 z-10 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:drop-shadow-lg';

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-secondary/30',
        className,
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />
      {/* Keys remount the container so React children and injected markup never mix. */}
      {usesMarkup
        ? <div key="markup" ref={containerRef} className={containerClassName} />
        : <div key="element" ref={containerRef} className={containerClassName}>{children}</div>}
      {overlay && <div className="absolute inset-4 z-10">{overlay}</div>}
      <FullSizePreview svgContent={svgContent} sourceRef={containerRef} disabled={!canExpand} />
    </div>
  );
}
