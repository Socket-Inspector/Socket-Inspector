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
  readonly connection: Connection;
  connect(): Promise<Connection>;
  reload(): Promise<void>;
};

export type Connection = {
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
  let current!: Connection;

  const page = await context.newPage();
  page.on('pageerror', (error) => onError(error));

  async function load(navigate: () => Promise<unknown>) {
    await navigate();
    const socket = await page.evaluateHandle(
      () => (globalThis as unknown as PageGlobals).initialSocket,
    );
    current = await adopt(socket);
  }

  async function adopt(socket: JSHandle<WebSocket>): Promise<Connection> {
    const url = await socket.evaluate((websocket) => websocket.url);
    const label = `client end of ${new URL(url).pathname}`;
    const { endpoint: client, recorder } = createWebsocketEndpoint({
      label,
      transport: {
        send: async (text) => {
          await socket.evaluate((websocket, text) => websocket.send(text), text);
        },
        close: async (options) => {
          const closeWebsocket = (websocket: WebSocket, { code, reason }: CloseOptions) => {
            return websocket.close(code, reason);
          };
          await socket.evaluate(closeWebsocket, options);
        },
      },
      onError,
    });
    urlToClientRecorder.set(url, recorder);

    const [serverEnd] = await Promise.all([
      server.waitForWebsocketEndpoint(url),
      socket.evaluate(async (websocket) => {
        return await new Promise<void>((resolve, reject) => {
          const report = (event: ClientEvent) =>
            (globalThis as unknown as PageGlobals).__clientEvent(websocket.url, event);
          websocket.addEventListener('message', (event) =>
            report({ type: 'message', text: typeof event.data === 'string' ? event.data : null }),
          );
          websocket.addEventListener('close', (event) =>
            report({ type: 'close', code: event.code, reason: event.reason }),
          );
          websocket.addEventListener('error', () => report({ type: 'error' }));

          if (websocket.readyState === WebSocket.OPEN) {
            resolve();
          }
          websocket.addEventListener('open', () => resolve());
          websocket.addEventListener('close', () =>
            reject(new Error(`socket at ${websocket.url} closed before it opened`)),
          );
        });
      }),
    ]);

    return { url, client, server: serverEnd };
  }

  function onClientEvent(url: string, event: ClientEvent) {
    const recorder = urlToClientRecorder.get(url)!;
    if (event.type === 'message') {
      if (event.text === null) {
        onError(new Error(`client end of ${url} received a binary message`));
      } else {
        recorder.recordReceivedMessage(event.text);
      }
    } else if (event.type === 'close') {
      recorder.recordReceivedClose(event);
    } else {
      onError(new Error(`client end of ${url} fired an error event`));
    }
  }

  await page.exposeFunction('__clientEvent', onClientEvent);
  await load(async () => await page.goto(server.origin));

  return {
    get connection() {
      return current;
    },
    async connect() {
      const socket = await page.evaluateHandle((url) => new WebSocket(url), server.newSocketUrl());
      return await adopt(socket);
    },
    async reload() {
      await load(async () => await page.reload());
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
