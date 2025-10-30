import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  svgContent: string;
  className?: string;
}

export function CanvasPreview({ svgContent, className }: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent || '';
    }
  }, [svgContent]);

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/30 p-10',
        className,
      )}
    >
      <div
        ref={containerRef}
        className="flex max-h-full max-w-full items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:drop-shadow-2xl"
      />
    </div>
  );
}
