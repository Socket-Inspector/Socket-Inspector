import { querySelectedSocketIOMessages, querySelectedSocketMessages } from '@/hooks/useSocketState/queries';
import { MessageFilterOption } from '../MessageTableActions';
import { SocketMessage } from '@/utils/sharedTypes/sharedTypes';
import { SocketState } from '@/hooks/useSocketState/stateTypes';

export type MessageTableSearch = {
  searchText: string;
  messageDirection: MessageFilterOption;
};

export function searchSelectedSocketMessages(socketState: SocketState, search: MessageTableSearch) {
  const { searchText, messageDirection } = search;

  return querySelectedSocketMessages(socketState)
    .filter((webSocketMessage) =>
      webSocketMessage.payload.toLowerCase().includes(searchText.toLowerCase()),
    )
    .filter((webSocketMessage) => matchesDirectionFilter(webSocketMessage, messageDirection));
}

export function searchSelectedSocketIOMessages(
  socketState: SocketState,
  search: MessageTableSearch,
) {
  const { searchText, messageDirection } = search;

  return (
    querySelectedSocketIOMessages(socketState)
      // TODO: consider searching on packet type, nsp, etc
      .filter(({ socketIOMessage }) =>
        socketIOMessage.serializedPacket.toLowerCase().includes(searchText.toLowerCase()),
      )
      .filter(({ webSocketMessage }) => matchesDirectionFilter(webSocketMessage, messageDirection))
  );
}

function matchesDirectionFilter(
  webSocketMessage: SocketMessage,
  directionFilter: MessageFilterOption,
) {
  return (
    directionFilter === 'all' ||
    (directionFilter === 'received' && webSocketMessage.endpoints.destination === 'client') ||
    (directionFilter === 'sent' && webSocketMessage.endpoints.destination === 'server')
  );
}
