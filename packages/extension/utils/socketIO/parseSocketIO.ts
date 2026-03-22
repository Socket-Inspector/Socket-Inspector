import { Decoder } from 'socket.io-parser';
import { decodePacket } from 'engine.io-parser';
import { SocketIOPacket, EngineIOPacket } from './socketIOTypes';

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
