import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TWEET_AVATAR, getTwitterAvatarUrl, resolveTweetAvatar } from './tweetAvatar';

const UNAVATAR_LOOKUP_URL = 'https://unavatar.io/x/';

const makeBlobResponse = (blob: Blob, ok = true): Response => ({
  ok,
  blob: () => Promise.resolve(blob),
} as Response);

const getUrlFromRequest = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
};

describe('tweetAvatar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves a normalized avatar URL', async () => {
    const avatarUrl = await getTwitterAvatarUrl(' @steipete/ ');

    expect(avatarUrl).toBe(`${UNAVATAR_LOOKUP_URL}steipete`);
  });

  it('returns null when handle is missing', async () => {
    const avatarUrl = await getTwitterAvatarUrl('  ');
    expect(avatarUrl).toBeNull();
  });

  it('returns placeholder when handle is empty', async () => {
    const avatarUrl = await resolveTweetAvatar('   ');
    expect(avatarUrl).toBe(DEFAULT_TWEET_AVATAR);
  });

  it('returns placeholder when avatar download fails', async () => {
    global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = getUrlFromRequest(input);
      expect(url).toBe(`${UNAVATAR_LOOKUP_URL}steipete`);

      return Promise.resolve(makeBlobResponse(new Blob(['blocked'], { type: 'text/plain' })));
    });

    const avatarUrl = await resolveTweetAvatar('steipete');

    expect(avatarUrl).toBe(DEFAULT_TWEET_AVATAR);
  });

  it('returns a data URL when avatar image is fetched successfully', async () => {
    const expectedAvatarUrl = `${UNAVATAR_LOOKUP_URL}steipete`;
    global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = getUrlFromRequest(input);

      if (url === expectedAvatarUrl) {
        return Promise.resolve(makeBlobResponse(new Blob(['avatar'], { type: 'image/png' })));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const avatarUrl = await resolveTweetAvatar('steipete');

    expect(avatarUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});
