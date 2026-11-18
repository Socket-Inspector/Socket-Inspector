import type { BrowserContext, JSHandle, Page } from '@playwright/test';
import { type ClientSocketBridge, installClientSocketBridge } from './clientSocketBridge';
import { type Server, startServer } from './server';
import type { InboundEvent, SocketEnd } from './socketEnd';

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
  /** Opens a new socket from the page whose handshake the server rejects. Resolves on its close. */
  addRejectedConnection(): Promise<RejectedSocket>;
  /** Reloads the page and replaces `initialPair` with the pair for the reloaded page's socket. */
  refreshPage(): Promise<void>;
};

export type SocketPair = {
  readonly url: string;
  readonly client: SocketEnd;
  readonly server: SocketEnd;
};

export type RejectedSocket = {
  readonly url: string;
  /** Every event the client received, ending with its close. */
  readonly clientEvents: readonly InboundEvent[];
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
    async addRejectedConnection() {
      const url = server.generateRejectedHandshakeUrl();
      const clientEvents = await recordRejectedClientSocketEvents(page, url);
      return { url, clientEvents };
    },
    async refreshPage() {
      await page.reload();
      const clientSocketJsHandle = await getInitialClientSocketJsHandle(page);
      initialPair = await createSocketPair({ clientSocketJsHandle, clientSocketBridge, server });
    },
  };
}

/**
 * Creates the socket and attaches its listeners in a single evaluate, since the server rejects the
 * handshake immediately and listeners attached by a later evaluate could miss the events.
 */
async function recordRejectedClientSocketEvents(page: Page, url: string): Promise<InboundEvent[]> {
  return await page.evaluate(async (socketUrl) => {
    const clientSocket = new WebSocket(socketUrl);
    const events: InboundEvent[] = [];
    clientSocket.addEventListener('message', (event) => {
      events.push(
        typeof event.data === 'string' ? { type: 'text', text: event.data } : { type: 'binary' },
      );
    });
    clientSocket.addEventListener('error', () => {
      events.push({ type: 'error' });
    });
    await new Promise<void>((resolve, reject) => {
      clientSocket.addEventListener('open', () => {
        reject(new Error(`socket at ${socketUrl} opened even though its handshake was rejected`));
      });
      clientSocket.addEventListener('close', (event) => {
        events.push({ type: 'close', code: event.code, reason: event.reason });
        resolve();
      });
    });
    return events;
  }, url);
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
