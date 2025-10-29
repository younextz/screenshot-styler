import { render, screen, fireEvent } from './test-utils';
import { TweetLoader } from '../components/TweetLoader';

describe('TweetLoader', () => {
it('calls onTweetLoad with fetched data when the button is clicked', async () => {
    const onTweetLoad = vi.fn();
    const mockTweetData = {
      author_name: 'John Doe',
      author_url: 'https://twitter.com/johndoe',
      html: '<p>This is a mock tweet for demonstration purposes.</p>',
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
      author: 'John Doe',
      handle: 'johndoe',
      avatar: '/placeholder.svg',
      text: 'This is a mock tweet for demonstration purposes.',
      timestamp: '',
      likes: 0,
      retweets: 0,
    });
  });
});
