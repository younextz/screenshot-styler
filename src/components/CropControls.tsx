import { useId } from 'react';
import { Crosshair } from 'lucide-react';
import { MAX_ZOOM, MIN_ZOOM } from '@/utils/composeDeviceFrame';

export interface CropControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onCenter: () => void;
  onAdjustingChange: (adjusting: boolean) => void;
}

export default function CropControls({ zoom, onZoomChange, onCenter, onAdjustingChange }: CropControlsProps) {
  const zoomId = useId();
  const stopAdjusting = () => onAdjustingChange(false);
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
      <label htmlFor={zoomId} className="font-medium text-foreground">Zoom</label>
      <input
        id={zoomId}
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={zoom}
        aria-valuetext={`${zoom.toFixed(1)} times`}
        onChange={(event) => onZoomChange(Number(event.target.value))}
        onPointerDown={() => onAdjustingChange(true)}
        onPointerUp={stopAdjusting}
        onPointerCancel={stopAdjusting}
        onBlur={stopAdjusting}
        className="w-32 accent-primary"
      />
      <output htmlFor={zoomId} className="w-9 tabular-nums">{zoom.toFixed(1)}×</output>
      <button
        type="button"
        onClick={onCenter}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Crosshair className="h-3.5 w-3.5" aria-hidden="true" /> Center
      </button>
    </div>
  );
}
