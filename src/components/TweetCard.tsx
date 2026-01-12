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
    <div className="bg-card border border-border/40 p-5 rounded-xl max-w-md mx-auto transition-colors duration-200">
      <div className="flex items-center mb-3">
        <img src={avatar} alt={`${author}'s avatar`} className="w-11 h-11 rounded-full mr-3" />
        <div>
          <p className="font-medium text-foreground">{author}</p>
          <p className="text-sm text-muted-foreground">@{handle}</p>
        </div>
      </div>
      <p className="text-foreground/90 mb-3 leading-relaxed">{text}</p>
      <div className="text-muted-foreground/70 text-sm mb-3">
        <span>{timestamp}</span>
      </div>
      <div className="flex text-muted-foreground text-sm gap-4">
        <div>
          <span className="font-medium text-foreground">{retweets}</span> Retweets
        </div>
        <div>
          <span className="font-medium text-foreground">{likes}</span> Likes
        </div>
      </div>
    </div>
  );
};
