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
  const storeError = (error: Error) => {
    errors.push(error);
  };

  const server = await startServer({ onError: storeError });

  try {
    const harness = {
      openHostPage: async () => {
        return await openHostPage({
          context,
          server,
          onError: storeError,
        });
      },
    };
    await use(harness);
    const error = getCombinedErrors(errors);
    if (error) {
      throw error;
    }
  } finally {
    await server.stop();
  }
}

function getCombinedErrors(errors: Error[]): Error | undefined {
  if (errors.length <= 1) {
    return errors[0];
  }
  const details = errors.map((error, i) => `  ${i + 1}. ${error.message}`).join('\n');
  return new AggregateError(errors, `${errors.length} unexpected host page errors:\n${details}`);
}
