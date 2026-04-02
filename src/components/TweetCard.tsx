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
    <div className="bg-red-500 dark:bg-red-700 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex justify-end mb-2">
        <svg viewBox="0 0 24 24" aria-label="X" className="w-5 h-5 fill-gray-900 dark:fill-white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex items-center mb-4">
        <img src={avatar} alt={`${author}'s avatar`} className="w-16 h-12 rounded-full mr-4 ring-4 ring-yellow-400 bg-black" />
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{author}</p>
          <p className="text-gray-500 dark:text-gray-400">@{handle}</p>
        </div>
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
