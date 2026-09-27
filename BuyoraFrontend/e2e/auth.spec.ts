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

  test('login form validates email', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    // Should show validation error
    expect(
      await page
        .getByLabel('Email', { exact: true })
        .evaluate((input: HTMLInputElement) => input.validity.typeMismatch)
    ).toBe(true);
  });

  test('register link on login page works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL(/\/register(?:\?|$)/);
  });

  test('forgot password link works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /forgot password/i }).click();
    await expect(page).toHaveURL('/forgot-password');
  });

  test('account page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/login/);
  });
});
