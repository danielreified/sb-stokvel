import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Visual regression: small threshold for antialiasing wobble. The
    // `--update-snapshots` flag is the canonical way to refresh baselines
    // (run `bun run test:e2e:update-snapshots` from inside the Docker image
    // so all contributors compare against the same Linux reference).
    toHaveScreenshot: {
      maxDiffPixels: 200,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Pin clock + locale + colorScheme so snapshots don't drift between
    // a contributor's machine in 'August 2026' and another's in 'January 2027'.
    timezoneId: 'Africa/Johannesburg',
    locale: 'en-ZA',
    colorScheme: 'light',
  },

  // 4-way matrix: Chrome + Safari × desktop + mobile. Each project has its
  // own setup that signs in with that project's UA — necessary because the
  // BFF binds sessions to a UA-fingerprint, so projects can't share one
  // storage-state file.
  projects: [
    {
      name: 'setup-chromium',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/chromium.json' },
      dependencies: ['setup-chromium'],
    },
    {
      name: 'setup-webkit',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/webkit.json' },
      dependencies: ['setup-webkit'],
    },
    {
      name: 'setup-mobile-chrome',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: 'playwright/.auth/mobile-chrome.json' },
      dependencies: ['setup-mobile-chrome'],
    },
    {
      name: 'setup-mobile-safari',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'], storageState: 'playwright/.auth/mobile-safari.json' },
      dependencies: ['setup-mobile-safari'],
    },
  ],

  // Auto-boot the BFF + PWA before tests. `bun run dev` at repo root spawns
  // both via turbo; Playwright waits for the PWA's port to be ready.
  webServer: {
    command: 'bun run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
