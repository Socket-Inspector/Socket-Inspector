export type MessageDetailType = 'EMPTY' | 'WEBSOCKET' | 'SOCKET_IO';

export function MessageDetailNew() {
  const viewType: MessageDetailType = 'SOCKET_IO';

  return (
    <aside className="h-full w-full" aria-labelledby="message-detail-heading">
      <h2 className="sr-only" id="message-detail-heading">
        Selected Message Details
      </h2>
    </aside>
  );
}

function MessageDetailEmpty() { }
function MessageDetailContent() { }
function MessageDetailSocketIOContent() { }