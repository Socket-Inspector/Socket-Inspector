import { Decoder } from 'socket.io-parser';
import { decodePacket } from 'engine.io-parser';
import type { Packet as SocketIOPacket } from 'socket.io-parser';
import type { Packet as EngineIOPacket } from 'engine.io-parser';
import { PacketType as SocketIOPacketType } from 'socket.io-parser';
import { SocketIOPacketTypeDescription } from '..';

export type SocketIOParseResult =
  | { success: true; engineIOPacket: EngineIOPacket; socketIOPacket?: SocketIOPacket }
  | { success: false };

export function parseSocketIO(rawString: string): SocketIOParseResult {
  let engineIOPacket: EngineIOPacket;
  try {
    engineIOPacket = decodePacket(rawString);
  } catch {
    return { success: false };
  }

  if (engineIOPacket.type === 'error') {
    return { success: false };
  }

  const cannotBeSocketIO = engineIOPacket.type !== 'message' || !engineIOPacket.data;
  if (cannotBeSocketIO) {
    return { success: true, engineIOPacket };
  }

  let socketIOPacket: SocketIOPacket | null = null;
  try {
    const decoder = new Decoder();
    decoder.on('decoded', (decodedPacket: SocketIOPacket) => {
      socketIOPacket = decodedPacket;
    });
    decoder.add(engineIOPacket.data);
    decoder.destroy();

    if (socketIOPacket) {
      return { success: true, engineIOPacket, socketIOPacket };
    }

    return { success: true, engineIOPacket };
  } catch {
    return { success: true, engineIOPacket };
  }
}

/**
 * TODO:
 * for BINARY_EVENT/BINARY_ACK packets with attachments,
 * the decoder won't emit 'decoded' until all binary attachments
 * are provided via subsequent add() calls
 */


function getSocketIOPacketDescription(
  type: SocketIOPacket['type'],
): SocketIOPacketTypeDescription {
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

type SocketIOEventParseResult =
  | { success: true; eventName: string; eventArgs: unknown[] }
  | { success: false };

export function parseSocketIOEvent(socketIOPacket: SocketIOPacket): SocketIOEventParseResult {
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