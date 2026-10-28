import { test, expect } from '@playwright/test';

test('product information tabs stay compact and show the selected content', async ({ page }) => {
  await page.goto('/product/sample-headphones');
  await expect(page.getByRole('button', { name: 'Black', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  const tabs = page.getByRole('tablist', { name: 'Product information' });
  await tabs.scrollIntoViewIfNeeded();
  const buttons = tabs.getByRole('tab');
  await expect(buttons).toHaveCount(3);
  const bounds = [];
  for (const button of await buttons.all()) {
    const box = await button.boundingBox();
    expect(box.height).toBeLessThanOrEqual(48);
    bounds.push(box);
  }
  expect(Math.abs(bounds[0].y - bounds[2].y)).toBeLessThanOrEqual(1);
  expect(bounds[2].x + bounds[2].width).toBeLessThanOrEqual(page.viewportSize().width);

  await tabs.getByRole('tab', { name: 'Specifications', exact: true }).click();
  await expect(tabs.getByRole('tab', { name: 'Specifications', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.getByRole('tabpanel')).toBeVisible();
  const panel = await page.getByRole('tabpanel').boundingBox();
  const bar = await tabs.boundingBox();
  expect(panel.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);

  await tabs.getByRole('tab', { name: 'Shipping & Returns', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Shipping Information', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Return Policy', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
  await page.screenshot({ path: 'test-results/product-tabs-' + test.info().project.name + '.png' });
});
