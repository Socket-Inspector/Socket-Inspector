import { z } from 'zod';

/***** Domain Schemas *****/
export const SocketCloseDetailsSchema = z.object({
  code: z.number(),
  reason: z.string(),
  wasClean: z.boolean(),
  timestampISO: z.string(),
});

const SocketDetailsBaseSchema = z.object({
  id: z.string(),
  url: z.string(),
  isPaused: z.boolean(),
});
const SocketDetailsConnectingSchema = SocketDetailsBaseSchema.extend({
  status: z.literal('CONNECTING'),
});
const SocketDetailsOpenSchema = SocketDetailsBaseSchema.extend({
  status: z.literal('OPEN'),
});
const SocketDetailsClosedSchema = SocketDetailsBaseSchema.extend({
  status: z.literal('CLOSED'),
  closeDetails: SocketCloseDetailsSchema,
});
export const SocketDetailsSchema = z.discriminatedUnion('status', [
  SocketDetailsConnectingSchema,
  SocketDetailsOpenSchema,
  SocketDetailsClosedSchema,
]);

const SocketMessageEndpointsClientToServer = z.object({
  source: z.literal('client'),
  destination: z.literal('server'),
});
const SocketMessageEndpointsServerToClient = z.object({
  source: z.literal('server'),
  destination: z.literal('client'),
});
const SocketMessageEndpointsExt = z.object({
  source: z.literal('chrome_extension'),
  destination: z.enum(['client', 'server']),
});
export const SocketMessageEndpointsSchema = z.discriminatedUnion('source', [
  SocketMessageEndpointsClientToServer,
  SocketMessageEndpointsServerToClient,
  SocketMessageEndpointsExt,
]);

export const SocketMessageSchema = z.object({
  id: z.string(),
  timestampISO: z.string(),
  endpoints: SocketMessageEndpointsSchema,
  payload: z.string(),
});

export const UserInjectedSocketMessageSchema = z.object({
  socketId: z.string(),
  destination: z.enum(['client', 'server']),
  payload: z.string(),
});

/***** Packet Schemas *****/
export const SocketDetailsPacketSchema = z.object({
  type: z.literal('SocketDetailsPacket'),
  payload: z.object({
    socket: SocketDetailsSchema,
  }),
});

export const SocketMessagePacketSchema = z.object({
  type: z.literal('SocketMessagePacket'),
  payload: z.object({
    socket: SocketDetailsSchema,
    message: SocketMessageSchema,
  }),
});

export const UserInjectedSocketMessagePacketSchema = z.object({
  type: z.literal('UserInjectedSocketMessagePacket'),
  payload: z.object({
    message: UserInjectedSocketMessageSchema,
  }),
});

export const DebuggingPacketSchema = z.object({
  type: z.literal('DebuggingPacket'),
  payload: z.object({
    message: z.string(),
  }),
});

export const ClearDevtoolsStatePacketSchema = z.object({
  type: z.literal('ClearDevtoolsStatePacket'),
});

export const PauseSocketPacketSchema = z.object({
  type: z.literal('PauseSocketPacket'),
  payload: z.object({
    socketId: z.string(),
  }),
});

export const ResumeSocketPacketSchema = z.object({
  type: z.literal('ResumeSocketPacket'),
  payload: z.object({
    socketId: z.string(),
  }),
});

export const CloseConnectionPacketSchema = z.object({
  type: z.literal('CloseConnectionPacket'),
  payload: z.object({
    socketId: z.string(),
    code: z.number().optional(),
    reason: z.string().optional(),
  }),
});

export const DetectedSocketIOPacketSchema = z.object({
  type: z.literal('DetectedSocketIOPacket'),
  payload: z.object({
    socketId: z.string(),
  }),
});

/***** Discriminated Union *****/
export const PacketSchema = z.discriminatedUnion('type', [
  SocketDetailsPacketSchema,
  SocketMessagePacketSchema,
  DebuggingPacketSchema,
  ClearDevtoolsStatePacketSchema,
  UserInjectedSocketMessagePacketSchema,
  PauseSocketPacketSchema,
  ResumeSocketPacketSchema,
  CloseConnectionPacketSchema,
  DetectedSocketIOPacketSchema,
]);
