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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button
        onClick={() => handleExport('copy')}
        disabled={disabled || isExporting || !svgContent}
        className="flex-1 gap-2"
        size="lg"
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
        Copy PNG
      </Button>

      <Button
        onClick={() => handleExport('download')}
        disabled={disabled || isExporting || !svgContent}
        variant="outline"
        className="flex-1 gap-2"
        size="lg"
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ImageDown className="w-5 h-5" />
        )}
        PNG (Original)
      </Button>

      <div className="grid grid-cols-2 gap-3 sm:col-span-3 md:col-span-1 md:grid-cols-2">
        <Button
          onClick={() => handleExport('download4k')}
          disabled={disabled || isExporting || !svgContent}
          variant="outline"
          className="flex-1 gap-2"
          size="lg"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          PNG 4K
        </Button>

        <Button
          onClick={() => handleExport('downloadSvg')}
          disabled={disabled || isExporting || !svgContent}
          variant="outline"
          className="flex-1 gap-2"
          size="lg"
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileDown className="w-5 h-5" />
          )}
          SVG
        </Button>
      </div>
    </div>
  );
}
