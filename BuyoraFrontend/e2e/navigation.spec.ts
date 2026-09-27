import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('logo links to home', async ({ page }) => {
    await page.goto('/category/electronics').catch(() => page.goto('/'));
    const logo = page.getByRole('link', { name: /buyora/i }).first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('cart icon is visible', async ({ page }) => {
    await page.goto('/');
    const cartButton = page.getByRole('button', { name: /cart/i }).or(page.getByLabel(/cart/i));
    await expect(cartButton).toBeVisible();
  });

  test('mobile menu opens on hamburger click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const hamburger = page
      .getByRole('button', { name: /menu/i })
      .or(page.getByLabel(/open menu/i))
      .first();
    await hamburger.click();
    // Menu should be visible after click
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });
});
