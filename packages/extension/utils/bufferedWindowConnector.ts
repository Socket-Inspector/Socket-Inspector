import { LogFn } from './customLogger';
import { Packet } from './sharedTypes/sharedTypes';
import { WindowConnector, WindowScriptName } from './windowMessaging';

export type BufferedWindowConnectorArgs = {
  window: Window;
  location: WindowScriptName;
  logger?: LogFn;
};

// TODO: do we really need all this complexity?
//       both scripts run before the host page, meaning socket cannot be patched until after both scripts are run

export class BufferedWindowConnector {
  private otherSideReady = false;
  private packetBuffer: Array<Packet> = [];
  private windowConnector: WindowConnector;
  private logger?: LogFn;

  constructor({ window, location, logger }: BufferedWindowConnectorArgs) {
    this.logger = logger;
    this.windowConnector = new WindowConnector({ window, location, logger });
  }

  connect() {
    this.windowConnector.connect();
    return this;
  }

  subscribe(onPacketReceived: (packet: Packet) => any) {
    this.windowConnector.subscribe((packet) => {
      if (packet.type === 'ConnectorReadyPacket' && !this.otherSideReady) {
        this.logger?.(`Other side is ready, received: ${packet.type}`);
        this.otherSideReady = true;
        // this.logger?.(`Other side is ready, sending ready packet`);
        // this.sendReadyPacket();
        this.sendBufferedPackets();
        return;
      }
      onPacketReceived(packet);
    });

    this.logger?.(`subscribed, sending ready packet`);
    this.sendReadyPacket();
  }

  sendPacket(packet: Packet) {
    if (!this.otherSideReady) {
      this.logger?.(`buffering packet: ${packet.type}`);
      this.packetBuffer.push(packet);
      return;
    }
    this.logger?.(`sending packet: ${packet.type}`);
    this.windowConnector.sendPacket(packet);
  }

  private sendReadyPacket() {
    this.windowConnector.sendPacket({ type: 'ConnectorReadyPacket' });
  }

  private sendBufferedPackets() {
    this.logger?.(`sending buffered packets`);
    for (let packet of this.packetBuffer) {
      this.sendPacket(packet);
    }
    this.packetBuffer = [];
  }
}
