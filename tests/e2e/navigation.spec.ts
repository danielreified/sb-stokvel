import { expect, test } from '@playwright/test';

test.describe('Authed routes', () => {
  test('each authed route renders its page', async ({ page }) => {
    // Drive nav by URL so this works on both desktop (sidebar always rendered)
    // and mobile (sidebar lives in a closed Sheet that needs an extra tap).
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto('/members');
    await expect(page).toHaveURL(/\/members$/);

    await page.goto('/contributions');
    await expect(page).toHaveURL(/\/contributions$/);

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
});
