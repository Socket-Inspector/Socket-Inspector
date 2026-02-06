import { LogFn } from './customLogger';
import { Packet } from './sharedTypes/sharedTypes';
import { WindowConnector, WindowScriptName } from './windowMessaging';

export type BufferedWindowConnectorArgs = {
  window: Window;
  location: WindowScriptName;
  logger?: LogFn;
};

/**
 * TODO:
 * make sure no infinite loops
 * would this be easier if the extension just created 2 global variables on the window?
 * do we need to enforce a certain ordering?
 * is it possible the main script gets data from ESW before socket patched? is this an issue?
 */

export class BufferedWindowConnector {
  private otherSideReady = false;
  private packetBuffer: Array<Packet> = [];
  private windowConnector: WindowConnector;

  constructor({ window, location, logger }: BufferedWindowConnectorArgs) {
    this.windowConnector = new WindowConnector({ window, location, logger });
  }

  connect() {
    this.windowConnector.connect();
    return this;
  }

  subscribe(onPacketReceived: (packet: Packet) => any) {
    this.windowConnector.subscribe((packet) => {
      if (packet.type === 'ConnectorReadyPacket' && !this.otherSideReady) {
        this.otherSideReady = true;
        this.sendReadyPacket();
        this.sendBufferedPackets();
        return;
      }
      onPacketReceived(packet);
    });

    this.sendReadyPacket();
  }

  sendPacket(packet: Packet) {
    if (!this.otherSideReady) {
      this.packetBuffer.push(packet);
      return;
    }
    this.windowConnector.sendPacket(packet);
  }

  private sendReadyPacket() {
    this.windowConnector.sendPacket({ type: 'ConnectorReadyPacket' });
  }

  private sendBufferedPackets() {
    for (let packet of this.packetBuffer) {
      this.sendPacket(packet);
    }
    this.packetBuffer = [];
  }
}
