import { test, expect } from '@playwright/test';
const empty = {
  id: 'test-cart',
  items: [],
  itemCount: 0,
  summary: {
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    total: 0,
    freeShipping: false,
  },
};
test('empty cart shows shopping link', async ({ page }) => {
  await page.route('**/api/v1/cart', (route) => route.fulfill({ json: empty }));
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: /cart is empty/i })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /start shopping|continue shopping/i }).first()
  ).toBeVisible();
});
test('checkout does not proceed when cart loading fails', async ({ page }) => {
  await page.route('**/api/v1/cart', (route) =>
    route.fulfill({ status: 503, json: { message: 'Unavailable' } })
  );
  await page.goto('/checkout');
  await expect(page.getByText('Unable to load your cart', { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByRole('button', { name: /place order/i })).toHaveCount(0);
});
test('payment success query cannot claim verified payment', async ({ page }) => {
  await page.goto('/payment/callback?status=success');
  await expect(page.getByRole('heading', { name: 'Payment could not be verified' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Payment verified', exact: true })).toHaveCount(0);
});
test('login fits the viewport', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.screenshot({
    path: 'test-results/login-' + test.info().project.name + '.png',
    fullPage: true,
  });
});
