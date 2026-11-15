import type { BrowserContext, JSHandle } from '@playwright/test';
import type { Server } from './server';
import {
  type CloseOptions,
  createWebsocketEndpoint,
  type EndpointRecorder,
  type WebsocketEndpoint,
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

  const urlToClientRecorder = new Map<string, EndpointRecorder>();

  await page.exposeFunction('__recordClientSocketEvent', (url: string, event: ClientEvent) => {
    const clientRecorder = urlToClientRecorder.get(url)!;
    if (event.type === 'text') {
      clientRecorder.recordIncomingMessage(event.text);
    } else if (event.type === 'close') {
      clientRecorder.recordIncomingCloseFrame(event);
    } else if (event.type === 'binary') {
      onError(new Error(`client end of ${url} received a binary message`));
    } else {
      onError(new Error(`client end of ${url} fired an error event`));
    }
  });

  await page.goto(server.origin);

  const createConnection = async (
    clientSocketHandle: JSHandle<WebSocket>,
  ): Promise<WebsocketConnection> => {
    const url = await clientSocketHandle.evaluate((clientSocket) => clientSocket.url);

    const clientLabel = `client end of ${new URL(url).pathname}`;
    const clientEndpoint = createWebsocketEndpoint({
      label: clientLabel,
      transport: {
        send: async (text) => {
          await clientSocketHandle.evaluate((clientSocket, message) => {
            clientSocket.send(message);
          }, text);
        },
        close: async (options) => {
          const sendCloseFrame = (clientSocket: WebSocket, { code, reason }: CloseOptions) => {
            clientSocket.close(code, reason);
          };
          await clientSocketHandle.evaluate(sendCloseFrame, options);
        },
      },
      onError,
    });

    urlToClientRecorder.set(url, clientEndpoint.recorder);

    const [serverEndpoint] = await Promise.all([
      server.waitForClientConnection(url),
      clientSocketHandle.evaluate(async (clientSocket) => {
        await new Promise<void>((resolve, reject) => {
          const reportEvent = (event: ClientEvent) => {
            (globalThis as unknown as PageGlobals).__recordClientSocketEvent(
              clientSocket.url,
              event,
            );
          };
          clientSocket.addEventListener('message', (event) => {
            reportEvent(
              typeof event.data === 'string'
                ? { type: 'text', text: event.data }
                : { type: 'binary' },
            );
          });
          clientSocket.addEventListener('close', (event) => {
            reportEvent({ type: 'close', code: event.code, reason: event.reason });
          });
          clientSocket.addEventListener('error', () => {
            reportEvent({ type: 'error' });
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
      }),
    ]);

    return { url, client: clientEndpoint.endpoint, server: serverEndpoint };
  };

  const initialClientSocketHandle = await page.evaluateHandle(
    () => (globalThis as unknown as PageGlobals).initialSocket,
  );

  let currentConnection = await createConnection(initialClientSocketHandle);

  return {
    get connection() {
      return currentConnection;
    },
    async connect() {
      const clientSocketHandle = await page.evaluateHandle(
        (url) => new WebSocket(url),
        server.generateUniqueHandshakeUrl(),
      );
      return await createConnection(clientSocketHandle);
    },
    async reload() {
      await page.reload();
      const clientSocketHandle = await page.evaluateHandle(
        () => (globalThis as unknown as PageGlobals).initialSocket,
      );
      currentConnection = await createConnection(clientSocketHandle);
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
  __recordClientSocketEvent(url: string, event: ClientEvent): void;
};
