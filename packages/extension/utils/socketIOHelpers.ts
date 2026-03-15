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

export type IOProtocolParse =
  | {
      lastSuccess: 'NONE';
      parseResults: [];
    }
  | {
      lastSuccess: 'ENGINE_IO';
      parseResults: [EngineIOPacket];
    }
  | {
      lastSuccess: 'SOCKET_IO';
      parseResults: [EngineIOPacket, SocketIOPacket];
    }
  | {
      lastSuccess: 'SOCKET_IO_EVENT';
      parseResults: [EngineIOPacket, SocketIOPacket, SocketIOEvent];
    };

export type SocketIOEvent = {
  eventName: string;
  eventArgs: unknown[];
};

export function parseIOMessage(rawString: string): IOProtocolParse {
  const engineIO = parseEngineIO(rawString);
  if (!engineIO.success) {
    return {
      lastSuccess: 'NONE',
      parseResults: [],
    };
  }

  const socketIO = parseSocketIO(engineIO.packet);
  if (!socketIO.success) {
    return {
      lastSuccess: 'ENGINE_IO',
      parseResults: [engineIO.packet],
    };
  }

  const eventData = parseEventData(socketIO.packet);

  if (!eventData.success) {
    return {
      lastSuccess: 'SOCKET_IO',
      parseResults: [engineIO.packet, socketIO.packet],
    };
  }

  return {
    lastSuccess: 'SOCKET_IO_EVENT',
    parseResults: [engineIO.packet, socketIO.packet, eventData.event],
  };
}

type EngineIOParseResult =
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

type SocketIOParseResult =
  | { success: true; packet: SocketIOPacket }
  | { success: false; errorMessage: string };

function parseSocketIO(engineIOPacket: EngineIOPacket): SocketIOParseResult {
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

type EventDataParseResult =
  | { success: true; event: SocketIOEvent }
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
    event: {
      eventName,
      eventArgs,
    },
  };
}
