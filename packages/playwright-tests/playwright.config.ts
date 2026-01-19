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
  webServer: [
    {
      cwd: "../test-app-ui",
      command: "pnpm serve",
      url: "http://localhost:4173",
      // reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      cwd: "../test-app-server",
      command: "pnpm serve",
      url: "http://localhost:6844/playwright-ready",
      // reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
});
