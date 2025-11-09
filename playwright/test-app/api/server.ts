import { sleep } from 'bun';
import { generateEnvConfig } from './generateEnvConfig';
import { handleClientMessage } from './messageHandlers';
import { ClientMessage } from './serverMessageTypes';

const config = generateEnvConfig();
console.log('serving with config: ', JSON.stringify(config, null, 2));

Bun.serve({
  port: config.port,
  async fetch(req, server) {
    console.log('fetch request received by server');

    if (config.openDelay) {
      await sleep(config.openDelay);
    }

    const url = new URL(req.url);
    const triggerError = url.searchParams.get('triggerHandshakeError');
    if (triggerError) {
      console.log('triggerError parameter detected, rejecting handshake');
      return new Response('Handshake error triggered', { status: 400 });
    }

    const upgradeSuccess = server.upgrade(req);
    if (upgradeSuccess) {
      console.log('responding to upgrade request');
      return;
    }

    return new Response('Upgrade failed', { status: 500 });
  },
  websocket: {
    perMessageDeflate: false,
    async open() {
      console.log('opening socket');
    },
    async message(ws, message) {
      console.log('Server received this message: ', message);

      if (config.messageDelay) {
        await sleep(config.messageDelay);
      }

      if (typeof message === 'string') {
        try {
          const parsedMessage = JSON.parse(message);

          if (!parsedMessage.type || typeof parsedMessage.type !== 'string') {
            console.error('invalid message');
            return;
          }

          handleClientMessage(ws, parsedMessage as ClientMessage);
        } catch {
          console.error('Failed to parse message as JSON:');
        }
      } else {
        console.error('non-string messages not currently supported');
      }
    },
    async close(ws, code, message) {
      console.log('closed with code: ', code, ' and message: ', message);
    },
  },
});
