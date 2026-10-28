import { test, expect } from '@playwright/test';

const catalogPages = [
  { name: 'category', path: '/category/electronics?minPrice=200' },
  { name: 'search', path: '/search?q=headphones&minPrice=200' },
];

for (const catalogPage of catalogPages) {
  test(`${catalogPage.name} opened by local IP loads products after redirect`, async ({
    page,
    baseURL,
  }) => {
    const expectedUrl = new URL(catalogPage.path, baseURL);
    const localIpUrl = new URL(expectedUrl);
    localIpUrl.hostname = '127.0.0.1';
    const catalogResponse = page.waitForResponse((response) => {
      const path = new URL(response.url()).pathname;
      return path === '/api/v1/products' || path === '/api/v1/products/search';
    });

    await page.goto(localIpUrl.href);

    await expect(page).toHaveURL(expectedUrl.href);
    expect((await catalogResponse).status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: 'Studio over-ear headphones', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Unable to load products' })).toHaveCount(0);
  });
}
