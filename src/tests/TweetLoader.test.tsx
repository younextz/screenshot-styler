import { render, screen, fireEvent } from './test-utils';
import { TweetLoader } from '../components/TweetLoader';

describe('TweetLoader', () => {
it('calls onTweetLoad with fetched data when the button is clicked', async () => {
    const onTweetLoad = vi.fn();
    const mockTweetData = {
      author_name: 'Peter Steinberger',
      author_url: 'https://twitter.com/steipete',
      html: '<blockquote class=\"twitter-tweet\"><p lang=\"en\" dir=\"ltr\">you can try to massage codex to do a long-running task, or just queue messages. simple wins. <a href=\"https://t.co/oPENz7KdsH\">pic.twitter.com/oPENz7KdsH</a></p>&mdash; Peter Steinberger (@steipete) <a href=\"https://twitter.com/steipete/status/1978099041884897517?ref_src=twsrc%5Etfw\">October 14, 2025</a></blockquote>\n<script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>\n\n',
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTweetData),
    });

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
});

it('throws an error when the tweet URL is invalid', async () => {
  const onTweetLoad = vi.fn();
  const mockTweetData = {
    error: 'Invalid URL',
  };
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockTweetData),
  });

  render(<TweetLoader onTweetLoad={onTweetLoad} />);

  const input = screen.getByPlaceholderText('Enter Tweet URL');
  fireEvent.change(input, { target: { value: 'https://twitter.com/user/status/invalid' } });

  const button = screen.getByText('Fetch Tweet');
  fireEvent.click(button);

  await screen.findByText('Failed to load tweet');

  expect(onTweetLoad).not.toHaveBeenCalled();
});
