import { defineUnlistedScript } from '#imports';
import { Packet, SocketDetails, SocketMessagePacket } from '@/utils/sharedTypes/sharedTypes';
import { WindowConnector } from '@/utils/windowMessaging';
import {
  WebSocketClientConnection,
  WebSocketData,
  WebSocketInterceptor,
  WebSocketServerConnection,
} from '@mswjs/interceptors/WebSocket';

type SocketConnection = {
  socket: SocketDetails;
  client: WebSocketClientConnection;
  server: WebSocketServerConnection;
};

export default defineUnlistedScript(() => {
  const contentScriptConnector = new WindowConnector({
    window,
    location: 'INJECTED_SCRIPT',
  }).connect();

  const sockets = new Map<SocketDetails['id'], SocketConnection>();

  const interceptor = new WebSocketInterceptor();
  interceptor.apply();

  // TODO: leverage dispose method?

  interceptor.on('connection', ({ client, server }) => {
    // host page constructed a WebSocket instance
    const socketUrl = client.url.href;

    const socketId = crypto.randomUUID();

    // initiate the websocket handshake GET request
    server.connect();

    const interceptedSocket: SocketDetails = {
      id: socketId,
      url: socketUrl,
      status: 'CONNECTING',
      isPaused: false,
    };

    sockets.set(socketId, {
      socket: interceptedSocket,
      client,
      server,
    });

    const sendSocketDetailsPacket = () => {
      contentScriptConnector.sendPacket({
        type: 'SocketDetailsPacket',
        payload: { socket: interceptedSocket },
      });
    };

    server.addEventListener('open', () => {
      /**
       * server responded to the websocket handshake,
       * and the connection is now open
       */
      interceptedSocket.status = 'OPEN';
      sendSocketDetailsPacket();
    });

    client.addEventListener('message', (event: MessageEvent<WebSocketData>) => {
      // client sent a message

      if (interceptedSocket.isPaused) {
        // block the message from reaching the server
        event.preventDefault();
        return;
      }

      if (typeof event.data !== 'string') {
        return;
      }

      const clientMessagePacket: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: interceptedSocket,
          message: {
            id: crypto.randomUUID(),
            timestampISO: new Date().toISOString(),
            endpoints: {
              source: 'client',
              destination: 'server',
            },
            payload: event.data,
            socketDetails: interceptedSocket,
          },
        },
      };
      contentScriptConnector.sendPacket(clientMessagePacket);
    });

    server.addEventListener('message', (event: MessageEvent<WebSocketData>) => {
      // message received from server

      if (interceptedSocket.isPaused) {
        // block the message from reaching the client
        event.preventDefault();
        return;
      }

      if (typeof event.data !== 'string') {
        return;
      }

      const serverMessagePacket: SocketMessagePacket = {
        type: 'SocketMessagePacket',
        payload: {
          socket: interceptedSocket,
          message: {
            id: crypto.randomUUID(),
            timestampISO: new Date().toISOString(),
            endpoints: {
              source: 'server',
              destination: 'client',
            },
            payload: event.data,
            socketDetails: interceptedSocket,
          },
        },
      };
      contentScriptConnector.sendPacket(serverMessagePacket);
    });

    client.addEventListener('close', () => {
      /**
       * socket was closed
       *
       * note: this fires regardless of whether
       * the client or server initiates the closure
       */
      interceptedSocket.status = 'CLOSED';
      sendSocketDetailsPacket();
    });

    sendSocketDetailsPacket();
  });

  contentScriptConnector.subscribe((packet: Packet) => {
    if (packet.type === 'UserInjectedSocketMessagePacket') {
      const { message } = packet.payload;
      const connection = sockets.get(message.socketId);

      if (!connection) {
        return;
      } else if (connection.socket.status === 'CONNECTING') {
        return;
      } else if (connection.socket.status === 'CLOSED') {
        return;
      }

      if (message.destination === 'client') {
        try {
          connection.client.send(message.payload);
        } catch {}

        const clientMessagePacket: SocketMessagePacket = {
          type: 'SocketMessagePacket',
          payload: {
            socket: connection.socket,
            message: {
              id: crypto.randomUUID(),
              timestampISO: new Date().toISOString(),
              endpoints: {
                source: 'chrome_extension',
                destination: 'client',
              },
              payload: message.payload,
              socketDetails: connection.socket,
            },
          },
        };
        contentScriptConnector.sendPacket(clientMessagePacket);
      } else if (message.destination === 'server') {
        try {
          connection.server.send(message.payload);
        } catch {}

        const serverMessagePacket: SocketMessagePacket = {
          type: 'SocketMessagePacket',
          payload: {
            socket: connection.socket,
            message: {
              id: crypto.randomUUID(),
              timestampISO: new Date().toISOString(),
              endpoints: {
                source: 'chrome_extension',
                destination: 'server',
              },
              payload: message.payload,
              socketDetails: connection.socket,
            },
          },
        };
        contentScriptConnector.sendPacket(serverMessagePacket);
      }
    } else if (packet.type === 'PauseSocketPacket' || packet.type === 'ResumeSocketPacket') {
      const { socketId } = packet.payload;
      const connection = sockets.get(socketId);
      if (!connection) {
        return;
      }

      connection.socket.isPaused = packet.type === 'PauseSocketPacket';

      contentScriptConnector.sendPacket({
        type: 'SocketDetailsPacket',
        payload: { socket: connection.socket },
      });
    } else if (packet.type === 'CloseConnectionPacket') {
      const { socketId, code, reason } = packet.payload;
      const connection = sockets.get(socketId);
      if (!connection) {
        return;
      }
      try {
        connection.client.close(code, reason);
      } catch {}
    }
  });

  contentScriptConnector.sendPacket({ type: 'ConnectorReadyPacket' });
});
