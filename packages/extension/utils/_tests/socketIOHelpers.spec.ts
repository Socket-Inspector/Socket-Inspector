import { describe, it, expect } from 'vitest';
import { isEngineIOv4Url } from '../socketIOHelpers';

describe('isEngineIOv4Url', () => {
  describe('valid Engine.IO v4 URL', () => {
    it('returns true when connection is websocket-only', () => {
      const SocketIOUpgradeUrl = 'ws://localhost:7812/socket.io/?EIO=4&transport=websocket';
      const result = isEngineIOv4Url(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
    it('returns true upgrading from long polling', () => {
      const SocketIOUpgradeUrl =
        'ws://localhost:7812/socket.io/?EIO=4&transport=websocket&sid=WXIHQm5DQtpna3W-AAAa';
      const result = isEngineIOv4Url(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
  });
  describe('Invalid Engine.IO v4 URL', () => {
    it('returns false when using Engine.IO v3', () => {
      const v3Url = 'ws://localhost:7812/socket.io/?EIO=3&transport=websocket';
      expect(isEngineIOv4Url(v3Url)).toBe(false);
    });
    it('returns false when urlString is not a url', () => {
      expect(isEngineIOv4Url('not-a-url')).toBe(false);
    });
    it('returns false when the url has no query params', () => {
      expect(isEngineIOv4Url('ws://localhost:7812/socket.io/')).toBe(false);
    });
  });
});
