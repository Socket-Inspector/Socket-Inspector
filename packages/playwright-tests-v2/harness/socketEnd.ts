export type SocketEnd = {
  send(text: string): Promise<void>;
  close(options: CloseOptions): Promise<void>;
  readonly receivedEvents: readonly InboundEvent[];
};

export type InboundEvent =
  | { type: 'text'; text: string }
  | { type: 'binary' }
  | { type: 'close'; code: number; reason: string }
  | { type: 'error' };

export type CloseOptions = { code?: number; reason?: string };
