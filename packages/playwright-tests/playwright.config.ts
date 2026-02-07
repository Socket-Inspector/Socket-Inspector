import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.test.ts',

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  retries: 0,

  workers: 3,

  fullyParallel: false,

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

  maxFailures: 1,

  // TODO: HTML report locking the process on failure
  webServer: [
    // main test app
    {
      cwd: '../test-app-ui',
      command: 'pnpm serve:playwright',
      url: 'http://localhost:4298',
      reuseExistingServer: false,
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
    // test app tiny
    {
      cwd: '../test-app-tiny',
      command: 'pnpm serve:test-app-tiny:playwright',
      url: 'http://localhost:4312',
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      cwd: '../test-app-server',
      command: 'pnpm serve:test-app-tiny:playwright',
      url: 'http://localhost:5890/playwright-ready',
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
