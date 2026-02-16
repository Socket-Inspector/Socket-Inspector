import { describe, it, expect } from 'vitest';
import { isPacket } from '../sharedTypes/validators';

describe('isPacket', () => {
  it('returns true for ClearDevtoolsStatePacket packet', () => {
    const packet = { type: 'ClearDevtoolsStatePacket' } as const;
    expect(isPacket(packet)).toBe(true);
  });

  it('returns false for an invalid packet', () => {
    const notAPacket = { foo: 'bar' } as const;
    expect(isPacket(notAPacket)).toBe(false);
  });
});
