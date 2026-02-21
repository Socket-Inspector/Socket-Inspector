import { useSocketContext } from '@/hooks/useSocketState/useSocketState';
import {
  querySelectedMessage,
  querySelectedSocketIODetails,
  querySelectedSocketMessages,
} from '@/hooks/useSocketState/queries';
import { MessageDetailEmptyView } from './MessageDetailEmptyView';
import { ScrollArea } from '../shadcn/ScrollArea';

export function MessageDetailNew() {
  const { socketState } = useSocketContext();

  if (!socketState.selectedSocket) {
    return null;
  }

  return (
    <aside className="h-full w-full" aria-labelledby="message-detail-heading">
      <h2 className="sr-only" id="message-detail-heading">
        Selected Message Details
      </h2>
    </aside>
  );
}

function MessageDetailContent() {
  const { socketState } = useSocketContext();

  if (querySelectedSocketMessages(socketState).length === 0) {
    return (
      <MessageDetailEmptyView
        headline="No messages captured"
        helperText="When the selected WebSocket sends or receives a message, it will show in the table above"
      ></MessageDetailEmptyView>
    );
  }

  if (!querySelectedMessage(socketState)) {
    return (
      <MessageDetailEmptyView
        headline="Select a message"
        helperText="Click a row in the table to view full details"
      ></MessageDetailEmptyView>
    );
  }

  const { isSocketIO } = querySelectedSocketIODetails(socketState);
  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full w-full">
        {isSocketIO ? (
          <MessageDetailSocketIO></MessageDetailSocketIO>
        ) : (
          <MessageDetailWebSocket></MessageDetailWebSocket>
        )}
      </ScrollArea>
    </div>
  );
}

function MessageDetailSocketIO() {
  return <div></div>;
}

function MessageDetailWebSocket() {
  return <div></div>;
}
