import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import FullSizePreview from './FullSizePreview';

interface CanvasPreviewProps {
  svgContent: string;
  className?: string;
  canExpand?: boolean;
}

export default function CanvasPreview({ svgContent, className, canExpand = false }: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svgContent || '';
    }
  }, [svgContent]);

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
      <div
        ref={containerRef}
        className="absolute inset-4 z-10 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:drop-shadow-lg"
      />
      <FullSizePreview svgContent={svgContent} sourceRef={containerRef} disabled={!canExpand} />
    </div>
  );
}
