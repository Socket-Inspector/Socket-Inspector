import { ArrowUp, ArrowDown } from 'lucide-react';

export type DirectionIconProps = {
  direction: 'up' | 'down';
};

export function MessageDirectionIcon({ direction }: DirectionIconProps) {
  if (direction === 'up') {
    return (
      <ArrowUp
        aria-label="outgoing"
        className="h-4 w-4 flex-none shrink-0 text-green-500"
      ></ArrowUp>
    );
  }
  return (
    <ArrowDown
      aria-label="incoming"
      className="h-4 w-4 flex-none shrink-0 text-red-400"
    ></ArrowDown>
  );
}
