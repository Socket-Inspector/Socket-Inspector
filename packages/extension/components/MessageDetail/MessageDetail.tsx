import { SocketContext, useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { querySelectedMessage, querySelectedSocketMessages } from '@/hooks/useSocketState/queries';
import { MessageDetailEmptyView } from './MessageDetailEmptyView';
import { ScrollArea } from '../shadcn/ScrollArea';
import { MessageDetailSocketIO } from './MessageDetailSocketIO';
import { MessageDetailWebSocket } from './MessageDetailWebSocket';
import { copyToClipboard } from '@/utils/helpers';
import { processJsonPayload } from '@/utils/payloadProcessors';

/**
 * TODO:
 * test scrolling
 * test copying json and non-json over to the composer
 * test various null states & empty states
 * keyboard nav still working
 */

export function MessageDetail() {
  const { socketState, dispatch } = useSocketContext();

  if (!socketState.selectedSocket) {
    return null;
  }

  return (
    <aside className="h-full w-full" aria-labelledby="message-detail-heading">
      <h2 className="sr-only" id="message-detail-heading">
        Selected Message Details
      </h2>
      <MessageDetailContent socketState={socketState} dispatch={dispatch}></MessageDetailContent>
    </aside>
  );
}

type MessageDetailContentProps = {
  socketState: SocketContext['socketState'];
  dispatch: SocketContext['dispatch'];
};
function MessageDetailContent({ socketState, dispatch }: MessageDetailContentProps) {
  // TODO: validate that querySelectedSocketMessages() is safe
  if (querySelectedSocketMessages(socketState).length === 0) {
    return (
      <MessageDetailEmptyView
        headline="No messages captured"
        helperText="When the selected WebSocket sends or receives a message, it will show in the table above"
      ></MessageDetailEmptyView>
    );
  }

  const selectedMessage = querySelectedMessage(socketState);
  if (!selectedMessage) {
    return (
      <MessageDetailEmptyView
        headline="Select a message"
        helperText="Click a row in the table to view full details"
      ></MessageDetailEmptyView>
    );
  }

  // const { isSocketIO } = querySelectedSocketIODetails(socketState);
  // harcoding to false until feature is complete
  const isSocketIO = false;

  const copyPayloadToClipboard = () => {
    copyToClipboard(selectedMessage.payload);
  };

  const prefillMessageComposer = () => {
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
  };

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        {isSocketIO ? (
          <MessageDetailSocketIO
            onCopyToClipboardClicked={copyPayloadToClipboard}
            onCopyToComposerClicked={prefillMessageComposer}
          ></MessageDetailSocketIO>
        ) : (
          <MessageDetailWebSocket
            rawText={selectedMessage.payload}
            onCopyToClipboardClicked={copyPayloadToClipboard}
            onCopyToComposerClicked={prefillMessageComposer}
          ></MessageDetailWebSocket>
        )}
      </ScrollArea>
    </div>
  );
}
