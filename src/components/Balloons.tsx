import { useEffect, useMemo, useState } from 'react';

export interface BalloonsProps {
  /** How many balloons to launch. */
  count?: number;
  /** Called once every balloon has floated off-screen and the layer unmounts. */
  onComplete?: () => void;
}

interface Balloon {
  id: number;
  /** Horizontal start position as a viewport-width percentage. */
  left: number;
  /** CSS color for the balloon body. */
  color: string;
  /** Animation start delay in seconds. */
  delay: number;
  /** Animation duration in seconds. */
  duration: number;
  /** Size multiplier applied to the SVG. */
  scale: number;
  /** Horizontal drift in pixels at the midpoint of the rise. */
  sway: number;
}

interface BalloonShapeProps {
  color: string;
  scale: number;
}

// Pull from the accent palette defined in index.css so balloons match the theme.
const BALLOON_COLORS = [
  'hsl(var(--color-cyan))',
  'hsl(var(--color-pink))',
  'hsl(var(--color-amber))',
  'hsl(var(--color-violet))',
  'hsl(var(--color-orange))',
];

const BalloonShape = ({ color, scale }: BalloonShapeProps) => (
  <svg
    width={44 * scale}
    height={64 * scale}
    viewBox="0 0 44 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="22" cy="22" rx="20" ry="24" fill={color} />
    {/* knot */}
    <path d="M22 45 l-3.5 5 h7 z" fill={color} />
    {/* string */}
    <path d="M22 50 q5 7 -1 14" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
    {/* highlight */}
    <ellipse cx="15" cy="14" rx="5" ry="7" fill="white" opacity="0.25" />
  </svg>
);

const Balloons = ({ count = 14, onComplete }: BalloonsProps) => {
  const [visible, setVisible] = useState(true);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const balloons = useMemo<Balloon[]>(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Spread evenly across the width, then jitter so they don't look gridded.
      left: Math.min(96, Math.max(2, (i / count) * 100 + (Math.random() * 8 - 4))),
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      delay: Math.random() * 1.5,
      duration: 5 + Math.random() * 3,
      scale: 0.7 + Math.random() * 0.6,
      sway: Math.random() * 40 - 20,
    }));
  }, [count, prefersReducedMotion]);

  useEffect(() => {
    if (balloons.length === 0) {
      onComplete?.();
      return;
    }
    const lifetimeMs =
      Math.max(...balloons.map((b) => b.delay + b.duration)) * 1000 + 200;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, lifetimeMs);
    return () => window.clearTimeout(timer);
  }, [balloons, onComplete]);

  if (!visible || balloons.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {balloons.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-0 animate-balloon-rise"
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            // Consumed by the balloon-rise keyframe for per-balloon horizontal drift.
            ['--balloon-sway' as string]: `${b.sway}px`,
          }}
        >
          <BalloonShape color={b.color} scale={b.scale} />
        </div>
      ))}
    </div>
  );
};

export default Balloons;
