import type { BrowserContext } from '@playwright/test';
import { openHostPage, type HostPage } from './hostPage';
import { startServer } from './server';

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
    const harness = {
      openHostPage: async () => {
        return await openHostPage({
          context,
          server,
          onError: (error) => {
            errors.push(error);
          },
        });
      },
    };
    await use(harness);
    if (errors.length > 0) {
      throw getCombinedErrors(errors);
    }
  } finally {
    await server.stop();
  }
}

function getCombinedErrors(errors: Error[]): Error {
  if (errors.length === 1) {
    return errors[0];
  }
  const details = errors.map((error, i) => `  ${i + 1}. ${error.message}`).join('\n');
  return new AggregateError(errors, `${errors.length} unexpected host page errors:\n${details}`);
}
