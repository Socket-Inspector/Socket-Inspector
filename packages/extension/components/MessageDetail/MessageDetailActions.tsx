import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shadcn/Tooltip';
import { Copy, ClipboardPaste } from 'lucide-react';
import { Button } from '../shadcn/Button';
import { cn } from '../../utils/cn';

export type MessageDetailActionsProps = {
  onCopyToClipboardClicked: () => void;
  onCopyToComposerClicked: () => void;
  className?: string;
};

export function MessageDetailActions({
  onCopyToClipboardClicked,
  onCopyToComposerClicked,
  className,
}: MessageDetailActionsProps) {
  return (
    <div className={cn(className)}>
      <TooltipProvider>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy to Clipboard"
              onClick={() => {
                onCopyToClipboardClicked();
              }}
            >
              <Copy className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to Clipboard</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy to Message Composer"
              onClick={() => {
                onCopyToComposerClicked();
              }}
            >
              <ClipboardPaste className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to Message Composer</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
