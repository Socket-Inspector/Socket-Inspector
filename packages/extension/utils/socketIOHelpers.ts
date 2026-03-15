import { decodePacket, Packet as EngineIOPacket } from 'engine.io-parser';

import {
  Decoder,
  Packet as SocketIOPacket,
  PacketType as SocketIOPacketType,
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
}

export type EngineIOParseResult =
  | { success: true; packet: EngineIOPacket }
  | { success: false; errorMessage: string };

export function parseEngineIO(rawString: string): EngineIOParseResult {
  try {
    const packet = decodePacket(rawString);
    if (packet.type === 'error') {
      return { success: false, errorMessage: 'Failed to decode Engine.IO packet' };
    } else {
      return { success: true, packet };
    }
  } catch {
    return { success: false, errorMessage: 'Failed to decode Engine.IO packet' };
  }
}

export type SocketIOParseResult =
  | { success: true; packet: SocketIOPacket }
  | { success: false; errorMessage: string };

export function parseSocketIO(encodedPacket: EngineIOPacket['data']): SocketIOParseResult {
  try {
    const decoder = new Decoder();
    let result: SocketIOParseResult = {
      success: false,
      errorMessage: 'Failed to decode Socket.IO packet',
    };
    decoder.on('decoded', (decodedPacket: SocketIOPacket) => {
      result = { success: true, packet: decodedPacket };
    });
    decoder.add(encodedPacket);
    return result;
  } catch {
    return { success: false, errorMessage: 'Failed to decode Socket.IO packet' };
  }
}

export type EventDataParseResult =
  | { success: true; eventName: string; eventArgs: unknown[] }
  | { success: false; errorMessage: string };

export function parseEventData(socketIOPacket: SocketIOPacket): EventDataParseResult {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    return { success: false, errorMessage: 'Must be a Socket.IO EVENT packet' };
  }

  const { data } = socketIOPacket;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, errorMessage: 'Invalid EVENT packet data field' };
  }

  const eventName = data[0];

  if (typeof eventName !== 'string') {
    return { success: false, errorMessage: 'Event name must be a string' };
  }

  const eventArgs = data.slice(1);

  return {
    success: true,
    eventName,
    eventArgs,
  };
}
