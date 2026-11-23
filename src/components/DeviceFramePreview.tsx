import type { DeviceLayout } from '@/utils/composeDeviceFrame';

export interface DeviceFramePreviewProps {
  layout: DeviceLayout;
  backgroundHref: string;
  imageHref: string;
  frameHref: string;
  /** Shows the cut-off parts of the screenshot, tinted, while the crop is being adjusted. */
  showOverflow?: boolean;
}

/**
 * Live preview of `composeDeviceFrame`, rendered as React SVG so panning only
 * updates attributes instead of re-parsing large embedded images on every move.
 */
export default function DeviceFramePreview({ layout, backgroundHref, imageHref, frameHref, showOverflow = false }: DeviceFramePreviewProps) {
  const { screen, image, frame } = layout;
  return (
    <svg
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Styled screenshot in an iPhone frame"
    >
      <defs>
        <clipPath id="device-screen-clip-preview">
          <rect x={screen.x} y={screen.y} width={screen.width} height={screen.height} />
        </clipPath>
      </defs>
      <image href={backgroundHref} x="0" y="0" width={layout.width} height={layout.height} preserveAspectRatio="xMidYMid slice" />
      {showOverflow && (
        <image
          data-testid="crop-overflow"
          href={imageHref}
          x={image.x}
          y={image.y}
          width={image.width}
          height={image.height}
          opacity={0.35}
          preserveAspectRatio="none"
        />
      )}
      <image
        href={imageHref}
        x={image.x}
        y={image.y}
        width={image.width}
        height={image.height}
        clipPath="url(#device-screen-clip-preview)"
        preserveAspectRatio="none"
      />
      <image href={frameHref} x={frame.x} y={frame.y} width={frame.width} height={frame.height} preserveAspectRatio="none" />
    </svg>
  );
}
