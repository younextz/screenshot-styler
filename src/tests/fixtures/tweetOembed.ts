export const TWEET_OEMBED_HTML = `<blockquote class="twitter-tweet"><p lang="en" dir="ltr">you can try to massage codex to do a long-running task, or just queue messages. simple wins. <a href="https://t.co/oPENz7KdsH">pic.twitter.com/oPENz7KdsH</a></p>&mdash; Peter Steinberger (@steipete) <a href="https://twitter.com/steipete/status/1978099041884897517?ref_src=twsrc%5Etfw">October 14, 2025</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
`;
export interface TweetOembedFixture {
  author_name?: string;
  author_url?: string;
  html?: string;
}
export function createTweetOembedFixture(
  overrides: TweetOembedFixture = {},
): TweetOembedFixture {
  return {
    author_name: 'Peter Steinberger',
    author_url: 'https://twitter.com/steipete',
    html: TWEET_OEMBED_HTML,
    ...overrides,
  };
}
