import { test as setup } from '@playwright/test';
import { DEMO_PHONE, DEMO_PIN } from './_helpers.js';

/**
 * Runs once per browser project before any auth-requiring test. Signs in
 * via the UI, then captures the resulting cookies + IDB state to a file
 * keyed by project name (e.g. `playwright/.auth/chromium.json`).
 *
 * Per-project rather than shared because the BFF binds sessions to a
 * UA-fingerprint (sha256 of os+engine+major-version) — Desktop Chrome and
 * Mobile Safari can't share a session.
 */
setup('authenticate', async ({ page }, testInfo) => {
  const name = testInfo.project.name.replace(/^setup-/, '');
  const storagePath = `playwright/.auth/${name}.json`;

  await page.goto('/login');
  await page.getByLabel(/mobile number/i).fill(DEMO_PHONE);
  await page.getByLabel(/pin/i).fill(DEMO_PIN);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard$/);
  await page.context().storageState({ path: storagePath });
});
