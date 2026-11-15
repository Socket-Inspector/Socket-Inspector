import type { BrowserContext, JSHandle } from '@playwright/test';
import type { Server } from './server';
import {
  type CloseOptions,
  createWebsocketEndpoint,
  type WebsocketEndpoint,
  type WebsocketHandle,
  type WebsocketHandleListeners,
} from './websocketEndpoint';

export type HostPageDependencies = {
  context: BrowserContext;
  server: Server;
  onError: (error: Error) => void;
};

export type HostPage = {
  readonly connection: WebsocketConnection;
  connect(): Promise<WebsocketConnection>;
  reload(): Promise<void>;
};

export type WebsocketConnection = {
  readonly url: string;
  readonly client: WebsocketEndpoint;
  readonly server: WebsocketEndpoint;
};

export async function openHostPage({
  context,
  server,
  onError,
}: HostPageDependencies): Promise<HostPage> {
  const page = await context.newPage();

  page.on('pageerror', (error) => {
    onError(error);
  });

  const urlToClientListeners = new Map<string, WebsocketHandleListeners>();

  await page.exposeFunction('__onClientSocketEvent', (url: string, event: ClientEvent) => {
    const listeners = urlToClientListeners.get(url)!;
    if (event.type === 'text') {
      listeners.onMessage(event.text);
    } else if (event.type === 'close') {
      listeners.onClose({ code: event.code, reason: event.reason });
    } else if (event.type === 'binary') {
      onError(new Error(`client end of ${url} received a binary message`));
    } else {
      onError(new Error(`client end of ${url} fired an error event`));
    }
  });

  await page.goto(server.origin);

  const createConnection = async (
    clientSocketJsHandle: JSHandle<WebSocket>,
  ): Promise<WebsocketConnection> => {
    const url = await clientSocketJsHandle.evaluate((clientSocket) => clientSocket.url);
    const { pathname, search } = new URL(url);
    const path = `${pathname}${search}`;

    const clientHandle: WebsocketHandle = {
      async send(text) {
        await clientSocketJsHandle.evaluate((clientSocket, message) => {
          clientSocket.send(message);
        }, text);
      },
      async close(options) {
        await clientSocketJsHandle.evaluate((clientSocket, { code, reason }: CloseOptions) => {
          clientSocket.close(code, reason);
        }, options);
      },
      subscribe(listeners) {
        urlToClientListeners.set(url, listeners);
      },
    };

    const clientEndpoint = createWebsocketEndpoint({
      label: `client end of ${path}`,
      handle: clientHandle,
      onError,
    });

    await clientSocketJsHandle.evaluate(async (clientSocket) => {
      await new Promise<void>((resolve, reject) => {
        const onClientSocketEvent = (event: ClientEvent) => {
          (globalThis as unknown as PageGlobals).__onClientSocketEvent(clientSocket.url, event);
        };
        clientSocket.addEventListener('message', (event) => {
          onClientSocketEvent(
            typeof event.data === 'string'
              ? { type: 'text', text: event.data }
              : { type: 'binary' },
          );
        });
        clientSocket.addEventListener('close', (event) => {
          onClientSocketEvent({ type: 'close', code: event.code, reason: event.reason });
        });
        clientSocket.addEventListener('error', () => {
          onClientSocketEvent({ type: 'error' });
        });
        if (clientSocket.readyState === WebSocket.OPEN) {
          resolve();
        }
        clientSocket.addEventListener('open', () => {
          resolve();
        });
        clientSocket.addEventListener('close', () => {
          reject(new Error(`socket at ${clientSocket.url} closed before it opened`));
        });
      });
    });

    const serverEndpoint = createWebsocketEndpoint({
      label: `server end of ${path}`,
      handle: server.getWebsocketHandle(url),
      onError,
    });

    return { url, client: clientEndpoint, server: serverEndpoint };
  };

  const initialClientSocketJsHandle = await page.evaluateHandle(
    () => (globalThis as unknown as PageGlobals).initialSocket,
  );

  let currentConnection = await createConnection(initialClientSocketJsHandle);

  return {
    get connection() {
      return currentConnection;
    },
    async connect() {
      const clientSocketJsHandle = await page.evaluateHandle(
        (url) => new WebSocket(url),
        server.generateUniqueHandshakeUrl(),
      );
      return await createConnection(clientSocketJsHandle);
    },
    async reload() {
      await page.reload();
      const clientSocketJsHandle = await page.evaluateHandle(
        () => (globalThis as unknown as PageGlobals).initialSocket,
      );
      currentConnection = await createConnection(clientSocketJsHandle);
    },
  };
}

type ClientEvent =
  | { type: 'text'; text: string }
  | { type: 'binary' }
  | { type: 'close'; code: number; reason: string }
  | { type: 'error' };

type PageGlobals = {
  initialSocket: WebSocket;
  __onClientSocketEvent(url: string, event: ClientEvent): void;
};
