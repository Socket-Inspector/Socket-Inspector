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
      eventPacketDetails: { eventName: string; eventArgs: unknown[] };
    }
  | {
      namespace: string;
      serializedPacket: string;
      packetType: 'CONNECT' | 'DISCONNECT' | 'ACK' | 'CONNECT_ERROR';
    };

export type SocketIOMessageParseResult =
  | { success: true; message: SocketIOMessage }
  | { success: false };

export function parseSocketIOMessage(websocketPayload: string): SocketIOMessageParseResult {
  throw 'not done';
}
