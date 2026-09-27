import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('skip nav link exists on home page', async ({ page }) => {
    await page.goto('/');
    // Skip nav should be focusable
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const text = await focused.textContent();
    expect(text?.toLowerCase()).toContain('skip');
  });

  test('home page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt])');
    const count = await images.count();
    expect(count).toBe(0);
  });

  test('forms have labeled inputs', async ({ page }) => {
    await page.goto('/login');
    const inputs = page.locator('input');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      // Each input should have a label, aria-label, or aria-labelledby
      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  });
});
