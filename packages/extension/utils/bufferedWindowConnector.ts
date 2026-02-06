import { LogFn } from "./customLogger";
import { Packet } from "./sharedTypes/sharedTypes";
import { WindowConnector, WindowScriptName } from "./windowMessaging";

export type BufferedWindowConnectorArgs = {
  window: Window;
  location: WindowScriptName;
  logger?: LogFn;
};

export class BufferedWindowConnector {
  private location: WindowScriptName;
  private logger?: LogFn;
  private windowConnector: WindowConnector;
  private otherSideReady = false;
  private packetBuffer: Array<Packet> = [];

  constructor({ window, location, logger }: BufferedWindowConnectorArgs) {
    this.logger = logger;
    this.location = location;
    this.windowConnector = new WindowConnector({
      window,
      location,
      logger,
    });
  }

  connect() {
    this.windowConnector.connect();
    return this;
  }

  subscribe(onPacketReceived: (packet: Packet) => any) {
    this.windowConnector.subscribe((packet) => {
      if (packet.type === 'ConnectorReadyPacket') {
        this.otherSideReady = true;
        this.sendBufferedPackets();
        return;
      }
      onPacketReceived(packet);
    });
  }

  sendPacket(packet: Packet) {
    if (!this.otherSideReady) {
      this.packetBuffer.push(packet);
      return;
    }
    this.windowConnector.sendPacket(packet);
  }

  private sendBufferedPackets() {
    for (let packet of this.packetBuffer) {
      this.sendPacket(packet);
    }
    this.packetBuffer = [];
  }
}