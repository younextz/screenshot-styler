import { useState, useEffect } from 'react';
import { TweetLoader } from '@/components/TweetLoader';
import { ImageLoader } from '@/components/ImageLoader';
import { PresetPicker } from '@/components/PresetPicker';
import { PalettePicker } from '@/components/PalettePicker';
import { ControlPanel } from '@/components/ControlPanel';
import { CanvasPreview } from '@/components/CanvasPreview';
import { ExportButtons } from '@/components/ExportButtons';
import { presets } from '@/lib/presets';
import { palettes } from '@/lib/palettes';
import { generateSVG, TitleBarType, AspectRatio, preloadBackgroundImages } from '@/lib/svgRenderer';
import { saveSettings, loadSettings } from '@/lib/storage';
import { toast } from 'sonner';
import { AlertCircle, Upload } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { renderTweetToImage } from '@/utils/tweetRenderer';
import type { TweetData } from '@/types/tweet';

const Index = () => {
  const savedSettings = loadSettings();
  const { theme } = useTheme();

  const [imageData, setImageData] = useState<string>('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [presetId, setPresetId] = useState(savedSettings.presetId || 'gradient-soft');
  const [paletteId, setPaletteId] = useState(savedSettings.paletteId || 'jetbrains-dark');
  const [titleBar, setTitleBar] = useState<TitleBarType>(savedSettings.titleBar || 'none');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(savedSettings.aspectRatio || 'auto');
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(
    savedSettings.animationsEnabled !== undefined ? savedSettings.animationsEnabled : true
  );
  const [svgContent, setSvgContent] = useState('');
  const [hasLoadedFirstImage, setHasLoadedFirstImage] = useState(false);
  const currentPreset = presets.find(p => p.id === presetId) || presets[0];
  const currentPalette = palettes.find(p => p.id === paletteId) || palettes[0];

  useEffect(() => {
    if (imageData && imageWidth && imageHeight) {
      const svg = generateSVG({
        presetId,
        palette: currentPalette,
        titleBar: currentPreset.supportsTitle ? titleBar : 'none',
        aspectRatio,
        imageData,
        imageWidth,
        imageHeight,
        animationsEnabled,
      });
      setSvgContent(svg);
    }
  }, [
    imageData,
    imageWidth,
    imageHeight,
    presetId,
    paletteId,
    titleBar,
    aspectRatio,
    animationsEnabled,
    currentPalette,
    currentPreset,
  ]);

  useEffect(() => {
    saveSettings({ presetId, paletteId, titleBar, aspectRatio, animationsEnabled });
  }, [presetId, paletteId, titleBar, aspectRatio, animationsEnabled]);

  // Preload background images for picture presets
  useEffect(() => {
    preloadBackgroundImages().catch(console.error);
  }, []);

  // Theme-aware default palette (applied only when there is no saved preference)
  useEffect(() => {
    if (!savedSettings.paletteId) {
      setPaletteId(theme === 'light' ? 'soft-pastel' : 'jetbrains-dark');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const handleImageLoad = (dataUrl: string, width: number, height: number) => {
    setImageData(dataUrl);
    setImageWidth(width);
    setImageHeight(height);
    
    // Set aspect ratio to 16:9 by default when loading the first image
    if (!hasLoadedFirstImage) {
      setAspectRatio('16:9');
      setHasLoadedFirstImage(true);
    }
  };

  const handleTweetLoad = async (data: TweetData) => {
    try {
      const { dataUrl, width, height } = await renderTweetToImage(data);
      handleImageLoad(dataUrl, width, height);
    } catch (error) {
      console.error('Tweet render error:', error);
      toast.error('Failed to render tweet preview');
    }
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `styled-screenshot-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
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

      if (type === 'copy') {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          toast.error('Copy failed. Downloading instead...');
          // Fallback to download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `styled-screenshot-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Downloaded successfully!');
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `styled-screenshot-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
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
            <p className="text-xs text-muted-foreground">Transform screenshots into polished frames</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section
          className={cn(
            'relative flex min-w-0 flex-1 items-center p-4',
            svgContent ? 'justify-center' : 'justify-center',
          )}
        >
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

        <aside className="flex w-80 shrink-0 flex-col border-l border-border/50 bg-card/50">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            {/* Source Section */}
            <section className="space-y-3">
              <h2 className="text-xs font-medium text-muted-foreground">Source</h2>
              <ImageLoader onImageLoad={handleImageLoad} />
              <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">Fetch Tweet</p>
                <TweetLoader onTweetLoad={handleTweetLoad} />
              </div>
            </section>

            {imageData && (
              <>
                {/* Export Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Export</h2>
                  <ExportButtons
                    svgContent={svgContent}
                    onExport={handleExport}
                    disabled={!svgContent}
                  />
                </section>

                {/* Style Preset Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Style Preset</h2>
                  <PresetPicker selectedId={presetId} onChange={setPresetId} />
                </section>

                {/* Color Palette Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Color Palette</h2>
                  <PalettePicker selectedId={paletteId} onChange={setPaletteId} />
                </section>

                {/* Options Section */}
                <section className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground">Options</h2>
                  <ControlPanel
                    titleBar={titleBar}
                    aspectRatio={aspectRatio}
                    animationsEnabled={animationsEnabled}
                    onTitleBarChange={setTitleBar}
                    onAspectRatioChange={setAspectRatio}
                    onAnimationsChange={setAnimationsEnabled}
                    supportsTitleBar={currentPreset.supportsTitle}
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
