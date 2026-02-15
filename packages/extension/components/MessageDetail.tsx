import { useState } from 'react';
import { SocketState } from '@/hooks/useSocketState/stateTypes';
import { ScrollArea } from './shadcn/ScrollArea';
import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { Button } from './shadcn/Button';
import { ClipboardPaste, Copy } from 'lucide-react';
import { processJsonPayload } from '@/utils/payloadProcessors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip';
import { copyToClipboard } from '@/utils/helpers';
import { RadioGroup, RadioGroupItem } from './shadcn/RadioGroup';
import { Label } from './shadcn/Label';
import { SocketMessage } from '@/utils/sharedTypes/sharedTypes';

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
  const [viewMode, setViewMode] = useState<'text' | 'socket-io'>('text');

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

  const isSocketIO = viewMode === 'socket-io';

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        <div className="flex items-center border-b px-2">
          <RadioGroup
            className="mr-auto flex flex-row"
            orientation="horizontal"
            value={viewMode}
            onValueChange={(value: string) => setViewMode(value as 'text' | 'socket-io')}
          >
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="socket-io" id="radio-view-socket-io" />
              <Label htmlFor="radio-view-socket-io" className="text-xs">
                Socket.IO
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="text" id="radio-view-text" />
              <Label htmlFor="radio-view-text" className="text-xs">
                Text
              </Label>
            </div>
          </RadioGroup>
          <TooltipProvider>
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy to Clipboard"
                  onClick={() => copyToClipboard(selectedMessage.payload)}
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
        <MessageDetailContentBody
          message={selectedMessage}
          socketIOView={isSocketIO}>
        </MessageDetailContentBody>
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

type MessageDetailContentBodyProps = {
  message: SocketMessage;
  socketIOView: boolean;
};
function MessageDetailContentBody({ message, socketIOView }: MessageDetailContentBodyProps) {
  if (socketIOView) {
    // just doing same as before for now
    return (
      <pre className="m-4 mt-1 font-mono text-xs break-all whitespace-pre-wrap">
        {message.payload}
      </pre>
    );
  }

  // just doing same as before for now
  return (
    <pre className="m-4 mt-1 font-mono text-xs break-all whitespace-pre-wrap">
      {message.payload}
    </pre>
  );
}