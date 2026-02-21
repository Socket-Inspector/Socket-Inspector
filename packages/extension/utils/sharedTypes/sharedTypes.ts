import { z } from 'zod';
import {
  SocketDetailsSchema,
  SocketMessageEndpointsSchema,
  SocketMessageSchema,
  UserInjectedSocketMessageSchema,
  SocketDetailsPacketSchema,
  SocketMessagePacketSchema,
  UserInjectedSocketMessagePacketSchema,
  DebuggingPacketSchema,
  ClearDevtoolsStatePacketSchema,
  PauseSocketPacketSchema,
  ResumeSocketPacketSchema,
  CloseConnectionPacketSchema,
  PacketSchema,
  DetectedSocketIOPacketSchema,
} from './schemas';

/***** Domain Types *****/
export type SocketDetails = z.infer<typeof SocketDetailsSchema>;
export type SocketMessageEndpoints = z.infer<typeof SocketMessageEndpointsSchema>;
export type SocketMessage = z.infer<typeof SocketMessageSchema>;
export type UserInjectedSocketMessage = z.infer<typeof UserInjectedSocketMessageSchema>;

/***** Packet Types *****/
export type SocketDetailsPacket = z.infer<typeof SocketDetailsPacketSchema>;
export type SocketMessagePacket = z.infer<typeof SocketMessagePacketSchema>;
export type UserInjectedSocketMessagePacket = z.infer<typeof UserInjectedSocketMessagePacketSchema>;
export type DebuggingPacket = z.infer<typeof DebuggingPacketSchema>;
export type ClearDevtoolsStatePacket = z.infer<typeof ClearDevtoolsStatePacketSchema>;
export type PauseSocketPacket = z.infer<typeof PauseSocketPacketSchema>;
export type ResumeSocketPacket = z.infer<typeof ResumeSocketPacketSchema>;
export type CloseConnectionPacket = z.infer<typeof CloseConnectionPacketSchema>;
export type DetectedSocketIOPacket = z.infer<typeof DetectedSocketIOPacketSchema>;

/** Union of all Packet Types */
export type Packet = z.infer<typeof PacketSchema>;
