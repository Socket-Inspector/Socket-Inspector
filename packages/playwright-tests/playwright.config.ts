import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.test.ts',
  outputDir: 'output/test-results',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 3,
  fullyParallel: false,
  reporter: [['html', { outputFolder: 'output/playwright-report' }]],
  use: {
    trace: 'retain-on-failure',
  },
  timeout: 10000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  maxFailures: 1,
});
