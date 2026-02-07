import { LogFn } from './customLogger';
import { createDebugPacket } from './packetFactory';
import { Packet } from './sharedTypes/sharedTypes';

export type WindowScriptName = 'ISOLATED_WORLD' | 'MAIN_WORLD';

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
  public readonly location: WindowScriptName;
  private readonly window: Window;
  private readonly logger?: LogFn;
  private onPacketReceived?: (packet: Packet) => any;

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

      // this.logger?.(`received window message from other side: ${windowMessage.packet.type}`)

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
