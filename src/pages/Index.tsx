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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
                      <ThemeToggle />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Screenshot Styler
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Transform your screenshots with beautiful styles
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Privacy Notice */}
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-accent mb-1">Privacy First</p>
            <p className="text-muted-foreground">
              All processing happens in your browser. Images are never uploaded or stored. Don't upload sensitive data.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8 animate-fade-in">
          <ImageLoader onImageLoad={handleImageLoad} />
          <TweetLoader onTweetLoad={handleTweetLoad} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Tweet Preview</h2>
          <TweetCard {...tweetData || {
            author: 'Placeholder',
            handle: 'placeholder',
            avatar: '/placeholder.svg',
            text: 'Your tweet will appear here.',
            timestamp: '',
            likes: 0,
            retweets: 0,
          }} />
        </div>

        {imageData && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <CanvasPreview svgContent={svgContent} />
            </div>

            {/* Export */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Export</h2>
              <ExportButtons
                svgContent={svgContent}
                onExport={handleExport}
                disabled={!svgContent}
              />
            </div>

            {/* Preset Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Style Preset</h2>
              <PresetPicker selectedId={presetId} onChange={setPresetId} />
            </div>

            {/* Palette Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
              <PalettePicker selectedId={paletteId} onChange={setPaletteId} />
            </div>

            {/* Controls */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Options</h2>
              <ControlPanel
                titleBar={titleBar}
                aspectRatio={aspectRatio}
                onTitleBarChange={setTitleBar}
                onAspectRatioChange={setAspectRatio}
                supportsTitleBar={currentPreset.supportsTitle}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Screenshot Styler v1.0 • All processing is done locally in your browser</p>
            <p className="text-xs">
              By using this tool, you agree not to upload sensitive or confidential information.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
