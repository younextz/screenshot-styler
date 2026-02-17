export const BACKGROUND_IMAGE_URLS = {
  'bg-picture-dark': '/backgrounds/bg-dark-bubbles.png',
  'bg-picture-light': '/backgrounds/bg-light-bubbles.png',
} as const;
const backgroundImageCache: Record<string, string> = {};
async function loadBackgroundImage(url: string): Promise<string> {
  if (backgroundImageCache[url]) {
    return backgroundImageCache[url];
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
      backgroundImageCache[url] = dataUrl;
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
export async function preloadBackgroundImages(): Promise<void> {
  const urls = Object.values(BACKGROUND_IMAGE_URLS);
  await Promise.all(urls.map(url => loadBackgroundImage(url)));
}
export function getBackgroundImageDataUrl(presetId: string): string | null {
  const url = BACKGROUND_IMAGE_URLS[presetId as keyof typeof BACKGROUND_IMAGE_URLS];
  if (!url) return null;
  return backgroundImageCache[url] || null;
}
