import { describe, it, expect, assert } from 'vitest';
import { parseSocketIO } from '../socketIO/parseSocketIO';
import { getSocketIOPacketDescription, parseSocketIOEvent } from '../socketIO/socketIOPacketUtils';

describe('parseSocketIO', () => {
  describe('packets that are engineIO but not socketIO', () => {
    it('parses engineIO open packet', () => {
      const rawText = `0{"sid":"T-PVhYXxifpJJirPAAJ6","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}`;
      const parse = parseSocketIO(rawText);
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'open');
      assert(!('socketIOPacket' in parse));
    });
    it('parses engineIO ping', () => {
      const parse = parseSocketIO('2');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'ping');
      assert(!('socketIOPacket' in parse));
    });
    it('parses engineIO pong', () => {
      const parse = parseSocketIO('3');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'pong');
      assert(!('socketIOPacket' in parse));
    });
  });
  describe('socketIO packets encoded within engineIO packets', () => {
    it('parses socketIO root namespace connection', () => {
      const rawString = `40{"sid":"RVSAtEn8n7lkZ4F4AAJ7"}`;
      const parse = parseSocketIO(rawString);
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket?.type) === 'CONNECT');
      assert(parse.socketIOPacket.nsp === '/');
    });
    it('parses socketIO event with multiple args', () => {
      const rawString = '42["STEAM","Blowing1","Blowing2"]';
      const parse = parseSocketIO(rawString);
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket?.type) === 'EVENT');
      assert(parse.socketIOPacket.nsp === '/');

      const eventParse = parseSocketIOEvent(parse.socketIOPacket);
      expect(eventParse).toEqual({
        success: true,
        eventName: 'STEAM',
        eventArgs: ['Blowing1', 'Blowing2']
      });
    });
  });
});