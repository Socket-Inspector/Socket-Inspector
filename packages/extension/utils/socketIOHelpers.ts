import { decodePacket } from 'engine.io-parser';
import { Decoder, Packet as SocketIOPacket, PacketType as SocketIOPacketType } from 'socket.io-parser';

// TODO: ^ check for any blue argon's in the above packages

export const isEngineIOv4Url = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return (
      url?.searchParams?.get('EIO') === '4' && url?.searchParams?.get('transport') === 'websocket'
    );
  } catch {
    return false;
  }
};

const parseSocketIO = async (encodedPacket: string): Promise<SocketIOPacket> => {
  return new Promise(resolve => {
    const decoder = new Decoder();
    decoder.on('decoded', (decodedPacket) => {
      resolve(decodedPacket);
    });
    decoder.add(encodedPacket);
  });
};

/**
 * TODO:
 *  Any error handling?
 */
export const parseSocketIOPacket = async (encodedPacket: string) => {
  console.log('-------------');
  console.log('encoded: ', encodedPacket);

  const engineIOPacket = decodePacket(encodedPacket);
  console.log('engineIO decoded: ', engineIOPacket);

  if (engineIOPacket.type === 'message' && engineIOPacket.data) {
    const socketIOPacket = await parseSocketIO(engineIOPacket.data)
    console.log('socketIOPacket: ', socketIOPacket);

    if (socketIOPacket.type === SocketIOPacketType.EVENT) {
      console.log('socket IO EVENT packet data: ', socketIOPacket.data)
    }
  }
};

export const extractEventPacketData = (socketIOPacket: SocketIOPacket) => {
  if (socketIOPacket.type !== SocketIOPacketType.EVENT) {
    // error
  }

  const { data } = socketIOPacket;
  if (!data || !Array.isArray(data) || data.length === 0) {
    // error
  }

  const eventName = data[0];
  const eventArgs = data.slice(1);

  return { eventName, eventArgs };
};
