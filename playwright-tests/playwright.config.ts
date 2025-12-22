import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright/tests',
  testMatch: '*.test.ts',

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Don't run tests in parallel
  workers: 1,

  // Reporter to use
  reporter: 'html',

  use: {
    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },

  timeout: 10000,

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
