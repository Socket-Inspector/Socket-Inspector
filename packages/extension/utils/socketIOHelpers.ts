import {
  decodePacket,
  Packet as EngineIOPacket,
  PacketType as EngineIOPacketType
} from 'engine.io-parser';

import {
  Decoder,
  Packet as SocketIOPacket,
  PacketType as SocketIOPacketType
} from 'socket.io-parser';

export function isEngineIOv4Url(urlString: string) {
  try {
    const url = new URL(urlString);
    return (
      url?.searchParams?.get('EIO') === '4' && url?.searchParams?.get('transport') === 'websocket'
    );
  } catch {
    return false;
  }
};

export type EngineIOParseResult =
  { success: true; packet: EngineIOPacket } |
  { success: false; }

export type SocketIOParseResult =
  { success: true; packet: SocketIOPacket } |
  { success: false; }

export function parseEngineIO(rawString: string): EngineIOParseResult {
  try {
    const packet = decodePacket(rawString);
    if (packet.type === 'error') {
      return { success: false };
    } else {
      return { success: true, packet }
    }
  } catch {
    return { success: false }
  }
}

export async function parseSocketIO(engineIOPacket: EngineIOPacket): Promise<SocketIOParseResult> {
  try {
    if (engineIOPacket.type === 'message' && engineIOPacket.data) {
      const socketIOPacket = await parseSocketIOHelper(engineIOPacket.data);
      return {
        success: true,
        packet: socketIOPacket
      }
    }
    return { success: false };
  } catch {
    return { success: false }
  }
}

export function parseEventData(socketIOPacket: SocketIOPacket) {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    return {
      success: false,
      errorMessage: 'Must be socketIO EVENT packet'
    };
  }

  const { data } = socketIOPacket;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      success: false,
      errorMessage: 'Invalid EVENT packet data field'
    };
  }

  // TODO: safe to assume the first element is always the event name?
  const eventName = data[0];
  const eventArgs = data.slice(1);

  return {
    success: true,
    eventData: {
      eventName,
      eventArgs
    }
  };
};

// TODO: error handling
// TODO: what if 'decoded' doesnt fire?
function parseSocketIOHelper(encodedPacket: EngineIOPacket['data']): Promise<SocketIOPacket> {
  return new Promise(resolve => {
    const decoder = new Decoder();
    decoder.on('decoded', (decodedPacket) => {
      resolve(decodedPacket);
    });
    decoder.add(encodedPacket);
  });
};