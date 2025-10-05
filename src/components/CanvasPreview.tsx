import { useEffect, useRef } from 'react';

interface CanvasPreviewProps {
  svgContent: string;
}

export function CanvasPreview({ svgContent }: CanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;
    }
  }, [svgContent]);

  return (
    <div className="w-full bg-muted/30 rounded-lg overflow-hidden border border-border">
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div
          ref={containerRef}
          className="max-w-full max-h-[600px] [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
