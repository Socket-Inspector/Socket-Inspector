import type { JSHandle, Page } from '@playwright/test';
import type { CloseOptions, InboundEvent, SocketEnd } from './socketEnd';

export type ClientSocketBridge = {
  getSocketEnd(url: string, clientSocketJsHandle: JSHandle<WebSocket>): Promise<SocketEnd>;
};

type PageGlobals = {
  SEND_EVENT_TO_NODE(url: string, event: InboundEvent): void;
};

export async function installClientSocketBridge(page: Page): Promise<ClientSocketBridge> {
  const urlToReceivedEvents = new Map<string, InboundEvent[]>();

  await page.exposeFunction('SEND_EVENT_TO_NODE', (url: string, event: InboundEvent) => {
    urlToReceivedEvents.get(url)!.push(event);
  });

  return {
    async getSocketEnd(url: string, clientSocketJsHandle: JSHandle<WebSocket>) {
      const receivedEvents: InboundEvent[] = [];
      urlToReceivedEvents.set(url, receivedEvents);
      await forwardClientSocketEvents(clientSocketJsHandle);
      return {
        receivedEvents,
        async send(text: string) {
          await clientSocketJsHandle.evaluate((clientSocket, message) => {
            clientSocket.send(message);
          }, text);
        },
        async close(options: CloseOptions) {
          await clientSocketJsHandle.evaluate((clientSocket, { code, reason }: CloseOptions) => {
            clientSocket.close(code, reason);
          }, options);
        },
      };
    },
  };
}

async function forwardClientSocketEvents(clientSocketJsHandle: JSHandle<WebSocket>): Promise<void> {
  await clientSocketJsHandle.evaluate((clientSocket) => {
    const sendEventToNode = (event: InboundEvent) => {
      (globalThis as unknown as PageGlobals).SEND_EVENT_TO_NODE(clientSocket.url, event);
    };
    clientSocket.addEventListener('message', (event) => {
      sendEventToNode(
        typeof event.data === 'string' ? { type: 'text', text: event.data } : { type: 'binary' },
      );
    });
    clientSocket.addEventListener('close', (event) => {
      sendEventToNode({ type: 'close', code: event.code, reason: event.reason });
    });
    clientSocket.addEventListener('error', () => {
      sendEventToNode({ type: 'error' });
    });
  });
}
