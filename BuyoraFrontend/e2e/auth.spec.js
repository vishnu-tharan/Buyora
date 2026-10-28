import { test, expect } from '@playwright/test';
test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  });
  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });
  test('registration submits with the optional phone left empty', async ({ page }) => {
    let submittedData;
    await page.route('**/api/v1/auth/register', async (route) => {
      submittedData = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: {} });
    });
    await page.goto('/register');
    await page.getByLabel('First name', { exact: true }).fill('Demo');
    await page.getByLabel('Last name', { exact: true }).fill('Customer');
    await page.getByLabel('Email', { exact: true }).fill('customer@example.test');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass1');
    await page.getByLabel('Confirm Password', { exact: true }).fill('SecurePass1');
    await expect(page.getByLabel('Phone (optional)', { exact: true })).toHaveValue('');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();

    await expect(page).toHaveURL(/\/login\?/);
    expect(submittedData.email).toBe('customer@example.test');
    expect(submittedData).not.toHaveProperty('phone');
  });
  test('login form validates email', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    // Should show validation error
    expect(
      await page
        .getByLabel('Email', { exact: true })
        .evaluate((input) => input.validity.typeMismatch),
    ).toBe(true);
  });
  test('register link on login page works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL(/\/register(?:\?|$)/);
  });
  test('account page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/login/);
  });
});
