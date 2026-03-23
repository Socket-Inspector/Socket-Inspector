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

export type SocketIOMessage =
  | {
      namespace: string;
      serializedPacket: string;
      packetType: 'EVENT';
      eventPacketDetails: {
        eventName: string;
        eventArgs: unknown[];
      };
    }
  | {
      namespace: string;
      serializedPacket: string;
      packetType: 'CONNECT' | 'DISCONNECT' | 'ACK' | 'CONNECT_ERROR';
    };

export function parseSocketIOMessage(websocketPayload: string): SocketIOMessage {
  throw 'not done';
}
