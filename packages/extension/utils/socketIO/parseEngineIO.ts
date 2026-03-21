import { decodePacket, Packet as EngineIOPacket } from 'engine.io-parser';

export type { EngineIOPacket };

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