import { SocketDetails } from '@/utils/sharedTypes/sharedTypes';
import { Ban, Circle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './shadcn/Tooltip';

export type SocketStatusIconProps = {
  socketStatus: SocketDetails['status'];
};

export function SocketStatusIcon({ socketStatus }: SocketStatusIconProps) {
  if (socketStatus === 'CONNECTING') {
    return (
      <TooltipIcon tooltipText="Connecting">
        <Loader2 className="animate-spin" aria-label="Connecting" strokeWidth={2}></Loader2>
      </TooltipIcon>
    );
  } else if (socketStatus === 'OPEN') {
    return (
      <TooltipIcon tooltipText="Connected">
        <Circle
          className="text-green-500"
          fill="currentColor"
          // fillOpacity={0.1}
          aria-label="Connected"
          strokeWidth={2}
        ></Circle>
      </TooltipIcon>
    );
  } else if (socketStatus === 'CLOSED') {
    return (
      <TooltipIcon tooltipText="Disconnected">
        <Ban
          className="text-red-400"
          // fill="currentColor"
          // fillOpacity={0.1}
          aria-label="Disconnected"
          strokeWidth={2}
        ></Ban>
      </TooltipIcon>
    );
  }

  return null;
}

type TooltipIconProps = {
  children: React.ReactNode;
  tooltipText: string;
};
function TooltipIcon({ children, tooltipText }: TooltipIconProps) {
  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} collisionPadding={{ left: 5 }}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
