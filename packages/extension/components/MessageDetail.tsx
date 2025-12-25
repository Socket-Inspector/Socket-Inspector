import { SocketState } from '@/hooks/useSocketState/stateTypes';
import { ScrollArea } from './shadcn/ScrollArea';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { Button } from './shadcn/Button';
import { ClipboardPaste } from 'lucide-react';
import { processJsonPayload } from '@/utils/payloadProcessors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';

export function MessageDetail() {
  const { socketState } = useSocketContext();

  const { selectedSocket, socketMessages } = socketState;

  return (
    <aside className="h-full w-full" aria-labelledby="message-detail-heading">
      <h2 className="sr-only" id="message-detail-heading">
        Selected Message Details
      </h2>
      <MessageDetailContent
        selectedSocket={selectedSocket}
        socketMessages={socketMessages}
      ></MessageDetailContent>
    </aside>
  );
}

type MessageDetailContentProps = {
  selectedSocket: SocketState['selectedSocket'];
  socketMessages: SocketState['socketMessages'];
};
function MessageDetailContent({ selectedSocket, socketMessages }: MessageDetailContentProps) {
  const { dispatch } = useSocketContext();

  if (!selectedSocket) {
    return null;
  }

  const selectedSocketMessages = socketMessages[selectedSocket.id];

  if (!selectedSocketMessages || selectedSocketMessages.length === 0) {
    return (
      <MessageDetailEmptyView
        headline="No messages captured"
        helperText="When the selected WebSocket sends or receives a message, it will show in the table above"
      ></MessageDetailEmptyView>
    );
  }

  if (!selectedSocket.selectedMessageId) {
    return (
      <MessageDetailEmptyView
        headline="Select a message"
        helperText="Click a row in the table to view full details"
      ></MessageDetailEmptyView>
    );
  }

  const selectedMessage = selectedSocketMessages.find(
    (msg) => msg.id === selectedSocket.selectedMessageId,
  );

  if (!selectedMessage) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        <div className="flex items-center justify-end px-2">
          <TooltipProvider>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy to Message Composer"
                  onClick={() => {
                    const validJSON = processJsonPayload(selectedMessage.payload).success;
                    dispatch({
                      type: 'PREFILL_MESSAGE_COMPOSER',
                      payload: {
                        composerPrefill: {
                          destination: selectedMessage.endpoints.destination,
                          payloadType: validJSON ? 'json' : 'raw',
                          payload: selectedMessage.payload,
                        },
                      },
                    });
                  }}
                >
                  <ClipboardPaste className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy to Message Composer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <pre className="m-4 mt-1 font-mono text-xs break-all whitespace-pre-wrap">
          {selectedMessage.payload}
        </pre>
      </ScrollArea>
    </div>
  );
}

type MessageDetailEmptyViewProps = {
  headline: string;
  helperText: string;
};
function MessageDetailEmptyView({ headline, helperText }: MessageDetailEmptyViewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-muted-foreground text-sm font-medium">{headline}</p>
        <p className="text-muted-foreground max-w-xs text-xs">{helperText}</p>
      </div>
    </div>
  );
}
