import { expect, test } from '@playwright/test';
import { DEMO_PHONE, DEMO_PIN } from './_helpers.js';

// These tests exercise the login flow itself, so they must start
// unauthenticated regardless of the project-level storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth flow', () => {
  test('happy path login lands on dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/mobile number/i).fill(DEMO_PHONE);
    await page.getByLabel(/pin/i).fill(DEMO_PIN);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('wrong PIN shows inline error and stays on login', async ({ page }) => {
    // Use a non-seeded phone so failures don't fill the per-phone bucket of
    // the real demo user, which other tests (and the setup) need to log in.
    await page.goto('/login');
    await page.getByLabel(/mobile number/i).fill('+27820000099');
    await page.getByLabel(/pin/i).fill('0000');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/incorrect number or pin/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
