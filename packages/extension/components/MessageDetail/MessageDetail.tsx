import { SocketContext, useSocketContext } from '@/hooks/useSocketState/useSocketState';
import { querySelectedMessage, querySelectedSocketMessages } from '@/hooks/useSocketState/queries';
import { MessageDetailEmptyView } from './MessageDetailEmptyView';
import { ScrollArea } from '../shadcn/ScrollArea';
import { MessageDetailWebSocket } from './MessageDetailWebSocket';
import { copyToClipboard } from '@/utils/helpers';
import { processJsonPayload } from '@/utils/payloadProcessors';
import { parseSocketIO } from '@/utils/socketIO/parseSocketIO';
import { Separator } from '../shadcn/Separator';
import { getSocketIOPacketDescription } from '@/utils/socketIO/socketIOPacketUtils';
import { Badge } from '../shadcn/Badge';

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

  // TODO: remove
  const parseResult = parseSocketIO(selectedMessage.payload);
  const socketIODebugText =
    parseResult.success && parseResult.socketIOPacket
      ? JSON.stringify(parseResult.socketIOPacket, null, 2)
      : '';
  const socketIOPacketType =
    parseResult.success && parseResult.socketIOPacket
      ? getSocketIOPacketDescription(parseResult.socketIOPacket.type)
      : '';

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        {/* TEMPORARY: Socket.IO parse debug output */}
        <MessageDetailWebSocket
          rawText={socketIODebugText}
          onCopyToClipboardClicked={copyPayloadToClipboard}
          onCopyToComposerClicked={prefillMessageComposer}
        ></MessageDetailWebSocket>
        <Separator></Separator>
        <Badge>{socketIOPacketType}</Badge>
      </ScrollArea>
    </div>
  );
}
