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
    <div className="grid grid-cols-2 gap-2">
      <Button
        onClick={() => handleExport('copy')}
        disabled={disabled || isExporting || !svgContent}
        className="col-span-2 gap-2"
        size="lg"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy PNG
      </Button>

      <Button
        onClick={() => handleExport('download')}
        disabled={disabled || isExporting || !svgContent}
        variant="outline"
        className="gap-2"
        size="default"
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
        variant="outline"
        className="gap-2"
        size="default"
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
        variant="outline"
        className="col-span-2 gap-2"
        size="default"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Download SVG
      </Button>
    </div>
  );
}
