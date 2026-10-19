import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const packedExtensionPath = path.resolve('../extension/.mock_output/chrome-mv3');

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  devtoolsPanelUrl: string;
}>({
  // oxlint-disable-next-line no-empty-pattern
  context: async ({ }, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: !!process.env.CI,
      // devtools: true,
      args: [
        `--disable-extensions-except=${packedExtensionPath}`,
        `--load-extension=${packedExtensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let background: { url(): string };
    [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
  devtoolsPanelUrl: async ({ context, extensionId }, use) => {
    const url = `chrome-extension://${extensionId}/devtools-panel.html`;
    await use(url);
  },
});

export const expect = test.expect;
