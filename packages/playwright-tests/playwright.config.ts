import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.test.ts',

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: 0,

  // Don't run tests in parallel
  workers: 1,

  // Reporter to use
  reporter: 'html',

  use: {
    trace: 'retain-on-failure',
  },

  timeout: 10000,

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // TODO: consider setting to 1 on CI?
  // maxFailures: 1,

  // TODO: consider having a specific bun server port for the playwright tests
  // consider using same env variable for build:mock and serve:playwright commands?

  // TODO: HTML report locking the process on failure
  webServer: [
    {
      cwd: '../test-app-ui',
      command: 'pnpm serve:playwright',
      url: 'http://localhost:4298',
      reuseExistingServer: false,
      // reuseExistingServer: !process.env.CI,
      // stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      cwd: '../test-app-server',
      command: 'pnpm serve:playwright',
      url: 'http://localhost:6857/playwright-ready',
      reuseExistingServer: false,
      // stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
