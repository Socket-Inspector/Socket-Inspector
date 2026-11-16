import type { BrowserContext } from '@playwright/test';
import { createHostPage, type HostPage } from './hostPage';
import { startServer } from './server';
import type { InboundEvent, SocketEnd } from './socketEnd';

export type Harness = {
  openHostPage(): Promise<HostPage>;
};

export async function harnessFixture(
  { context }: { context: BrowserContext },
  use: (harness: Harness) => Promise<void>,
): Promise<void> {
  const errors: Error[] = [];

  const server = await startServer({
    onError: (error) => {
      errors.push(error);
    },
  });

  try {
    const labeledSocketEnds: { label: string; socketEnd: SocketEnd }[] = [];
    await use({
      openHostPage: async () => {
        return await createHostPage({
          context,
          server,
          onError: (error) => {
            errors.push(error);
          },
          onSocketEnd: (label, socketEnd) => {
            labeledSocketEnds.push({ label, socketEnd });
          },
        });
      },
    });
    for (const { label, socketEnd } of labeledSocketEnds) {
      errors.push(...findUnexpectedEvents(label, socketEnd.receivedEvents));
    }
    if (errors.length > 0) {
      throw getCombinedErrors(errors);
    }
  } finally {
    await server.stop();
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
