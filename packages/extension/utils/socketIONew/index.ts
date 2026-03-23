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

export type SocketIOPacketDescription =
  | 'CONNECT'
  | 'DISCONNECT'
  | 'EVENT'
  | 'ACK'
  | 'CONNECT_ERROR'
  | 'BINARY_EVENT'
  | 'BINARY_ACK';

export type SocketIOMessage =
  | {
    namespace: string;
    serializedPacket: string;
    packetType: 'EVENT'
    eventPacketDetails: { eventName: string; eventArgs: unknown[] };
  }
  | {
    namespace: string;
    serializedPacket: string;
    // TODO: make sure binary is truly excluded
    packetType: Exclude<SocketIOPacketDescription, 'EVENT' | 'BINARY_EVENT' | 'BINARY_ACK'>
  };

export type SocketIOMessageParseResult =
  | { success: true; message: SocketIOMessage }
  | { success: false };

export function parseSocketIOMessage(websocketPayload: string): SocketIOMessageParseResult {
  throw 'not done';
}