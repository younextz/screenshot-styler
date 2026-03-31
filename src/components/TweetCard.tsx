import React from 'react';
import type { TweetData } from '@/types/tweet';

type TweetCardProps = TweetData;

export const TweetCard: React.FC<TweetCardProps> = ({
  author,
  handle,
  avatar,
  text,
  timestamp,
  likes,
  retweets,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <img src={avatar} alt={`${author}'s avatar`} className="w-12 h-12 rounded-full mr-4" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white">{author}</p>
          <p className="text-gray-500 dark:text-gray-400">@{handle}</p>
        </div>
        <svg viewBox="0 0 24 24" aria-label="X" className="w-5 h-5 fill-current text-gray-900 dark:text-white flex-shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <p className="text-gray-800 dark:text-gray-200 mb-4">{text}</p>
      <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        <span>{timestamp}</span>
      </div>
      <div className="flex text-gray-500 dark:text-gray-400 text-sm">
        <div className="mr-4">
          <span className="font-bold text-gray-900 dark:text-white">{retweets}</span> Retweets
        </div>
        <div>
          <span className="font-bold text-gray-900 dark:text-white">{likes}</span> Likes
        </div>
      </div>
    </div>
  );
};
