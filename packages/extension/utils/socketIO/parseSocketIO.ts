import { Decoder } from 'socket.io-parser';
import { decodePacket } from 'engine.io-parser';
import { SocketIOPacket, EngineIOPacket, SocketIOPacketType } from "./socketIOTypes";

export type SocketIOParseResult =
  | { engineIOPacket: EngineIOPacket; socketIOPacket?: SocketIOPacket }
  | { error: true };

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

/**
 * TODO:
 * for BINARY_EVENT/BINARY_ACK packets with attachments,
 * the decoder won't emit 'decoded' until all binary attachments 
 * are provided via subsequent add() calls
 */