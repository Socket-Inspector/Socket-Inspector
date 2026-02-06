import { LogFn } from './customLogger';
import { Packet } from './sharedTypes/sharedTypes';
import { WindowConnector, WindowScriptName } from './windowMessaging';

export type BufferedWindowConnectorArgs = {
  window: Window;
  location: WindowScriptName;
  logger?: LogFn;
};

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
