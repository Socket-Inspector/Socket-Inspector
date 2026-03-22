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

export type SocketIOEvent =
  | { eventName: string; eventArgs: unknown[]; }
  | { error: true };

export function parseSocketIOEvent(socketIOPacket: SocketIOPacket): SocketIOEvent {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    return { error: true };
  }

  const { data } = socketIOPacket;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return { error: true };
  }

  const eventName = data[0];

  if (typeof eventName !== 'string') {
    return { error: true };
  }

  const eventArgs = data.slice(1);

  return { eventName, eventArgs };
}