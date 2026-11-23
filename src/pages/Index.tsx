import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowUpRight, Check, LockKeyhole, RotateCcw } from 'lucide-react';

import AgentInstructions from '@/components/AgentInstructions';
import BackgroundPicker from '@/components/BackgroundPicker';
import CanvasPreview from '@/components/CanvasPreview';
import CropControls from '@/components/CropControls';
import CropSurface from '@/components/CropSurface';
import DeviceFramePreview from '@/components/DeviceFramePreview';
import ExportButtons from '@/components/ExportButtons';
import ImageLoader from '@/components/ImageLoader';
import LayoutPicker from '@/components/LayoutPicker';
import { BACKGROUND_IMAGE_URLS, type BackgroundVariant } from '@/lib/backgroundAssets';
import { DEVICE_FRAME, loadDeviceFrame } from '@/lib/deviceFrame';
import { backgroundHref, generateDeviceSVG, generateSVG, preloadBackgroundImage } from '@/lib/svgRenderer';
import { loadBackgroundVariant, loadLayout, saveBackgroundVariant, saveLayout, type StudioLayout } from '@/lib/storage';
import {
  CENTERED_CROP,
  deviceLayout,
  panCrop,
  zoomCrop,
  type CropState,
  type DeviceFrameAsset,
} from '@/utils/composeDeviceFrame';
import { copyOrDownloadBlob, downloadBlob } from '@/utils/exportUtils';
import { svgToBlob } from '@/utils/browserRenderer';

type BackgroundStatus = 'loading' | 'ready' | 'failed';
interface BackgroundState {
  variant: BackgroundVariant;
  status: BackgroundStatus;
}
type FrameState =
  | { status: 'idle' | 'loading' | 'failed' }
  | { status: 'ready'; frame: DeviceFrameAsset };

const Index = () => {
  const [imageData, setImageData] = useState<string>('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [savedVariant, setSavedVariant] = useState<BackgroundVariant | null>(loadBackgroundVariant);
  const [backgroundState, setBackgroundState] = useState<BackgroundState>({
    variant: savedVariant ?? 'light',
    status: 'loading',
  });
  const [backgroundAttempt, setBackgroundAttempt] = useState(0);
  const [svgContent, setSvgContent] = useState('');
  const [savedLayout, setSavedLayout] = useState<StudioLayout | null>(loadLayout);
  const [frameState, setFrameState] = useState<FrameState>({ status: 'idle' });
  const [frameAttempt, setFrameAttempt] = useState(0);
  // Pan and zoom belong to the current image and are not saved.
  const [crop, setCrop] = useState<CropState>(CENTERED_CROP);
  const [adjusting, setAdjusting] = useState(false);

  const variant = savedVariant ?? 'light';
  const backgroundStatus = backgroundState.variant === variant ? backgroundState.status : 'loading';
  const backgroundsReady = backgroundStatus === 'ready';
  // Without the bundled bezel the iPhone layout does not exist and a saved choice is ignored.
  const layout: StudioLayout = DEVICE_FRAME ? savedLayout ?? 'screenshot' : 'screenshot';
  const usesDevice = layout === 'iphone';
  const frame = usesDevice && frameState.status === 'ready' ? frameState.frame : null;
  const frameStatus = usesDevice ? frameState.status : 'idle';

  useEffect(() => {
    let active = true;
    setBackgroundState({ variant, status: 'loading' });
    preloadBackgroundImage(variant)
      .then(() => {
        if (active) setBackgroundState({ variant, status: 'ready' });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error(error);
        setBackgroundState({ variant, status: 'failed' });
      });
    return () => { active = false; };
  }, [variant, backgroundAttempt]);

  const retryBackgrounds = () => {
    setBackgroundState({ variant, status: 'loading' });
    setBackgroundAttempt((attempt) => attempt + 1);
  };

  useEffect(() => {
    if (!usesDevice || !DEVICE_FRAME) return;
    let active = true;
    setFrameState((state) => (state.status === 'ready' ? state : { status: 'loading' }));
    loadDeviceFrame(DEVICE_FRAME)
      .then((loaded) => {
        if (active) setFrameState({ status: 'ready', frame: loaded });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error(error);
        setFrameState({ status: 'failed' });
      });
    return () => { active = false; };
  }, [usesDevice, frameAttempt]);

  useEffect(() => {
    if (!imageData || !imageWidth || !imageHeight) return;
    if (!usesDevice) {
      setSvgContent(generateSVG({ variant, imageData, imageWidth, imageHeight }));
      return;
    }
    setSvgContent(frame ? generateDeviceSVG({ variant, imageData, imageWidth, imageHeight, frame, crop }) : '');
    // backgroundsReady triggers a re-render once the backgrounds are embeddable data URLs
  }, [imageData, imageWidth, imageHeight, variant, backgroundsReady, usesDevice, frame, crop]);

  const deviceView = useMemo(
    () => (frame && imageData && imageWidth && imageHeight
      ? deviceLayout({ width: imageWidth, height: imageHeight }, frame, crop)
      : null),
    [frame, imageData, imageWidth, imageHeight, crop],
  );
  const imageSize = useMemo(() => ({ width: imageWidth, height: imageHeight }), [imageWidth, imageHeight]);
  const screenSize = frame?.screen;

  const handlePan = useCallback((dx: number, dy: number) => {
    if (!screenSize) return;
    setCrop((current) => panCrop(imageSize, screenSize, current, dx, dy));
  }, [imageSize, screenSize]);

  const handleZoom = useCallback((zoom: number) => {
    if (!screenSize) return;
    setCrop((current) => zoomCrop(imageSize, screenSize, current, zoom));
  }, [imageSize, screenSize]);

  const handleZoomBy = useCallback((factor: number) => {
    if (!screenSize) return;
    setCrop((current) => zoomCrop(imageSize, screenSize, current, current.zoom * factor));
  }, [imageSize, screenSize]);

  const handleCenter = useCallback(() => {
    setCrop((current) => ({ ...current, centerX: 0.5, centerY: 0.5 }));
  }, []);

  const handleImageLoad = (dataUrl: string, width: number, height: number) => {
    setImageData(dataUrl);
    setImageWidth(width);
    setImageHeight(height);
    setCrop(CENTERED_CROP);
  };

  const handleLayoutChange = (next: StudioLayout) => {
    setSavedLayout(next);
    saveLayout(next);
  };

  const handleVariantChange = (next: BackgroundVariant) => {
    setSavedVariant(next);
    saveBackgroundVariant(next);
  };

  const exportsReady = backgroundsReady && (!usesDevice || frame !== null);

  const downloadSvg = (svgString: string) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    downloadBlob(blob, `styled-screenshot-${Date.now()}.svg`);
  };

  const handleExport = async (type: 'copy' | 'download' | 'download4k' | 'downloadSvg') => {
    if (!svgContent || !exportsReady) return;
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
    <div
      className="relative isolate flex min-h-svh flex-col bg-cover bg-center bg-no-repeat text-foreground"
      style={{
        backgroundImage: `linear-gradient(hsl(var(--background) / 0.65), hsl(var(--background) / 0.65)), url(${BACKGROUND_IMAGE_URLS.light})`,
      }}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10 sm:py-8">
        <a href={import.meta.env.BASE_URL} aria-label="Air Screenshot Studio home" className="flex items-center gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <img src={`${import.meta.env.BASE_URL}air-logo.svg`} alt="Air" className="h-7 w-auto" />
          <span className="h-5 w-px bg-foreground/20" aria-hidden="true" />
          <span className="text-sm font-medium tracking-tight"><span className="hidden sm:inline">Screenshot </span>Studio</span>
        </a>
        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <AgentInstructions />
          <a
            href="https://air.dev"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="hidden sm:inline">Discover Air</span>
            <span className="sm:hidden">Air.dev</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div className={`w-full ${imageData ? 'max-w-5xl' : 'max-w-[680px]'}`}>
          <div className={`text-center ${imageData ? 'mb-6' : 'mb-9 sm:mb-11'}`}>
            <h1 className={`font-display font-[130] leading-[0.95] tracking-[-0.055em] ${imageData ? 'text-5xl sm:text-6xl' : 'text-[clamp(3rem,7vw,5.5rem)]'}`}>
              {imageData ? 'Ready to share' : 'Add some Air'}
            </h1>
          </div>

          {backgroundStatus !== 'ready' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/65 px-4 py-3 text-sm">
              <p role="status" aria-live="polite">
                {backgroundStatus === 'failed'
                  ? 'Air backgrounds couldn’t load. Retry to enable exports. Your screenshot is safe.'
                  : 'Loading Air backgrounds for export…'}
              </p>
              <button
                type="button"
                onClick={retryBackgrounds}
                disabled={backgroundStatus === 'loading'}
                className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
              >
                Retry backgrounds
              </button>
            </div>
          )}

          {imageData && usesDevice && frameStatus !== 'ready' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/65 px-4 py-3 text-sm">
              <p role="status" aria-live="polite">
                {frameStatus === 'failed'
                  ? 'The iPhone frame couldn’t load. Retry, or switch to the Screenshot layout.'
                  : 'Loading the iPhone frame…'}
              </p>
              <button
                type="button"
                onClick={() => setFrameAttempt((attempt) => attempt + 1)}
                disabled={frameStatus !== 'failed'}
                className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50"
              >
                Retry frame
              </button>
            </div>
          )}

          {imageData && (
            <section aria-label="Styled screenshot" className="mb-4 overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-2 shadow-lg backdrop-blur-xl sm:p-3">
              <div className={usesDevice ? 'h-[clamp(320px,60vh,640px)]' : 'h-[clamp(220px,40vh,480px)]'}>
                <CanvasPreview
                  svgContent={svgContent}
                  canExpand={exportsReady}
                  className="rounded-xl border-0 bg-transparent"
                  overlay={deviceView && frame && (
                    <CropSurface
                      composition={deviceView}
                      screen={frame.screen}
                      onPan={handlePan}
                      onZoom={handleZoomBy}
                      onCenter={handleCenter}
                      onAdjustingChange={setAdjusting}
                    />
                  )}
                >
                  {deviceView && frame && (
                    <DeviceFramePreview
                      layout={deviceView}
                      backgroundHref={backgroundHref(variant)}
                      imageHref={imageData}
                      frameHref={frame.data}
                      showOverflow={adjusting}
                    />
                  )}
                </CanvasPreview>
              </div>
              {deviceView && (
                <div className="px-2 pt-3 sm:px-3">
                  <CropControls zoom={crop.zoom} onZoomChange={handleZoom} onCenter={handleCenter} onAdjustingChange={setAdjusting} />
                </div>
              )}
              <div className="flex flex-col items-center justify-between gap-4 px-2 pb-2 pt-4 sm:flex-row sm:px-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {DEVICE_FRAME && <LayoutPicker selected={layout} onChange={handleLayoutChange} deviceModel={DEVICE_FRAME.model} />}
                  <BackgroundPicker selected={variant} onChange={handleVariantChange} />
                </div>
                <ExportButtons svgContent={svgContent} onExport={handleExport} disabled={!svgContent || !exportsReady} />
              </div>
            </section>
          )}

          <ImageLoader onImageLoad={handleImageLoad} compact={Boolean(imageData)} />

          {imageData ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" aria-hidden="true" /> {imageWidth} × {imageHeight} source · Original quality</span>
              <button
                type="button"
                onClick={() => { setImageData(''); setSvgContent(''); }}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Start fresh
              </button>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:gap-x-8">
              {['Drop it in', 'Give it some Air', 'Share it anywhere'].map((step, index) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground/20 text-[9px]">{index + 1}</span>
                  {step}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="flex flex-col gap-3 px-6 py-6 text-[11px] text-muted-foreground sm:px-10">
        <div className="space-y-1 text-center leading-relaxed">
          <p>Community project. Not affiliated with the official Air product or JetBrains.</p>
          <p className="flex items-center justify-center gap-1.5">
            <LockKeyhole className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>Screenshots are processed entirely in your browser and are never uploaded or stored on our servers.</span>
          </p>
          {DEVICE_FRAME && <p>iPhone is a trademark of Apple Inc., registered in the U.S. and other countries and regions.</p>}
        </div>
      </footer>
    </div>
  );
};

export default Index;
