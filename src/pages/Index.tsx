import { useState, useEffect } from 'react';
import { TweetLoader } from '@/components/TweetLoader';
import { TweetCard } from '@/components/TweetCard';
import { ImageLoader } from '@/components/ImageLoader';
import { PresetPicker } from '@/components/PresetPicker';
import { PalettePicker } from '@/components/PalettePicker';
import { ControlPanel } from '@/components/ControlPanel';
import { CanvasPreview } from '@/components/CanvasPreview';
import { ExportButtons } from '@/components/ExportButtons';
import { presets } from '@/lib/presets';
import { palettes } from '@/lib/palettes';
import { generateSVG, TitleBarType, AspectRatio } from '@/lib/svgRenderer';
import { saveSettings, loadSettings } from '@/lib/storage';
import { toast } from 'sonner';
import { AlertCircle, Upload } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

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
  const [svgContent, setSvgContent] = useState('');
  const [hasLoadedFirstImage, setHasLoadedFirstImage] = useState(false);
  const [tweetData, setTweetData] = useState<any>(null);

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
      });
      setSvgContent(svg);
    }
  }, [imageData, imageWidth, imageHeight, presetId, paletteId, titleBar, aspectRatio, currentPalette, currentPreset]);

  useEffect(() => {
    saveSettings({ presetId, paletteId, titleBar, aspectRatio });
  }, [presetId, paletteId, titleBar, aspectRatio]);

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

  const handleTweetLoad = (data: any) => {
    setTweetData(data);
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
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-10 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Screenshot Styler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transform your screenshots with polished, sharable frames.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 overflow-hidden">
        <section
          className={cn(
            'relative flex flex-1 items-center bg-muted/5 pl-2 pr-3 py-10 sm:pl-3 sm:pr-4',
            svgContent ? 'justify-start' : 'justify-center',
          )}
        >
          {svgContent ? (
            <CanvasPreview
              svgContent={svgContent}
              className="max-h-[calc(100vh-12rem)]"
            />
          ) : (
            <div className="flex h-full max-h-[640px] w-full max-w-3xl flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-background/80">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Drop in a screenshot to get started</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Use the import tools on the right to upload a PNG or JPG, or paste directly from your clipboard.
              </p>
            </div>
          )}
        </section>

        <aside className="flex w-full max-w-xl flex-col border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="space-y-10">
              <section className="space-y-4">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                    Source
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload or paste your screenshot to populate the live preview.
                  </p>
                </div>
                <ImageLoader onImageLoad={handleImageLoad} />
              </section>

              <section className="rounded-xl border border-accent/20 bg-accent/5 p-5 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-accent/20 p-1">
                    <AlertCircle className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-accent">Privacy First</p>
                    <p className="mt-1">
                      All processing happens in your browser. Images are never uploaded or stored. Please avoid sharing sensitive data.
                    </p>
                  </div>
                </div>
              </section>

              {imageData && (
                <div className="space-y-10">
                  <section className="space-y-4">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        Export
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Choose how you want to share or download your styled screenshot.
                      </p>
                    </div>
                    <ExportButtons
                      svgContent={svgContent}
                      onExport={handleExport}
                      disabled={!svgContent}
                    />
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        Style Preset
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Quickly switch between layout styles designed for different content types.
                      </p>
                    </div>
                    <PresetPicker selectedId={presetId} onChange={setPresetId} />
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        Color Palette
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tune the backdrop colors to match your brand or highlight important details.
                      </p>
                    </div>
                    <PalettePicker selectedId={paletteId} onChange={setPaletteId} />
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                        Options
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Adjust the window chrome, aspect ratio, and layout to perfect the frame.
                      </p>
                    </div>
                    <ControlPanel
                      titleBar={titleBar}
                      aspectRatio={aspectRatio}
                      onTitleBarChange={setTitleBar}
                      onAspectRatioChange={setAspectRatio}
                      supportsTitleBar={currentPreset.supportsTitle}
                    />
                  </section>
                </div>
              )}
            </div>
          </div>

          <footer className="border-t border-border/80 px-6 py-5 text-xs text-muted-foreground">
            <p>Screenshot Styler v1.0 — All processing is done locally in your browser.</p>
            <p className="mt-2">By using this tool you agree not to upload sensitive or confidential information.</p>
          </footer>
        </aside>
      </main>
    </div>
  );
};

export default Index;
