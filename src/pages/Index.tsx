import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Upload } from 'lucide-react';

import { BackgroundPicker } from '@/components/BackgroundPicker';
import { CanvasPreview } from '@/components/CanvasPreview';
import { ExportButtons } from '@/components/ExportButtons';
import { ImageLoader } from '@/components/ImageLoader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import type { BackgroundVariant } from '@/lib/backgroundAssets';
import { generateSVG, preloadBackgroundImages } from '@/lib/svgRenderer';
import { loadBackgroundVariant, saveBackgroundVariant } from '@/lib/storage';
import { copyOrDownloadBlob, downloadBlob } from '@/utils/exportUtils';

const Index = () => {
  const { theme } = useTheme();

  const [imageData, setImageData] = useState<string>('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [savedVariant, setSavedVariant] = useState<BackgroundVariant | null>(loadBackgroundVariant);
  const [backgroundsReady, setBackgroundsReady] = useState(false);
  const [svgContent, setSvgContent] = useState('');

  // Follow the UI theme until the user picks a background explicitly.
  const variant = savedVariant ?? theme;

  useEffect(() => {
    preloadBackgroundImages()
      .then(() => setBackgroundsReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!imageData || !imageWidth || !imageHeight) return;
    setSvgContent(generateSVG({ variant, imageData, imageWidth, imageHeight }));
    // backgroundsReady triggers a re-render once the backgrounds are embeddable data URLs
  }, [imageData, imageWidth, imageHeight, variant, backgroundsReady]);

  const handleImageLoad = (dataUrl: string, width: number, height: number) => {
    setImageData(dataUrl);
    setImageWidth(width);
    setImageHeight(height);
  };

  const handleVariantChange = (next: BackgroundVariant) => {
    setSavedVariant(next);
    saveBackgroundVariant(next);
  };

  const getSvgSize = (svgString: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    const width = parseInt(svgElement?.getAttribute('width') || '800');
    const height = parseInt(svgElement?.getAttribute('height') || '600');
    return { width, height };
  };

  const svgToBlob = async (svgString: string, targetLongSide?: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const { width: svgW, height: svgH } = getSvgSize(svgString);

        let outW = svgW;
        let outH = svgH;
        if (targetLongSide && Math.max(svgW, svgH) !== targetLongSide) {
          if (svgW >= svgH) {
            outW = targetLongSide;
            outH = Math.round((targetLongSide / svgW) * svgH);
          } else {
            outH = targetLongSide;
            outW = Math.round((targetLongSide / svgH) * svgW);
          }
        }

        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, outW, outH);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };

      img.src = url;
    });
  };

  const downloadSvg = (svgString: string) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, `styled-screenshot-${Date.now()}.svg`);
  };

  const handleExport = async (type: 'copy' | 'download' | 'download4k' | 'downloadSvg') => {
    if (!svgContent) return;
    try {
      if (type === 'downloadSvg') {
        downloadSvg(svgContent);
        toast.success('SVG downloaded!');
        return;
      }
      const blob = await svgToBlob(svgContent, type === 'download4k' ? 3840 : undefined);
      const filename = `styled-screenshot-${Date.now()}.png`;
      if (type === 'copy') {
        const result = await copyOrDownloadBlob(blob, { filename });
        if (result === 'copied') {
          toast.success('Copied to clipboard!');
        } else {
          toast.error('Copy failed. Downloading instead...');
          toast.success('Downloaded successfully!');
        }
      } else {
        downloadBlob(blob, filename);
        toast.success(type === 'download4k' ? '4K PNG downloaded!' : 'PNG downloaded!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-sm font-bold text-primary">SS</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Screenshot Styler</h1>
            <p className="text-xs text-muted-foreground">Frame screenshots on the Air background</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section className="relative flex min-h-[45vh] min-w-0 flex-1 items-center justify-center p-4 md:min-h-0">
          {svgContent ? (
            <CanvasPreview
              svgContent={svgContent}
              className="max-h-[calc(100vh-5rem)]"
            />
          ) : (
            <div className="flex h-full max-h-[480px] w-full max-w-2xl flex-col items-center justify-center rounded-xl border border-border/40 bg-card/30 p-8 text-center shadow-[var(--shadow-sm)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium text-foreground">Drop a screenshot to begin</h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Upload a PNG/JPG or paste from clipboard using the controls on the right.
              </p>
            </div>
          )}
        </section>

        <aside className="flex w-full shrink-0 flex-col border-t border-border/50 bg-card/50 md:w-80 md:border-l md:border-t-0">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {/* Source Section */}
            <section className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground">Source</h2>
              <ImageLoader onImageLoad={handleImageLoad} />
            </section>

            {imageData && (
              <>
                {/* Background Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Background</h2>
                  <BackgroundPicker selected={variant} onChange={handleVariantChange} />
                </section>

                {/* Export Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Export</h2>
                  <ExportButtons
                    svgContent={svgContent}
                    onExport={handleExport}
                    disabled={!svgContent}
                  />
                </section>
              </>
            )}
          </div>

          {/* Compact Footer with Privacy Note */}
          <div className="shrink-0 border-t border-border/40 bg-background/30 px-4 py-2.5">
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>All processing is local. Images are never uploaded.</span>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;
