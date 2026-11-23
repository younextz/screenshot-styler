import { useEffect, useId, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { ImageSize } from '@/utils/composeScreenshot';

export interface CropSurfaceProps {
  /** Size of the composed picture; the surface lies over its letterboxed preview. */
  composition: ImageSize;
  /** Size of the device screen, used for keyboard step sizes. */
  screen: ImageSize;
  /** Moves the screenshot by (dx, dy) composition pixels. */
  onPan: (dx: number, dy: number) => void;
  /** Multiplies the zoom by `factor`. */
  onZoom: (factor: number) => void;
  onCenter: () => void;
  onAdjustingChange: (adjusting: boolean) => void;
}

const SETTLE_DELAY_MS = 600;
const KEY_ZOOM_FACTOR = 1.1;

interface Point {
  x: number;
  y: number;
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * Transparent layer over the preview that adjusts which part of the screenshot
 * fills the device screen: drag, wheel/trackpad, pinch, and keyboard.
 */
export default function CropSurface({ composition, screen, onPan, onZoom, onCenter, onAdjustingChange }: CropSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const settleTimer = useRef<number | undefined>(undefined);
  const helpId = useId();
  const callbacks = useRef({ onPan, onZoom, onAdjustingChange, composition });
  callbacks.current = { onPan, onZoom, onAdjustingChange, composition };

  // Screen pixels per composition pixel: the SVG is fitted inside the same box.
  const pixelScale = () => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    const { width, height } = callbacks.current.composition;
    const scale = rect ? Math.min(rect.width / width, rect.height / height) : 0;
    return scale > 0 ? scale : 1;
  };

  const settleLater = () => {
    callbacks.current.onAdjustingChange(true);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      if (pointers.current.size === 0) callbacks.current.onAdjustingChange(false);
    }, SETTLE_DELAY_MS);
  };

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    // React registers wheel listeners as passive; preventDefault needs a native listener.
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
      if (event.ctrlKey || event.metaKey) {
        // Trackpad pinch arrives as ctrl + wheel.
        callbacks.current.onZoom(Math.exp((-event.deltaY * unit) / 200));
      } else {
        const scale = pixelScale();
        const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
        const dy = event.shiftKey && !event.deltaX ? 0 : event.deltaY;
        // Scrolling reveals content further along, like a scroll view.
        callbacks.current.onPan((-dx * unit) / scale, (-dy * unit) / scale);
      }
      settleLater();
    };
    surface.addEventListener('wheel', handleWheel, { passive: false });
    return () => surface.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    window.clearTimeout(settleTimer.current);
    onAdjustingChange(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    const others = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, point]) => point);
    const scale = pixelScale();
    if (others.length === 1) {
      const [other] = others;
      const before = distance(previous, other);
      const after = distance(current, other);
      if (before > 0 && after > 0) onZoom(after / before);
      const from = midpoint(previous, other);
      const to = midpoint(current, other);
      onPan((to.x - from.x) / scale, (to.y - from.y) / scale);
    } else if (others.length === 0) {
      onPan((current.x - previous.x) / scale, (current.y - previous.y) / scale);
    }
    pointers.current.set(event.pointerId, current);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(event.pointerId)) return;
    if (pointers.current.size === 0) onAdjustingChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-screen.width * step, 0],
      ArrowRight: [screen.width * step, 0],
      ArrowUp: [0, -screen.height * step],
      ArrowDown: [0, screen.height * step],
    };
    if (moves[event.key]) {
      onPan(...moves[event.key]);
    } else if (event.key === '+' || event.key === '=') {
      onZoom(KEY_ZOOM_FACTOR);
    } else if (event.key === '-' || event.key === '_') {
      onZoom(1 / KEY_ZOOM_FACTOR);
    } else if (event.key === '0' || event.key === 'Home') {
      onCenter();
    } else {
      return;
    }
    event.preventDefault();
    settleLater();
  };

  return (
    <div
      ref={surfaceRef}
      tabIndex={0}
      role="group"
      aria-roledescription="crop area"
      aria-label="Screenshot position on the iPhone screen"
      aria-describedby={helpId}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      onBlur={() => { if (pointers.current.size === 0) onAdjustingChange(false); }}
      className="absolute inset-0 cursor-grab touch-none select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <span id={helpId} className="sr-only">
        Drag, scroll or use the arrow keys to move the screenshot. Pinch, Ctrl and scroll, or the plus and minus keys zoom. Press 0 to center.
      </span>
    </div>
  );
}
