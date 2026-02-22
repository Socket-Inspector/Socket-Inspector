import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../shadcn/Tooltip';
import { Copy, ClipboardPaste } from 'lucide-react';
import { Button } from '../shadcn/Button';

export type MessageDetailActionsProps = {
  onCopyToClipboardClicked: () => void;
  onCopyToComposerClicked: () => void;
};

export function MessageDetailActions({
  onCopyToClipboardClicked,
  onCopyToComposerClicked,
}: MessageDetailActionsProps) {
  return (
    <div>
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
