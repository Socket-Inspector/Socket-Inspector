import { SocketContext, useSocketContext } from '@/hooks/useSocketState/useSocketState';
import {
  querySelectedMessage,
  querySelectedSocketIODetails,
  querySelectedSocketMessages,
} from '@/hooks/useSocketState/queries';
import { MessageDetailEmptyView } from './MessageDetailEmptyView';
import { ScrollArea } from '../shadcn/ScrollArea';
import { MessageDetailSocketIO, MessageDetailSocketIOProps } from './MessageDetailSocketIO';
import { MessageDetailWebSocket } from './MessageDetailWebSocket';
import { copyToClipboard } from '@/utils/helpers';
import { processJsonPayload } from '@/utils/payloadProcessors';
import { parseIOMessage } from '@/utils/socketIOHelpers';
import { SocketMessage } from '@/utils/sharedTypes/sharedTypes';

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

  // TODO: restore to false if feature not complete
  // const isSocketIOConnection = false;
  const socketIORenderInfo = getSocketIORenderInfo(socketState, selectedMessage);

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
        {socketIORenderInfo.renderSocketIO ? (
          <MessageDetailSocketIO
            rawText={selectedMessage.payload}
            parseResult={socketIORenderInfo.parseResult}
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

type SocketIORenderInfo =
  | { renderSocketIO: false }
  | {
      renderSocketIO: true;
      parseResult: MessageDetailSocketIOProps['parseResult'];
    };

function getSocketIORenderInfo(
  socketState: SocketContext['socketState'],
  selectedMessage: SocketMessage,
): SocketIORenderInfo {
  const { isSocketIOConnection } = querySelectedSocketIODetails(socketState);

  if (!isSocketIOConnection) {
    return {
      renderSocketIO: false,
    };
  }

  const socketIOParseResult = parseIOMessage(selectedMessage.payload);

  if (socketIOParseResult.lastSuccess === 'NONE') {
    return {
      renderSocketIO: false,
    };
  }

  return {
    renderSocketIO: true,
    parseResult: socketIOParseResult,
  };
}
