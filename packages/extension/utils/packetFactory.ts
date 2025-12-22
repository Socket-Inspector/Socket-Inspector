import { DebuggingPacket } from './sharedTypes/sharedTypes';

export function createDebugPacket(message: string): DebuggingPacket {
  return {
    type: 'DebuggingPacket',
    payload: {
      message,
    },
  };
}
