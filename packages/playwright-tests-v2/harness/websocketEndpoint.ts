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
  expectMessages(expectedMessages: string[]): Promise<void>;
  expectMessagesToStay(expectedMessages: string[]): Promise<void>;
  expectClosed(expected?: CloseOptions): Promise<void>;
};

export type EndpointRecorder = {
  recordReceivedMessage(text: string): void;
  recordReceivedCloseFrame(closeFrame: CloseFrame): void;
};

export type CloseFrame = { code: number; reason: string };

export type Transport = {
  send(text: string): Promise<void>;
  close(options: CloseOptions): Promise<void>;
};

export function createWebsocketEndpoint({
  label,
  transport,
  onError,
}: CreateWebsocketEndpointArgs): { endpoint: WebsocketEndpoint; recorder: EndpointRecorder } {
  const receivedMessages: string[] = [];
  let receivedCloseFrame: CloseFrame | undefined;
  let closeRequested = false;

  // TODO: why are there 2 'channels' for exposing errors? i.e. throwing and calling onError
  const assertOpen = () => {
    if (closeRequested || receivedCloseFrame) {
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
    async expectMessages(expectedMessages: string[]) {
      await expect
        .poll(() => [...receivedMessages], { message: `messages received by ${label}` })
        .toEqual(expectedMessages);
    },
    async expectMessagesToStay(expectedMessages: string[]) {
      const deadline = Date.now() + 500;
      while (true) {
        expect([...receivedMessages], `messages received by ${label}`).toEqual(expectedMessages);
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          return;
        }
        await sleep(Math.min(remaining, 50));
      }
    },
    async expectClosed(expected: CloseOptions = {}) {
      await expect
        .poll(() => receivedCloseFrame, { message: `close received by ${label}` })
        .toMatchObject(expected);
    },
  };

  const recorder: EndpointRecorder = {
    recordReceivedMessage(text: string) {
      if (receivedCloseFrame) {
        onError(new Error(`${label} received message ${JSON.stringify(text)} after it closed`));
        return;
      }
      receivedMessages.push(text);
    },
    recordReceivedCloseFrame(closeFrame: CloseFrame) {
      if (receivedCloseFrame) {
        onError(
          new Error(
            `${label} received a second close (code ${closeFrame.code}, reason ${JSON.stringify(closeFrame.reason)})`,
          ),
        );
        return;
      }
      receivedCloseFrame = { code: closeFrame.code, reason: closeFrame.reason };
    },
  };

  return { endpoint, recorder };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
