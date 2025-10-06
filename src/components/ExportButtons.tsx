import { Download, Copy, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface ExportButtonsProps {
  svgContent: string;
  onExport: (type: 'copy' | 'download') => Promise<void>;
  disabled?: boolean;
}

export function ExportButtons({ svgContent, onExport, disabled }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'copy' | 'download') => {
    if (!svgContent || disabled) return;

    setIsExporting(true);
    try {
      await onExport(type);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <Download className="w-5 h-5" />
        )}
        Download PNG
      </Button>
    </div>
  );
}
