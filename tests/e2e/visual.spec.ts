import { expect, test } from '@playwright/test';

/**
 * Visual regression for stable screens. Baselines are committed to the repo
 * and must be regenerated from inside the Docker image (`bun run
 * test:e2e:update-snapshots`) so all contributors compare against the same
 * Linux + font rendering. Screens chosen here have no wall-clock-relative
 * content (no "5 minutes ago" copy that drifts between runs).
 */

test.describe('Visual regression — unauthenticated', () => {
  // Override the project-level storageState so we land on /login.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('login page', async ({ page }) => {
    await page.goto('/login');
    // Wait for the install-prompt heuristics + logo to settle.
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page).toHaveScreenshot('login.png', { fullPage: true, timeout: 15_000 });
  });
});

test.describe('Visual regression — authed', () => {
  test('profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/profile/i);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('profile.png', { fullPage: true, timeout: 15_000 });
  });

  test('members page', async ({ page }) => {
    await page.goto('/members');
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/members/i);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('members.png', { fullPage: true, timeout: 15_000 });
  });
});
