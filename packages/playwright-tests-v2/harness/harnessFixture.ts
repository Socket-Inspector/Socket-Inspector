import type { BrowserContext } from '@playwright/test';
import type { InboundEvent, SocketEnd } from './socketEnd';
import { type SocketPair, startTransport } from './transport';
import { createWebsocketEndpoint, type WebsocketEndpoint } from './websocketEndpoint';

export type Harness = {
  openHostPage(): Promise<HostPage>;
};

export type HostPage = {
  /** Connection for the socket the page opens on load. Replaced on each `refreshPage()`. */
  readonly connection: WebsocketConnection;
  /** Opens a new socket from the page (alongside the initial one) and returns its connection. */
  addConnection(): Promise<WebsocketConnection>;
  /** Reloads the page and replaces `connection` with the reloaded page's connection. */
  refreshPage(): Promise<void>;
};

export type WebsocketConnection = {
  readonly url: string;
  readonly client: WebsocketEndpoint;
  readonly server: WebsocketEndpoint;
};

export async function harnessFixture(
  { context }: { context: BrowserContext },
  use: (harness: Harness) => Promise<void>,
): Promise<void> {
  const errors: Error[] = [];

  const transport = await startTransport({
    context,
    onError: (error) => {
      errors.push(error);
    },
  });

  try {
    const labeledSocketEnds: { label: string; socketEnd: SocketEnd }[] = [];

    const createConnection = ({ url, client, server }: SocketPair): WebsocketConnection => {
      const { pathname, search } = new URL(url);
      const path = `${pathname}${search}`;
      const clientLabel = `client end of ${path}`;
      const serverLabel = `server end of ${path}`;
      labeledSocketEnds.push(
        { label: clientLabel, socketEnd: client },
        { label: serverLabel, socketEnd: server },
      );
      return {
        url,
        client: createWebsocketEndpoint({ label: clientLabel, socketEnd: client }),
        server: createWebsocketEndpoint({ label: serverLabel, socketEnd: server }),
      };
    };

    await use({
      openHostPage: async () => {
        const transportPage = await transport.openPage();
        let currentConnection = createConnection(transportPage.initialPair);
        return {
          get connection() {
            return currentConnection;
          },
          async addConnection() {
            const socketPair = await transportPage.addConnection();
            return createConnection(socketPair);
          },
          async refreshPage() {
            await transportPage.refreshPage();
            currentConnection = createConnection(transportPage.initialPair);
          },
        };
      },
    });

    for (const { label, socketEnd } of labeledSocketEnds) {
      errors.push(...findUnexpectedEvents(label, socketEnd.receivedEvents));
    }

    if (errors.length > 0) {
      throw getCombinedErrors(errors);
    }
  } finally {
    await transport.stop();
  }
}

function findUnexpectedEvents(label: string, receivedEvents: readonly InboundEvent[]): Error[] {
  const errors: Error[] = [];
  let closed = false;
  for (const event of receivedEvents) {
    if (event.type === 'text') {
      if (closed) {
        errors.push(
          new Error(`${label} received message ${JSON.stringify(event.text)} after it closed`),
        );
      }
    } else if (event.type === 'close') {
      if (closed) {
        errors.push(
          new Error(
            `${label} received a second close (code ${event.code}, reason ${JSON.stringify(event.reason)})`,
          ),
        );
      }
      closed = true;
    } else if (event.type === 'binary') {
      errors.push(new Error(`${label} received a binary message; only text is supported`));
    } else {
      errors.push(new Error(`${label} fired an error event`));
    }
  }
  return errors;
}

function getCombinedErrors(errors: Error[]): Error {
  if (errors.length === 1) {
    return errors[0];
  }
  const details = errors.map((error, i) => `  ${i + 1}. ${error.message}`).join('\n');
  return new AggregateError(errors, `${errors.length} unexpected host page errors:\n${details}`);
}
