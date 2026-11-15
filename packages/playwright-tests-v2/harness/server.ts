import { randomUUID } from 'node:crypto';
import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  createWebsocketEndpoint,
  type CloseOptions,
  type WebsocketEndpoint,
} from './websocketEndpoint';

export type StartServerArgs = {
  onError: (error: Error) => void;
};

export type Server = {
  readonly origin: string;
  generateUniqueHandshakeUrl(): string;
  getClientConnection(url: string): WebsocketEndpoint;
  stop(): Promise<void>;
};

export async function startServer({ onError }: StartServerArgs): Promise<Server> {
  const httpServer = createServer((_request, response) => {
    response
      .writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      .end(hostPageHtml());
  });

  const pathToWebsocket = new Map<string, WebSocket>();
  const websocketServer = new WebSocketServer({ server: httpServer });

  websocketServer.on('connection', (websocket, request) => {
    const path = request.url ?? '/';
    pathToWebsocket.set(path, websocket);
  });

  websocketServer.on('error', (error) => {
    onError(error);
  });

  const { host, port } = await openServer(httpServer);

  return {
    origin: `http://${host}:${port}`,
    generateUniqueHandshakeUrl: () => `ws://${host}:${port}/${randomUUID()}`,
    getClientConnection(url: string) {
      const { pathname, search } = new URL(url);
      const path = `${pathname}${search}`;
      const websocket = pathToWebsocket.get(path);
      if (!websocket) {
        throw new Error(`server has no connection for ${path}`);
      }
      return createServerEndpoint({ websocket, path, onError });
    },
    async stop() {
      await closeWebsocketServer(websocketServer);
      await closeHttpServer(httpServer);
    },
  };
}

async function openServer(httpServer: HttpServer): Promise<{ host: string; port: number }> {
  const LOOPBACK_HOST = '127.0.0.1';
  const FREE_PORT = 0;
  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.once('listening', resolve);
    httpServer.listen(FREE_PORT, LOOPBACK_HOST);
  });
  return {
    host: LOOPBACK_HOST,
    port: (httpServer.address() as AddressInfo).port,
  };
}

async function closeWebsocketServer(websocketServer: WebSocketServer): Promise<void> {
  for (const client of websocketServer.clients) {
    client.terminate();
  }
  return new Promise<void>((resolve) => {
    websocketServer.close(() => {
      resolve();
    });
  });
}

async function closeHttpServer(httpServer: HttpServer): Promise<void> {
  httpServer.closeAllConnections();
  return new Promise<void>((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

type CreateServerEndpointArgs = {
  websocket: WebSocket;
  path: string;
  onError: (error: Error) => void;
};

function createServerEndpoint({
  websocket,
  path,
  onError,
}: CreateServerEndpointArgs): WebsocketEndpoint {
  const label = `server end of ${path}`;
  const serverEndpoint = createWebsocketEndpoint({
    label,
    transport: {
      async send(text: string) {
        return new Promise<void>((resolve, reject) => {
          websocket.send(text, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      },
      async close({ code, reason }: CloseOptions) {
        websocket.close(code, reason);
      },
    },
    onError,
  });
  websocket.on('message', (data, isBinary) => {
    if (isBinary) {
      onError(new Error(`${label} received a binary message; only text is supported`));
      return;
    }
    // ws always delivers text frames as a single Buffer, regardless of binaryType
    serverEndpoint.recorder.recordIncomingMessage((data as Buffer).toString());
  });
  websocket.on('close', (code, reason) => {
    serverEndpoint.recorder.recordIncomingCloseFrame({ code, reason: reason.toString() });
  });
  websocket.on('error', (error) => {
    onError(error);
  });
  return serverEndpoint.endpoint;
}

function hostPageHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Socket Inspector host page</title>
    <link rel="icon" href="data:," />
    <script>
      window.initialSocket = new WebSocket('ws://' + location.host + '/' + crypto.randomUUID());
    </script>
  </head>
  <body></body>
</html>`;
}
