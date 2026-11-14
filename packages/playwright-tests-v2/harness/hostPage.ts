import type { BrowserContext, JSHandle } from '@playwright/test';
import type { Server } from './server';
import {
  type CloseOptions,
  createWebsocketEndpoint,
  type EndpointRecorder,
  type WebsocketEndpoint,
} from './websocketEndpoint';

export type OpenHostPageArgs = {
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
}: OpenHostPageArgs): Promise<HostPage> {
  const urlToClientRecorder = new Map<string, EndpointRecorder>();
  const page = await context.newPage();

  page.on('pageerror', (error) => onError(error));

  await page.exposeFunction('__clientEvent', (url: string, event: ClientEvent) => {
    const recorder = urlToClientRecorder.get(url)!;
    if (event.type === 'message') {
      if (event.text === null) {
        onError(new Error(`client end of ${url} received a binary message`));
      } else {
        recorder.recordReceivedMessage(event.text);
      }
    } else if (event.type === 'close') {
      recorder.recordReceivedCloseFrame(event);
    } else {
      onError(new Error(`client end of ${url} fired an error event`));
    }
  });

  await page.goto(server.origin);

  const adopt = async (clientSocketHandle: JSHandle<WebSocket>): Promise<WebsocketConnection> => {
    const url = await clientSocketHandle.evaluate((clientSocket) => clientSocket.url);

    const clientLabel = `client end of ${new URL(url).pathname}`;
    const clientEndpoint = createWebsocketEndpoint({
      label: clientLabel,
      transport: {
        send: async (text) => {
          await clientSocketHandle.evaluate((clientSocket, text) => clientSocket.send(text), text);
        },
        close: async (options) => {
          const closeWebsocket = (clientSocket: WebSocket, options: CloseOptions) => {
            const { code, reason } = options;
            return clientSocket.close(code, reason);
          };
          await clientSocketHandle.evaluate(closeWebsocket, options);
        },
      },
      onError,
    });

    urlToClientRecorder.set(url, clientEndpoint.recorder);

    const [serverEndpoint] = await Promise.all([
      server.waitForWebsocketEndpoint(url),
      clientSocketHandle.evaluate(async (clientSocket) => {
        return await new Promise<void>((resolve, reject) => {
          const reportEvent = (event: ClientEvent) => {
            return (globalThis as unknown as PageGlobals).__clientEvent(clientSocket.url, event);
          };
          clientSocket.addEventListener('message', (event) =>
            reportEvent({
              type: 'message',
              text: typeof event.data === 'string' ? event.data : null,
            }),
          );
          clientSocket.addEventListener('close', (event) =>
            reportEvent({ type: 'close', code: event.code, reason: event.reason }),
          );
          clientSocket.addEventListener('error', () => reportEvent({ type: 'error' }));
          if (clientSocket.readyState === WebSocket.OPEN) {
            resolve();
          }
          clientSocket.addEventListener('open', () => resolve());
          clientSocket.addEventListener('close', () =>
            reject(new Error(`socket at ${clientSocket.url} closed before it opened`)),
          );
        });
      }),
    ]);

    return { url, client: clientEndpoint.endpoint, server: serverEndpoint };
  };

  const initialSocket = await page.evaluateHandle(
    () => (globalThis as unknown as PageGlobals).initialSocket,
  );

  let current = await adopt(initialSocket);

  return {
    get connection() {
      return current;
    },
    async connect() {
      const clientSocketHandle = await page.evaluateHandle(
        (url) => new WebSocket(url),
        server.newSocketUrl(),
      );
      return await adopt(clientSocketHandle);
    },
    async reload() {
      await page.reload();
      const clientSocketHandle = await page.evaluateHandle(
        () => (globalThis as unknown as PageGlobals).initialSocket,
      );
      current = await adopt(clientSocketHandle);
    },
  };
}

type ClientEvent =
  | { type: 'message'; text: string | null }
  | { type: 'close'; code: number; reason: string }
  | { type: 'error' };

type PageGlobals = {
  initialSocket: WebSocket;
  __clientEvent(url: string, event: ClientEvent): void;
};
