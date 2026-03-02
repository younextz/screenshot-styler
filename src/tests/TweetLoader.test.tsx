import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TweetLoader } from '../components/TweetLoader';
import { createTweetOembedFixture } from './fixtures/tweetOembed';
import { fireEvent, render, screen } from './test-utils';
import { resolveTweetAvatar } from '@/utils/tweetAvatar';

vi.mock('@/utils/tweetAvatar', () => ({
  resolveTweetAvatar: vi.fn(),
}));

describe('TweetLoader', () => {
  const mockResolveTweetAvatar = vi.mocked(resolveTweetAvatar);

  const mockFetch = (payload: unknown, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(payload),
    } as Response);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveTweetAvatar.mockResolvedValue('/placeholder.svg');
  });

  it('calls onTweetLoad with fetched data and resolved avatar', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(createTweetOembedFixture());
    mockResolveTweetAvatar.mockResolvedValue('data:image/png;base64,avatar');

    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    fireEvent.change(screen.getByPlaceholderText('Enter Tweet URL'), {
      target: { value: 'https://twitter.com/user/status/123' },
    });
    fireEvent.click(screen.getByText('Fetch Tweet'));

    await screen.findByText('Tweet loaded successfully');
    expect(mockResolveTweetAvatar).toHaveBeenCalledWith('steipete');
    expect(onTweetLoad).toHaveBeenCalledWith({
      author: 'Peter Steinberger',
      handle: 'steipete',
      avatar: 'data:image/png;base64,avatar',
      text: 'you can try to massage codex to do a long-running task, or just queue messages. simple wins. pic.twitter.com/oPENz7KdsH',
      timestamp: 'October 14, 2025',
      likes: 0,
      retweets: 0,
    });
  });

  it('shows an error when the oEmbed payload is invalid', async () => {
    const onTweetLoad = vi.fn();
    mockFetch({ error: 'Invalid URL' });

    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    fireEvent.change(screen.getByPlaceholderText('Enter Tweet URL'), {
      target: { value: 'https://twitter.com/user/status/invalid' },
    });
    fireEvent.click(screen.getByText('Fetch Tweet'));

    await screen.findByText('Failed to load tweet');
    expect(mockResolveTweetAvatar).not.toHaveBeenCalled();
    expect(onTweetLoad).not.toHaveBeenCalled();
  });

  it('handles a missing author_url gracefully', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(createTweetOembedFixture({ author_url: undefined }));

    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    fireEvent.change(screen.getByPlaceholderText('Enter Tweet URL'), {
      target: { value: 'https://twitter.com/user/status/123' },
    });
    fireEvent.click(screen.getByText('Fetch Tweet'));

    await screen.findByText('Tweet loaded successfully');
    expect(mockResolveTweetAvatar).toHaveBeenCalledWith('');
    expect(onTweetLoad).toHaveBeenCalledWith({
      author: 'Peter Steinberger',
      handle: '',
      avatar: '/placeholder.svg',
      text: 'you can try to massage codex to do a long-running task, or just queue messages. simple wins. pic.twitter.com/oPENz7KdsH',
      timestamp: 'October 14, 2025',
      likes: 0,
      retweets: 0,
    });
  });

  it('extracts handle from author_url query params', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(createTweetOembedFixture({ author_url: 'https://twitter.com/intent/user?screen_name=steipete' }));

    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    fireEvent.change(screen.getByPlaceholderText('Enter Tweet URL'), {
      target: { value: 'https://twitter.com/user/status/123' },
    });
    fireEvent.click(screen.getByText('Fetch Tweet'));

    await screen.findByText('Tweet loaded successfully');
    expect(mockResolveTweetAvatar).toHaveBeenCalledWith('steipete');
    expect(onTweetLoad).toHaveBeenCalledWith(expect.objectContaining({
      author: 'Peter Steinberger',
      handle: 'steipete',
      avatar: '/placeholder.svg',
    }));
  });
});
