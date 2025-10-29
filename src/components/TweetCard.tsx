import React from 'react';

interface TweetCardProps {
  author: string;
  handle: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  retweets: number;
}

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
