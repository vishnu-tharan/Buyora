import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search page loads with query', async ({ page }) => {
    await page.goto('/search?q=phone');
    await expect(page).toHaveURL(/search.*q=phone/);
  });

  test('search URL is shareable', async ({ page }) => {
    await page.goto('/search?q=laptop&sort=PRICE_ASC');
    await expect(page).toHaveURL(/q=laptop/);
    await expect(page).toHaveURL(/sort=PRICE_ASC/);
  });

  test('categories page loads', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible();
  });

  test('deals page loads', async ({ page }) => {
    await page.goto('/deals');
    await expect(page.getByRole('heading', { name: /deals/i })).toBeVisible();
  });
});
