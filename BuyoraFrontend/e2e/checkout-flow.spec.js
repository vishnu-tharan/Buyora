import { test, expect } from '@playwright/test';

test('checkout validates contact details and reaches review with accurate totals', async ({
  page,
}) => {
  await page.route('**/api/v1/cart', (route) =>
    route.fulfill({
      json: {
        id: 'audit-cart',
        itemCount: 2,
        items: [
          {
            id: 1,
            quantity: 2,
            unitPrice: 200,
            totalPrice: 400,
            product: { id: 1, name: 'Notebook', slug: 'notebook' },
            variant: { id: 1, attributes: {} },
          },
        ],
        summary: {
          subtotal: 400,
          discountAmount: 50,
          taxAmount: 0,
          total: 350,
          freeShipping: false,
        },
      },
    })
  );
  await page.route('**/api/v1/checkout/preview', (route) =>
    route.fulfill({
      json: {
        paymentMethods: ['CASH_ON_DELIVERY'],
        shippingMethods: [{ id: '1', name: 'Standard Delivery', price: 350 }],
      },
    })
  );
  await page.route('**/api/v1/store/delivery**', (route) =>
    route.fulfill({ json: { minDays: 2, maxDays: 5, codAvailable: true } })
  );
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Continue to Shipping' }).click();
  await expect(page.getByRole('heading', { name: 'Contact Information' })).toBeVisible();
  await page.getByLabel('Email Address').fill('customer@example.test');
  await page.getByLabel('First Name', { exact: true }).fill('Test');
  await page.getByLabel('Last Name', { exact: true }).fill('Customer');
  await page.getByLabel('Phone Number').fill('0771234567');
  await page.getByLabel('Address Line 1').fill('1 Test Road');
  await page.getByLabel('City', { exact: true }).fill('Colombo');
  await page.getByRole('combobox', { name: 'District', exact: true }).click();
  await page.getByRole('option', { name: 'Colombo', exact: true }).click();
  await page.getByRole('button', { name: 'Continue to Shipping' }).click();
  await page.getByRole('radio', { name: /Standard Delivery/ }).check();
  await page.getByRole('button', { name: 'Continue to Payment' }).click();
  await page.getByRole('radio', { name: 'Cash on Delivery', exact: true }).check();
  await page.getByRole('button', { name: 'Continue to Review' }).click();
  await expect(page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Place Order.*700/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.screenshot({
    path: 'test-results/checkout-review-' + test.info().project.name + '.png',
    fullPage: true,
  });
});
