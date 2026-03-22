import { SocketIOConnection, SocketState } from './stateTypes';


export type SocketIODetails =
  | { isSocketIOConnection: true; socketIOConnection: SocketIOConnection }
  | { isSocketIOConnection: false; };

export const querySelectedSocketIODetails = (state: SocketState): SocketIODetails => {
  const { selectedSocket } = state;

  if (!selectedSocket) {
    return { isSocketIOConnection: false };
  }

  const socketIO = state.socketIOConnections[selectedSocket.id];

  if (!socketIO) {
    return { isSocketIOConnection: false };
  }

  return { isSocketIOConnection: true, socketIOConnection: socketIO };
};