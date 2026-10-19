import { createServer, type Server } from 'http';
import { once } from 'events';
import { readFile } from 'fs/promises';
import type { AddressInfo } from 'net';
import { WebSocketServer } from 'ws';

export async function startHarnessServer() {
  const server = createServer();
  const wss = new WebSocketServer({ server });
  await serveIndexHtml(server);
  await startServer(server);

  return {
    stop: async () => {
      await stopServer(server, wss);
    },
  };
}

async function serveIndexHtml(server: Server): Promise<void> {
  const indexHtmlPath = new URL('./index.html', import.meta.url);
  const indexHtml = await readFile(indexHtmlPath, 'utf-8');

  server.on('request', (request, response) => {
    if (request.url === '/' || request.url === '/index.html') {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(indexHtml);
      return;
    }
    response.writeHead(404);
    response.end();
  });
}

async function startServer(server: Server): Promise<number> {
  // port 0 lets the OS pick any unused port
  server.listen(0, 'localhost');
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  return address.port;
}

async function stopServer(server: Server, wss: WebSocketServer): Promise<void> {
  for (const client of wss.clients) {
    client.terminate();
  }
  wss.close();
  server.close();
  server.closeAllConnections();
  await once(server, 'close');
}
