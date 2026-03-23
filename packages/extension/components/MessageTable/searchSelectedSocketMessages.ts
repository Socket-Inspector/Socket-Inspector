import { SocketState } from '@/hooks/useSocketState/stateTypes';
import { MessageFilterOption } from '../MessageTableActions';
import {
  isSocketIOConnectionSelected,
  querySelectedSocketMessages,
} from '@/hooks/useSocketState/queries';
import { parseSocketIOMessage } from '@/utils/socketIO';

export type MessageTableSearch = {
  searchText: string;
  messageDirection: MessageFilterOption;
};

export const searchSelectedSocketMessages = (
  socketState: SocketState,
  search: MessageTableSearch,
) => {
  const socketMessages = querySelectedSocketMessages(socketState);

  if (socketMessages.length === 0) {
    return [];
  }

  const { searchText, messageDirection } = search;

  const isSocketIOConnection = isSocketIOConnectionSelected(socketState);

  if (isSocketIOConnection) {
    return (
      querySelectedSocketMessages(socketState)
        .flatMap((webSocketMessage) => {
          const socketIOParse = parseSocketIOMessage(webSocketMessage.payload);

          if (!socketIOParse.success) {
            return [];
          }

          return [{ webSocketMessage, socketIOMessage: socketIOParse.message }];
        })
        // TODO: consider searching on packet type, nsp, etc
        .filter(({ socketIOMessage }) =>
          socketIOMessage.serializedPacket.toLowerCase().includes(searchText.toLowerCase()),
        )
        .filter(
          ({ webSocketMessage }) =>
            messageDirection === 'all' ||
            (messageDirection === 'received' &&
              webSocketMessage.endpoints.destination === 'client') ||
            (messageDirection === 'sent' && webSocketMessage.endpoints.destination === 'server'),
        )
    );
  }
};
