import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_TWEET_AVATAR, getTwitterAvatarUrl, resolveTweetAvatar } from './tweetAvatar';

const TWITTER_PROFILE_LOOKUP_URL = 'https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=';

const makeJsonResponse = (payload: unknown, ok = true): Response => ({
  ok,
  json: () => Promise.resolve(payload),
} as Response);

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

  it('resolves a normalized high-resolution avatar URL', async () => {
    const lowResolutionAvatar = 'http://pbs.twimg.com/profile_images/42/profile_normal.jpg';
    global.fetch = vi.fn().mockResolvedValue(makeJsonResponse([
      { profile_image_url_https: lowResolutionAvatar },
    ]));

    const avatarUrl = await getTwitterAvatarUrl(' @steipete/ ');

    expect(global.fetch).toHaveBeenCalledWith(`${TWITTER_PROFILE_LOOKUP_URL}steipete`);
    expect(avatarUrl).toBe('https://pbs.twimg.com/profile_images/42/profile_400x400.jpg');
  });

  it('returns null when lookup payload is malformed', async () => {
    global.fetch = vi.fn().mockResolvedValue(makeJsonResponse({}));

    const avatarUrl = await getTwitterAvatarUrl('steipete');

    expect(avatarUrl).toBeNull();
  });

  it('returns placeholder when handle is empty', async () => {
    const avatarUrl = await resolveTweetAvatar('   ');
    expect(avatarUrl).toBe(DEFAULT_TWEET_AVATAR);
  });

  it('returns placeholder when avatar download fails', async () => {
    global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = getUrlFromRequest(input);
      if (url.startsWith(TWITTER_PROFILE_LOOKUP_URL)) {
        return Promise.resolve(makeJsonResponse([
          { profile_image_url_https: 'https://pbs.twimg.com/profile_images/42/profile_normal.jpg' },
        ]));
      }

      return Promise.resolve(makeBlobResponse(new Blob(['blocked'], { type: 'text/plain' })));
    });

    const avatarUrl = await resolveTweetAvatar('steipete');

    expect(avatarUrl).toBe(DEFAULT_TWEET_AVATAR);
  });

  it('returns a data URL when avatar image is fetched successfully', async () => {
    const expectedAvatarUrl = 'https://pbs.twimg.com/profile_images/42/profile_400x400.jpg';
    global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = getUrlFromRequest(input);
      if (url.startsWith(TWITTER_PROFILE_LOOKUP_URL)) {
        return Promise.resolve(makeJsonResponse([
          { profile_image_url_https: 'https://pbs.twimg.com/profile_images/42/profile_normal.jpg' },
        ]));
      }

      if (url === expectedAvatarUrl) {
        return Promise.resolve(makeBlobResponse(new Blob(['avatar'], { type: 'image/png' })));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const avatarUrl = await resolveTweetAvatar('steipete');

    expect(avatarUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});
