import type { Page } from '@playwright/test';

// Mirror of packages/db/src/seed.ts. We deliberately don't import from
// @seyva/db/seed here — Playwright's worker uses Node's ESM resolver and
// can't follow Bun's workspace exports. If you change these, change them
// in seed.ts too. Worth tightening if the e2e runner ever moves to bun
// natively.
export const DEMO_PHONE = '+27821000001';
export const DEMO_PIN = '1234';

/** Sign in via the login UI. Leaves the page on /dashboard when it returns. */
export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/mobile number/i).fill(DEMO_PHONE);
  await page.getByLabel(/pin/i).fill(DEMO_PIN);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard$/);
}
