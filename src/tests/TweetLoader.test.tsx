import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from './test-utils';
import { TweetLoader } from '../components/TweetLoader';
import { createTweetOembedFixture } from './fixtures/tweetOembed';
describe('TweetLoader', () => {
  const mockFetch = (payload: unknown, ok = true) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(payload),
    } as Response);
  };
  it('calls onTweetLoad with fetched data when the button is clicked', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(createTweetOembedFixture());
    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    const input = screen.getByPlaceholderText('Enter Tweet URL');
    fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/123' } });
    const button = screen.getByText('Fetch Tweet');
    fireEvent.click(button);
    await screen.findByText('Tweet loaded successfully');
    expect(onTweetLoad).toHaveBeenCalledWith({
      author: 'Peter Steinberger',
      handle: 'steipete',
      avatar: '/placeholder.svg',
      text: 'you can try to massage codex to do a long-running task, or just queue messages. simple wins. pic.twitter.com/oPENz7KdsH',
      timestamp: 'October 14, 2025',
      likes: 0,
      retweets: 0,
    });
  });
  it('throws an error when the tweet URL is invalid', async () => {
    const onTweetLoad = vi.fn();
    mockFetch({ error: 'Invalid URL' });
    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    const input = screen.getByPlaceholderText('Enter Tweet URL');
    fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/invalid' } });
    const button = screen.getByText('Fetch Tweet');
    fireEvent.click(button);
    await screen.findByText('Failed to load tweet');
    expect(onTweetLoad).not.toHaveBeenCalled();
  });
  it('handles a missing author_url gracefully', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(createTweetOembedFixture({ author_url: undefined }));
    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    const input = screen.getByPlaceholderText('Enter Tweet URL');
    fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/123' } });
    const button = screen.getByText('Fetch Tweet');
    fireEvent.click(button);
    await screen.findByText('Tweet loaded successfully');
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
  it('handles missing author_name and trailing slash in author_url', async () => {
    const onTweetLoad = vi.fn();
    mockFetch(
      createTweetOembedFixture({
        author_name: undefined,
        author_url: 'https://twitter.com/steipete/',
      }),
    );
    render(<TweetLoader onTweetLoad={onTweetLoad} />);
    const input = screen.getByPlaceholderText('Enter Tweet URL');
    fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/123' } });
    const button = screen.getByText('Fetch Tweet');
    fireEvent.click(button);
    await screen.findByText('Tweet loaded successfully');
    expect(onTweetLoad).toHaveBeenCalledWith({
      author: '',
      handle: 'steipete',
      avatar: '/placeholder.svg',
      text: 'you can try to massage codex to do a long-running task, or just queue messages. simple wins. pic.twitter.com/oPENz7KdsH',
      timestamp: 'October 14, 2025',
      likes: 0,
      retweets: 0,
    });
  });
});
