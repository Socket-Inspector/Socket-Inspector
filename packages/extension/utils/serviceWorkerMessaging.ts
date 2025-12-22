import { browser, Browser } from '#imports';
import { LogFn } from './customLogger';
import { touchLastError } from './helpers';
import { createDebugPacket } from './packetFactory';
import { Packet } from './sharedTypes/sharedTypes';

export type ServiceWorkerConnectorArgs = {
  channelName: string;
  logger?: LogFn;
};

export class ServiceWorkerConnector {
  private channelName: string;
  private onPacketReceived?: (packet: Packet) => any;
  private logger?: LogFn;
  private packetBuffer: Array<Packet> = [];
  private serviceWorkerPort?: Browser.runtime.Port;

  /**
   * Prevents infinite disconnect/reconnect loops
   *
   * This can happen if for some reason there's an exception in the service
   * worker that prevents it from listening for connections
   *
   * This should (hopefully) never happen in the real world, but
   * we'll use this crude detection mechanism in case it does
   */
  private reconnectLoopDetector: InfiniteLoopDetector = new InfiniteLoopDetector({
    maxIterationsPerWindow: 200,
    minWindowDuration: 100,
  });

  /**
   * Simple coalescing flag to avoid scheduling multiple reconnects
   * from overlapping disconnect events. Cleared when the scheduled
   * reconnect runs.
   */
  private isReconnectScheduled = false;

  constructor({ channelName, logger }: ServiceWorkerConnectorArgs) {
    this.channelName = channelName;
    this.logger = logger;
  }

  connect() {
    this.internalConnect();
    return this;
  }

  subscribe(onPacketReceived: (packet: Packet) => any) {
    if (this.packetBuffer.length > 0) {
      for (let packet of this.packetBuffer) {
        onPacketReceived(packet);
      }
      this.packetBuffer = [];
    }
    this.onPacketReceived = onPacketReceived;
    return this;
  }

  sendPacket(packet: Packet) {
    if (!this.serviceWorkerPort) {
      return;
    }

    try {
      this.serviceWorkerPort!.postMessage(packet);
    } catch {
      /**
       * I believe postMessage() could throw if
       *  1. ESW disconnects
       *  2. sendPacket() is called BEFORE the disconnectHandler() is triggered
       */
      this.internalConnect();
      try {
        this.serviceWorkerPort!.postMessage(packet);
      } catch {}
    }
  }

  sendDebugPacket(message: string) {
    this.sendPacket(createDebugPacket(message));
  }

  private internalConnect() {
    const port = browser.runtime.connect({
      name: this.channelName,
    });

    const messageHandler = (message: any) => {
      if (this.serviceWorkerPort !== port) {
        // TODO: does this cause relay deletion?
        // maybe, but this doesn't seem like an issue because the relay will be re-created if another connect() is called
        port.disconnect();
        return;
      }
      const packet = message as Packet;
      if (this.onPacketReceived) {
        this.onPacketReceived(packet);
      } else {
        this.packetBuffer.push(packet);
      }
    };

    const disconnectHandler = () => {
      touchLastError();

      port.onMessage.removeListener(messageHandler);
      port.onDisconnect.removeListener(disconnectHandler);

      if (this.serviceWorkerPort !== port) {
        return;
      }

      const { loopDetected } = this.reconnectLoopDetector.trackIteration();
      if (loopDetected) {
        this.serviceWorkerPort = undefined;
        return;
      }

      if (this.isReconnectScheduled) {
        return;
      }

      this.isReconnectScheduled = true;

      // Schedule reconnect on a microtask to avoid tight synchronous loops
      Promise.resolve().then(() => {
        this.isReconnectScheduled = false;
        this.internalConnect();
      });
    };

    port.onMessage.addListener(messageHandler);
    port.onDisconnect.addListener(disconnectHandler);

    this.serviceWorkerPort = port;
  }
}

type InfiniteLoopDetectorArgs = {
  maxIterationsPerWindow: number;
  minWindowDuration: number;
};

class InfiniteLoopDetector {
  private maxIterationsPerWindow: number;

  // 'grace period' -> gives the ESW some time to start
  // before detecting any infinite loops
  private minWindowDuration: number;

  private iterationWindow = {
    startTime: 0,
    iterations: 0,
  };

  constructor({ maxIterationsPerWindow, minWindowDuration }: InfiniteLoopDetectorArgs) {
    this.maxIterationsPerWindow = maxIterationsPerWindow;
    this.minWindowDuration = minWindowDuration;
  }

  public trackIteration(): { loopDetected: boolean } {
    const windowExpired = this.windowDurationMs() > 1000;
    if (windowExpired) {
      this.iterationWindow = { startTime: Date.now(), iterations: 1 };
      return { loopDetected: false };
    }
    this.iterationWindow.iterations++;
    return { loopDetected: this.detectLoop() };
  }

  public getDebugInfo() {
    const debugInfo = {
      windowDuration: this.windowDurationMs(),
      iterations: this.iterationWindow.iterations,
    };
    return JSON.stringify(debugInfo);
  }

  private windowDurationMs() {
    return Date.now() - this.iterationWindow.startTime;
  }

  private detectLoop() {
    return (
      this.iterationWindow.iterations > this.maxIterationsPerWindow &&
      this.windowDurationMs() > this.minWindowDuration
    );
  }
}
