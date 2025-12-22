import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import path from 'path';

const pathToExtension = path.resolve('.output/chrome-mv3');

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  devtoolsPanelUrl: string;
}>({
  // oxlint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      // devtools: true,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let background: { url(): string };
    if (pathToExtension.endsWith('-mv3')) {
      [background] = context.serviceWorkers();
      if (!background) background = await context.waitForEvent('serviceworker');
    } else {
      [background] = context.backgroundPages();
      if (!background) background = await context.waitForEvent('backgroundpage');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  serviceWorker: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker');
    await use(sw);
  },
  devtoolsPanelUrl: async ({ extensionId }, use) => {
    const url = `chrome-extension://${extensionId}/devtools-panel.html`;
    await use(url);
  },
});
export const expect = test.expect;
