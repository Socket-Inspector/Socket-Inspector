import type { BrowserContext, JSHandle } from '@playwright/test';
import type { Server } from './server';
import type { CloseOptions, InboundEvent, SocketEnd } from './socketEnd';
import { createWebsocketEndpoint, type WebsocketEndpoint } from './websocketEndpoint';

export type HostPageArgs = {
  context: BrowserContext;
  server: Server;
  onError: (error: Error) => void;
  onSocketEnd: (label: string, socketEnd: SocketEnd) => void;
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
  onSocketEnd,
}: HostPageArgs): Promise<HostPage> {
  const page = await context.newPage();

  page.on('pageerror', (error) => {
    onError(error);
  });

  const urlToClientReceivedEvents = new Map<string, InboundEvent[]>();

  await page.exposeFunction('__onClientSocketEvent', (url: string, event: InboundEvent) => {
    urlToClientReceivedEvents.get(url)!.push(event);
  });

  await page.goto(server.origin);

  const createConnection = async (
    clientSocketJsHandle: JSHandle<WebSocket>,
  ): Promise<WebsocketConnection> => {
    const url = await clientSocketJsHandle.evaluate((clientSocket) => clientSocket.url);
    const { pathname, search } = new URL(url);
    const path = `${pathname}${search}`;

    const clientLabel = `client end of ${path}`;
    const clientReceivedEvents: InboundEvent[] = [];
    
    urlToClientReceivedEvents.set(url, clientReceivedEvents);

    const clientSocketEnd: SocketEnd = {
      receivedEvents: clientReceivedEvents,
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

    onSocketEnd(clientLabel, clientSocketEnd);

    await clientSocketJsHandle.evaluate(async (clientSocket) => {
      await new Promise<void>((resolve, reject) => {
        const onClientSocketEvent = (event: InboundEvent) => {
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

    const serverLabel = `server end of ${path}`;
    const serverSocketEnd = server.getSocketEnd(url);
    onSocketEnd(serverLabel, serverSocketEnd);

    return {
      url,
      client: createWebsocketEndpoint({ label: clientLabel, socketEnd: clientSocketEnd }),
      server: createWebsocketEndpoint({ label: serverLabel, socketEnd: serverSocketEnd }),
    };
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

type PageGlobals = {
  initialSocket: WebSocket;
  __onClientSocketEvent(url: string, event: InboundEvent): void;
};
