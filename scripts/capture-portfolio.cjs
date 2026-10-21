// Capture the running local application for the project and portfolio gallery.
const { chromium, expect } = require('../BuyoraFrontend/node_modules/@playwright/test');
const { mkdirSync, writeFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs', 'screenshots');
function runningPort(service, target, fallback) {
  try {
    const binding = execFileSync('docker', ['compose', '-p', process.env.SCREENSHOT_PROJECT || 'buyora-docker-check', 'port', service, String(target)], { cwd: root, timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split(/\r?\n/)[0];
    return binding.match(/:(\d+)$/)?.[1] || fallback;
  } catch { return fallback; }
}
const website = (process.env.SCREENSHOT_BASE_URL || 'http://localhost:' + runningPort('frontend', 3000, 3000)).replace(/\/$/, '');
const api = (process.env.SCREENSHOT_API_URL || 'http://localhost:' + runningPort('backend', 8080, 8080) + '/api/v1').replace(/\/$/, '');
const captures = [];

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  const decline = page.getByRole('button', { name: 'No thanks', exact: true });
  if (await decline.isVisible()) await decline.click();
  await page.mouse.move(0, 0);
}

async function save(page, file, title, fullPage = false) {
  await settle(page);
  if (fullPage) {
    const height = await page.locator('body').evaluate((element) => element.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(100);
    }
    await page.waitForLoadState('networkidle');
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const jpeg = file.endsWith('.jpg');
  await page.screenshot({
    path: path.join(output, file), fullPage, animations: 'disabled', caret: 'hide',
    ...(jpeg ? { type: 'jpeg', quality: 90 } : { type: 'png' }),
  });
  captures.push({ file, title, route: new URL(page.url()).pathname, viewport: page.viewportSize(), fullPage });
  console.log('Saved ' + file);
}

async function main() {
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  let context;
  let guestCartChanged = false;
  let exitCode = 0;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await context.request.get(api + '/products?size=100');
    if (!response.ok()) throw new Error('The local catalog is unavailable. Start the Docker stack first.');
    const products = (await response.json()).content;
    const preferred = ['sample-headphones', 'sample-earbuds', 'sample-speaker'];
    const featured = preferred.map((slug) => products.find((product) => product.slug === slug));
    if (featured.some((product) => !product)) throw new Error('Load the documented sample catalog before capturing this gallery.');

    await page.goto(website, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your favourites.');
    await save(page, 'desktop-home.png', 'Desktop storefront');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await save(page, 'desktop-home-full.jpg', 'Complete storefront', true);

    await page.goto(website + '/category/electronics', { waitUntil: 'networkidle' });
    await expect(page.locator('article').first()).toBeVisible();
    await save(page, 'desktop-catalog.png', 'Product discovery and filters');

    await page.goto(website + '/product/' + featured[0].slug, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(featured[0].name);
    await save(page, 'desktop-product.png', 'Product details and LKR pricing');

    for (const product of featured) {
      await page.goto(website + '/product/' + product.slug, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Add to wishlist', exact: true }).first().click();
      await expect(page.getByRole('button', { name: 'Remove from wishlist', exact: true }).first()).toBeVisible();
    }
    await page.goto(website + '/wishlist', { waitUntil: 'networkidle' });
    await expect(page.getByText(featured[0].name, { exact: true }).first()).toBeVisible();
    await save(page, 'desktop-wishlist.png', 'Saved favourites');

    await page.goto(website + '/compare?ids=' + featured.map((product) => product.id).join(','), { waitUntil: 'networkidle' });
    await expect(page.getByText(featured[0].name, { exact: true }).first()).toBeVisible();
    await save(page, 'desktop-comparison.png', 'Side-by-side product comparison');

    const notebook = products.find((product) => product.slug === 'sample-notebook');
    for (const product of [featured[0], notebook].filter(Boolean)) {
      await page.goto(website + '/product/' + product.slug, { waitUntil: 'networkidle' });
      const added = page.waitForResponse((result) => result.url().endsWith('/cart/items') && result.request().method() === 'POST');
      await page.getByRole('button', { name: 'Add to Cart', exact: true }).first().click();
      if ((await added).status() !== 200) throw new Error('Unable to prepare the capture session cart.');
      guestCartChanged = true;
    }
    await page.goto(website + '/cart', { waitUntil: 'networkidle' });
    await expect(page.getByText(featured[0].name, { exact: true }).first()).toBeVisible();
    await save(page, 'desktop-cart.png', 'Shopping cart');

    await page.goto(website + '/checkout', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
    await save(page, 'desktop-checkout.png', 'Guest checkout');

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mobilePage = await mobile.newPage();
    mobilePage.on('pageerror', (error) => errors.push(error.message));
    await mobilePage.goto(website, { waitUntil: 'networkidle' });
    await save(mobilePage, 'mobile-home.png', 'Mobile storefront');
    await mobilePage.goto(website + '/product/' + featured[0].slug, { waitUntil: 'networkidle' });
    await save(mobilePage, 'mobile-product.png', 'Mobile product details');

    if (errors.length) throw new Error('Browser runtime errors: ' + errors.join('; '));
    writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({
      capturedAt: new Date().toISOString(), source: 'Running local Docker application',
      catalog: 'Sample product photos, LKR prices and quantities', desktopScale: 2, mobileScale: 2, captures,
    }, null, 2));
    console.log('All ' + captures.length + ' screenshots captured.');
  } catch (error) {
    console.error(error.message);
    exitCode = 1;
  } finally {
    if (guestCartChanged && context) {
      try {
        const csrfResponse = await context.request.get(api + '/auth/csrf');
        const csrf = await csrfResponse.json();
        const removed = await context.request.delete(api + '/cart/clear', { headers: { [csrf.headerName]: csrf.token } });
        if (!removed.ok()) throw new Error('Capture cart cleanup failed.');
        console.log('Capture session guest cart cleared.');
      } catch (error) {
        console.error(error.message);
        exitCode = 1;
      }
    }
    await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 7000))]);
    process.exit(exitCode);
  }
}

main();
