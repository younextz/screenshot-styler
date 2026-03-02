export const DEFAULT_TWEET_AVATAR = '/placeholder.svg';

const normalizeTwitterHandle = (handle: string): string => (
  handle.trim().replace(/^@+/, '').replace(/\/+$/, '')
);

const normalizeAvatarUrl = (avatarUrl: string): string | null => {
  try {
    const parsedUrl = new URL(avatarUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    if (parsedUrl.protocol === 'http:') {
      parsedUrl.protocol = 'https:';
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
};

const blobToDataUrl = (blob: Blob): Promise<string> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Could not convert avatar blob to data URL'));
    };
    reader.onerror = () => reject(new Error('Could not read avatar blob'));
    reader.readAsDataURL(blob);
  })
);

export const getTwitterAvatarUrl = async (handle: string): Promise<string | null> => {
  const normalizedHandle = normalizeTwitterHandle(handle);
  if (!normalizedHandle) {
    return null;
  }

  return normalizeAvatarUrl(`https://unavatar.io/x/${encodeURIComponent(normalizedHandle)}`);
};

const getAvatarDataUrl = async (avatarUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(avatarUrl);
    if (!response.ok) {
      return null;
    }

    const imageBlob = await response.blob();
    if (!imageBlob.type.startsWith('image/')) {
      return null;
    }

    return await blobToDataUrl(imageBlob);
  } catch {
    return null;
  }
};

export const resolveTweetAvatar = async (handle: string): Promise<string> => {
  const avatarUrl = await getTwitterAvatarUrl(handle);
  if (!avatarUrl) {
    return DEFAULT_TWEET_AVATAR;
  }

  const avatarDataUrl = await getAvatarDataUrl(avatarUrl);
  return avatarDataUrl ?? DEFAULT_TWEET_AVATAR;
};
