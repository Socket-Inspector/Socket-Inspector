import { expect } from '@playwright/test';

export type CloseOptions = { code?: number; reason?: string };

export type CreateWebsocketEndpointArgs = {
  label: string;
  transport: Transport;
  onError: (error: Error) => void;
};

export type WebsocketEndpoint = {
  send(text: string): Promise<void>;
  close(options?: CloseOptions): Promise<void>;
  expectMessages(list: string[]): Promise<void>;
  expectMessagesToStay(list: string[]): Promise<void>;
  expectClosed(expected?: CloseOptions): Promise<void>;
};

export type EndpointRecorder = {
  recordReceivedMessage(text: string): void;
  recordReceivedClose(close: ReceivedClose): void;
};

export type ReceivedClose = { code: number; reason: string };

export type Transport = {
  send(text: string): Promise<void>;
  close(options: CloseOptions): Promise<void>;
};

export function createWebsocketEndpoint({
  label,
  transport,
  onError,
}: CreateWebsocketEndpointArgs): { endpoint: WebsocketEndpoint; recorder: EndpointRecorder } {
  const messages: string[] = [];
  let receivedClose: ReceivedClose | undefined;
  let closeRequested = false;

  // TODO: why are there 2 'channels' for exposing errors? i.e. throwing and calling onError
  const assertOpen = () => {
    if (closeRequested || receivedClose) {
      throw new Error(`${label} is closed`);
    }
  };

  const endpoint: WebsocketEndpoint = {
    async send(text: string) {
      assertOpen();
      await transport.send(text);
    },
    async close(options: CloseOptions = {}) {
      assertOpen();
      closeRequested = true;
      await transport.close(options);
    },
    async expectMessages(list: string[]) {
      await expect
        .poll(() => [...messages], { message: `messages received by ${label}` })
        .toEqual(list);
    },
    async expectMessagesToStay(list: string[]) {
      const deadline = Date.now() + 500;
      while (true) {
        expect([...messages], `messages received by ${label}`).toEqual(list);
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          return;
        }
        await sleep(Math.min(remaining, 50));
      }
    },
    async expectClosed(expected: CloseOptions = {}) {
      await expect
        .poll(() => receivedClose, { message: `close received by ${label}` })
        .toMatchObject(expected);
    },
  };

  const recorder: EndpointRecorder = {
    recordReceivedMessage(text: string) {
      if (receivedClose) {
        onError(new Error(`${label} received message ${JSON.stringify(text)} after it closed`));
        return;
      }
      messages.push(text);
    },
    recordReceivedClose(close: ReceivedClose) {
      if (receivedClose) {
        onError(
          new Error(
            `${label} received a second close (code ${close.code}, reason ${JSON.stringify(close.reason)})`,
          ),
        );
        return;
      }
      receivedClose = { code: close.code, reason: close.reason };
    },
  };

  return { endpoint, recorder };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
