import { useEffect, useRef, useState, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import {
  MIN_SCREENSHOT_SCALE,
  clampScreenshotScale,
  maxScreenshotScale,
  screenshotLayout,
} from '@/utils/composeScreenshot';

const KEYBOARD_SCALE_STEP = 0.05;

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface HandleSpec {
  corner: Corner;
  cursorClass: string;
}

const HANDLES: HandleSpec[] = [
  { corner: 'top-left', cursorClass: 'cursor-nwse-resize' },
  { corner: 'top-right', cursorClass: 'cursor-nesw-resize' },
  { corner: 'bottom-left', cursorClass: 'cursor-nesw-resize' },
  { corner: 'bottom-right', cursorClass: 'cursor-nwse-resize' },
];

interface DragState {
  centerX: number;
  centerY: number;
  startDist: number;
  startScale: number;
}

export interface ScreenshotResizeHandlesProps {
  imageWidth: number;
  imageHeight: number;
  scale: number;
  onScaleChange: (scale: number) => void;
  /** Element the composed SVG is injected into; handle positions are derived from its box. */
  sourceRef: RefObject<HTMLDivElement>;
}

export default function ScreenshotResizeHandles({
  imageWidth,
  imageHeight,
  scale,
  onScaleChange,
  sourceRef,
}: ScreenshotResizeHandlesProps) {
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [dragScale, setDragScale] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const container = sourceRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [sourceRef]);

  const displayScale = dragScale ?? scale;
  const layout = screenshotLayout(imageWidth, imageHeight, displayScale);
  const fit =
    containerSize.width > 0 && containerSize.height > 0
      ? Math.min(containerSize.width / layout.canvasWidth, containerSize.height / layout.canvasHeight)
      : 0;
  if (fit <= 0) return null;

  // The SVG letterboxes its canvas inside the container (preserveAspectRatio "meet").
  const offsetX = (containerSize.width - layout.canvasWidth * fit) / 2;
  const offsetY = (containerSize.height - layout.canvasHeight * fit) / 2;
  const left = offsetX + layout.x * fit;
  const top = offsetY + layout.y * fit;
  const right = left + layout.width * fit;
  const bottom = top + layout.height * fit;
  const cornerPosition: Record<Corner, { left: number; top: number }> = {
    'top-left': { left, top },
    'top-right': { left: right, top },
    'bottom-left': { left, top: bottom },
    'bottom-right': { left: right, top: bottom },
  };

  // Dragging updates the injected SVG directly so the preview stays smooth; the
  // canonical SVG string is regenerated once via onScaleChange when the drag ends.
  const applyLiveScale = (next: number) => {
    const container = sourceRef.current;
    const image = container?.querySelector<SVGImageElement>('image[data-screenshot]');
    const clip = container?.querySelector<SVGRectElement>('rect[data-screenshot-clip]');
    if (!image || !clip) return;
    const live = screenshotLayout(imageWidth, imageHeight, next);
    for (const element of [image, clip]) {
      element.setAttribute('x', String(live.x));
      element.setAttribute('y', String(live.y));
      element.setAttribute('width', String(live.width));
      element.setAttribute('height', String(live.height));
    }
    clip.setAttribute('rx', String(live.cornerRadius));
  };

  const scaleFromPointer = (event: React.PointerEvent, drag: DragState) => {
    const dist = Math.hypot(event.clientX - drag.centerX, event.clientY - drag.centerY);
    return clampScreenshotScale(drag.startScale * (dist / drag.startDist), imageWidth, imageHeight);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const container = sourceRef.current;
    if (!container || event.button !== 0) return;
    const rect = container.getBoundingClientRect();
    // The screenshot stays centered on the canvas, so resizing pivots around the canvas center.
    const centerX = rect.left + offsetX + (layout.canvasWidth * fit) / 2;
    const centerY = rect.top + offsetY + (layout.canvasHeight * fit) / 2;
    const startDist = Math.hypot(event.clientX - centerX, event.clientY - centerY);
    if (startDist < 1) return;
    dragRef.current = { centerX, centerY, startDist, startScale: displayScale };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragScale(displayScale);
    event.preventDefault();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const next = scaleFromPointer(event, drag);
    setDragScale(next);
    applyLiveScale(next);
  };

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    // pointercancel may carry no usable coordinates; commit the last live value instead.
    const next = event.type === 'pointercancel' ? (dragScale ?? scale) : scaleFromPointer(event, drag);
    setDragScale(null);
    onScaleChange(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    let delta = 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') delta = KEYBOARD_SCALE_STEP;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') delta = -KEYBOARD_SCALE_STEP;
    else return;
    event.preventDefault();
    onScaleChange(clampScreenshotScale(scale + delta, imageWidth, imageHeight));
  };

  const minPercent = Math.round(MIN_SCREENSHOT_SCALE * 100);
  const maxPercent = Math.round(maxScreenshotScale(imageWidth, imageHeight) * 100);
  const currentPercent = Math.round(displayScale * 100);

  return (
    // Mirrors the inset-4 box CanvasPreview injects the SVG into, so both share coordinates.
    <div className="pointer-events-none absolute inset-4 z-20">
      {HANDLES.map(({ corner, cursorClass }) => (
        <button
          key={corner}
          type="button"
          role="slider"
          aria-label={`Resize screenshot (${corner.replace('-', ' ')} corner). Drag or use arrow keys; double-click to reset.`}
          aria-valuemin={minPercent}
          aria-valuemax={maxPercent}
          aria-valuenow={currentPercent}
          aria-valuetext={`${currentPercent}%`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => onScaleChange(1)}
          style={cornerPosition[corner]}
          className={cn(
            'pointer-events-auto absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-primary/70 bg-white shadow-md transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            cursorClass,
          )}
        />
      ))}
    </div>
  );
}
