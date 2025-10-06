import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

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
      <div className="p-4 xl:p-8 flex items-center justify-center min-h-[400px] xl:min-h-[500px]">
        <div
          ref={containerRef}
          className={cn(
            "max-w-full transition-all duration-300",
            "xl:max-h-[700px] max-h-[500px]", 
            "[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:drop-shadow-2xl",
            // Better scaling for larger viewports
            "[&>svg]:xl:max-h-[700px] [&>svg]:max-h-[500px]"
          )}
        />
      </div>
      
      {/* Visual indicator that preview updates in real-time */}
      <div className="px-4 pb-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Live preview - changes apply instantly</span>
      </div>
    </div>
  );
}
