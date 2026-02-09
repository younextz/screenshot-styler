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
        'relative flex items-center justify-center overflow-hidden',
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
        className="relative z-10 flex max-h-full max-w-full items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:drop-shadow-lg"
      />
    </div>
  );
}
