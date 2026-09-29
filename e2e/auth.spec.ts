import { test, expect } from '@playwright/test';
import { resetDb } from './helpers/reset';
import { loginAs, DEMO } from './helpers/auth';

test.beforeEach(async () => {
  await resetDb();
});

test('unauthenticated visitor sees login and signup links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign up' }).first()).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input#email', DEMO.nusrat.email);
  await page.fill('input#password', 'wrong-password');
  await page.click('button[type="submit"]');
  await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('login-error')).toContainText(/incorrect/i);
});

test('passenger logs in and lands on request page', async ({ page }) => {
  await loginAs(page, 'nusrat');
  await expect(page).toHaveURL(/\/passenger\/rides\/new/);
});

test('driver logs in and lands on dashboard', async ({ page }) => {
  await loginAs(page, 'jashim');
  await expect(page).toHaveURL(/\/driver$/);
});

test('logout returns to login', async ({ page }) => {
  await loginAs(page, 'nusrat');
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('passenger cannot visit driver dashboard', async ({ page }) => {
  await loginAs(page, 'nusrat');
  await page.goto('/driver');
  await page.waitForURL(/\/(passenger\/rides\/new|login)/, { timeout: 15_000 });
  expect(page.url()).toMatch(/\/passenger\/rides\/new/);
});

test('demo shortcut fills the credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /nusrat@example\.com/i }).click();
  await expect(page.locator('input#email')).toHaveValue('nusrat@example.com');
  await expect(page.locator('input#password')).toHaveValue('password123');
});