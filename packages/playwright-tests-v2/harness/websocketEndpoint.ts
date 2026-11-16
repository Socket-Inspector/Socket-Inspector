import { expect } from '@playwright/test';
import type { CloseOptions, SocketEnd } from './socketEnd';

export type CreateWebsocketEndpointArgs = {
  label: string;
  socketEnd: SocketEnd;
};

export type WebsocketEndpoint = {
  /** Sends a message to the other end. Throws if this end is closed. */
  send(text: string): Promise<void>;
  /** Send a close frame from this end. Throws if this end is already closed. */
  close(options?: CloseOptions): Promise<void>;
  /** Wait until all received messages equal `expectedMessages`*/
  expectMessages(expectedMessages: string[]): Promise<void>;
  /** Wait until all received messages equal `expectedMessages` and don't change for 300ms*/
  expectMessagesToStay(expectedMessages: string[]): Promise<void>;
  /** Wait until this end receives a matching close frame (or any close frame if no args passed). */
  expectClosed(expected?: CloseOptions): Promise<void>;
};

export type CloseFrame = { code: number; reason: string };

export function createWebsocketEndpoint({
  label,
  socketEnd,
}: CreateWebsocketEndpointArgs): WebsocketEndpoint {
  let closeRequested = false;

  const getMessages = (): string[] => {
    return socketEnd.receivedEvents
      .filter((event) => event.type === 'text')
      .map((event) => event.text);
  };

  const getCloseFrame = (): CloseFrame | undefined => {
    const closeEvent = socketEnd.receivedEvents.find((event) => event.type === 'close');
    return closeEvent && { code: closeEvent.code, reason: closeEvent.reason };
  };

  const assertOpen = () => {
    if (closeRequested || getCloseFrame()) {
      throw new Error(`${label} is closed`);
    }
  };

  return {
    async send(text: string) {
      assertOpen();
      await socketEnd.send(text);
    },
    async close(options: CloseOptions = {}) {
      assertOpen();
      closeRequested = true;
      await socketEnd.close(options);
    },
    async expectMessages(expectedMessages: string[]) {
      await expect
        .poll(getMessages, { message: `messages received by ${label}` })
        .toEqual(expectedMessages);
    },
    async expectMessagesToStay(expectedMessages: string[]) {
      const deadline = Date.now() + 300;
      while (true) {
        expect(getMessages(), `messages received by ${label}`).toEqual(expectedMessages);
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          return;
        }
        await sleep(Math.min(remaining, 50));
      }
    },
    async expectClosed(expected: CloseOptions = {}) {
      await expect
        .poll(getCloseFrame, { message: `close received by ${label}` })
        .toMatchObject(expected);
    },
  };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
