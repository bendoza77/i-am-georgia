import { cn } from '../../utils/cn';

/**
 * Seamless CSS marquee (duplicated track). Pauses on hover.
 * @param {React.ReactNode} children  one copy of the track content
 */
export default function Marquee({ children, className, speed = '40s', reverse = false }) {
  return (
    <div className={cn('mask-fade-r group relative flex overflow-hidden', className)}>
      <div
        className="flex shrink-0 items-center gap-16 pr-16 group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee ${speed} linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center gap-16 pr-16 group-hover:[animation-play-state:paused]"
        style={{ animation: `marquee ${speed} linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
    </div>
  );
}
