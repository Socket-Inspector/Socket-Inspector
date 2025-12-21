import { Browser } from '#imports';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { ServiceWorkerConnector } from '../serviceWorkerMessaging';
import { createLogger } from '../customLogger';
import { fakeBrowser } from 'wxt/testing';
import { createDebugPacket } from '../packetFactory';
import { Packet, SocketDetailsPacket } from '../sharedTypes/sharedTypes';

describe('ServiceWorkerConnector', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('can send a packet to the service worker', () => {
    const mockPort = getMockPort();

    fakeBrowser.runtime.connect = () => mockPort.port;

    const serviceWorkerConnector = new ServiceWorkerConnector({
      channelName: 'CONTENT_SCRIPT_CHANNEL',
    }).connect();

    const testPacket = createDebugPacket('SENDING_TEST');
    serviceWorkerConnector.sendPacket(testPacket);
    expect(mockPort.port.postMessage).toHaveBeenCalledExactlyOnceWith(testPacket);
  });

  it('can receive a packet from the service worker', async () => {
    const mockPort = getMockPort();

    fakeBrowser.runtime.connect = () => mockPort.port;

    const serviceWorkerConnector = new ServiceWorkerConnector({
      channelName: 'CONTENT_SCRIPT_CHANNEL',
    }).connect();

    const subscription = vi.fn();
    serviceWorkerConnector.subscribe(subscription);

    const testPacket = createDebugPacket('UNIT_TEST');
    await mockPort.triggerMessage(testPacket);
    expect(subscription).toHaveBeenCalledExactlyOnceWith(testPacket);
  });

  it('can receive buffered packets from the service worker', async () => {
    const mockPort = getMockPort();

    fakeBrowser.runtime.connect = () => mockPort.port;

    const serviceWorkerConnector = new ServiceWorkerConnector({
      channelName: 'CONTENT_SCRIPT_CHANNEL',
      logger: createLogger('UNIT_TEST'),
    }).connect();

    // Send packets BEFORE subscribing - they should be buffered
    const testPacket1 = createDebugPacket('BUFFERED_PACKET_1');
    const testPacket2 = createDebugPacket('BUFFERED_PACKET_2');
    await mockPort.triggerMessage(testPacket1);
    await mockPort.triggerMessage(testPacket2);

    // Now subscribe - buffered packets should be delivered immediately
    const subscription = vi.fn();
    serviceWorkerConnector.subscribe(subscription);

    // Verify both buffered packets were delivered
    expect(subscription).toHaveBeenCalledTimes(2);
    expect(subscription).toHaveBeenNthCalledWith(1, testPacket1);
    expect(subscription).toHaveBeenNthCalledWith(2, testPacket2);

    // Send a new packet after subscribing - should be delivered normally
    const testPacket3 = createDebugPacket('NORMAL_PACKET');
    await mockPort.triggerMessage(testPacket3);

    expect(subscription).toHaveBeenCalledTimes(3);
    expect(subscription).toHaveBeenNthCalledWith(3, testPacket3);
  });

  describe('if service worker disconnects, and disconnectHandler runs before sendPacket() is called', () => {
    it('can reconnect and then send the packet', async () => {
      const originalMockPort = getMockPort();
      const reconnectedMockPort = getMockPort();

      let connectCall = 1;
      fakeBrowser.runtime.connect = vi.fn(() => {
        if (connectCall === 1) {
          connectCall++;
          return originalMockPort.port;
        } else if (connectCall === 2) {
          return reconnectedMockPort.port;
        }
      });

      const serviceWorkerConnector = new ServiceWorkerConnector({
        channelName: 'CONTENT_SCRIPT_CHANNEL',
        logger: createLogger('UNIT_TEST'),
      }).connect();

      expect(fakeBrowser.runtime.connect).toHaveBeenCalledTimes(1);
      expect(fakeBrowser.runtime.connect).toHaveBeenCalledWith({
        name: 'CONTENT_SCRIPT_CHANNEL',
      });

      const subscription = vi.fn();
      serviceWorkerConnector.subscribe(subscription);

      // Trigger disconnect on original port - should cause reconnection
      await originalMockPort.triggerDisconnect();

      // Verify reconnection occurred
      expect(fakeBrowser.runtime.connect).toHaveBeenCalledTimes(2);
      expect(fakeBrowser.runtime.connect).toHaveBeenNthCalledWith(2, {
        name: 'CONTENT_SCRIPT_CHANNEL',
      });

      // Verify event listeners were cleaned up on the original port
      expect(originalMockPort.port.onMessage.removeListener).toHaveBeenCalled();
      expect(originalMockPort.port.onDisconnect.removeListener).toHaveBeenCalled();

      // Messages can still be received after reconnecting
      const receivedAfterReconnect = createDebugPacket('AFTER_RECONNECT');
      await reconnectedMockPort.triggerMessage(receivedAfterReconnect);
      expect(subscription).toHaveBeenCalledExactlyOnceWith(receivedAfterReconnect);

      // Messages can still be sent after reconnecting
      const sentAfterReconnect = createDebugPacket('SENT_AFTER_RECONNECT');
      serviceWorkerConnector.sendPacket(sentAfterReconnect);
      expect(reconnectedMockPort.port.postMessage).toHaveBeenCalledExactlyOnceWith(
        sentAfterReconnect,
      );
      expect(originalMockPort.port.postMessage).toHaveBeenCalledTimes(0);
    });
  });

  describe('if service worker disconnects, and sendPacket() is called before disconnectHandler runs', () => {
    it('can reconnect and then send the packet', async () => {
      const firstPort = getMockPort();
      firstPort.port.postMessage = vi.fn(() => {
        throw new Error('sent message on disconnected port');
      });

      const secondPort = getMockPort();

      let connectCall = 1;
      fakeBrowser.runtime.connect = vi.fn(() => {
        if (connectCall === 1) {
          connectCall++;
          return firstPort.port;
        } else if (connectCall === 2) {
          return secondPort.port;
        }
      });

      const serviceWorkerConnector = new ServiceWorkerConnector({
        channelName: 'CONTENT_SCRIPT_CHANNEL',
        logger: createLogger('UNIT_TEST'),
      }).connect();

      const testPacket = createDebugPacket('TEST');
      serviceWorkerConnector.sendPacket(testPacket);

      expect(fakeBrowser.runtime.connect).toHaveBeenCalledTimes(2);
      expect(firstPort.port.postMessage).toHaveBeenCalledExactlyOnceWith(testPacket);
      expect(secondPort.port.postMessage).toHaveBeenCalledExactlyOnceWith(testPacket);

      // it can send another packet after disconnectHandler does run
      await firstPort.triggerDisconnect();

      const testPacket2 = createDebugPacket('TEST_2');
      serviceWorkerConnector.sendPacket(testPacket2);
      expect(secondPort.port.postMessage).toHaveBeenNthCalledWith(2, testPacket2);
    });

    it('can reconnect, send the packet, and receive packets after reconnecting', async () => {
      const firstPort = getMockPort();
      firstPort.port.postMessage = vi.fn(() => {
        throw new Error('sent message on disconnected port');
      });

      const secondPort = getMockPort();

      let connectCall = 1;
      fakeBrowser.runtime.connect = vi.fn(() => {
        if (connectCall === 1) {
          connectCall++;
          return firstPort.port;
        } else if (connectCall === 2) {
          return secondPort.port;
        }
      });

      const serviceWorkerConnector = new ServiceWorkerConnector({
        channelName: 'CONTENT_SCRIPT_CHANNEL',
        logger: createLogger('UNIT_TEST'),
      }).connect();

      const subscription = vi.fn();
      serviceWorkerConnector.subscribe(subscription);

      const testPacket = createDebugPacket('TEST');
      serviceWorkerConnector.sendPacket(testPacket);

      // Verify that subscription still works after reconnecting
      const receivedPacket = createDebugPacket('RECEIVED_AFTER_RECONNECT');
      await secondPort.triggerMessage(receivedPacket);
      expect(subscription).toHaveBeenCalledExactlyOnceWith(receivedPacket);
    });

    it('can reconnect, send the packet, and then reconnect again if new port`s disconnectHandler triggers', async () => {
      const firstPort = getMockPort();
      firstPort.port.postMessage = vi.fn(() => {
        throw new Error('sent message on disconnected port');
      });

      const secondPort = getMockPort();
      const thirdPort = getMockPort();

      let connectCall = 1;
      fakeBrowser.runtime.connect = vi.fn(() => {
        if (connectCall === 1) {
          connectCall++;
          return firstPort.port;
        } else if (connectCall === 2) {
          connectCall++;
          return secondPort.port;
        } else if (connectCall === 3) {
          return thirdPort.port;
        }
      });

      const serviceWorkerConnector = new ServiceWorkerConnector({
        channelName: 'CONTENT_SCRIPT_CHANNEL',
        logger: createLogger('UNIT_TEST'),
      }).connect();

      serviceWorkerConnector.sendPacket(createDebugPacket('TEST'));
      await firstPort.triggerDisconnect();
      serviceWorkerConnector.sendPacket(createDebugPacket('TEST_2'));

      // second port's disconnect triggers
      await secondPort.triggerDisconnect();
      expect(fakeBrowser.runtime.connect).toHaveBeenCalledTimes(3);

      // send packet on the third port
      const thirdPortPacket = createDebugPacket('TEST_3');
      serviceWorkerConnector.sendPacket(thirdPortPacket);
      expect(thirdPort.port.postMessage).toHaveBeenCalledExactlyOnceWith(thirdPortPacket);
    });
  });

  describe('realistic scenarios', () => {
    it('Page is refreshed with devtools opened, user sends custom message', async () => {
      const mockPort = getMockPort();
      fakeBrowser.runtime.connect = () => mockPort.port;

      const serviceWorkerConnector = new ServiceWorkerConnector({
        channelName: 'CONTENT_SCRIPT_CHANNEL',
      }).connect();

      // 1. Sends ClearDevtoolsStatePacket
      const clearStatePacket: Packet = {
        type: 'ClearDevtoolsStatePacket',
      };
      serviceWorkerConnector.sendPacket(clearStatePacket);
      expect(mockPort.port.postMessage).toHaveBeenCalledTimes(1);
      expect(mockPort.port.postMessage).toHaveBeenCalledWith(clearStatePacket);

      // 2. subscribes to service worker
      const subscription = vi.fn();
      serviceWorkerConnector.subscribe(subscription);

      // 3. sends CONNECTING socket details
      const connectingSocketDetails: SocketDetailsPacket = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: 'a8f1f735-ad90-4a8b-b4f5-8a42802cdc8d',
            url: 'ws://localhost:6844/',
            status: 'CONNECTING',
            isPaused: false,
          },
        },
      };
      serviceWorkerConnector.sendPacket(connectingSocketDetails);
      expect(mockPort.port.postMessage).toHaveBeenCalledTimes(2);
      expect(mockPort.port.postMessage).toHaveBeenNthCalledWith(2, connectingSocketDetails);
      expect(subscription).toHaveBeenCalledTimes(0);

      // 4. sends OPEN socket details
      const openSocketDetails: SocketDetailsPacket = {
        type: 'SocketDetailsPacket',
        payload: {
          socket: {
            id: 'db544d0f-5400-4c22-891e-c2464260e18f',
            url: 'ws://localhost:6844/',
            status: 'OPEN',
            isPaused: false,
          },
        },
      };
      serviceWorkerConnector.sendPacket(openSocketDetails);
      expect(mockPort.port.postMessage).toHaveBeenCalledTimes(3);
      expect(mockPort.port.postMessage).toHaveBeenNthCalledWith(3, openSocketDetails);
      expect(subscription).toHaveBeenCalledTimes(0);

      // 5. sends custom message
      const customMessagePacket: Packet = {
        type: 'UserInjectedSocketMessagePacket',
        payload: {
          message: {
            socketId: 'db544d0f-5400-4c22-891e-c2464260e18f',
            destination: 'client',
            payload: 'raw test',
          },
        },
      };
      await mockPort.triggerMessage(customMessagePacket);
      expect(subscription).toHaveBeenCalledExactlyOnceWith(customMessagePacket);
    });
  });
});

function getMockPort() {
  const { triggerMessage, onMessage } = createOnMessageMock();
  const { triggerDisconnect, onDisconnect } = createOnDisconnectMock();

  const port = {
    onMessage,
    onDisconnect,
    postMessage: vi.fn(),
  } as unknown as Browser.runtime.Port;

  return { port, triggerMessage, triggerDisconnect };
}

function createOnMessageMock() {
  let messageListeners: any[] = [];
  const onMessage = {
    addListener: vi.fn((listener) => {
      messageListeners.push(listener);
    }),
    removeListener: vi.fn((listener) => {
      messageListeners = messageListeners.filter((l) => l !== listener);
    }),
  };

  const triggerMessage = async (message: any) => {
    await Promise.resolve();
    for (let listener of messageListeners) {
      listener(message);
    }
  };

  return { triggerMessage, onMessage };
}

function createOnDisconnectMock() {
  let disconnectListeners: any[] = [];

  const onDisconnect = {
    addListener: vi.fn((listener) => {
      disconnectListeners.push(listener);
    }),
    removeListener: vi.fn((listener) => {
      disconnectListeners = disconnectListeners.filter((l) => l !== listener);
    }),
  };

  const triggerDisconnect = async () => {
    await Promise.resolve();
    for (const listener of disconnectListeners) {
      listener();
    }
  };

  return { onDisconnect, triggerDisconnect };
}
