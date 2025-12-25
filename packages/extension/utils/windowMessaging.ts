import { LogFn } from './customLogger';
import { createDebugPacket } from './packetFactory';
import { Packet } from './sharedTypes/sharedTypes';

export type WindowScriptName = 'CONTENT_SCRIPT' | 'INJECTED_SCRIPT';

export type WindowMessage = {
  socketExtensionValidationKey: 'SOCKET_EXTENSION_VALIDATION_KEY';
  messageSource: WindowScriptName;
  packet: Packet;
};

export type WindowConnectorArgs = {
  window: Window;
  location: WindowScriptName;
  logger?: LogFn;
};

export class WindowConnector {
  private window: Window;
  private location: WindowScriptName;
  private onPacketReceived?: (packet: Packet) => any;
  private logger?: LogFn;

  constructor({ window, location, logger }: WindowConnectorArgs) {
    this.window = window;
    this.location = location;
    this.logger = logger;
  }

  connect() {
    this.window.addEventListener('message', (event) => {
      if (event.source !== this.window || event.origin !== this.window.location.origin) {
        return;
      }

      if (!this.isWindowMessage(event.data)) {
        return;
      }

      const windowMessage = event.data;

      if (this.isOwnMessage(windowMessage)) {
        return;
      }

      if (!windowMessage.packet) {
        return;
      }

      if (this.onPacketReceived) {
        this.onPacketReceived(windowMessage.packet);
      }
    });
    return this;
  }

  subscribe(onPacketReceived: (packet: Packet) => any) {
    this.onPacketReceived = onPacketReceived;
    return this;
  }

  sendPacket(packet: Packet) {
    const message: WindowMessage = {
      socketExtensionValidationKey: 'SOCKET_EXTENSION_VALIDATION_KEY',
      messageSource: this.location,
      packet,
    };
    this.window.postMessage(message, this.window.origin);
  }

  sendDebugPacket(message: string) {
    this.sendPacket(createDebugPacket(message));
  }

  private isWindowMessage(data: any): data is WindowMessage {
    return (
      Boolean(data) &&
      typeof data === 'object' &&
      data.socketExtensionValidationKey === 'SOCKET_EXTENSION_VALIDATION_KEY'
    );
  }

  private isOwnMessage(windowMessage: WindowMessage): boolean {
    return windowMessage.messageSource === this.location;
  }
}

export type InjectedScriptWindowConnectorArgs = {
  window: Window;
  logger?: LogFn;
};

export class InjectedScriptWindowConnector {
  private logger?: LogFn;
  private windowConnector: WindowConnector;
  private injectedScriptReady = false;
  private packetBuffer: Array<Packet> = [];

  constructor({ window, logger }: InjectedScriptWindowConnectorArgs) {
    this.logger = logger;
    this.windowConnector = new WindowConnector({
      window,
      location: 'CONTENT_SCRIPT',
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
        this.injectedScriptReady = true;
        this.sendBufferedPackets();
        return;
      }
      onPacketReceived(packet);
    });
    return this;
  }

  sendPacket(packet: Packet) {
    if (!this.injectedScriptReady) {
      this.packetBuffer.push(packet);
      return;
    }
    this.windowConnector.sendPacket(packet);
  }

  sendDebugPacket(message: string) {
    this.sendPacket(createDebugPacket(message));
  }

  private sendBufferedPackets() {
    for (let packet of this.packetBuffer) {
      this.sendPacket(packet);
    }
    this.packetBuffer = [];
  }
}
