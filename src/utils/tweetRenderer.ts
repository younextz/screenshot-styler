import type { TweetData } from '@/types/tweet';

interface TweetRenderOptions {
  width?: number;
}

export interface TweetRenderResult {
  dataUrl: string;
  width: number;
  height: number;
}

const FONT_STACK = '"Satoshi", "Space Grotesk", "IBM Plex Sans", "Segoe UI", sans-serif';
const DEFAULT_WIDTH = 720;
const PADDING = 32;
const AVATAR_SIZE = 44;
const HEADER_GAP = 16;
const BODY_FONT_SIZE = 20;
const BODY_LINE_HEIGHT = 30;
const META_FONT_SIZE = 14;
const META_LINE_HEIGHT = 20;
const META_GAP = 16;
const TIMESTAMP_GAP = 18;
const PARAGRAPH_GAP = 12;

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] => {
  ctx.font = font;
  const paragraphs = text.split(/\n/);
  const lines: string[] = [];

  paragraphs.forEach((paragraph, index) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        line = testLine;
        return;
      }

      if (line) {
        lines.push(line);
      }

      if (ctx.measureText(word).width <= maxWidth) {
        line = word;
        return;
      }

      let remaining = word;
      while (remaining.length > 0) {
        let slice = remaining;
        while (ctx.measureText(slice).width > maxWidth && slice.length > 1) {
          slice = slice.slice(0, -1);
        }
        lines.push(slice);
        remaining = remaining.slice(slice.length);
      }
      line = '';
    });

    if (line) {
      lines.push(line);
    }

    if (index < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const getInitials = (author: string) => {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const renderTweetToImage = async (
  tweet: TweetData,
  options: TweetRenderOptions = {},
): Promise<TweetRenderResult> => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const width = options.width ?? DEFAULT_WIDTH;
  const contentWidth = width - PADDING * 2;
  const bodyFont = `500 ${BODY_FONT_SIZE}px ${FONT_STACK}`;
  const metaFont = `500 ${META_FONT_SIZE}px ${FONT_STACK}`;
  const titleFont = `600 18px ${FONT_STACK}`;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('Could not get canvas context');
  }

  const textLines = wrapText(measureCtx, tweet.text, contentWidth, bodyFont);
  const textHeight = textLines.reduce((height, line) => (
    height + (line ? BODY_LINE_HEIGHT : PARAGRAPH_GAP)
  ), 0);

  const hasTimestamp = Boolean(tweet.timestamp);
  const hasMetrics = tweet.likes > 0 || tweet.retweets > 0;

  const height = Math.ceil(
    PADDING +
      AVATAR_SIZE +
      HEADER_GAP +
      textHeight +
      (hasTimestamp ? TIMESTAMP_GAP + META_LINE_HEIGHT : 0) +
      (hasMetrics ? META_GAP + META_LINE_HEIGHT : 0) +
      PADDING
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(scale, scale);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawRoundedRect(ctx, 0, 0, width, height, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  const avatarX = PADDING;
  const avatarY = PADDING;

  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(avatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  const initials = getInitials(tweet.author);
  if (initials) {
    ctx.font = `600 16px ${FONT_STACK}`;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, avatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const nameX = avatarX + AVATAR_SIZE + 14;
  const nameY = avatarY + 2;
  const authorName = tweet.author || 'Unknown';
  ctx.font = titleFont;
  ctx.fillStyle = '#0f172a';
  ctx.fillText(authorName, nameX, nameY);

  const nameWidth = ctx.measureText(authorName).width;
  const handle = tweet.handle ? `@${tweet.handle}` : '';
  if (handle) {
    ctx.font = metaFont;
    ctx.fillStyle = '#64748b';
    ctx.fillText(handle, nameX + nameWidth + 8, nameY + 2);
  }

  let currentY = avatarY + AVATAR_SIZE + HEADER_GAP;
  ctx.font = bodyFont;
  ctx.fillStyle = '#0f172a';

  textLines.forEach((line) => {
    if (!line) {
      currentY += PARAGRAPH_GAP;
      return;
    }
    ctx.fillText(line, PADDING, currentY);
    currentY += BODY_LINE_HEIGHT;
  });

  if (hasTimestamp) {
    currentY += TIMESTAMP_GAP;
    ctx.font = metaFont;
    ctx.fillStyle = '#64748b';
    ctx.fillText(tweet.timestamp, PADDING, currentY);
    currentY += META_LINE_HEIGHT;
  }

  if (hasMetrics) {
    currentY += META_GAP;
    ctx.font = metaFont;
    ctx.fillStyle = '#475569';
    const metrics = [
      tweet.retweets > 0 ? `${tweet.retweets} Retweets` : null,
      tweet.likes > 0 ? `${tweet.likes} Likes` : null,
    ].filter(Boolean).join(' · ');
    if (metrics) {
      ctx.fillText(metrics, PADDING, currentY);
    }
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height,
  };
};
