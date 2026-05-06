import { expect, test } from '@playwright/test';

test.describe('Language switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('switching to isiZulu translates the breadcrumb', async ({ page }) => {
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('menuitemradio', { name: /isiZulu/i }).click();

    // Breadcrumb is in the AppWindow header. copy.nav.dashboard in zu.ts is "Ikhasi elikhulu".
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/ikhasi elikhulu/i);
  });

  test('switching to Afrikaans translates the breadcrumb', async ({ page }) => {
    await page.getByRole('button', { name: /language/i }).click();
    await page.getByRole('menuitemradio', { name: /afrikaans/i }).click();

    // copy.nav.dashboard in af.ts is "Paneelbord".
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/paneelbord/i);
  });
});
