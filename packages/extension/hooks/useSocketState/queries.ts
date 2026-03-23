import { SocketDetails, SocketMessage } from '@/utils/sharedTypes/sharedTypes';
import { SocketState } from './stateTypes';
import { MessageFilterOption } from '@/components/MessageTableActions';
import { SocketIOPacket } from '@/utils/socketIO/socketIOTypes';
import { SocketIOEvent, SocketIOPacketDescription } from '@/utils/socketIO/socketIOPacketUtils';

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

export const querySelectedMessage = (state: SocketState): SocketMessage | undefined => {
  const { selectedSocket } = state;
  if (!selectedSocket || !selectedSocket.selectedMessageId) {
    return undefined;
  }
  return querySelectedSocketMessages(state).find(
    (message) => message.id === selectedSocket.selectedMessageId,
  );
};

/** New Functions with socket IO supports */
// export type ExtendedSocketDetails = {

// };

// export const isSocketIOConnectionSelected = (state: SocketState) => {
//   return true; // TODO:
// };

// export type SocketIOMessage = {
//   webSocketMessage: SocketMessage;
//   socketIOPacket: SocketIOPacket;
//   socketIOPacketDescription: SocketIOPacketDescription;
//   socketIOEventPacketDetails?: SocketIOEvent;
// };

// export const querySelectedSocketIOMessages = (state: SocketState): Array<SocketIOMessage> => {
//   const selectedSocketMessages = querySelectedSocketMessages(state);
//   if (selectedSocketMessages.length === 0) {
//     return [];
//   }
//   return [];
// };

// export type MessageTableSearch = {
//   searchText: string;
//   messageDirection: MessageFilterOption;
// };
// export const searchSelectedSocketMessages = (state: SocketState, search: MessageTableSearch) => {
//   const { searchText, messageDirection } = search;
//   const selectedSocketMessages = querySelectedSocketMessages(state);
//   if (selectedSocketMessages.length === 0) {
//     return [];
//   }
//   const messages = querySelectedSocketIOMessages(state);
// };

/**
 * Socket IO needs
 *
 * Message Table:
 * - is connection socket IO?
 * - raw SocketIOPacket string for each message
 * - SocketIOPacketDescription for each message
 * - SocketIOEvent details (event packet only)
 *
 * Message Detail:
 *  - is connection socket IO?
 *  - raw SocketIOPacket string
 *  - SocketIOPacketDescription
 *  - SocketIOEvent details
 *  - ACK id (for future use)
 *
 *  Message Composer:
 *   - is connection socket IO?
 *   - prefill: raw SocketIOPacket string? Maybe the SocketIOEvent details?
 *   - a way to convert user input to the raw SocketIOPacket string
 */
