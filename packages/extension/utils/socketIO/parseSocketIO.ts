import {
  Decoder,
  Packet as SocketIOPacket,
  PacketType as SocketIOPacketType,
} from 'socket.io-parser';
import { EngineIOPacket } from './parseEngineIO';

export type { SocketIOPacket, SocketIOPacketType };

export type SocketIOParseResult =
  | { success: true; packet: SocketIOPacket }
  | { success: false; errorMessage: string };

export function parseSocketIO(engineIOPacket: EngineIOPacket): SocketIOParseResult {
  try {
    if (engineIOPacket.type !== 'message') {
      return { success: false, errorMessage: 'Must be an Engine.IO message packet' };
    }
    if (!engineIOPacket.data) {
      return { success: false, errorMessage: 'Engine.IO message packet has no data' };
    }
    const decoder = new Decoder();
    let result: SocketIOParseResult = {
      success: false,
      errorMessage: 'Failed to decode Socket.IO packet',
    };
    decoder.on('decoded', (decodedPacket: SocketIOPacket) => {
      result = { success: true, packet: decodedPacket };
    });
    // Note: for BINARY_EVENT/BINARY_ACK packets with attachments, the decoder
    // won't emit 'decoded' until all binary attachments are provided via
    // subsequent add() calls. Since we only handle single text frames, those
    // packets will return the default failure result.
    decoder.add(engineIOPacket.data);
    decoder.destroy();
    return result;
  } catch {
    return { success: false, errorMessage: 'Failed to decode Socket.IO packet' };
  }
}