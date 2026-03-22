import { SocketIOPacket, SocketIOPacketType } from "./socketIOTypes";

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
  | { eventName: string; eventArgs: unknown[]; }
  | { error: true };

export function parseSocketIOEvent(socketIOPacket: SocketIOPacket): SocketIOEvent {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    return { error: true };
  }

  const { data } = socketIOPacket;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { error: true };
  }

  const eventName = data[0];

  if (typeof eventName !== 'string') {
    return { error: true };
  }

  const eventArgs = data.slice(1);

  return { eventName, eventArgs };
}