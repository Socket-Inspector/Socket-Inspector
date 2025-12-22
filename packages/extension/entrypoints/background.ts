import { browser, Browser, defineBackground } from '#imports';
import { touchLastError } from '@/utils/helpers';
import { Packet } from '@/utils/sharedTypes/sharedTypes';
import { isPacket } from '@/utils/sharedTypes/validators';

export default defineBackground(() => {
  const connections = new Map<number, Relay>();

  const onPortsDisconnected = (tabId: number) => {
    connections.delete(tabId);
  };

  browser.runtime.onConnect.addListener((port) => {
    if (port.name.startsWith('DEVTOOLS_CHANNEL')) {
      const tabId = parseDevtoolsTabId(port.name);
      if (!connections.has(tabId)) {
        connections.set(tabId, new Relay({ tabId, onPortsDisconnected }));
      }
      connections.get(tabId)!.connectDevtoolsPort(port);
    } else if (port.name === 'CONTENT_SCRIPT_CHANNEL') {
      const tabId = import.meta.env.VITE_MOCK_TAB_ID
        ? parseInt(import.meta.env.VITE_MOCK_TAB_ID)
        : port.sender!.tab!.id!;
      if (!connections.has(tabId)) {
        connections.set(tabId, new Relay({ tabId, onPortsDisconnected }));
      }
      connections.get(tabId)!.connectContentPort(port);
    }
  });
});

function parseDevtoolsTabId(connectionName: string) {
  return Number(connectionName.split(':')[1]);
}

type RelayArgs = {
  tabId: number;
  onPortsDisconnected: (tabId: number) => any;
};

class Relay {
  public readonly tabId: number;
  private readonly portsDisconnected: (tabId: number) => any;
  // using set here in case its possible for multiple content ports on same tab
  private contentPorts = new Set<Browser.runtime.Port>();
  private devtoolsPort?: Browser.runtime.Port;
  constructor({ tabId, onPortsDisconnected }: RelayArgs) {
    this.tabId = tabId;
    this.portsDisconnected = onPortsDisconnected;
  }
  public connectContentPort(contentPort: Browser.runtime.Port) {
    const messageHandler = (message: any) => {
      // TODO: do we need to check if contentPort is in the current set of ports?

      if (!isPacket(message)) {
        return;
      }

      // Received message from CS

      if (this.devtoolsPortDisconnected()) {
        return;
      }

      this.sendDevtoolsPacket(message);
    };
    const disconnectHandler = () => {
      touchLastError();
      contentPort.onMessage.removeListener(messageHandler);
      contentPort.onDisconnect.removeListener(disconnectHandler);
      this.contentPorts.delete(contentPort);
      if (this.allPortsDisconnected()) {
        this.portsDisconnected(this.tabId);
      }
    };
    contentPort.onMessage.addListener(messageHandler);
    contentPort.onDisconnect.addListener(disconnectHandler);
    this.contentPorts.add(contentPort);
  }
  public connectDevtoolsPort(devtoolsPort: Browser.runtime.Port) {
    const messageHandler = (message: any) => {
      if (!isPacket(message)) {
        return;
      }

      if (this.devtoolsPort !== devtoolsPort) {
        return;
      }

      if (this.contentPortsDisconnected()) {
        /**
         * TODO:
         * shouldn't we actually buffer the message here?
         *    or await waitForContentPort()?
         * otherwise user event could technically be ignored?
         * however, buffers may require us to persist in storage in case of ESW restart?
         */
        return;
      }

      this.sendContentPacket(message);
    };
    const disconnectHandler = () => {
      touchLastError();
      devtoolsPort.onMessage.removeListener(messageHandler);
      devtoolsPort.onDisconnect.removeListener(disconnectHandler);

      if (this.devtoolsPort !== devtoolsPort) {
        return;
      }

      this.devtoolsPort = undefined;

      if (this.allPortsDisconnected()) {
        this.portsDisconnected(this.tabId);
      }
    };
    devtoolsPort.onMessage.addListener(messageHandler);
    devtoolsPort.onDisconnect.addListener(disconnectHandler);
    this.devtoolsPort = devtoolsPort;
  }
  /**
   * TODO:
   * is it possible that any of these ports are disconnected?
   * e.g. could we call port.postMessage() before the port's disconnectHandler was invoked?
   *  maybe we could manually remove them from the Set if they're disconnected?
   *    i.e. have a try-catch that does this
   *    but we could miss a message in that case, maybe instead we could
   *    wait a few MS and retry? or wait for a reconnect somehow
   */
  private sendContentPacket(packet: Packet) {
    this.contentPorts.forEach((port) => {
      port.postMessage(packet);
    });
  }
  private sendDevtoolsPacket(packet: Packet) {
    this.devtoolsPort?.postMessage(packet);
  }
  private devtoolsPortDisconnected() {
    return !this.devtoolsPort;
  }
  private contentPortsDisconnected() {
    return this.contentPorts.size === 0;
  }
  private allPortsDisconnected() {
    return this.devtoolsPortDisconnected() && this.contentPortsDisconnected();
  }
}
