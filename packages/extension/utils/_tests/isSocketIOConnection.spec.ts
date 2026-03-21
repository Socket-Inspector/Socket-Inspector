import { describe, it, expect } from 'vitest';
import { isSocketIOConnection } from '../socketIO/isSocketIOConnection';

describe('isSocketIOConnection', () => {
  describe('valid Engine.IO v4 URL', () => {
    it('returns true when connection is websocket-only', () => {
      const SocketIOUpgradeUrl = 'ws://localhost:7812/socket.io/?EIO=4&transport=websocket';
      const result = isSocketIOConnection(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
    it('returns true upgrading from long polling', () => {
      const SocketIOUpgradeUrl =
        'ws://localhost:7812/socket.io/?EIO=4&transport=websocket&sid=WXIHQm5DQtpna3W-AAAa';
      const result = isSocketIOConnection(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
  });
  describe('invalid Engine.IO v4 URL', () => {
    it('returns false when using Engine.IO v3', () => {
      const v3Url = 'ws://localhost:7812/socket.io/?EIO=3&transport=websocket';
      expect(isSocketIOConnection(v3Url)).toBe(false);
    });
    it('returns false when urlString is not a url', () => {
      expect(isSocketIOConnection('not-a-url')).toBe(false);
    });
    it('returns false when the url has no query params', () => {
      expect(isSocketIOConnection('ws://localhost:7812/socket.io/')).toBe(false);
    });
  });
});
