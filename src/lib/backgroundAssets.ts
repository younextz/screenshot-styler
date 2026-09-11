export type BackgroundVariant = 'dark' | 'light';

export const BACKGROUND_IMAGE_URLS: Record<BackgroundVariant, string> = {
  dark: '/backgrounds/bg-dark-bubbles.png',
  light: '/backgrounds/bg-light-bubbles.png',
};

const backgroundImageCache: Partial<Record<BackgroundVariant, string>> = {};
const pendingBackgrounds: Partial<Record<BackgroundVariant, Promise<string>>> = {};

async function loadBackgroundImage(variant: BackgroundVariant): Promise<string> {
  const cached = backgroundImageCache[variant];
  if (cached) {
    return cached;
  }
  const pending = pendingBackgrounds[variant];
  if (pending) return pending;

  const request = new Promise<string>((resolve, reject) => {
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
      try {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        backgroundImageCache[variant] = dataUrl;
        resolve(dataUrl);
      } catch (error: unknown) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${BACKGROUND_IMAGE_URLS[variant]}`));
    img.src = BACKGROUND_IMAGE_URLS[variant];
  });
  pendingBackgrounds[variant] = request;
  try {
    return await request;
  } finally {
    delete pendingBackgrounds[variant];
  }
}

// Converts the backgrounds to data URLs so exported SVGs/PNGs embed them;
// a relative /backgrounds/... href would not resolve once the SVG leaves the app.
export async function preloadBackgroundImage(variant: BackgroundVariant): Promise<void> {
  await loadBackgroundImage(variant);
}

export function getBackgroundImageDataUrl(variant: BackgroundVariant): string | null {
  return backgroundImageCache[variant] ?? null;
}
