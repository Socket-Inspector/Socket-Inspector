import { describe, it, expect, assert } from 'vitest';
import { parseIOMessage } from '../socketIOHelpers';
import { PacketType as SocketIOPacketType } from 'socket.io-parser';

describe('packet parsing', () => {
  it('parses engineIO open packet', () => {
    const rawText = `0{"sid":"T-PVhYXxifpJJirPAAJ6","upgrades":[],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}`;
    const parse = parseIOMessage(rawText);
    assert(parse.parseResults.length === 1);
    assert(parse.lastSuccess === 'ENGINE_IO');
    assert(parse.parseResults[0].type === 'open');
  });
  it('parses engineIO ping', () => {
    const parse = parseIOMessage('2');
    assert(parse.parseResults.length === 1);
    assert(parse.lastSuccess === 'ENGINE_IO');
    assert(parse.parseResults[0].type === 'ping');
  });
  it('parses engineIO pong', () => {
    const parse = parseIOMessage('3');
    assert(parse.parseResults.length === 1);
    assert(parse.lastSuccess === 'ENGINE_IO');
    assert(parse.parseResults[0].type === 'pong');
  });
  it('parses socketIO root namespace connection', () => {
    const rawString = `40{"sid":"RVSAtEn8n7lkZ4F4AAJ7"}`;
    const parse = parseIOMessage(rawString);
    assert(parse.parseResults.length === 2);
    assert(parse.lastSuccess === 'SOCKET_IO');
    assert(parse.parseResults[1].nsp === '/');
    assert(parse.parseResults[1].type === SocketIOPacketType.CONNECT);
    console.log(JSON.stringify(parse));
  });
  it('parses socketIO event with multiple args', () => {
    const parse = parseIOMessage('42["STEAM","Blowing1","Blowing2"]');
    assert(parse.lastSuccess === 'SOCKET_IO_EVENT');
    assert(parse.parseResults.length === 3);
    assert(parse.parseResults[1].type === SocketIOPacketType.EVENT);
    const event = parse.parseResults[2];
    expect(event.eventName).toBe('STEAM');
    expect(event.eventArgs).toEqual(['Blowing1', 'Blowing2']);
  });
  it('parses socketIO event with single arg', () => {
    const parse = parseIOMessage('42["message","CATS"]');
    assert(parse.lastSuccess === 'SOCKET_IO_EVENT');
    assert(parse.parseResults.length === 3);
    assert(parse.parseResults[1].type === SocketIOPacketType.EVENT);
    const event = parse.parseResults[2];
    expect(event.eventName).toBe('message');
    expect(event.eventArgs).toEqual(['CATS']);
  });
  it('parses socketIO event with string arg containing spaces', () => {
    const parse = parseIOMessage('42["MAIN","HELLO WORLD"]');
    assert(parse.lastSuccess === 'SOCKET_IO_EVENT');
    assert(parse.parseResults.length === 3);
    assert(parse.parseResults[1].type === SocketIOPacketType.EVENT);
    const event = parse.parseResults[2];
    expect(event.eventName).toBe('MAIN');
    expect(event.eventArgs).toEqual(['HELLO WORLD']);
  });
  it('parses socketIO root namespace connection without data', () => {
    const parse = parseIOMessage('40');
    assert(parse.lastSuccess === 'SOCKET_IO');
    assert(parse.parseResults.length === 2);
    assert(parse.parseResults[1].type === SocketIOPacketType.CONNECT);
    assert(parse.parseResults[1].nsp === '/');
  });
  it('parses socketIO custom namespace connection', () => {
    const parse = parseIOMessage('40/dogs,');
    assert(parse.lastSuccess === 'SOCKET_IO');
    assert(parse.parseResults.length === 2);
    assert(parse.parseResults[1].type === SocketIOPacketType.CONNECT);
    assert(parse.parseResults[1].nsp === '/dogs');
  });
  it('parses socketIO event on custom namespace', () => {
    const parse = parseIOMessage('42/dogs,["DOG","WOOF"]');
    assert(parse.lastSuccess === 'SOCKET_IO_EVENT');
    assert(parse.parseResults.length === 3);
    assert(parse.parseResults[1].type === SocketIOPacketType.EVENT);
    assert(parse.parseResults[1].nsp === '/dogs');
    const event = parse.parseResults[2];
    expect(event.eventName).toBe('DOG');
    expect(event.eventArgs).toEqual(['WOOF']);
  });
});
