import { SocketDetails, SocketMessage } from '@/utils/sharedTypes/sharedTypes';
import { SocketState } from './stateTypes';

export const querySelectedSocketDetails = (state: SocketState): SocketDetails | undefined => {
  if (!state.selectedSocket) {
    return undefined;
  }
  const selectedSocketId = state.selectedSocket.id;
  return state.sockets.find((s) => s.id === selectedSocketId);
};

export const querySelectedSocketMessages = (state: SocketState): Array<SocketMessage> => {
  if (!state.selectedSocket) {
    return [];
  }

  const selectedSocketId = state.selectedSocket.id;
  const selectedSocketDetails = querySelectedSocketDetails(state);

  if (!selectedSocketDetails) {
    return [];
  }

  if (selectedSocketDetails.status === 'CONNECTING') {
    /**
     * when the host page constructs a WebSocket, mswjs will
     * return a mocked WebSocket, and will almost immediately
     * set its readyState to OPEN
     *
     * It does NOT wait for the server to respond to the
     * websocket handshake (a non-mocked WebSocket would
     * wait for the handshake to complete before setting
     * the readyState to OPEN)
     *
     * If the client sends messages from the mocked socket
     * before the handshake is complete, mswjs will buffer
     * the packets and then send them all once the server
     * connects.
     *
     * So, we won't show any messages in the table until
     * they are actually sent to the server (this aligns
     * with chrome devtools)
     */
    return [];
  }

  return state.socketMessages[selectedSocketId] ?? [];
};
