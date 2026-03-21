import {
  Decoder,
  Packet as SocketIOPacket,
  PacketType as SocketIOPacketType,
} from 'socket.io-parser';

import { decodePacket, Packet as EngineIOPacket } from 'engine.io-parser';

export type { SocketIOPacket, SocketIOPacketType, EngineIOPacket };

export type SocketIOParseResult =
  | { error: true }
  | { engineIOPacket: EngineIOPacket; socketIOPacket?: SocketIOPacket };

export function parseSocketIO(rawString: string): SocketIOParseResult {
  let engineIOPacket: EngineIOPacket;
  try {
    engineIOPacket = decodePacket(rawString);
  } catch {
    return { error: true }
  }

  const cannotBeSocketIO = engineIOPacket.type !== 'message' || !engineIOPacket.data;
  if (cannotBeSocketIO) {
    return { engineIOPacket };
  }

  let socketIOPacket: SocketIOPacket | null = null;
  try {
    const decoder = new Decoder();
    decoder.on('decoded', (decodedPacket: SocketIOPacket) => {
      socketIOPacket = decodedPacket;
    });
    /**
     * TODO:
     * for BINARY_EVENT/BINARY_ACK packets with attachments,
     * the decoder won't emit 'decoded' until all binary attachments 
     * are provided via subsequent add() calls
     */
    decoder.add(engineIOPacket.data);
    decoder.destroy();

    if (socketIOPacket) {
      return { engineIOPacket, socketIOPacket }
    }

    return { engineIOPacket };

  } catch {
    return { engineIOPacket };
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