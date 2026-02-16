import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Input } from './ui/input';
import type { TweetData } from '@/types/tweet';

interface TweetLoaderProps {
  onTweetLoad: (tweetData: TweetData) => void;
}

const getHandleFromUrl = (authorUrl?: string): string => {
  if (!authorUrl) return '';

  try {
    const url = new URL(authorUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  } catch {
    return authorUrl.split('/').filter(Boolean).pop() ?? '';
  }
};

export function TweetLoader({ onTweetLoad }: TweetLoaderProps) {
  const [tweetUrl, setTweetUrl] = useState<string>('');

  const handleFetchTweet = async () => {
    const trimmedUrl = tweetUrl.trim();
    if (!trimmedUrl) {
      toast.error('Please enter a tweet URL');
      return;
    }

    try {
      const normalizedUrl = trimmedUrl.replace('https://x.com/', 'https://twitter.com/');
      const response = await fetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch tweet');
      }
      const data: { author_name?: string; author_url?: string; html?: string } = await response.json();

      if (!data.html) {
        throw new Error('Invalid tweet URL or oEmbed response');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, 'text/html');
      const text = doc.querySelector('p')?.textContent || '';
      const links = doc.querySelectorAll('a');
      const timestamp = links.length > 0 ? links[links.length - 1]?.textContent || '' : '';

      const tweetData: TweetData = {
        author: typeof data.author_name === 'string' ? data.author_name.trim() : '',
        handle: getHandleFromUrl(data.author_url),
        avatar: '/placeholder.svg',
        text,
        timestamp,
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
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Tweet URL</p>
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter Tweet URL"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleFetchTweet();
            }
          }}
          className="flex-1"
        />
        <Button type="button" onClick={handleFetchTweet}>
          Fetch Tweet
        </Button>
      </div>
    </div>
  );
}
