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
import { Upload, Shield, Menu, X, Sparkles } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'preview' | 'controls'>('preview');

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

  const navItems = [
    { id: 'preview' as const, label: 'Preview' },
    { id: 'controls' as const, label: 'Controls' },
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      {/* ── Floating Island Header ───────────────────── */}
      <header className="header-island flex items-center gap-3 sm:gap-5">
        {/* Logo icon */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>

        {/* App name in body text style */}
        <span className="hidden text-sm font-medium text-foreground sm:inline">
          Screenshot Styler
        </span>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                activeSection === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1 p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown menu ─────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 mx-4 animate-fade-up rounded-2xl bg-card p-4 shadow-lg md:hidden"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">

        {/* ── Hero Section ───────────────────────────── */}
        {!imageData && (
          <section className="mb-12 text-center">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Make your{' '}
              <span className="hero-gradient-text">screenshots</span>
              <br />
              look amazing
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              Drop in a screenshot, pick a style, and export a polished, sharable image.
            </p>
          </section>
        )}

        {/* ── Two-column layout (desktop) / tabbed (mobile) ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* ── Preview Column ───────────────────────── */}
          <section
            className={cn(
              'order-1',
              activeSection !== 'preview' && 'hidden md:block'
            )}
          >
            {svgContent ? (
              <CanvasPreview
                svgContent={svgContent}
                className="min-h-[300px] lg:min-h-[500px]"
              />
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-card p-8 text-center sm:min-h-[400px] lg:min-h-[500px]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="font-heading text-xl font-bold sm:text-2xl">
                  Drop in a screenshot
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Upload a PNG or JPG, paste from your clipboard, or use the controls to get started.
                </p>
              </div>
            )}
          </section>

          {/* ── Controls Column ──────────────────────── */}
          <aside
            className={cn(
              'order-2 space-y-0',
              activeSection !== 'controls' && 'hidden md:block'
            )}
          >
            {/* Source section */}
            <div className="space-y-5 pb-8">
              <h2 className="section-heading">Source</h2>
              <hr className="divider" />
              <ImageLoader onImageLoad={handleImageLoad} />

              <div className="block-soft space-y-3">
                <p className="text-sm font-medium text-foreground">Fetch Tweet</p>
                <p className="text-xs text-muted-foreground">
                  Paste a tweet URL to pull its text details.
                </p>
                <TweetLoader onTweetLoad={handleTweetLoad} />
              </div>
            </div>

            {/* Privacy note */}
            <div className="block-soft flex items-start gap-3 text-sm text-muted-foreground">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Shield className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-accent">Privacy First</p>
                <p className="mt-1 leading-relaxed">
                  All processing happens in your browser. Images are never uploaded or stored.
                </p>
              </div>
            </div>

            {imageData && (
              <>
                {/* Export */}
                <div className="space-y-5 py-8">
                  <h2 className="section-heading">Export</h2>
                  <hr className="divider" />
                  <ExportButtons
                    svgContent={svgContent}
                    onExport={handleExport}
                    disabled={!svgContent}
                  />
                </div>

                {/* Style Preset */}
                <div className="space-y-5 py-8">
                  <h2 className="section-heading">Style Preset</h2>
                  <hr className="divider" />
                  <PresetPicker selectedId={presetId} onChange={setPresetId} />
                </div>

                {/* Color Palette */}
                <div className="space-y-5 py-8">
                  <h2 className="section-heading">Color Palette</h2>
                  <hr className="divider" />
                  <PalettePicker selectedId={paletteId} onChange={setPaletteId} />
                </div>

                {/* Options */}
                <div className="space-y-5 py-8">
                  <h2 className="section-heading">Options</h2>
                  <hr className="divider" />
                  <ControlPanel
                    titleBar={titleBar}
                    aspectRatio={aspectRatio}
                    onTitleBarChange={setTitleBar}
                    onAspectRatioChange={setAspectRatio}
                    supportsTitleBar={currentPreset.supportsTitle}
                  />
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        <p>Screenshot Styler v1.0 — All processing is done locally in your browser.</p>
      </footer>
    </div>
  );
};

export default Index;
