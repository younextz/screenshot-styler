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
        'relative flex items-center justify-center overflow-hidden rounded-2xl bg-card p-4 sm:p-6',
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
        className="relative z-10 flex max-h-[calc(100%-2rem)] max-w-[calc(100%-2rem)] items-center justify-center p-4 [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:drop-shadow-lg"
      />
    </div>
  );
}
