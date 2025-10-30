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
    <div className="w-full h-full bg-muted/30 rounded-lg overflow-hidden border border-border">
      <div className="h-full w-full p-8 flex items-center justify-center overflow-auto min-h-[400px]">
        <div
          ref={containerRef}
          className="max-w-full max-h-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
