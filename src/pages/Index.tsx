import { useState, useEffect } from 'react';
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
import { AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur flex-shrink-0">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-4 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Screenshot Styler
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Transform your screenshots with beautiful styles
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-[360px] max-w-[420px] min-w-[320px] border-r border-border/60 bg-card/40 backdrop-blur-sm overflow-y-auto">
          <div className="px-6 py-8 space-y-8">
            {/* Privacy Notice */}
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent mb-1">Privacy First</p>
                <p className="text-muted-foreground">
                  All processing happens in your browser. Images are never uploaded or stored. Don't upload sensitive data.
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold mb-4">Load Screenshot</h2>
              <ImageLoader onImageLoad={handleImageLoad} />
            </div>

            {/* Preset Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Style Preset</h2>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{currentPreset.name}</span>
              </div>
              <PresetPicker selectedId={presetId} onChange={setPresetId} />
            </div>

            {/* Palette Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Color Palette</h2>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{currentPalette.name}</span>
              </div>
              <PalettePicker selectedId={paletteId} onChange={setPaletteId} />
            </div>

            {/* Controls */}
            <div className="space-y-4 pb-10">
              <h2 className="text-base font-semibold">Options</h2>
              <ControlPanel
                titleBar={titleBar}
                aspectRatio={aspectRatio}
                onTitleBarChange={setTitleBar}
                onAspectRatioChange={setAspectRatio}
                supportsTitleBar={currentPreset.supportsTitle}
              />
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row">
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-hidden">
              {imageData ? (
                <div className="w-full max-w-4xl h-full flex items-center justify-center">
                  <CanvasPreview svgContent={svgContent} />
                </div>
              ) : (
                <div className="max-w-md text-center space-y-3 text-muted-foreground">
                  <h2 className="text-lg font-semibold text-foreground">Upload a screenshot to get started</h2>
                  <p>
                    Use the panel on the left to upload an image or paste one from your clipboard. Adjust the style options and the preview will update instantly.
                  </p>
                </div>
              )}
            </div>

            {imageData && (
              <div className="w-full max-w-sm border-t lg:border-t-0 lg:border-l border-border/60 bg-background/80 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold">Export</h2>
                    <p className="text-sm text-muted-foreground">Choose how you want to save or copy your styled screenshot.</p>
                  </div>
                  <ExportButtons
                    svgContent={svgContent}
                    onExport={handleExport}
                    disabled={!svgContent}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-[1400px] px-6 py-6 text-sm text-muted-foreground text-center">
              <p className="mb-1">Screenshot Styler v1.0 • All processing is done locally in your browser</p>
              <p className="text-xs">
                By using this tool, you agree not to upload sensitive or confidential information.
              </p>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default Index;
