import { test, expect } from '@playwright/test';
import { resetDb } from './helpers/reset';
import { loginAs } from './helpers/auth';

test.beforeEach(async () => {
  await resetDb();
});

test('live estimate shows ৳93.00 for Banani → Mohakhali', async ({ page }) => {
  await loginAs(page, 'nusrat');

  await page.selectOption('select[name="pickup"]', { label: 'Banani' });
  await page.selectOption('select[name="destination"]', { label: 'Mohakhali' });

  await expect(page.getByTestId('estimated-fare')).toContainText('৳93.00', { timeout: 15_000 });
});

test('live estimate shows ৳82.50 for Banani → Gulshan 1', async ({ page }) => {
  await loginAs(page, 'nusrat');

  await page.selectOption('select[name="pickup"]', { label: 'Banani' });
  await page.selectOption('select[name="destination"]', { label: 'Gulshan 1' });

  await expect(page.getByTestId('estimated-fare')).toContainText('৳82.50', { timeout: 15_000 });
});

test('passenger requests a ride and sees the detail page', async ({ page }) => {
  await loginAs(page, 'nusrat');

  await page.selectOption('select[name="pickup"]', { label: 'Banani' });
  await page.selectOption('select[name="destination"]', { label: 'Mohakhali' });
  await expect(page.getByTestId('estimated-fare')).toContainText('৳93.00', { timeout: 15_000 });

  await page.getByRole('button', { name: /request ride/i }).click();

  await expect(page).toHaveURL(/\/passenger\/rides\/[a-f0-9-]+/, { timeout: 15_000 });
  await expect(page.getByTestId('status-badge-REQUESTED')).toBeVisible();
  await expect(page.getByText(/Banani → Mohakhali/)).toBeVisible();
});

test('passenger cancels a REQUESTED ride', async ({ page }) => {
  await loginAs(page, 'nusrat');

  await page.selectOption('select[name="pickup"]', { label: 'Banani' });
  await page.selectOption('select[name="destination"]', { label: 'Mohakhali' });
  await expect(page.getByTestId('estimated-fare')).toContainText('৳93.00', { timeout: 15_000 });
  await page.getByRole('button', { name: /request ride/i }).click();

  await expect(page).toHaveURL(/\/passenger\/rides\/[a-f0-9-]+/, { timeout: 15_000 });
  await page.getByText(/cancel this ride/i).click();
  await page.getByRole('button', { name: /yes, cancel/i }).click();

  await expect(page.getByTestId('status-badge-CANCELLED')).toBeVisible({ timeout: 15_000 });
});

test('history table shows the ride after creating it', async ({ page }) => {
  await loginAs(page, 'nusrat');

  await page.selectOption('select[name="pickup"]', { label: 'Banani' });
  await page.selectOption('select[name="destination"]', { label: 'Mohakhali' });
  await expect(page.getByTestId('estimated-fare')).toContainText('৳93.00', { timeout: 15_000 });
  await page.getByRole('button', { name: /request ride/i }).click();

  await expect(page).toHaveURL(/\/passenger\/rides\/[a-f0-9-]+/, { timeout: 15_000 });

  await page.getByRole('link', { name: 'My rides', exact: true }).click();
  await expect(page).toHaveURL(/\/passenger\/rides$/);
  await expect(page.getByText('Banani → Mohakhali').first()).toBeVisible({ timeout: 15_000 });
});