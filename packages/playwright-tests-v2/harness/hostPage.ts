import type { BrowserContext, JSHandle } from '@playwright/test';
import { type ClientSocketBridge, installClientSocketBridge } from './clientSocketBridge';
import type { Server } from './server';
import type { SocketEnd } from './socketEnd';
import { createWebsocketEndpoint, type WebsocketEndpoint } from './websocketEndpoint';

export type CreateHostPageArgs = {
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

type PageGlobals = {
  initialSocket: WebSocket;
};

export async function createHostPage({
  context,
  server,
  onError,
  onSocketEnd,
}: CreateHostPageArgs): Promise<HostPage> {
  const page = await context.newPage();

  page.on('pageerror', (error) => {
    onError(error);
  });

  const clientSocketBridge = await installClientSocketBridge(page);

  await page.goto(server.origin);

  const connectionArgs = { clientSocketBridge, server, onSocketEnd };

  const initialClientSocketJsHandle = await page.evaluateHandle(
    () => (globalThis as unknown as PageGlobals).initialSocket,
  );

  let currentConnection = await createConnection({
    ...connectionArgs,
    clientSocketJsHandle: initialClientSocketJsHandle,
  });

  return {
    get connection() {
      return currentConnection;
    },
    async connect() {
      const clientSocketJsHandle = await page.evaluateHandle(
        (url) => new WebSocket(url),
        server.generateUniqueHandshakeUrl(),
      );
      return await createConnection({
        ...connectionArgs,
        clientSocketJsHandle,
      });
    },
    async reload() {
      await page.reload();
      const clientSocketJsHandle = await page.evaluateHandle(
        () => (globalThis as unknown as PageGlobals).initialSocket,
      );
      currentConnection = await createConnection({
        ...connectionArgs,
        clientSocketJsHandle,
      });
    },
  };
}

type ConnectionArgs = {
  clientSocketJsHandle: JSHandle<WebSocket>;
  clientSocketBridge: ClientSocketBridge;
  server: Server;
  onSocketEnd: (label: string, socketEnd: SocketEnd) => void;
};

async function createConnection({
  clientSocketJsHandle,
  clientSocketBridge,
  server,
  onSocketEnd,
}: ConnectionArgs): Promise<WebsocketConnection> {
  const url = await clientSocketJsHandle.evaluate((clientSocket) => clientSocket.url);
  const { pathname, search } = new URL(url);
  const path = `${pathname}${search}`;

  const clientLabel = `client end of ${path}`;
  const clientSocketEnd = await clientSocketBridge.createSocketEnd(url, clientSocketJsHandle);
  onSocketEnd(clientLabel, clientSocketEnd);

  await waitForClientSocketOpen(clientSocketJsHandle);

  const serverLabel = `server end of ${path}`;
  const serverSocketEnd = server.createSocketEnd(url);
  onSocketEnd(serverLabel, serverSocketEnd);

  return {
    url,
    client: createWebsocketEndpoint({
      label: clientLabel,
      socketEnd: clientSocketEnd,
    }),
    server: createWebsocketEndpoint({
      label: serverLabel,
      socketEnd: serverSocketEnd,
    }),
  };
}

async function waitForClientSocketOpen(clientSocketJsHandle: JSHandle<WebSocket>): Promise<void> {
  await clientSocketJsHandle.evaluate(async (clientSocket) => {
    await new Promise<void>((resolve, reject) => {
      const closedError = new Error(`socket at ${clientSocket.url} closed before it opened`);
      if (clientSocket.readyState === WebSocket.OPEN) {
        resolve();
      } else if (clientSocket.readyState === WebSocket.CONNECTING) {
        clientSocket.addEventListener('open', () => {
          resolve();
        });
        clientSocket.addEventListener('close', () => {
          reject(closedError);
        });
      } else {
        reject(closedError);
      }
    });
  });
}
