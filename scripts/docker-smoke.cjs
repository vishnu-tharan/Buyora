// Optional live checks. Run only against the disposable buyora-docker-check project.
const { chromium, request, expect } = require('../BuyoraFrontend/node_modules/@playwright/test');
const { execFileSync } = require('node:child_process');
const { randomUUID, randomBytes } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const api = 'http://localhost:8080/api/v1';
const web = 'http://localhost:3000';
const checks = [];
const pass = (name) => { checks.push(name); console.log('PASS ' + name); };
let browser;
async function send(ctx, method, route, data, expected = 200) {
  let headers = {};
  if (!['GET', 'HEAD'].includes(method)) {
    const csrf = await (await ctx.get(api + '/auth/csrf')).json();
    headers[csrf.headerName] = csrf.token;
  }
  const response = await ctx.fetch(api + route, { method, data, headers });
  assert.equal(response.status(), expected, `${method} ${route}: ${await response.text()}`);
  return response.status() === 204 ? null : response.json().catch(() => null);
}
async function register(ctx, email, password) {
  await send(ctx, 'POST', '/auth/register', { email, password, firstName: 'Docker', lastName: 'Check', phone: '0771234567' }, 201);
  let message;
  for (let n = 0; n < 20 && !message; n++) {
    const inbox = await (await fetch('http://localhost:8025/api/v1/messages')).json();
    message = inbox.messages.find(m => m.Subject.includes('Verify') && m.To.some(to => to.Address === email));
    if (!message) await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(message, 'Verification email delivered to the local inbox');
  const mail = await (await fetch(`http://localhost:8025/api/v1/message/${message.ID}`)).json();
  const url = mail.Text.match(/http[^\s]+/)[0];
  const token = new URL(url).searchParams.get('token');
  assert.ok(token);
  await send(ctx, 'POST', '/auth/verify-email', { token });
}
(async () => {
  const id = randomBytes(5).toString('hex');
  const password = randomBytes(18).toString('base64') + 'Aa1!';
  const adminEmail = `docker-admin-${id}@example.test`;
  const customerEmail = `docker-customer-${id}@example.test`;
  const admin = await request.newContext();
  const customer = await request.newContext();
  const guest = await request.newContext();
  assert.equal((await fetch(web + '/health')).status, 200);
  assert.equal((await fetch('http://localhost:8080/actuator/health')).status, 200);
  pass('Frontend and backend health');
  await register(admin, adminEmail, password);
  await register(customer, customerEmail, password);
  pass('Registration and verification email delivery');
  // Bootstrap only the newly registered test administrator, following the setup guide.
  execFileSync('docker', ['compose', '-p', 'buyora-docker-check', 'exec', '-T', 'postgres', 'sh', '-c', 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'], {
    cwd: root, input: `INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u CROSS JOIN roles r WHERE u.email = '${adminEmail}' AND r.name = 'ROLE_ADMIN' ON CONFLICT DO NOTHING;`, stdio: ['pipe', 'pipe', 'pipe'],
  });
  await send(admin, 'POST', '/auth/login', { email: adminEmail, password });
  await send(customer, 'POST', '/auth/login', { email: customerEmail, password });
  await send(customer, 'POST', '/auth/refresh');
  await send(customer, 'GET', '/account/profile');
  pass('Login, refresh, and authenticated profile');
  assert.equal((await guest.post(api + '/cart/items', { data: { variantId: 1, quantity: 1 } })).status(), 403);
  await send(customer, 'GET', '/admin/products', undefined, 403);
  await send(guest, 'GET', '/account/profile', undefined, 401);
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
    const response = await fetch(api + '/cart/items', { method: 'OPTIONS', headers: { Origin: web, 'Access-Control-Request-Method': method, 'Access-Control-Request-Headers': 'Content-Type,X-XSRF-TOKEN' } });
    assert.equal(response.headers.get('access-control-allow-origin'), web);
    assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
  }
  assert.equal((await fetch(api + '/products', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  pass('CSRF, private routes, admin permissions, and restricted CORS');
  const category = await send(admin, 'POST', '/admin/categories', { name: `Docker checks ${id}`, active: true }, 201);
  const product = await send(admin, 'POST', '/admin/products', {
    name: `Docker product ${id}`, categoryPublicId: category.publicId, status: 'ACTIVE', featured: true,
    tags: ['Docker', 'comma, preserved'], variants: [{ sku: `DOCKER-${id}`, price: 1250, active: true }],
  }, 201);
  assert.deepEqual(product.tags, ['Docker', 'comma, preserved']);
  const inventory = await send(admin, 'GET', '/admin/inventory?size=100');
  const item = inventory.content.find(i => i.sku === `DOCKER-${id}`);
  assert.ok(item);
  await send(admin, 'POST', `/admin/inventory/variants/${item.variantId}/adjust`, { quantity: 10, reason: 'Disposable Docker verification' });
  const detail = await send(customer, 'GET', '/products/' + product.slug);
  assert.equal(detail.name, product.name);
  pass('Admin category/product creation, PostgreSQL tags, inventory, and public catalog');
  for (const route of ['/categories/tree', '/categories', '/brands']) {
    const first = await send(customer, 'GET', route);
    const cached = await send(customer, 'GET', route);
    assert.deepEqual(cached, first, route + ' cache must preserve the response');
  }
  pass('Repeated category and brand requests survive Redis cache reads');
  const html = await (await fetch(web)).text();
  assert.ok(html.includes(product.name), 'Server rendering must contain the real product');
  assert.ok(!html.includes('http://backend:8080'), 'Internal hostname must not reach browser HTML');
  pass('Server rendering uses the internal API and displays real catalog data');
  let cart = await send(customer, 'POST', '/cart/items', { variantId: item.variantId, quantity: 2 });
  assert.equal(cart.items.length, 1);
  const preview = await send(customer, 'POST', '/checkout/preview');
  assert.ok(preview);
  const shipping = await send(customer, 'GET', '/shipping/methods');
  const orderRequest = {
    guestShippingAddress: { firstName: 'Docker', lastName: 'Check', phone: '0771234567', addressLine1: '1 Test Road', city: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', isDefaultShipping: false, isDefaultBilling: false },
    guestEmail: customerEmail, paymentMethod: 'CASH_ON_DELIVERY', deliveryMethod: String(shipping[0].id), idempotencyKey: randomUUID(),
  };
  const order = await send(customer, 'POST', '/checkout/place-order', orderRequest);
  assert.ok(order.orderNumber);
  assert.equal((await send(customer, 'POST', '/checkout/place-order', orderRequest)).orderNumber, order.orderNumber);
  await send(customer, 'GET', '/orders/' + order.orderNumber);
  const orders = await send(customer, 'GET', '/orders');
  assert.ok(orders.content.some(o => o.orderNumber === order.orderNumber));
  const denied = await guest.get(api + '/orders/' + order.orderNumber);
  assert.ok([403, 404].includes(denied.status()));
  pass('Cart, checkout, COD order, duplicate-order protection, and order ownership');
  const updatedName = product.name + ' updated';
  await send(admin, 'PUT', '/admin/products/' + detail.id, { name: updatedName, categoryPublicId: category.publicId, status: 'ACTIVE' });
  assert.equal((await send(customer, 'GET', '/products/by-id/' + detail.id)).name, updatedName);
  pass('Admin changes appear in the public catalog');
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(web + '/login');
  await page.getByLabel('Email', { exact: true }).fill(customerEmail);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  await page.goto(web + '/account/orders');
  await expect(page.getByText(order.orderNumber, { exact: false }).first()).toBeVisible({ timeout: 15000 });
  await page.goto(web);
  await expect(page.getByText(updatedName, { exact: false }).first()).toBeVisible();
  await page.goto(web + '/product/' + product.slug);
  const added = page.waitForResponse(r => r.url().endsWith('/cart/items') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  assert.equal((await added).status(), 200);
  await page.goto(web + '/checkout');
  await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
  const adminContext = await browser.newContext({ storageState: await admin.storageState() });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(web + '/admin/products');
  await expect(adminPage.getByText(updatedName, { exact: true }).first()).toBeVisible({ timeout: 15000 });
  const cookies = await context.cookies();
  assert.ok(cookies.some(c => c.name.includes('access') && c.httpOnly && c.sameSite === 'Lax'));
  assert.deepEqual(errors, []);
  pass('Browser login, cookies, customer orders, product cart action, checkout, admin products, and live storefront');
  await send(customer, 'POST', '/auth/logout', undefined, 204);
  await send(customer, 'GET', '/account/profile', undefined, 401);
  pass('Logout clears authentication');
  writeFileSync(path.join(root, 'docs/verification/runtime.json'), JSON.stringify({ testedAt: new Date().toISOString(), project: 'buyora-docker-check', checks, productId: detail.id, productName: updatedName, orderNumber: order.orderNumber }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); });
