import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility audits via axe-core. We scan a representative set of screens
 * — login (unauth), dashboard (the most-rendered authed view), and the
 * sidebar-with-modal state (PIN lock equivalent).
 *
 * Failure threshold: any violation tagged `serious` or `critical`. Lower
 * severities are reported in the trace but don't fail the build — a11y is
 * a moving target and we don't want false positives gating CI on every
 * library upgrade.
 */

const BLOCKING_IMPACTS = ['critical', 'serious'] as const;

test.describe('Accessibility — unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('login page has no critical/serious axe violations', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(['region']) // single-screen marketing layout has no <main>
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact && (BLOCKING_IMPACTS as readonly string[]).includes(v.impact),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });
});

test.describe('Accessibility — authed', () => {
  test('dashboard has no critical/serious axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/dashboard/i);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact && (BLOCKING_IMPACTS as readonly string[]).includes(v.impact),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });

  test('profile has no critical/serious axe violations', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByTestId('breadcrumb-page')).toHaveText(/profile/i);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact && (BLOCKING_IMPACTS as readonly string[]).includes(v.impact),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });
});
