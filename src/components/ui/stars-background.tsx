import { useId } from "react";
import { cn } from "../../utils/cn";

interface DotPatternProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
  [key: string]: any;
}

export function StarsBackground({
  starDensity = 24,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <canvas
      aria-hidden="true"
      className={cn(
        "h-full w-full absolute inset-0 pointer-events-none -z-10", // Add pointer-events-none and z-index
        className,
      )}
      {...props}
      style={{
        '--star-density': starDensity,
        '--all-stars-twinkle': allStarsTwinkle ? 1 : 0,
        '--twinkle-probability': twinkleProbability,
        '--min-twinkle-speed': minTwinkleSpeed,
        '--max-twinkle-speed': maxTwinkleSpeed,
      } as React.CSSProperties}
    />
  );
}

export default StarsBackground;