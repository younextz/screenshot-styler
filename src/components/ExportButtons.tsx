import { Download, Copy, Loader2, FileDown, ImageDown } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface ExportButtonsProps {
  svgContent: string;
  onExport: (type: 'copy' | 'download' | 'download4k' | 'downloadSvg') => Promise<void>;
  disabled?: boolean;
}

export function ExportButtons({ svgContent, onExport, disabled }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'copy' | 'download' | 'download4k' | 'downloadSvg') => {
    if (!svgContent || disabled) return;

    setIsExporting(true);
    try {
      await onExport(type);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Primary action - Copy to clipboard */}
      <Button
        onClick={() => handleExport('copy')}
        disabled={disabled || isExporting || !svgContent}
        className="gap-1.5 px-4"
        size="sm"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy
      </Button>

      {/* Secondary actions - Downloads */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-border/50">
        <Button
          onClick={() => handleExport('download')}
          disabled={disabled || isExporting || !svgContent}
          variant="ghost"
          className="gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
          size="sm"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageDown className="w-4 h-4" />
          )}
          PNG
        </Button>

        <Button
          onClick={() => handleExport('download4k')}
          disabled={disabled || isExporting || !svgContent}
          variant="ghost"
          className="gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
          size="sm"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          4K
        </Button>

        <Button
          onClick={() => handleExport('downloadSvg')}
          disabled={disabled || isExporting || !svgContent}
          variant="ghost"
          className="gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
          size="sm"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          SVG
        </Button>
      </div>
    </div>
  );
}
