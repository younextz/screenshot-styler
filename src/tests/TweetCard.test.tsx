import { render, screen } from '@testing-library/react';
import { TweetCard } from '../components/TweetCard';

describe('TweetCard', () => {
  const tweetData = {
    author: 'John Doe',
    handle: 'johndoe',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    text: 'This is a mock tweet for demonstration purposes.',
    timestamp: '2h',
    likes: 123,
    retweets: 45,
  };

  it('renders the tweet data correctly', () => {
    render(<TweetCard {...tweetData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('This is a mock tweet for demonstration purposes.')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });
});
