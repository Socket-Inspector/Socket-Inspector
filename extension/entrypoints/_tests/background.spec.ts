import { Browser } from '#imports';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import background from '../background';
import { createDebugPacket } from '@/utils/packetFactory';
import { ClearDevtoolsStatePacket } from '@/utils/sharedTypes/sharedTypes';

/**
 * TODO:
 * add some test cases for the bugs we saw earlier
 *
 * tests for the early return != guards
 *
 * add some tests that include disconnecting and reconnecting
 *  e.g. opening and closing devtools
 *
 * write a test to simulate BF cache reconnections
 */

describe('Extension Service Worker', () => {
  /**
   * Reference to the callback function passed to
   * browser.runtime.onConnect.addListener()
   */
  let onConnectListener!: (port: Browser.runtime.Port) => any;

  beforeEach(() => {
    fakeBrowser.reset();
    fakeBrowser.runtime.onConnect.addListener = (callback: (port: Browser.runtime.Port) => any) => {
      onConnectListener = callback;
    };
    background.main();
  });

  it('can relay a message from content script to devtools when content script connects first', async () => {
    const TAB_ID = 1234;

    const { contentPort, sendMessageFromContentScript } = createMockContentPort(TAB_ID);
    onConnectListener(contentPort);

    const { devtoolsPort } = createMockDevtoolsPort(TAB_ID);
    onConnectListener(devtoolsPort);

    expect(contentPort.postMessage).not.toHaveBeenCalled();
    expect(devtoolsPort.postMessage).not.toHaveBeenCalled();

    const packet = createDebugPacket('Hello from content script');
    await sendMessageFromContentScript(packet);

    expect(contentPort.postMessage).not.toHaveBeenCalled();
    expect(devtoolsPort.postMessage).toHaveBeenCalledWith(packet);
  });

  it('can relay a message from content script to devtools when devtools connects first', async () => {
    const TAB_ID = 1234;

    const { devtoolsPort } = createMockDevtoolsPort(TAB_ID);
    onConnectListener(devtoolsPort);

    const { contentPort, sendMessageFromContentScript } = createMockContentPort(TAB_ID);
    onConnectListener(contentPort);

    expect(contentPort.postMessage).not.toHaveBeenCalled();
    expect(devtoolsPort.postMessage).not.toHaveBeenCalled();

    const packet = createDebugPacket('Hello from content script');
    await sendMessageFromContentScript(packet);

    expect(contentPort.postMessage).not.toHaveBeenCalled();
    expect(devtoolsPort.postMessage).toHaveBeenCalledWith(packet);
  });

  it('can relay a message from devtools to content script when content script connects first', async () => {
    const TAB_ID = 1234;

    const { contentPort } = createMockContentPort(TAB_ID);
    onConnectListener(contentPort);

    const { devtoolsPort, sendMessageFromDevtools } = createMockDevtoolsPort(TAB_ID);
    onConnectListener(devtoolsPort);

    const packet = createDebugPacket('Hello from devtools');
    await sendMessageFromDevtools(packet);

    expect(contentPort.postMessage).toHaveBeenCalledWith(packet);
    expect(devtoolsPort.postMessage).not.toHaveBeenCalled();
  });

  it('can relay a message from devtools to content script when devtools connects first', async () => {
    const TAB_ID = 1234;

    const { devtoolsPort, sendMessageFromDevtools } = createMockDevtoolsPort(TAB_ID);
    onConnectListener(devtoolsPort);

    const { contentPort } = createMockContentPort(TAB_ID);
    onConnectListener(contentPort);

    const packet = createDebugPacket('Hello from devtools');
    await sendMessageFromDevtools(packet);

    expect(contentPort.postMessage).toHaveBeenCalledWith(packet);
    expect(devtoolsPort.postMessage).not.toHaveBeenCalled();
  });

  describe('relaying multiple messages', async () => {
    it('case 1', async () => {
      const TAB_ID = 1234;

      const { devtoolsPort, sendMessageFromDevtools } = createMockDevtoolsPort(TAB_ID);

      const { contentPort, sendMessageFromContentScript } = createMockContentPort(TAB_ID);

      onConnectListener(devtoolsPort);
      onConnectListener(contentPort);

      const devtoolsPacket1 = createDebugPacket(`Devtools_Packet_1`);
      const contentScriptPacket1 = createDebugPacket(`CS_PACKET_1`);
      const devtoolsPacket2 = createDebugPacket(`Devtools_Packet_2`);

      await sendMessageFromDevtools(devtoolsPacket1);
      expect(contentPort.postMessage).lastCalledWith(devtoolsPacket1);
      expect(devtoolsPort.postMessage).not.toHaveBeenCalled();

      await sendMessageFromContentScript(contentScriptPacket1);
      expect(contentPort.postMessage).lastCalledWith(devtoolsPacket1);
      expect(devtoolsPort.postMessage).lastCalledWith(contentScriptPacket1);

      await sendMessageFromDevtools(devtoolsPacket2);
      expect(contentPort.postMessage).lastCalledWith(devtoolsPacket2);
      expect(devtoolsPort.postMessage).lastCalledWith(contentScriptPacket1);
    });
  });

  describe('when there are 2 browser tabs', () => {
    it('packets sent from content scripts', async () => {
      const TAB_ONE = 1;
      const TAB_TWO = 2;

      const tabOnePorts = {
        content: createMockContentPort(TAB_ONE),
        devtools: createMockDevtoolsPort(TAB_ONE),
      };
      onConnectListener(tabOnePorts.content.contentPort);
      onConnectListener(tabOnePorts.devtools.devtoolsPort);

      const tabTwoPorts = {
        content: createMockContentPort(TAB_TWO),
        devtools: createMockDevtoolsPort(TAB_TWO),
      };
      onConnectListener(tabTwoPorts.content.contentPort);
      onConnectListener(tabTwoPorts.devtools.devtoolsPort);

      const packet1 = createDebugPacket('packet1');
      await tabOnePorts.content.sendMessageFromContentScript(packet1);
      expect(tabOnePorts.devtools.devtoolsPort.postMessage).toHaveBeenLastCalledWith(packet1);
      expect(tabOnePorts.content.contentPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.devtools.devtoolsPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.content.contentPort.postMessage).not.toHaveBeenCalled();

      const packet2 = createDebugPacket('packet1');
      await tabTwoPorts.content.sendMessageFromContentScript(packet2);
      expect(tabOnePorts.devtools.devtoolsPort.postMessage).toHaveBeenLastCalledWith(packet1);
      expect(tabOnePorts.content.contentPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.devtools.devtoolsPort.postMessage).toHaveBeenLastCalledWith(packet2);
      expect(tabTwoPorts.content.contentPort.postMessage).not.toHaveBeenCalled();
    });
    it('packets sent from devtools', async () => {
      const TAB_ONE = 1;
      const TAB_TWO = 2;

      const tabOnePorts = {
        content: createMockContentPort(TAB_ONE),
        devtools: createMockDevtoolsPort(TAB_ONE),
      };
      onConnectListener(tabOnePorts.content.contentPort);
      onConnectListener(tabOnePorts.devtools.devtoolsPort);

      const tabTwoPorts = {
        content: createMockContentPort(TAB_TWO),
        devtools: createMockDevtoolsPort(TAB_TWO),
      };
      onConnectListener(tabTwoPorts.content.contentPort);
      onConnectListener(tabTwoPorts.devtools.devtoolsPort);

      const packet1 = createDebugPacket('packet1');
      await tabOnePorts.devtools.sendMessageFromDevtools(packet1);
      expect(tabOnePorts.content.contentPort.postMessage).toHaveBeenLastCalledWith(packet1);
      expect(tabOnePorts.devtools.devtoolsPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.content.contentPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.devtools.devtoolsPort.postMessage).not.toHaveBeenCalled();

      const packet2 = createDebugPacket('packet2');
      await tabTwoPorts.devtools.sendMessageFromDevtools(packet2);
      expect(tabOnePorts.content.contentPort.postMessage).toHaveBeenLastCalledWith(packet1);
      expect(tabOnePorts.devtools.devtoolsPort.postMessage).not.toHaveBeenCalled();
      expect(tabTwoPorts.content.contentPort.postMessage).toHaveBeenLastCalledWith(packet2);
      expect(tabTwoPorts.devtools.devtoolsPort.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('if devtools is open when content script is injected', () => {
    it('can relay the ClearDevtoolsStatePacket packet to the devtools', async () => {
      const TAB_ID = 1234;

      const { devtoolsPort } = createMockDevtoolsPort(TAB_ID);
      onConnectListener(devtoolsPort);

      const { contentPort, sendMessageFromContentScript } = createMockContentPort(TAB_ID);
      onConnectListener(contentPort);

      const packet: ClearDevtoolsStatePacket = {
        type: 'ClearDevtoolsStatePacket',
      };
      await sendMessageFromContentScript(packet);

      expect(devtoolsPort.postMessage).toHaveBeenCalledWith(packet);
    });
  });
});

function createMockContentPort(tabId: number) {
  const { triggerMessage, onMessage } = createOnMessageMock();
  const { onDisconnect } = createOnDisconnectMock();

  const contentPort = {
    name: 'CONTENT_SCRIPT_CHANNEL',
    sender: {
      tab: {
        id: tabId,
      },
      documentLifecycle: 'active',
      origin: 'MOCK_ORIGIN',
    },
    onMessage,
    onDisconnect,
    postMessage: vi.fn(),
  } as unknown as Browser.runtime.Port;

  return {
    contentPort,
    sendMessageFromContentScript: triggerMessage,
  };
}

function createMockDevtoolsPort(tabId: number) {
  const { triggerMessage, onMessage } = createOnMessageMock();
  const { onDisconnect } = createOnDisconnectMock();

  const devtoolsPort = {
    name: `DEVTOOLS_CHANNEL:${tabId}`,
    onMessage,
    onDisconnect,
    postMessage: vi.fn(),
  } as unknown as Browser.runtime.Port;

  return { devtoolsPort, sendMessageFromDevtools: triggerMessage };
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
