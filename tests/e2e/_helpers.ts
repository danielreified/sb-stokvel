import type { Page } from '@playwright/test';
import { DEMO_PHONE, DEMO_PIN } from '@seyva/db/seed';

export { DEMO_PHONE, DEMO_PIN };

/** Sign in via the login UI. Leaves the page on /dashboard when it returns. */
export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/mobile number/i).fill(DEMO_PHONE);
  await page.getByLabel(/pin/i).fill(DEMO_PIN);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard$/);
}
