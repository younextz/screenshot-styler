import { Download, Copy, Loader2, FileDown, ImageDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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

  const btnBase =
    'btn-float inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40';

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleExport('copy')}
        disabled={disabled || isExporting || !svgContent}
        className={cn(btnBase, 'bg-primary text-primary-foreground')}
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
        Copy PNG
      </button>

      <button
        onClick={() => handleExport('download')}
        disabled={disabled || isExporting || !svgContent}
        className={cn(btnBase, 'bg-secondary text-secondary-foreground')}
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
        PNG
      </button>

      <button
        onClick={() => handleExport('download4k')}
        disabled={disabled || isExporting || !svgContent}
        className={cn(btnBase, 'bg-secondary text-secondary-foreground')}
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        4K
      </button>

      <button
        onClick={() => handleExport('downloadSvg')}
        disabled={disabled || isExporting || !svgContent}
        className={cn(btnBase, 'bg-secondary text-secondary-foreground')}
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        SVG
      </button>
    </div>
  );
}
