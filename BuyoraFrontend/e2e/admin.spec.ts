import { test, expect } from '@playwright/test';
test('administrator can reach the second category page', async ({ page }) => {
  await page.route('**/api/v1/auth/me', (route) =>
    route.fulfill({
      json: {
        id: 1,
        email: 'admin@example.test',
        firstName: 'Store',
        lastName: 'Administrator',
        roles: ['ADMIN'],
        isActive: true,
        isEmailVerified: true,
      },
    })
  );
  await page.route('**/api/v1/admin/categories?**', (route) => {
    const index = Number(new URL(route.request().url()).searchParams.get('page'));
    return route.fulfill({
      json: {
        content: [
          {
            id: index + 1,
            name: index === 0 ? 'First category' : 'Second category',
            slug: 'category-' + index,
          },
        ],
        number: index,
        totalPages: 2,
        totalElements: 21,
        size: 20,
      },
    });
  });
  await page.goto('/admin/categories');
  await expect(page.getByText('First category', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('Second category', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Page 2', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  );
});
