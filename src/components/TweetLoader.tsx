import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface TweetLoaderProps {
  onTweetLoad: (tweetData: any) => void;
}

export function TweetLoader({ onTweetLoad }: TweetLoaderProps) {
  const [tweetUrl, setTweetUrl] = useState('');

  const handleFetchTweet = async () => {
    if (!tweetUrl) {
      toast.error('Please enter a tweet URL');
      return;
    }
try {
      const response = await fetch(`https://publish.twitter.com/oembed?url=${tweetUrl}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tweet');
      }
      const data = await response.json();

      const tweetData = {
        author: data.author_name,
        handle: data.author_url.split('/').pop(),
        avatar: '/placeholder.svg',
        text: data.html.replace(/<[^>]*>?/gm, ''), // A simple way to strip html tags
        timestamp: '', // oEmbed doesn't provide timestamp
        likes: 0, // oEmbed doesn't provide likes
        retweets: 0, // oEmbed doesn't provide retweets
      };

      onTweetLoad(tweetData);
      toast.success('Tweet loaded successfully');
    } catch (error) {
      toast.error('Failed to load tweet');
      console.error('Tweet loading error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter Tweet URL"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleFetchTweet}>Fetch Tweet</Button>
      </div>
    </div>
  );
}
