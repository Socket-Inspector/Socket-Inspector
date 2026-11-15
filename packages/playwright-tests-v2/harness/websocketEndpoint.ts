import { expect } from '@playwright/test';

export type CreateWebsocketEndpointArgs = {
  label: string;
  handle: WebsocketHandle;
  onError: (error: Error) => void;
};

export type WebsocketEndpoint = {
  send(text: string): Promise<void>;
  close(options?: CloseOptions): Promise<void>;
  expectMessages(expectedMessages: string[]): Promise<void>;
  expectMessagesToStay(expectedMessages: string[]): Promise<void>;
  expectClosed(expected?: CloseOptions): Promise<void>;
};

export type WebsocketHandle = {
  send(text: string): Promise<void>;
  close(options: CloseOptions): Promise<void>;
  // called exactly once, by createWebsocketEndpoint
  subscribe(listeners: WebsocketHandleListeners): void;
};

export type WebsocketHandleListeners = {
  onMessage: (text: string) => void;
  onClose: (closeFrame: CloseFrame) => void;
};

export type CloseFrame = { code: number; reason: string };

export type CloseOptions = { code?: number; reason?: string };

export function createWebsocketEndpoint({
  label,
  handle,
  onError,
}: CreateWebsocketEndpointArgs): WebsocketEndpoint {
  const incomingData: IncomingData = {
    messages: [],
    closeFrame: undefined,
  };

  let closeRequested = false;

  handle.subscribe({
    onMessage(text: string) {
      if (incomingData.closeFrame) {
        onError(new Error(`${label} received message ${JSON.stringify(text)} after it closed`));
        return;
      }
      incomingData.messages.push(text);
    },
    onClose(closeFrame: CloseFrame) {
      if (incomingData.closeFrame) {
        onError(
          new Error(
            `${label} received a second close (code ${closeFrame.code}, reason ${JSON.stringify(closeFrame.reason)})`,
          ),
        );
        return;
      }
      incomingData.closeFrame = { code: closeFrame.code, reason: closeFrame.reason };
    },
  });

  const assertOpen = () => {
    if (closeRequested || incomingData.closeFrame) {
      throw new Error(`${label} is closed`);
    }
  };

  return {
    async send(text: string) {
      assertOpen();
      await handle.send(text);
    },
    async close(options: CloseOptions = {}) {
      assertOpen();
      closeRequested = true;
      await handle.close(options);
    },
    async expectMessages(expectedMessages: string[]) {
      await expect
        .poll(() => [...incomingData.messages], { message: `messages received by ${label}` })
        .toEqual(expectedMessages);
    },
    async expectMessagesToStay(expectedMessages: string[]) {
      const deadline = Date.now() + 500;
      while (true) {
        expect([...incomingData.messages], `messages received by ${label}`).toEqual(
          expectedMessages,
        );
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          return;
        }
        await sleep(Math.min(remaining, 50));
      }
    },
    async expectClosed(expected: CloseOptions = {}) {
      await expect
        .poll(() => incomingData.closeFrame, { message: `close received by ${label}` })
        .toMatchObject(expected);
    },
  };
}

type IncomingData = { messages: string[]; closeFrame: CloseFrame | undefined };

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
