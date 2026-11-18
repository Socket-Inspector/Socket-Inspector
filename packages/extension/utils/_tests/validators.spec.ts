import { describe, it, expect } from 'vitest';
import { isPacket } from '../sharedTypes/validators';

describe('isPacket', () => {
  it('returns true for ClearDevtoolsStatePacket packet', () => {
    const packet = { type: 'ClearDevtoolsStatePacket' } as const;
    expect(isPacket(packet)).toBe(true);
  });

  it('returns true for SocketDetailsPacket with closeDetails', () => {
    const packet = {
      type: 'SocketDetailsPacket',
      payload: {
        socket: {
          id: 'socket-1',
          url: 'wss://example.com',
          status: 'CLOSED',
          isPaused: false,
          closeDetails: {
            code: 1006,
            reason: '',
            wasClean: false,
            timestampISO: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    } as const;
    expect(isPacket(packet)).toBe(true);
  });

  it('returns false for SocketDetailsPacket with malformed closeDetails', () => {
    const packet = {
      type: 'SocketDetailsPacket',
      payload: {
        socket: {
          id: 'socket-1',
          url: 'wss://example.com',
          status: 'CLOSED',
          isPaused: false,
          closeDetails: { code: '1000' },
        },
      },
    } as const;
    expect(isPacket(packet)).toBe(false);
  });

  it('returns false for a CLOSED SocketDetailsPacket without closeDetails', () => {
    const packet = {
      type: 'SocketDetailsPacket',
      payload: {
        socket: {
          id: 'socket-1',
          url: 'wss://example.com',
          status: 'CLOSED',
          isPaused: false,
        },
      },
    } as const;
    expect(isPacket(packet)).toBe(false);
  });

  it('returns false for an invalid packet', () => {
    const notAPacket = { foo: 'bar' } as const;
    expect(isPacket(notAPacket)).toBe(false);
  });
});
