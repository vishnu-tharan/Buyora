import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Buyora/);
  });

  test('shows hero section', async ({ page }) => {
    await page.goto('/');
    // Hero section should be visible
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('header is visible with navigation', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('footer is visible', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('has working search bar', async ({ page }) => {
    await page.goto('/');
    if ((page.viewportSize()?.width ?? 1280) < 768)
      await page.getByRole('button', { name: 'Search', exact: true }).click();
    const searchInput = page.locator('input[type=search]:visible').first();
    await expect(searchInput).toBeVisible();
  });

  test('navigates to search on query submit', async ({ page }) => {
    await page.goto('/');
    if ((page.viewportSize()?.width ?? 1280) < 768)
      await page.getByRole('button', { name: 'Search', exact: true }).click();
    const searchInput = page.locator('input[type=search]:visible').first();
    await searchInput.fill('headphones');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/search.*headphones/);
  });
});
