import { PacketSchema } from './schemas';
import { Packet } from './sharedTypes';

export const isPacket = (value: unknown): value is Packet => {
  return PacketSchema.safeParse(value).success;
};
