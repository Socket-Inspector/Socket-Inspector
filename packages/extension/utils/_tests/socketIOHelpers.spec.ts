import { describe, it, expect } from 'vitest';
import { isSocketIOConnection } from '../socketIOHelpers';

describe('isSocketIOConnection', () => {
  describe('Valid Socket.IO connection', () => {
    it('Detects socketIO when connection is websocket-only', () => {
      const SocketIOUpgradeUrl = 'ws://localhost:7812/socket.io/?EIO=4&transport=websocket';
      const result = isSocketIOConnection(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
    it('Detects socketIO when upgrading from long polling', () => {
      const SocketIOUpgradeUrl = 'ws://localhost:7812/socket.io/?EIO=4&transport=websocket&sid=WXIHQm5DQtpna3W-AAAa';
      const result = isSocketIOConnection(SocketIOUpgradeUrl);
      expect(result).toBe(true);
    });
  });
});