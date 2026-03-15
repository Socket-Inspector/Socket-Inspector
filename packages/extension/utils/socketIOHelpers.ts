import {
  decodePacket,
  Packet as EngineIOPacket,
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

export type SocketIOParseResult =
  { success: true; packet: SocketIOPacket } |
  { success: false; }

export function parseSocketIO(encodedPacket: EngineIOPacket['data']): SocketIOParseResult {
  try {
    const decoder = new Decoder();
    let result: SocketIOParseResult = { success: false };
    decoder.on('decoded', (decodedPacket: SocketIOPacket) => {
      result = { success: true, packet: decodedPacket };
    });
    decoder.add(encodedPacket);
    return result;
  } catch {
    return { success: false };
  }
};

export type EventDataParseResult =
  { success: true; eventName: string; eventArgs: unknown[] } |
  { success: false; }

export function parseEventData(socketIOPacket: SocketIOPacket): EventDataParseResult {
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

  return {
    success: true,
    eventName,
    eventArgs
  };
};