import { SocketIOPacket, SocketIOPacketType } from './socketIOTypes';

export type SocketIOPacketDescription =
  | 'CONNECT'
  | 'DISCONNECT'
  | 'EVENT'
  | 'ACK'
  | 'CONNECT_ERROR'
  | 'BINARY_EVENT'
  | 'BINARY_ACK';

export function getSocketIOPacketDescription(
  type: SocketIOPacket['type'],
): SocketIOPacketDescription {
  if (type === SocketIOPacketType.CONNECT) {
    return 'CONNECT';
  } else if (type === SocketIOPacketType.DISCONNECT) {
    return 'DISCONNECT';
  } else if (type === SocketIOPacketType.EVENT) {
    return 'EVENT';
  } else if (type === SocketIOPacketType.ACK) {
    return 'ACK';
  } else if (type === SocketIOPacketType.CONNECT_ERROR) {
    return 'CONNECT_ERROR';
  } else if (type === SocketIOPacketType.BINARY_EVENT) {
    return 'BINARY_EVENT';
  } else {
    return 'BINARY_ACK';
  }
}

export type SocketIOEvent =
  | { success: true; eventName: string; eventArgs: unknown[] }
  | { success: false };

export function parseSocketIOEvent(socketIOPacket: SocketIOPacket): SocketIOEvent {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    return { success: false };
  }

  const { data } = socketIOPacket;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false };
  }

  const eventName = data[0];

  if (typeof eventName !== 'string') {
    return { success: false };
  }

  const eventArgs = data.slice(1);

  return { success: true, eventName, eventArgs };
}
