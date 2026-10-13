import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: '*.test.ts',

  forbidOnly: !!process.env.CI,

  retries: 0,

  workers: 3,

  fullyParallel: false,

  reporter: 'html',

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

  webServer: [
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
    {
      cwd: '../test-app-tiny',
      command: 'pnpm serve:test-app-tiny:playwright',
      url: 'http://localhost:4312',
      reuseExistingServer: false,
      // stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      cwd: '../test-app-server',
      command: 'pnpm serve:test-app-tiny',
      url: 'http://localhost:5890/playwright-ready',
      reuseExistingServer: false,
      // stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
