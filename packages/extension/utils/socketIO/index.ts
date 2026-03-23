import { SocketIOPacketDescription } from './internal/socketIOPacketUtils';

export function isSocketIOUrl(websocketUrl: string): boolean {
  try {
    const url = new URL(websocketUrl);
    const isEngineIOV4 =
      url?.searchParams?.get('EIO') === '4' && url?.searchParams?.get('transport') === 'websocket';
    return isEngineIOV4;
  } catch {
    return false;
  }
}

export type SocketIOMessage = {
  namespace: string;
  packetType: 'CONNECT' | 'DISCONNECT' | 'EVENT' | 'ACK' | 'CONNECT_ERROR';
  serializedPacket: string;
  eventPacketDetails?: {
    eventName: string;
    eventArgs: unknown[];
  }
};

export function parseSocketIOMessage(websocketPayload: string): SocketIOMessage {
  throw 'not done';
}
