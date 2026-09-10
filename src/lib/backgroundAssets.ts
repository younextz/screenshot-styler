export type BackgroundVariant = 'dark' | 'light';

export const BACKGROUND_IMAGE_URLS: Record<BackgroundVariant, string> = {
  dark: '/backgrounds/bg-dark-bubbles.png',
  light: '/backgrounds/bg-light-bubbles.png',
};

const backgroundImageCache: Partial<Record<BackgroundVariant, string>> = {};

async function loadBackgroundImage(variant: BackgroundVariant): Promise<string> {
  const cached = backgroundImageCache[variant];
  if (cached) {
    return cached;
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      backgroundImageCache[variant] = dataUrl;
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${BACKGROUND_IMAGE_URLS[variant]}`));
    img.src = BACKGROUND_IMAGE_URLS[variant];
  });
}

// Converts the backgrounds to data URLs so exported SVGs/PNGs embed them;
// a relative /backgrounds/... href would not resolve once the SVG leaves the app.
export async function preloadBackgroundImages(): Promise<void> {
  const variants = Object.keys(BACKGROUND_IMAGE_URLS) as BackgroundVariant[];
  await Promise.all(variants.map(loadBackgroundImage));
}

export function getBackgroundImageDataUrl(variant: BackgroundVariant): string | null {
  return backgroundImageCache[variant] ?? null;
}
