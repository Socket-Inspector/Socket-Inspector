import { describe, it, expect, assert } from 'vitest';
import { parseSocketIO } from '../socketIO/parseSocketIO';
import { getSocketIOPacketDescription, parseSocketIOEvent } from '../socketIO/socketIOPacketUtils';

describe('parseSocketIO', () => {
  it('returns success: false when input cannot be decoded', () => {
    const parse = parseSocketIO(null as unknown as string);
    assert(!parse.success);
  });
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
    it('parses socketIO event with single arg', () => {
      const parse = parseSocketIO('42["message","CATS"]');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket.type) === 'EVENT');
      assert(parse.socketIOPacket.nsp === '/');

      const eventParse = parseSocketIOEvent(parse.socketIOPacket);
      expect(eventParse).toEqual({
        success: true,
        eventName: 'message',
        eventArgs: ['CATS']
      });
    });
    it('parses socketIO event with string arg containing spaces', () => {
      const parse = parseSocketIO('42["MAIN","HELLO WORLD"]');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket.type) === 'EVENT');

      const eventParse = parseSocketIOEvent(parse.socketIOPacket);
      expect(eventParse).toEqual({
        success: true,
        eventName: 'MAIN',
        eventArgs: ['HELLO WORLD']
      });
    });
    it('parses socketIO root namespace connection without data', () => {
      const parse = parseSocketIO('40');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket.type) === 'CONNECT');
      assert(parse.socketIOPacket.nsp === '/');
    });
    it('parses socketIO custom namespace connection', () => {
      const parse = parseSocketIO('40/dogs,');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket.type) === 'CONNECT');
      assert(parse.socketIOPacket.nsp === '/dogs');
    });
    it('parses socketIO event on custom namespace', () => {
      const parse = parseSocketIO('42/dogs,["DOG","WOOF"]');
      assert(parse.success);
      assert(parse.engineIOPacket.type === 'message');
      assert(parse.socketIOPacket);
      assert(getSocketIOPacketDescription(parse.socketIOPacket.type) === 'EVENT');
      assert(parse.socketIOPacket.nsp === '/dogs');

      const eventParse = parseSocketIOEvent(parse.socketIOPacket);
      expect(eventParse).toEqual({
        success: true,
        eventName: 'DOG',
        eventArgs: ['WOOF']
      });
    });
  });
});