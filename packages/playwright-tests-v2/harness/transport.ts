import type { BrowserContext, JSHandle, Page } from '@playwright/test';
import { type ClientSocketBridge, installClientSocketBridge } from './clientSocketBridge';
import { type Server, startServer } from './server';
import type { SocketEnd } from './socketEnd';

export type StartTransportArgs = {
  context: BrowserContext;
  onError: (error: Error) => void;
};

export type Transport = {
  openPage(): Promise<TransportPage>;
  stop(): Promise<void>;
};

export type TransportPage = {
  /** Pair for the socket the page opens on load. Replaced on each `refreshPage()`. */
  readonly initialPair: SocketPair;
  /** Opens a new socket from the page (alongside the initial one) and returns its pair. */
  addConnection(): Promise<SocketPair>;
  /** Reloads the page and replaces `initialPair` with the pair for the reloaded page's socket. */
  refreshPage(): Promise<void>;
};

export type SocketPair = {
  readonly url: string;
  readonly client: SocketEnd;
  readonly server: SocketEnd;
};

type PageGlobals = {
  initialSocket: WebSocket;
};

export async function startTransport({ context, onError }: StartTransportArgs): Promise<Transport> {
  const server = await startServer({ onError });
  return {
    async openPage() {
      return await openTransportPage({ context, server, onError });
    },
    async stop() {
      await server.stop();
    },
  };
}

type OpenTransportPageArgs = {
  context: BrowserContext;
  server: Server;
  onError: (error: Error) => void;
};

async function openTransportPage({
  context,
  server,
  onError,
}: OpenTransportPageArgs): Promise<TransportPage> {
  const page = await context.newPage();

  page.on('pageerror', (error) => {
    onError(error);
  });

  const clientSocketBridge = await installClientSocketBridge(page);

  await page.goto(server.origin);

  const initialClientSocketJsHandle = await getInitialClientSocketJsHandle(page);

  let initialPair = await createSocketPair({
    clientSocketJsHandle: initialClientSocketJsHandle,
    clientSocketBridge,
    server,
  });

  return {
    get initialPair() {
      return initialPair;
    },
    async addConnection() {
      const clientSocketJsHandle = await page.evaluateHandle(
        (url) => new WebSocket(url),
        server.generateUniqueHandshakeUrl(),
      );
      return await createSocketPair({ clientSocketJsHandle, clientSocketBridge, server });
    },
    async refreshPage() {
      await page.reload();
      const clientSocketJsHandle = await getInitialClientSocketJsHandle(page);
      initialPair = await createSocketPair({ clientSocketJsHandle, clientSocketBridge, server });
    },
  };
}

async function getInitialClientSocketJsHandle(page: Page): Promise<JSHandle<WebSocket>> {
  return await page.evaluateHandle(() => (globalThis as unknown as PageGlobals).initialSocket);
}

type CreateSocketPairArgs = {
  clientSocketJsHandle: JSHandle<WebSocket>;
  clientSocketBridge: ClientSocketBridge;
  server: Server;
};

async function createSocketPair({
  clientSocketJsHandle,
  clientSocketBridge,
  server,
}: CreateSocketPairArgs): Promise<SocketPair> {
  const url = await clientSocketJsHandle.evaluate((clientSocket) => clientSocket.url);
  const client = await clientSocketBridge.createSocketEnd(url, clientSocketJsHandle);
  await waitForClientSocketOpen(clientSocketJsHandle);
  return {
    url,
    client,
    server: server.createSocketEnd(url),
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
