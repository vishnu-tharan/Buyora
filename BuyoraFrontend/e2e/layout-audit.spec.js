import { test, expect } from '@playwright/test';

const publicPages = [
  '/',
  '/categories',
  '/brands',
  '/deals',
  '/search?q=headphones',
  '/category/electronics',
  '/product/sample-headphones',
  '/cart',
  '/wishlist',
  '/checkout',
  '/login',
  '/register',
  '/shipping',
  '/returns',
  '/contact',
  '/faq',
  '/terms',
  '/privacy',
  '/track-order',
];

test('public screens render without page errors or horizontal overflow', async ({ page }) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of publicPages) {
    // Leave time between full-page loads to respect the API's request limit.
    await page.waitForTimeout(2500);
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      path
    ).toBe(true);
    await expect(
      page.getByRole('heading', { name: /something went wrong|unable to load/i })
    ).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('price slider is visible and keyboard changes the price filter', async ({
  page,
  isMobile,
}) => {
  await page.goto('/category/electronics');
  if (isMobile) await page.getByRole('button', { name: /filters/i }).click();
  const slider = page.getByRole('slider').first();
  await expect(slider).toBeVisible();
  const track = page.locator('[data-slot="slider-track"]').filter({ visible: true });
  const box = await track.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(4);
  expect(box.width).toBeGreaterThan(100);
  await slider.press('ArrowRight');
  await slider.press('Tab');
  await expect(page).toHaveURL(/minPrice=100/);
});
